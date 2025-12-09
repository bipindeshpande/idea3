"""
RQ task definitions for background discovery jobs.
"""
from typing import Dict, Any, Optional

from app.core.database import SessionLocal
from app.services.discovery_service import DiscoveryService
from app.models.run import Run
from datetime import datetime, timezone


def run_stage2(run_id: str, inputs: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Background job to execute discovery (stage 2 heavy work).
    Calls DiscoveryService.run_discovery which handles stage 1 & 2 and persistence.
    """
    db = SessionLocal()
    try:
        # mark as running
        run = db.query(Run).filter(Run.run_id == run_id).first()
        if run:
            run.status = "processing"
            run.started_at = datetime.now(timezone.utc) if hasattr(run, "started_at") else run.created_at
            db.commit()

        service = DiscoveryService(db)
        result = service.run_discovery(inputs=inputs, user_id=user_id, run_id=run_id)
        return result
    except Exception as e:
        # update run as failed
        try:
            run = db.query(Run).filter(Run.run_id == run_id).first()
            if run:
                run.status = "failed"
                run.error_message = str(e)
                db.commit()
        except Exception:
            db.rollback()
        raise
    finally:
        db.close()

