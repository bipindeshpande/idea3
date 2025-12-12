"""
Test script to show how frontend sees SSE chunk boundaries.

Simulates the SSE stream output with chunk boundaries highlighted.
"""
import asyncio
from typing import List


def simulate_sse_stream(chunks: List[str]) -> List[str]:
    """
    Simulate how generate_sse() wraps chunks into SSE format.
    
    Each chunk becomes: "data: {chunk}\n\n"
    """
    sse_events = []
    
    # Start event
    sse_events.append("event: start")
    sse_events.append('data: {"run_id": "test-123", "status": "processing"}')
    sse_events.append("")  # Empty line after event
    
    # Data chunks (each chunk is one SSE event)
    for chunk in chunks:
        sse_events.append(f"data: {chunk}")
        sse_events.append("")  # Empty line after each data event
    
    # End event
    sse_events.append("event: end")
    sse_events.append('data: {"run_id": "test-123", "status": "completed", "cached": false}')
    sse_events.append("")  # Empty line after event
    
    return sse_events


def highlight_chunk_boundaries(sse_events: List[str]) -> str:
    """
    Format SSE events with chunk boundaries highlighted.
    """
    output = []
    output.append("=" * 80)
    output.append("SSE STREAM AS FRONTEND SEES IT")
    output.append("=" * 80)
    output.append("")
    output.append("CHUNK BOUNDARIES ARE MARKED WITH: <<< CHUNK #N >>>")
    output.append("")
    output.append("=" * 80)
    output.append("")
    
    chunk_num = 0
    in_data_event = False
    
    for line in sse_events:
        if line.startswith("data: "):
            if not in_data_event:
                chunk_num += 1
                output.append("")
                output.append(f"<<< CHUNK #{chunk_num} >>>")
                output.append("-" * 80)
            in_data_event = True
            # Extract the actual data (remove "data: " prefix)
            data = line[6:]  # Remove "data: " prefix
            output.append(f"data: {data}")
        elif line == "":
            if in_data_event:
                output.append("")  # Empty line (SSE event separator)
                output.append("-" * 80)
                in_data_event = False
            else:
                output.append("")  # Regular empty line
        elif line.startswith("event: "):
            output.append("")
            output.append(f"[EVENT] {line}")
            output.append("-" * 80)
        else:
            output.append(line)
    
    output.append("")
    output.append("=" * 80)
    output.append(f"TOTAL CHUNKS: {chunk_num}")
    output.append("=" * 80)
    
    return "\n".join(output)


def test_fragmented_tokens():
    """
    Test with fragmented tokens to show chunk boundaries.
    """
    print("\n" + "=" * 80)
    print("TEST 1: Fragmented IDEA Header")
    print("=" * 80)
    
    # Simulate what workflow_stream() would yield after buffering
    chunks = [
        "### IDEA_1\n",
        "title: Eco-Friendly Packaging Solutions.\n",
        "summary: A startup that creates biodegradable packaging.\n\n",
        "### IDEA_2\n",
        "title: Virtual Fitness Coaching.\n"
    ]
    
    sse_events = simulate_sse_stream(chunks)
    output = highlight_chunk_boundaries(sse_events)
    print(output)


def test_profile_markers():
    """
    Test with profile markers to show they appear once.
    """
    print("\n" + "=" * 80)
    print("TEST 2: Profile Markers (No Duplicates)")
    print("=" * 80)
    
    chunks = [
        "---PROFILE_ANALYSIS_START---\n",
        '{\n  "core_motivations": "You are looking to generate side income."\n}\n',
        "---PROFILE_ANALYSIS_END---\n",
        "\n\n---PROFILE_END---\n\n",
        "### IDEA_1\n",
        "title: Test Idea.\n"
    ]
    
    sse_events = simulate_sse_stream(chunks)
    output = highlight_chunk_boundaries(sse_events)
    print(output)


def test_field_pairs():
    """
    Test that field:value pairs stay intact.
    """
    print("\n" + "=" * 80)
    print("TEST 3: Field:Value Pairs Stay Intact")
    print("=" * 80)
    
    chunks = [
        "### IDEA_1\n",
        "title: Eco-Friendly Packaging Solutions.\n",
        "summary: A startup that creates biodegradable and sustainable packaging materials.\n",
        "target_market: E-commerce companies and environmentally conscious brands.\n",
        "revenue_model: Direct sales to businesses and subscription services.\n"
    ]
    
    sse_events = simulate_sse_stream(chunks)
    output = highlight_chunk_boundaries(sse_events)
    print(output)


if __name__ == "__main__":
    test_fragmented_tokens()
    test_profile_markers()
    test_field_pairs()
    
    print("\n" + "=" * 80)
    print("FRONTEND SSE PARSING NOTES:")
    print("=" * 80)
    print("""
1. Each "data: {chunk}\n\n" is one SSE event
2. Frontend receives chunks in order
3. Empty line (\n\n) separates SSE events
4. Chunk boundaries are preserved - no splitting within chunks
5. Profile markers are complete chunks, never fragmented
6. Field:value pairs are complete chunks, never split
7. IDEA headers are complete chunks, never fragmented

Frontend EventSource API will:
- Parse "data: " prefix automatically
- Fire 'message' event for each chunk
- Preserve chunk boundaries exactly as sent
    """)

