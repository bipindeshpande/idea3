"""
Copy generated industry files from static_blocks to static_engine.
"""
import shutil
from pathlib import Path

SOURCE_DIR = Path(__file__).parent / "app" / "tools" / "static_blocks"
TARGET_DIR = Path(__file__).parent / "app" / "static_engine" / "static" / "industries"

def copy_industry_files():
    """Copy all industry JSON files to static_engine directory."""
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    
    json_files = list(SOURCE_DIR.glob("*.json"))
    
    print(f"Found {len(json_files)} JSON files in {SOURCE_DIR}")
    print(f"Copying to {TARGET_DIR}\n")
    
    copied = []
    skipped = []
    
    for json_file in json_files:
        if json_file.name == "default.json":
            print(f"  Skipping {json_file.name} (default file)")
            skipped.append(json_file.name)
            continue
        
        target_file = TARGET_DIR / json_file.name
        
        try:
            shutil.copy2(json_file, target_file)
            copied.append(json_file.name)
            print(f"  ✓ Copied {json_file.name}")
        except Exception as e:
            print(f"  ✗ Failed to copy {json_file.name}: {e}")
            skipped.append(json_file.name)
    
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Copied: {len(copied)} files")
    print(f"Skipped: {len(skipped)} files")
    
    if copied:
        print(f"\nCopied files:")
        for name in copied:
            print(f"  - {name}")
    
    if skipped:
        print(f"\nSkipped files:")
        for name in skipped:
            print(f"  - {name}")
    
    return len(copied), len(skipped)

if __name__ == "__main__":
    copy_industry_files()


