"""File logger utility for writing logs to mylog.log"""
import os
from datetime import datetime
from pathlib import Path

LOG_FILE = "mylog.log"

def get_log_file_path():
    """Get the absolute path to mylog.log in the project root"""
    # Get the project root (backend_v2 directory)
    # file_logger.py is at: backend_v2/app/utils/file_logger.py
    # So we need to go up 2 levels: utils -> app -> backend_v2
    current_file = Path(__file__).resolve()
    project_root = current_file.parent.parent.parent  # backend_v2 directory
    log_path = project_root / LOG_FILE
    
    # Ensure directory exists
    log_path.parent.mkdir(parents=True, exist_ok=True)
    
    return log_path

def write_to_log(message: str, level: str = "INFO", source: str = "SYSTEM"):
    """Write a log message to mylog.log"""
    try:
        log_path = get_log_file_path()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] [{level}] [{source}] {message}\n"
        
        # Ensure directory exists
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Append to log file
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(log_entry)
            f.flush()  # Ensure immediate write
            os.fsync(f.fileno())  # Force write to disk
        
        # Also print to console
        print(log_entry.strip())
    except Exception as e:
        # Fallback to console if file write fails - include full error details
        try:
            log_path = get_log_file_path()
            error_msg = f"Failed to write to log file (path: {log_path}): {e}"
        except:
            error_msg = f"Failed to write to log file: {e}"
        print(error_msg)
        import traceback
        print(traceback.format_exc())
        print(f"[{level}] [{source}] {message}")

def write_section_to_log(title: str, content: str, level: str = "DEBUG", source: str = "SYSTEM"):
    """Write a section with title and content to log file"""
    try:
        log_path = get_log_file_path()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        separator = "=" * 80
        log_entry = f"\n{separator}\n"
        log_entry += f"[{timestamp}] [{level}] [{source}] {title}\n"
        log_entry += f"{separator}\n"
        log_entry += f"{content}\n"
        log_entry += f"{separator}\n\n"
        
        # Ensure directory exists
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Append to log file
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(log_entry)
            f.flush()
            os.fsync(f.fileno())  # Force write to disk
        
        # Also print to console
        print(log_entry.strip())
    except Exception as e:
        # Include full error details
        try:
            log_path = get_log_file_path()
            error_msg = f"Failed to write section to log file (path: {log_path}): {e}"
        except:
            error_msg = f"Failed to write section to log file: {e}"
        print(error_msg)
        import traceback
        print(traceback.format_exc())
        print(f"[{level}] [{source}] {title}")
        print(content)

