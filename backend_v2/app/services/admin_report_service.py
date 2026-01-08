"""Admin report service for CSV export operations"""
import csv
import io
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.services.base_service import BaseService
from app.models.user import User
from app.models.run import Run
from app.models.validation import Validation


class AdminReportService(BaseService):
    """Service for generating admin reports"""
    
    def export_users_report(self) -> str:
        """Export users report as CSV string"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        users = self.db.query(User).all()
        writer.writerow(["User ID", "Email", "Subscription Type", "Is Active", "Created At"])
        
        for user in users:
            writer.writerow([
                user.user_id,
                user.email,
                user.subscription_type or "free",
                user.is_active,
                user.created_at.isoformat() if user.created_at else ""
            ])
        
        return output.getvalue()
    
    def export_payments_report(self) -> str:
        """Export payments report as CSV string (mock - no Payment model)"""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Payment ID", "User Email", "Amount", "Currency", "Status", "Created At"])
        # Empty for now - TODO: Implement when Payment model is created
        return output.getvalue()
    
    def export_activity_report(self) -> str:
        """Export activity report as CSV string"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        runs = self.db.query(Run).filter(Run.deleted_at.is_(None)).limit(1000).all()
        validations = self.db.query(Validation).filter(Validation.deleted_at.is_(None)).limit(1000).all()
        
        writer.writerow(["Type", "ID", "User ID", "Status", "Created At"])
        
        for run in runs:
            writer.writerow([
                "run",
                run.run_id,
                run.user_id or "",
                run.status,
                run.created_at.isoformat() if run.created_at else ""
            ])
        
        for validation in validations:
            writer.writerow([
                "validation",
                validation.validation_id,
                validation.user_id or "",
                validation.status,
                validation.created_at.isoformat() if validation.created_at else ""
            ])
        
        return output.getvalue()
    
    def export_subscriptions_report(self) -> str:
        """Export subscriptions report as CSV string"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        users = self.db.query(User).filter(
            User.subscription_type != "free"
        ).all()
        
        writer.writerow(["User ID", "Email", "Subscription Type", "Is Active", "Created At"])
        
        for user in users:
            writer.writerow([
                user.user_id,
                user.email,
                user.subscription_type,
                user.is_active,
                user.created_at.isoformat() if user.created_at else ""
            ])
        
        return output.getvalue()
    
    def export_revenue_report(self) -> str:
        """Export revenue report as CSV string (mock - no Payment model)"""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Period", "Revenue", "Transactions"])
        # Empty for now - TODO: Implement when Payment model is created
        return output.getvalue()
    
    def export_full_report(self) -> str:
        """Export full combined report as CSV string"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["Type", "ID", "User ID", "Email", "Subscription", "Status", "Created At"])
        
        # Export users
        users = self.db.query(User).all()
        for user in users:
            writer.writerow([
                "user",
                user.user_id,
                user.user_id,
                user.email,
                user.subscription_type or "free",
                "active" if user.is_active else "inactive",
                user.created_at.isoformat() if user.created_at else ""
            ])
        
        # Export runs with user emails
        runs = self.db.query(Run).filter(Run.deleted_at.is_(None)).limit(1000).all()
        
        # Pre-fetch all user emails to avoid N+1 queries
        user_ids = set(run.user_id for run in runs if run.user_id)
        users_dict = {}
        if user_ids:
            users_list = self.db.query(User).filter(User.user_id.in_(user_ids)).all()
            users_dict = {user.user_id: user.email for user in users_list}
        
        for run in runs:
            user_email = users_dict.get(run.user_id, "") if run.user_id else ""
            writer.writerow([
                "run",
                run.run_id,
                run.user_id or "",
                user_email,
                "",
                run.status,
                run.created_at.isoformat() if run.created_at else ""
            ])
        
        return output.getvalue()
    
    def generate_report(self, report_type: str) -> str:
        """
        Generate report based on type
        
        Args:
            report_type: Type of report (users, payments, activity, subscriptions, revenue, full)
            
        Returns:
            CSV string content
            
        Raises:
            ValueError: If report_type is invalid
        """
        report_methods = {
            "users": self.export_users_report,
            "payments": self.export_payments_report,
            "activity": self.export_activity_report,
            "subscriptions": self.export_subscriptions_report,
            "revenue": self.export_revenue_report,
            "full": self.export_full_report
        }
        
        if report_type not in report_methods:
            raise ValueError(f"Invalid report type: {report_type}")
        
        return report_methods[report_type]()

