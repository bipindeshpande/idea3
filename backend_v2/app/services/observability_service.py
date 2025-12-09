from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import text, and_
from sqlalchemy.orm import Session

from app.services.base_service import BaseService
from app.core.redis_client import get_redis
from app.models.run import Run
from app.models.error_log import ErrorLog


class ObservabilityService(BaseService):
    """Lightweight observability metrics."""

    def __init__(self, db: Session):
        super().__init__(db, get_redis())

    def get_metrics(self) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        seven_days_ago = now - timedelta(days=7)

        # Queue length (Redis list); fall back to 0 if unavailable
        queue_length = 0
        if self.redis:
            try:
                queue_length = self.redis.llen("task_queue")
            except Exception as e:
                self._log(f"Failed to read Redis queue length: {e}", "WARNING")

        # Last 20 completed runs -> avg response time
        last_runs: List[Run] = (
            self.db.query(Run)
            .filter(and_(Run.status == "completed", Run.completed_at.isnot(None)))
            .order_by(Run.completed_at.desc())
            .limit(20)
            .all()
        )
        durations_ms: List[float] = []
        for r in last_runs:
            if r.created_at and r.completed_at:
                durations_ms.append((r.completed_at - r.created_at).total_seconds() * 1000)
        avg_response_time_ms = sum(durations_ms) / len(durations_ms) if durations_ms else 0

        # Slow runs (> 60s)
        slow_runs_count = (
            self.db.query(Run)
            .filter(
                and_(
                    Run.status == "completed",
                    Run.completed_at.isnot(None),
                    Run.created_at.isnot(None),
                    (Run.completed_at - Run.created_at) > timedelta(seconds=60),
                )
            )
            .count()
        )

        # Failure rate last 7d
        runs_last_7d = (
            self.db.query(Run)
            .filter(Run.created_at >= seven_days_ago)
            .count()
        )
        failures_last_7d = (
            self.db.query(Run)
            .filter(and_(Run.created_at >= seven_days_ago, Run.status == "failed"))
            .count()
        )
        failure_rate_last_7d = (
            failures_last_7d / runs_last_7d if runs_last_7d else 0.0
        )

        # Postgres connections active
        connections_active = None
        try:
            result = self.db.execute(text("SELECT count(*) FROM pg_stat_activity"))
            connections_active = result.scalar()
        except Exception as e:
            self._log(f"Failed to read pg_stat_activity: {e}", "WARNING")

        # Redis memory usage
        redis_memory = None
        if self.redis:
            try:
                info = self.redis.info()
                redis_memory = info.get("used_memory_human") or info.get("used_memory")
            except Exception as e:
                self._log(f"Failed to read Redis info: {e}", "WARNING")

        # Last 10 logs from error_logs
        logs: List[ErrorLog] = (
            self.db.query(ErrorLog)
            .order_by(ErrorLog.created_at.desc())
            .limit(10)
            .all()
        )
        last_10_logs = [
            {
                "timestamp": log.created_at.isoformat() if log.created_at else None,
                "severity": log.severity,
                "error_type": log.error_type,
                "message": log.error_message,
                "request_id": log.request_id,
                "run_id": log.run_id,
            }
            for log in logs
        ]

        return {
            "current_queue_length": queue_length,
            "avg_response_time_last_20_runs_ms": round(avg_response_time_ms, 2),
            "slow_runs_over_60s": slow_runs_count,
            "failure_rate_last_7d": round(failure_rate_last_7d, 4),
            "postgres_connections_active": connections_active,
            "redis_memory_usage": redis_memory,
            "last_10_logs": last_10_logs,
        }

    @staticmethod
    def render_html(metrics: Dict[str, Any]) -> str:
        """Render a simple HTML view."""
        logs_rows = "".join(
            f"<tr><td>{i+1}</td><td>{log.get('timestamp','')}</td><td>{log.get('severity','')}</td>"
            f"<td>{log.get('error_type','')}</td><td>{log.get('message','')}</td>"
            f"<td>{log.get('request_id','')}</td><td>{log.get('run_id','')}</td></tr>"
            for i, log in enumerate(metrics.get("last_10_logs", []))
        )

        html = f"""
        <html>
            <head>
                <title>Observability Dashboard</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 24px; }}
                    h1 {{ color: #111; }}
                    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }}
                    .card {{ border: 1px solid #ddd; border-radius: 8px; padding: 12px; background: #fafafa; }}
                    table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
                    th, td {{ border: 1px solid #ddd; padding: 6px; font-size: 12px; }}
                    th {{ background: #f0f0f0; text-align: left; }}
                    code {{ background: #eee; padding: 2px 4px; border-radius: 4px; }}
                </style>
            </head>
            <body>
                <h1>Observability Dashboard</h1>
                <div class="grid">
                    <div class="card"><strong>Queue Length</strong><br>{metrics.get("current_queue_length", 0)}</div>
                    <div class="card"><strong>Avg Response Time (last 20)</strong><br>{metrics.get("avg_response_time_last_20_runs_ms", 0)} ms</div>
                    <div class="card"><strong>Slow Runs (&gt;60s)</strong><br>{metrics.get("slow_runs_over_60s", 0)}</div>
                    <div class="card"><strong>Failure Rate (7d)</strong><br>{metrics.get("failure_rate_last_7d", 0)*100:.2f}%</div>
                    <div class="card"><strong>Postgres Connections</strong><br>{metrics.get("postgres_connections_active", 'n/a')}</div>
                    <div class="card"><strong>Redis Memory</strong><br>{metrics.get("redis_memory_usage", 'n/a')}</div>
                </div>
                <h2>Last 10 Logs</h2>
                <table>
                    <thead>
                        <tr><th>#</th><th>Time</th><th>Severity</th><th>Type</th><th>Message</th><th>Request ID</th><th>Run ID</th></tr>
                    </thead>
                    <tbody>
                        {logs_rows if logs_rows else '<tr><td colspan="7">No logs</td></tr>'}
                    </tbody>
                </table>
            </body>
        </html>
        """
        return html

