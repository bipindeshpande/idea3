"""
Test script for debugging workflow_stream() buffering logic.

This creates a fake LLM stream that emits fragmented tokens to test
IDEA header merging, field splitting, and chunk boundaries.
"""
import asyncio
from typing import AsyncIterator, Dict, Any
from unittest.mock import AsyncMock, patch
from app.services.discovery_service import DiscoveryService
from app.core.database import SessionLocal


async def fake_llm_stream() -> AsyncIterator[str]:
    """
    Fake LLM stream that emits fragmented tokens to test buffering logic.
    
    Simulates a real LLM stream with:
    - Fragmented IDEA headers: "###", "IDE", "A_", "1"
    - Field names: "title", ":", "Eco"
    - Various boundary conditions
    """
    # Test case: Fragmented IDEA header and fields
    tokens = [
        "###",
        "IDE",
        "A_",
        "1",
        "\n",
        "title",
        ":",
        "Eco",
        "-",
        "Friendly",
        " Packaging",
        " Solutions",
        ".",
        "\n",
        "summary",
        ":",
        "A",
        " startup",
        " that",
        " creates",
        " biodegradable",
        " packaging",
        ".",
        "\n\n",
        "###",
        "IDE",
        "A_",
        "2",
        "\n",
        "title",
        ":",
        "Virtual",
        " Fitness",
        " Coaching",
        ".",
    ]
    
    for token in tokens:
        await asyncio.sleep(0.05)  # Simulate network delay (faster for testing)
        yield token


async def test_workflow_stream_direct():
    """
    Test the buffering logic directly with fake LLM stream.
    This tests the same logic as workflow_stream() without the full pipeline.
    """
    print("=" * 80)
    print("TESTING BUFFERING LOGIC WITH FAKE LLM STREAM")
    print("=" * 80)
    
    db = SessionLocal()
    try:
        discovery_service = DiscoveryService(db)
        
        print("\n>>> Starting fake LLM stream...\n")
        
        buffer = ""
        token_count = 0
        chunks_yielded = []
        
        async for chunk in fake_llm_stream():
            token_count += 1
            t = chunk
            
            # Log RAW TOKEN and BUFFER BEFORE
            print(f"\n[TOKEN #{token_count}] RAW TOKEN: {repr(t)}")
            print(f"[TOKEN #{token_count}] BUFFER BEFORE: {repr(buffer)}")

            # IDEA header merging
            merge_candidate = discovery_service.merge_idea_header(buffer, t)
            if merge_candidate:
                print(f"[TOKEN #{token_count}] MERGE_IDEA: buffer='{buffer}', token='{t}' -> merged='{merge_candidate}'")
                buffer = merge_candidate
                print(f"[TOKEN #{token_count}] BUFFER AFTER MERGE: {repr(buffer)}")
                continue

            # Full IDEA header ready (### IDEA_1)
            if buffer.startswith("### IDEA_") and t.strip() == "":
                print(f"[TOKEN #{token_count}] FLUSHED (IDEA header complete): {repr(buffer)}")
                print(f"  >>> YIELDING: {repr(buffer)}")
                chunks_yielded.append(buffer)
                buffer = ""
                print(f"[TOKEN #{token_count}] BUFFER AFTER FLUSH: {repr(buffer)}")
                continue

            # Field flush (title:, summary:, etc.)
            if ":" in t and buffer.strip():
                flushed = buffer.strip()
                print(f"[TOKEN #{token_count}] FLUSHED (field boundary): {repr(flushed)}")
                print(f"  >>> YIELDING: {repr(flushed)}")
                chunks_yielded.append(flushed)
                buffer = t
                print(f"[TOKEN #{token_count}] BUFFER AFTER FIELD FLUSH: {repr(buffer)}")
                continue

            # Natural boundary flush
            if t == "\n" and buffer.strip():
                flushed = buffer.strip()
                print(f"[TOKEN #{token_count}] FLUSHED (newline boundary): {repr(flushed)}")
                print(f"  >>> YIELDING: {repr(flushed)}")
                chunks_yielded.append(flushed)
                buffer = ""
                print(f"[TOKEN #{token_count}] BUFFER AFTER NEWLINE FLUSH: {repr(buffer)}")
                continue

            # Accumulate token
            buffer += t
            print(f"[TOKEN #{token_count}] BUFFER AFTER ACCUMULATE: {repr(buffer)}")

        # Final flush
        if buffer.strip():
            flushed = buffer.strip()
            print(f"\n[FINAL] FLUSHED (remaining buffer): {repr(flushed)}")
            print(f"  >>> YIELDING: {repr(flushed)}")
            chunks_yielded.append(flushed)
        
        print("\n" + "=" * 80)
        print("SUMMARY OF YIELDED CHUNKS:")
        print("=" * 80)
        for i, chunk in enumerate(chunks_yielded, 1):
            print(f"\nChunk #{i}:")
            print(f"  {repr(chunk)}")
            print(f"  Length: {len(chunk)}")
        
        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)
        
    finally:
        db.close()


async def test_workflow_stream_with_mock():
    """
    Test actual workflow_stream() by mocking the LLM service.
    """
    print("=" * 80)
    print("TESTING workflow_stream() WITH MOCKED LLM SERVICE")
    print("=" * 80)
    
    db = SessionLocal()
    try:
        discovery_service = DiscoveryService(db)
        
        # Mock the LLM service's generate_stream method
        async def mock_generate_stream(*args, **kwargs):
            async for token in fake_llm_stream():
                yield token
        
        # Patch the LLM service
        discovery_service.llm_service.generate_stream = mock_generate_stream
        
        # Create minimal inputs
        inputs: Dict[str, Any] = {
            "time_commitment": "5-10 hours",
            "budget_range": "$1,000-5,000",
            "risk_tolerance": "Moderate",
            "preferred_work_style": "Solo",
            "startup_style": "Online only",
            "customer_interaction": "Somewhat comfortable",
            "location_context": "Urban",
            "industry_interest": "Technology",
            "business_type": "Product",
            "earnings_timeline": "90 days",
            "founder_ambition": "Side income",
        }
        
        print("\n>>> Starting workflow_stream() with mocked LLM...\n")
        
        chunks_received = []
        async for chunk in discovery_service.workflow_stream(
            inputs=inputs,
            user_id=None,
            run_id="test-run-123"
        ):
            chunks_received.append(chunk)
            print(f"\n[RECEIVED CHUNK]: {repr(chunk)}")
        
        print("\n" + "=" * 80)
        print("SUMMARY OF RECEIVED CHUNKS:")
        print("=" * 80)
        for i, chunk in enumerate(chunks_received, 1):
            print(f"\nChunk #{i}:")
            print(f"  {repr(chunk)}")
            print(f"  Length: {len(chunk)}")
        
        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)
        
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--full":
        # Test with full workflow_stream (requires mocking)
        asyncio.run(test_workflow_stream_with_mock())
    else:
        # Test buffering logic directly (simpler, faster)
        asyncio.run(test_workflow_stream_direct())

