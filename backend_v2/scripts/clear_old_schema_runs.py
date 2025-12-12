#!/usr/bin/env python
"""Script to soft delete runs with old schema from database"""
import sys
from datetime import datetime, timezone
from sqlalchemy import and_
from app.core.database import SessionLocal
from app.models.run import Run

def clear_old_schema_runs():
    """Soft delete all runs that use old schema fields"""
    db = SessionLocal()
    try:
        old_schema_fields = ['goal_type', 'interest_area', 'work_style', 'skill_strength']
        
        # Find all non-deleted runs
        all_runs = db.query(Run).filter(Run.deleted_at.is_(None)).all()
        
        deleted_count = 0
        for run in all_runs:
            inputs = run.inputs or {}
            # Check if run has any old schema fields
            has_old_fields = any(field in inputs for field in old_schema_fields)
            
            if has_old_fields:
                run.deleted_at = datetime.now(timezone.utc)
                run.status = 'deleted'
                deleted_count += 1
        
        if deleted_count > 0:
            db.commit()
            print(f"✅ Soft deleted {deleted_count} runs with old schema")
        else:
            print("✅ No old schema runs found")
        
        return deleted_count
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    clear_old_schema_runs()

