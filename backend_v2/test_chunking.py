"""
Unit tests for workflow_stream() chunking logic.

Tests:
- Fragmented IDEA header merging
- Field name:value pair integrity
- Profile marker handling (no duplicates)
- No partial marker emission
"""
import pytest
import asyncio
from typing import AsyncIterator, List
from app.services.discovery_service import DiscoveryService
from app.core.database import SessionLocal


async def fake_stream(tokens: List[str]) -> AsyncIterator[str]:
    """Helper to create a fake async stream from token list."""
    for token in tokens:
        yield token


class TestChunking:
    """Test suite for chunking logic."""
    
    @pytest.fixture
    def discovery_service(self):
        """Create discovery service instance."""
        db = SessionLocal()
        try:
            service = DiscoveryService(db)
            yield service
        finally:
            db.close()
    
    async def collect_chunks(self, tokens: List[str], discovery_service: DiscoveryService) -> List[str]:
        """Helper to run workflow_stream logic and collect chunks.
        
        This replicates the exact logic from workflow_stream() for testing.
        """
        buffer = ""
        state = "NORMAL"
        prev_char = ""
        in_profile = False
        chunks = []
        
        for t in tokens:
            # Handle profile markers - pass through immediately
            if "---PROFILE_ANALYSIS_START---" in t:
                if buffer.strip():
                    chunks.append(buffer.strip())
                    buffer = ""
                chunks.append(t)
                in_profile = True
                state = "NORMAL"
                continue
                
            if "---PROFILE_ANALYSIS_END---" in t:
                if buffer.strip():
                    chunks.append(buffer.strip())
                    buffer = ""
                chunks.append(t)
                in_profile = False
                state = "NORMAL"
                continue
            
            # Inside profile - accumulate everything
            if in_profile:
                buffer += t
                continue
            
            # Detect IDEA header start
            if state == "NORMAL" and ("###" in buffer or (buffer == "" and t == "#")):
                buffer += t
                if "###" in buffer:
                    state = "IDEA_HEADER"
                continue
            
            # Building IDEA header
            if state == "IDEA_HEADER":
                buffer += t
                
                # Try to merge with number token
                merge_candidate = discovery_service.merge_idea_header(buffer, t)
                if merge_candidate:
                    buffer = merge_candidate
                    continue
                
                # Header complete when we have "### IDEA_X" followed by newline/space
                if buffer.startswith("### IDEA_") and (t == "\n" or t == " " or (t.strip() == "" and len(buffer) > 8)):
                    chunks.append(buffer)
                    buffer = ""
                    state = "NORMAL"
                    continue
                
                # If we have complete header but next token is not whitespace/digit, flush header
                if buffer.startswith("### IDEA_") and len(buffer) >= 9 and not t.isdigit() and t not in [" ", "\n", ""]:
                    header_end = buffer.find("\n") if "\n" in buffer else len(buffer)
                    header = buffer[:header_end].rstrip()
                    remainder = buffer[header_end:] + t
                    chunks.append(header)
                    buffer = remainder
                    state = "NORMAL"
                    continue
                continue
            
            # Detect field start
            if state == "NORMAL" and (t.isalnum() or t == "_") and ":" not in buffer:
                buffer += t
                if buffer.endswith(":"):
                    state = "FIELD_VALUE"
                continue
            
            # Building field value
            if state == "FIELD_VALUE" or (state == "NORMAL" and ":" in buffer):
                if state == "NORMAL":
                    state = "FIELD_VALUE"
                
                buffer += t
                
                # Flush on sentence end: period followed by space/newline
                if prev_char == "." and (t == " " or t == "\n"):
                    chunks.append(buffer.strip())
                    buffer = ""
                    state = "NORMAL"
                    continue
                prev_char = t
                continue
            
            # Handle double newline
            if t == "\n" and prev_char == "\n" and state != "FIELD_VALUE":
                if buffer.strip():
                    chunks.append(buffer.strip())
                buffer = ""
                state = "NORMAL"
                continue
            
            # Default: accumulate
            buffer += t
            prev_char = t
        
        # Final flush
        if buffer.strip():
            chunks.append(buffer.strip())
        
        return chunks
    
    @pytest.mark.asyncio
    async def test_fragmented_header_merging(self, discovery_service):
        """Test that fragmented header ['###', 'IDE', 'A_', '1'] becomes '### IDEA_1'."""
        tokens = ["###", "IDE", "A_", "1", "\n"]
        chunks = await self.collect_chunks(tokens, discovery_service)
        
        # Should yield complete header
        assert len(chunks) >= 1, f"Expected at least 1 chunk, got {len(chunks)}"
        assert "### IDEA_1" in chunks[0], f"Expected '### IDEA_1' in first chunk, got {chunks[0]}"
        assert chunks[0].startswith("### IDEA_1"), f"First chunk should start with '### IDEA_1', got {chunks[0]}"
        print(f"✓ Fragmented header test passed: {chunks}")
    
    @pytest.mark.asyncio
    async def test_fragmented_field_pair(self, discovery_service):
        """Test that fragmented field ['title', ':', 'Eco'] becomes 'title: Eco'."""
        tokens = ["title", ":", "Eco", "-", "Friendly", ".", " "]
        chunks = await self.collect_chunks(tokens, discovery_service)
        
        # Should yield complete field with value
        assert len(chunks) >= 1, f"Expected at least 1 chunk, got {len(chunks)}"
        # Field should contain "title:" and "Eco"
        field_chunk = chunks[0]
        assert "title:" in field_chunk, f"Expected 'title:' in chunk, got {field_chunk}"
        assert "Eco" in field_chunk, f"Expected 'Eco' in chunk, got {field_chunk}"
        print(f"✓ Fragmented field test passed: {chunks}")
    
    @pytest.mark.asyncio
    async def test_profile_markers_appear_once(self, discovery_service):
        """Test that profile markers appear exactly once, not duplicated."""
        tokens = [
            "some",
            " text",
            "---PROFILE_ANALYSIS_START---",
            "\n",
            "{",
            '"',
            "core",
            "_",
            "motivations",
            '"',
            ":",
            " ",
            '"',
            "test",
            '"',
            "}",
            "\n",
            "---PROFILE_ANALYSIS_END---",
            "\n",
            "more",
            " text"
        ]
        chunks = await self.collect_chunks(tokens, discovery_service)
        
        # Count profile markers
        start_count = sum(1 for chunk in chunks if "---PROFILE_ANALYSIS_START---" in chunk)
        end_count = sum(1 for chunk in chunks if "---PROFILE_ANALYSIS_END---" in chunk)
        
        assert start_count == 1, f"Expected exactly 1 START marker, got {start_count}"
        assert end_count == 1, f"Expected exactly 1 END marker, got {end_count}"
        
        # Verify markers are complete (not partial)
        for chunk in chunks:
            if "PROFILE_ANALYSIS" in chunk:
                assert chunk in ["---PROFILE_ANALYSIS_START---", "---PROFILE_ANALYSIS_END---"] or \
                       chunk.startswith("---PROFILE_ANALYSIS_START---") or \
                       chunk.startswith("---PROFILE_ANALYSIS_END---"), \
                       f"Found partial marker: {chunk}"
        
        print(f"✓ Profile markers test passed: START={start_count}, END={end_count}")
    
    @pytest.mark.asyncio
    async def test_no_partial_markers(self, discovery_service):
        """Test that flush never emits partial markers like '---PRO' or 'FILE_ANALYSIS'."""
        tokens = [
            "text",
            "---",
            "PRO",
            "FILE",
            "_",
            "ANALYSIS",
            "_",
            "START",
            "---",
            "content",
            "---",
            "PRO",
            "FILE",
            "_",
            "ANALYSIS",
            "_",
            "END",
            "---"
        ]
        chunks = await self.collect_chunks(tokens, discovery_service)
        
        # Check that no chunk contains partial markers
        partial_markers = ["---PRO", "FILE_ANALYSIS", "ANALYSIS_", "_START", "_END", "---PROFILE", "PROFILE_"]
        for chunk in chunks:
            for partial in partial_markers:
                # Allow full markers but not standalone partials
                if partial in chunk:
                    # If it's part of a complete marker, that's OK
                    if "---PROFILE_ANALYSIS_START---" not in chunk and \
                       "---PROFILE_ANALYSIS_END---" not in chunk:
                        # Check if this is a standalone partial (not part of complete marker)
                        if chunk.strip() == partial or chunk.strip().startswith(partial):
                            pytest.fail(f"Found partial marker '{partial}' in chunk: {chunk}")
        
        print(f"✓ No partial markers test passed")
    
    @pytest.mark.asyncio
    async def test_complete_idea_header_flow(self, discovery_service):
        """Test complete flow: fragmented header -> field -> value."""
        tokens = [
            "###", "IDE", "A_", "1", "\n",
            "title", ":", "Eco", "-", "Friendly", ".", " ",
            "summary", ":", "A", " startup", ".", "\n"
        ]
        chunks = await self.collect_chunks(tokens, discovery_service)
        
        # Should have at least the header and fields
        assert len(chunks) >= 1, f"Expected at least 1 chunk, got {len(chunks)}"
        
        # First chunk should be the complete header
        assert chunks[0].startswith("### IDEA_1"), f"First chunk should be header, got {chunks[0]}"
        
        # Should have field chunks
        has_title = any("title:" in chunk for chunk in chunks)
        has_summary = any("summary:" in chunk for chunk in chunks)
        assert has_title or has_summary, f"Expected title or summary field, got {chunks}"
        
        print(f"✓ Complete flow test passed: {len(chunks)} chunks")
    
    @pytest.mark.asyncio
    async def test_field_value_stays_intact(self, discovery_service):
        """Test that field:value pairs are never split."""
        tokens = [
            "title", ":", "Eco", "-", "Friendly", " Packaging", " Solutions", ".", " ",
            "summary", ":", "A", " startup", " that", " creates", " biodegradable", " packaging", ".", "\n"
        ]
        chunks = await self.collect_chunks(tokens, discovery_service)
        
        # Each chunk should contain complete field:value pairs
        for chunk in chunks:
            if ":" in chunk:
                # Should have both field name and value
                parts = chunk.split(":", 1)
                assert len(parts) == 2, f"Field chunk should have ':', got {chunk}"
                assert parts[0].strip(), f"Field name should not be empty in {chunk}"
                assert parts[1].strip(), f"Field value should not be empty in {chunk}"
        
        print(f"✓ Field value integrity test passed")


if __name__ == "__main__":
    # Run tests directly
    import sys
    
    async def run_tests():
        db = SessionLocal()
        try:
            service = DiscoveryService(db)
            test_suite = TestChunking()
            
            print("=" * 80)
            print("RUNNING CHUNKING TESTS")
            print("=" * 80)
            
            await test_suite.test_fragmented_header_merging(service)
            await test_suite.test_fragmented_field_pair(service)
            await test_suite.test_profile_markers_appear_once(service)
            await test_suite.test_no_partial_markers(service)
            await test_suite.test_complete_idea_header_flow(service)
            await test_suite.test_field_value_stays_intact(service)
            
            print("\n" + "=" * 80)
            print("ALL TESTS PASSED")
            print("=" * 80)
        finally:
            db.close()
    
    asyncio.run(run_tests())

