"""
Quick diagnostic script to test if enrichment sections are being generated correctly.
Run this to check what's happening with Decision Checklist and Additional Insights.
"""
import json
from app.services.tool_service import ToolService
from app.core.redis_client import get_redis
from app.core.database import SessionLocal

def test_enrichment_parsing():
    """Test if enrichment parsing correctly extracts Decision Checklist and Additional Insights"""
    
    # Sample test content that might come from LLM
    test_content = """### Intro
This is a great idea.

### Why this Idea Fits You
Fits your constraints.

### Decision Checklist
- Check market demand
- Assess budget fit
- Evaluate time commitment

### Additional Insights
Consider partnerships. Look for early validation opportunities.

### Financial Snapshot
Some financial info."""
    
    db = SessionLocal()
    redis_client = get_redis()
    tool_service = ToolService(db, redis_client)
    
    print("Testing enrichment parsing...")
    print(f"Input content length: {len(test_content)}")
    print(f"Has Decision Checklist in content: {'### Decision Checklist' in test_content or '### decision checklist' in test_content.lower()}")
    print(f"Has Additional Insights in content: {'### Additional Insights' in test_content or '### additional insights' in test_content.lower()}")
    print("\n" + "="*80 + "\n")
    
    result = tool_service._parse_enrichment_response(test_content)
    
    print("Parsing Result:")
    print(f"decision_checklist: {result.get('decision_checklist', 'MISSING')[:100] if result.get('decision_checklist') else 'EMPTY'}")
    print(f"additional_insights: {result.get('additional_insights', 'MISSING')[:100] if result.get('additional_insights') else 'EMPTY'}")
    print("\n" + "="*80 + "\n")
    
    # Check if sections are present
    has_decision = bool(result.get('decision_checklist') and result['decision_checklist'].strip())
    has_insights = bool(result.get('additional_insights') and result['additional_insights'].strip())
    
    print(f"✅ Decision Checklist present: {has_decision}")
    print(f"✅ Additional Insights present: {has_insights}")
    
    if not has_decision or not has_insights:
        print("\n⚠️ WARNING: Some required sections are missing!")
        print("This means the fallback content generation should have been triggered.")
    
    db.close()

if __name__ == "__main__":
    test_enrichment_parsing()
