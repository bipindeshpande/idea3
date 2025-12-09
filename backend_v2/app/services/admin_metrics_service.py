"""Admin metrics service for calculating system statistics"""
from typing import Dict, Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from sqlalchemy.dialects.postgresql import aggregate_order_by
from app.services.base_service import BaseService
from app.models.run import Run
from app.models.discovery_result import DiscoveryResult
from app.models.cache_entry import CacheEntry
from app.models.llm_usage import LLMUsage


class AdminMetricsService(BaseService):
    """Service for calculating admin metrics"""
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Calculate and return all admin metrics
        
        Returns:
            Dictionary with all metrics
        """
        now = datetime.now(timezone.utc)
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        
        # Total runs (excluding soft-deleted)
        total_runs = self.db.query(Run).filter(Run.deleted_at.is_(None)).count()
        
        # Completed runs
        completed_runs = self.db.query(Run).filter(
            and_(
                Run.status == "completed",
                Run.deleted_at.is_(None)
            )
        ).count()
        
        # Failed runs
        failed_runs = self.db.query(Run).filter(
            and_(
                Run.status == "failed",
                Run.deleted_at.is_(None)
            )
        ).count()
        
        # Average runtime (from created_at to completed_at)
        completed_runs_with_timing = self.db.query(Run).filter(
            and_(
                Run.status == "completed",
                Run.completed_at.isnot(None),
                Run.deleted_at.is_(None)
            )
        ).all()
        
        if completed_runs_with_timing:
            total_runtime_ms = 0
            count_with_timing = 0
            for run in completed_runs_with_timing:
                if run.created_at and run.completed_at:
                    delta = run.completed_at - run.created_at
                    total_runtime_ms += delta.total_seconds() * 1000
                    count_with_timing += 1
            
            avg_runtime_ms = total_runtime_ms / count_with_timing if count_with_timing > 0 else 0
        else:
            avg_runtime_ms = 0
        
        # Cache hit ratio
        # Calculate based on cache entries vs total discovery runs
        # Note: This is an approximation - actual cache hits would require tracking
        # each discovery run's cache status, which we don't currently store
        
        # Count active cache entries (not expired)
        active_cache_entries = self.db.query(CacheEntry).filter(
            and_(
                CacheEntry.cache_type == "discovery",
                CacheEntry.expires_at > now
            )
        ).count()
        
        # Total discovery runs (completed)
        total_discovery_runs = completed_runs
        
        if total_discovery_runs > 0:
            # Estimate: cache entries represent unique queries that were cached
            # Ratio is approximate - actual hits would be higher due to multiple hits per cache entry
            cache_hit_ratio = min(1.0, active_cache_entries / total_discovery_runs) if total_discovery_runs > 0 else 0.0
        else:
            cache_hit_ratio = 0.0
        
        # Runs in last 24 hours
        runs_last_24h = self.db.query(Run).filter(
            and_(
                Run.created_at >= last_24h,
                Run.deleted_at.is_(None)
            )
        ).count()
        
        # Runs in last 7 days
        runs_last_7d = self.db.query(Run).filter(
            and_(
                Run.created_at >= last_7d,
                Run.deleted_at.is_(None)
            )
        ).count()
        
        # Runs by interest area (grouped)
        runs_by_interest_area = {}
        runs_with_interest = self.db.query(Run).filter(
            and_(
                Run.deleted_at.is_(None),
                Run.inputs.isnot(None)
            )
        ).all()
        
        for run in runs_with_interest:
            if run.inputs and isinstance(run.inputs, dict):
                interest_area = run.inputs.get("interest_area") or run.inputs.get("sub_interest_area")
                if interest_area:
                    runs_by_interest_area[interest_area] = runs_by_interest_area.get(interest_area, 0) + 1
        
        # LLM usage aggregates
        usage_totals = self._calculate_llm_usage_totals()
        estimated_llm_cost = self._calculate_estimated_llm_cost(usage_totals)

        total_tokens = usage_totals.get("total_tokens", 0)
        total_cost_usd = usage_totals.get("total_cost_usd", 0)
        avg_tokens_per_run = (total_tokens / completed_runs) if completed_runs else 0
        avg_cost_per_run = (total_cost_usd / completed_runs) if completed_runs else 0
        monthly_cost_estimate = usage_totals.get("cost_last_30d", 0)
        
        return {
            "total_runs": total_runs,
            "completed_runs": completed_runs,
            "failed_runs": failed_runs,
            "avg_runtime_ms": round(avg_runtime_ms, 2),
            "cache_hit_ratio": round(cache_hit_ratio, 4),
            "runs_last_24h": runs_last_24h,
            "runs_last_7d": runs_last_7d,
            "runs_by_interest_area": runs_by_interest_area,
            "estimated_llm_cost": estimated_llm_cost,
            "avg_tokens_per_run": round(avg_tokens_per_run, 2),
            "avg_cost_per_run": round(avg_cost_per_run, 4),
            "monthly_cost_estimate": round(monthly_cost_estimate, 4),
        }
    
    def _calculate_llm_usage_totals(self) -> Dict[str, Any]:
        """Aggregate LLM usage from llm_usage table."""
        now = datetime.now(timezone.utc)
        last_30d = now - timedelta(days=30)

        totals = self.db.query(
            func.coalesce(func.sum(LLMUsage.prompt_tokens), 0),
            func.coalesce(func.sum(LLMUsage.completion_tokens), 0),
            func.coalesce(func.sum(LLMUsage.total_tokens), 0),
            func.coalesce(func.sum(LLMUsage.cost_usd), 0),
        ).one()

        last_30d_totals = self.db.query(
            func.coalesce(func.sum(LLMUsage.cost_usd), 0)
        ).filter(LLMUsage.created_at >= last_30d).scalar()

        return {
            "prompt_tokens": totals[0],
            "completion_tokens": totals[1],
            "total_tokens": totals[2],
            "total_cost_usd": float(totals[3]),
            "cost_last_30d": float(last_30d_totals or 0),
        }

    def _calculate_estimated_llm_cost(self, usage_totals: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate estimated LLM cost based on persisted token usage.
        Falls back to zeros if no usage recorded.
        """
        return {
            "total_input_tokens": usage_totals.get("prompt_tokens", 0),
            "total_output_tokens": usage_totals.get("completion_tokens", 0),
            "total_tokens": usage_totals.get("total_tokens", 0),
            "estimated_cost_usd": round(usage_totals.get("total_cost_usd", 0), 4),
            "cost_last_30d": round(usage_totals.get("cost_last_30d", 0), 4),
        }

