"""Discovery idea enrichment endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import json

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.tool_service import ToolService
from app.core.redis_client import get_redis
from app.utils.user_utils import extract_user_id
from app.utils.file_logger import write_to_log, write_section_to_log
from app.services.parsers.profile_parser import ProfileParser

router = APIRouter()


@router.post("/discovery/enrich_idea", status_code=status.HTTP_200_OK)
async def enrich_idea(
    request: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    format: str = Query("sse", regex="^(sse|json)$", description="Response format: 'sse' for Server-Sent Events or 'json' for JSON")
):
    """
    Enrich a specific idea with personalized premium playbook (on-demand).
    
    Requires authentication - all LLM calls must be associated with a logged-in user.
    
    Request body:
    {
        "idea": {
            "title": "...",
            "summary": "...",
            "target_market": "...",
            "revenue_model": "..."
        },
        "industry": "ai",
        "profile_analysis": {
            "core_motivations": "...",
            "operating_constraints": "...",
            "strengths_and_capabilities": "...",
            "strategic_considerations": "...",
            "viability_red_flags": "..."
        }
    }
    
    Returns:
    - SSE stream (default): Streams enriched playbook as Server-Sent Events
    - JSON (format=json): Returns structured enrichment object
    """
    # Log that enrichment endpoint was called (at the very start)
    try:
        idea_title = request.get("idea", {}).get("title", "Unknown")
        industry_param = request.get("industry", "")
        write_to_log(f"=== ENRICHMENT API ENDPOINT CALLED === Idea: {idea_title}, Industry: {industry_param}, Format: {format}", "INFO", "DiscoveryAPI")
    except Exception as log_err:
        print(f"Warning: Failed to write endpoint call log: {log_err}")
        import traceback
        traceback.print_exc()
    
    redis_client = get_redis()
    tool_service = ToolService(db, redis_client)
    
    # Extract request data
    idea = request.get("idea", {})
    industry = request.get("industry", "")
    profile_analysis_raw = request.get("profile_analysis", {})
    
    # Handle profile_analysis - it might be a string (markdown) or a dict
    profile_analysis = {}
    if isinstance(profile_analysis_raw, str):
        # Extract JSON from the markdown string using shared parser library
        try:
            parsed = ProfileParser.extract_json(profile_analysis_raw)
            profile_analysis = parsed if parsed else {}
        except Exception as e:
            # If parsing fails, use empty dict
            print(f"Warning: Failed to parse profile_analysis from string: {e}")
            import traceback
            traceback.print_exc()
            profile_analysis = {}
    elif isinstance(profile_analysis_raw, dict):
        profile_analysis = profile_analysis_raw
    else:
        profile_analysis = {}
    
    if not idea.get("title") or not idea.get("summary"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idea must have 'title' and 'summary' fields"
        )
    
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Industry is required"
        )
    
    # Extract user_id consistently
    user_id = extract_user_id(current_user)
    
    if format == "json":
        # Return JSON response (non-streaming)
        # Use tool_service.enrich_idea which includes all logging and returns both parsed and raw content
        enrichment_result = tool_service.enrich_idea(
            idea=idea,
            industry=industry,
            profile_analysis=profile_analysis,
            run_id=None,
            user_id=user_id
        )
        
        # enrich_idea now returns {"parsed": {...}, "raw_content": "..."}
        parsed_result = enrichment_result.get("parsed", {})
        raw_content = enrichment_result.get("raw_content", "")
        
        # CRITICAL: Ensure required sections are in raw_content by reconstructing from parsed if needed
        # Check if Decision Checklist and Additional Insights are in raw_content
        has_decision_in_raw = "### Decision Checklist" in raw_content or "### decision checklist" in raw_content.lower()
        has_insights_in_raw = "### Additional Insights" in raw_content or "### additional insights" in raw_content.lower()
        
        # If missing from raw but present in parsed, append them to raw_content
        if not has_decision_in_raw and parsed_result.get("decision_checklist"):
            raw_content += "\n\n### Decision Checklist\n" + parsed_result["decision_checklist"]
            write_to_log("EnrichmentAPI: Appended Decision Checklist to raw_content from parsed result", "INFO", "DiscoveryAPI")
        
        if not has_insights_in_raw and parsed_result.get("additional_insights"):
            raw_content += "\n\n### Additional Insights\n" + parsed_result["additional_insights"]
            write_to_log("EnrichmentAPI: Appended Additional Insights to raw_content from parsed result", "INFO", "DiscoveryAPI")
        
        # Final validation: Ensure both sections are present
        final_has_decision = "### Decision Checklist" in raw_content or "### decision checklist" in raw_content.lower()
        final_has_insights = "### Additional Insights" in raw_content or "### additional insights" in raw_content.lower()
        
        if not final_has_decision or not final_has_insights:
            write_to_log(f"EnrichmentAPI: WARNING - Required sections missing in final body. Decision: {final_has_decision}, Insights: {final_has_insights}", "WARNING", "DiscoveryAPI")
        
        response_payload = {
            "success": True,
            "enrichment": {
                "body": raw_content,  # Return raw markdown for frontend parsing (now guaranteed to have required sections)
                "parsed": parsed_result  # Also include parsed for debugging
            }
        }
        
        try:
            payload_text = json.dumps(response_payload, indent=2)
            write_section_to_log("JSON PAYLOAD RETURNED TO FRONTEND", payload_text, "INFO", "DiscoveryAPI")
        except Exception as log_err:
            print(f"Warning: Failed to write payload log: {log_err}")
            import traceback
            traceback.print_exc()
        
        return response_payload
    else:
        # Stream SSE response
        async def generate_enrichment_sse():
            try:
                # Send initial event
                yield f"event: start\n"
                yield f"data: {json.dumps({'status': 'enriching', 'idea': idea.get('title', '')})}\n\n"
                
                # Stream enrichment chunks
                buffer = ""
                async for chunk in tool_service.enrich_idea_stream(
                    idea=idea,
                    industry=industry,
                    profile_analysis=profile_analysis,
                    user_id=user_id
                ):
                    if chunk:
                        buffer += chunk
                        # Flush on natural boundaries
                        if "\n\n" in buffer or buffer.endswith(":"):
                            # Format as SSE data event
                            yield f"data: {buffer}\n\n"
                            buffer = ""
                
                # Flush remaining buffer
                if buffer.strip():
                    yield f"data: {buffer}\n\n"
                
                # Send completion event
                yield f"event: complete\n"
                yield f"data: {json.dumps({'status': 'completed'})}\n\n"
                
            except Exception as e:
                yield f"event: error\n"
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_enrichment_sse(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )

