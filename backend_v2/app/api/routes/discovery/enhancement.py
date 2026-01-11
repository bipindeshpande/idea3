"""Discovery report enhancement endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from sqlalchemy import desc, and_
import json
import uuid as uuid_module

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.run import Run
from app.models.validation import Validation
from app.services.llm_service import LLMService
from app.core.redis_client import get_redis
from app.utils.user_utils import extract_user_id, verify_run_ownership
from app.utils.error_handler import handle_exception, NotFoundError

router = APIRouter()


@router.post("/enhance-report", status_code=status.HTTP_200_OK)
async def enhance_report(
    request: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Enhance a report with additional insights
    
    Requires authentication - all enhancements must be associated with a logged-in user.
    
    Request body:
    - run_id: UUID of the run to enhance
    
    Returns:
    - success: bool
    - enhancements: Dict with enhanced insights including:
      - similar_ideas: List of similar high-scoring ideas from user's validation history
      - market_insights: List of market insight strings
      - validation_suggestions: List of validation question objects with question, listenFor, actOn
    """
    try:
        run_id = request.get("run_id")
        if not run_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="run_id is required"
            )
        
        # Validate UUID format
        try:
            uuid_module.UUID(run_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid run_id format: {run_id}"
            )
        
        # Get the run (exclude soft-deleted runs)
        run = db.query(Run).filter(
            and_(
                Run.run_id == run_id,
                Run.deleted_at.is_(None)  # Exclude soft-deleted runs
            )
        ).first()
        
        if not run:
            raise NotFoundError("Run", run_id)
        
        user_id = extract_user_id(current_user)
        
        # Verify user has permission to access this run
        verify_run_ownership(run.user_id, user_id, resource_name="run")
        enhancements = {
            "similar_ideas": [],
            "market_insights": [],
            "validation_suggestions": []
        }
        
        # Initialize LLM service for generating insights
        redis_client = get_redis()
        llm_service = LLMService(db, redis_client)
        
        # 1. Get similar ideas from user's validation history
        if user_id:
            try:
                validations = db.query(Validation).filter(
                    and_(
                        Validation.user_id == user_id,
                        Validation.deleted_at.is_(None),
                        Validation.status == "completed"
                    )
                ).order_by(desc(Validation.created_at)).limit(20).all()
                
                similar_ideas = []
                for validation in validations:
                    try:
                        validation_result = validation.validation_result
                        if isinstance(validation_result, str):
                            validation_result = json.loads(validation_result)
                        
                        overall_score = validation_result.get("overall_score", 0)
                        if overall_score >= 7.0:  # High-scoring validations
                            similar_ideas.append({
                                "validation_id": validation.validation_id,
                                "idea_explanation": validation.idea_explanation[:200] + "..." if len(validation.idea_explanation) > 200 else validation.idea_explanation,
                                "score": float(overall_score)
                            })
                            if len(similar_ideas) >= 5:  # Limit to top 5
                                break
                    except Exception as e:
                        # Skip invalid validation records
                        continue
                
                enhancements["similar_ideas"] = similar_ideas
            except Exception as e:
                # If similar ideas fail, continue with other enhancements
                pass
        
        # 2. Generate market insights from recommendations
        try:
            recommendations_text = ""
            if run.reports:
                recommendations = run.reports.get("personalized_recommendations", "")
                if isinstance(recommendations, str):
                    recommendations_text = recommendations[:3000]  # Limit length
                elif isinstance(recommendations, dict):
                    # Try to extract text from structured format
                    recommendations_text = json.dumps(recommendations)[:3000]
            
            if recommendations_text:
                market_insights_prompt = f"""Analyze the following startup recommendations and extract 3-5 key market insights or opportunities. 
Focus on market trends, opportunities, and strategic insights that would be valuable for the entrepreneur.

Recommendations:
{recommendations_text[:2000]}

Return a JSON object with a "market_insights" array, where each item is a concise market insight string (one sentence each).
Example format:
{{
  "market_insights": ["Market insight 1", "Market insight 2", "Market insight 3"]
}}

Return only the JSON object, no additional text."""
                
                try:
                    response = llm_service.generate(
                        prompt=market_insights_prompt,
                        system_prompt="You are a market research analyst. Extract key market insights from startup recommendations.",
                        temperature=0.7,
                        max_tokens=500,
                        response_format={"type": "json_object"}
                    )
                    
                    content = response.get("content", "").strip()
                    # Try to parse JSON
                    try:
                        data = json.loads(content)
                        insights = data.get("market_insights", data.get("insights", []))
                        if isinstance(insights, list):
                            enhancements["market_insights"] = insights[:5]  # Limit to 5 insights
                        else:
                            enhancements["market_insights"] = []
                    except json.JSONDecodeError:
                        # Fallback: try to extract JSON from markdown code blocks or plain text
                        import re
                        json_match = re.search(r'\{.*?\}', content, re.DOTALL)
                        if json_match:
                            try:
                                data = json.loads(json_match.group(0))
                                insights = data.get("market_insights", data.get("insights", []))
                                if isinstance(insights, list):
                                    enhancements["market_insights"] = insights[:5]
                                else:
                                    enhancements["market_insights"] = []
                            except:
                                enhancements["market_insights"] = []
                        else:
                            # Last fallback: split by lines
                            insights = []
                            for line in content.split("\n"):
                                line = line.strip().strip('-"')
                                if line and len(line) > 10 and not line.startswith("{"):
                                    insights.append(line)
                            enhancements["market_insights"] = insights[:5]
                except Exception as e:
                    # If LLM generation fails, continue without market insights
                    pass
        except Exception as e:
            # If market insights fail, continue with other enhancements
            pass
        
        # 3. Generate validation suggestions/questions from recommendations
        try:
            recommendations_text = ""
            if run.reports:
                recommendations = run.reports.get("personalized_recommendations", "")
                if isinstance(recommendations, str):
                    recommendations_text = recommendations[:3000]
                elif isinstance(recommendations, dict):
                    recommendations_text = json.dumps(recommendations)[:3000]
            
            if recommendations_text:
                validation_prompt = f"""Based on the following startup recommendations, generate 3-4 validation questions that would help an entrepreneur validate these ideas with potential customers.

Recommendations:
{recommendations_text[:2000]}

For each question, provide:
- question: The validation question to ask customers
- listenFor: What to listen for in the response (keywords, indicators, etc.)
- actOn: What action to take based on the response

Return a JSON object with a "questions" array, where each item has "question", "listenFor", and "actOn" fields.
Example format:
{{
  "questions": [
    {{
      "question": "Question text",
      "listenFor": "What to listen for",
      "actOn": "What action to take"
    }}
  ]
}}

Return only the JSON object, no additional text."""
                
                try:
                    response = llm_service.generate(
                        prompt=validation_prompt,
                        system_prompt="You are a startup validation expert. Generate practical validation questions for entrepreneurs.",
                        temperature=0.7,
                        max_tokens=800,
                        response_format={"type": "json_object"}
                    )
                    
                    content = response.get("content", "").strip()
                    try:
                        data = json.loads(content)
                        questions = data.get("questions", data.get("validation_suggestions", []))
                        if isinstance(questions, list):
                            enhancements["validation_suggestions"] = questions[:4]  # Limit to 4 questions
                    except json.JSONDecodeError:
                        # If JSON parsing fails, skip validation suggestions
                        pass
                except Exception as e:
                    # If LLM generation fails, continue without validation suggestions
                    pass
        except Exception as e:
            # If validation suggestions fail, continue
            pass
        
        return {
            "success": True,
            "enhancements": enhancements
        }
    except Exception as e:
        raise handle_exception(
            error=e,
            context={
                "endpoint": "enhance_report",
                "run_id": request.get("run_id") if isinstance(request, dict) else None,
                "user_id": extract_user_id(current_user) if current_user else None
            }
        )

