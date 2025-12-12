#!/usr/bin/env python3
"""Test script to verify file logging is working"""

import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.utils.file_logger import write_to_log, write_section_to_log, get_log_file_path

def test_logging():
    """Test file logging functionality"""
    print("Testing file logging...")
    print(f"Log file path: {get_log_file_path()}")
    print(f"Log file exists: {get_log_file_path().exists()}")
    
    # Test simple log
    print("\n1. Testing simple log entry...")
    write_to_log("Test log entry from test script", "INFO", "TEST_SCRIPT")
    
    # Test section log
    print("\n2. Testing section log...")
    write_section_to_log("TEST SECTION", "This is test content for the section", "DEBUG", "TEST_SCRIPT")
    
    # Verify file was created/updated
    log_path = get_log_file_path()
    if log_path.exists():
        print(f"\n✓ Log file exists at: {log_path}")
        print(f"✓ File size: {log_path.stat().st_size} bytes")
        print("\nLast 5 lines of log file:")
        with open(log_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for line in lines[-5:]:
                print(f"  {line.rstrip()}")
    else:
        print(f"\n✗ Log file does not exist at: {log_path}")
        print("Check file permissions and directory access")
    
    print("\n✓ Logging test complete!")

if __name__ == "__main__":
    test_logging()

