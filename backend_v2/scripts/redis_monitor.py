#!/usr/bin/env python3
"""
Redis Monitoring Script
Monitor Redis activity in real-time for your application
"""
import redis
import sys
import json
from datetime import datetime
from typing import Optional
import time

try:
    from app.core.config import settings
except ImportError:
    # Fallback if not in app context
    REDIS_URL = "redis://localhost:6379/0"
else:
    REDIS_URL = settings.REDIS_URL


def connect_redis() -> Optional[redis.Redis]:
    """Connect to Redis"""
    try:
        client = redis.from_url(REDIS_URL, decode_responses=True)
        client.ping()
        return client
    except Exception as e:
        print(f"❌ Failed to connect to Redis: {e}")
        print(f"   URL: {REDIS_URL}")
        return None


def show_stats(client: redis.Redis):
    """Show Redis statistics"""
    info = client.info()
    keyspace = client.info('keyspace')
    
    print("\n" + "="*60)
    print("📊 REDIS STATISTICS")
    print("="*60)
    print(f"Connected clients: {info.get('connected_clients', 0)}")
    print(f"Used memory: {info.get('used_memory_human', 'N/A')}")
    print(f"Total keys: {client.dbsize()}")
    print(f"Uptime: {info.get('uptime_in_seconds', 0) / 3600:.2f} hours")
    
    # Count keys by pattern
    patterns = {
        "Discovery cache": "discovery:*",
        "RQ queues": "rq:*",
        "Profile cache": "profile:*",
        "Tools cache": "tools:*",
    }
    
    print("\n📁 Keys by pattern:")
    for name, pattern in patterns.items():
        count = len(list(client.scan_iter(match=pattern)))
        print(f"  {name}: {count}")


def show_keys(client: redis.Redis, pattern: str = "*", limit: int = 20):
    """Show keys matching pattern"""
    print(f"\n🔑 Keys matching '{pattern}' (showing first {limit}):")
    print("-" * 60)
    
    keys = list(client.scan_iter(match=pattern))[:limit]
    if not keys:
        print("  No keys found")
        return
    
    for key in keys:
        ttl = client.ttl(key)
        key_type = client.type(key)
        
        if ttl == -1:
            ttl_str = "no expiry"
        elif ttl == -2:
            continue  # Key doesn't exist (expired)
        else:
            ttl_str = f"{ttl}s"
        
        print(f"  {key}")
        print(f"    Type: {key_type}, TTL: {ttl_str}")


def show_key_value(client: redis.Redis, key: str):
    """Show value of a specific key"""
    print(f"\n🔍 Value of key: {key}")
    print("-" * 60)
    
    key_type = client.type(key)
    
    if key_type == "none":
        print("  ❌ Key does not exist")
        return
    
    if key_type == "string":
        value = client.get(key)
        try:
            # Try to parse as JSON for pretty printing
            parsed = json.loads(value)
            print(f"  Value (JSON):")
            print(json.dumps(parsed, indent=2)[:500])  # Limit output
        except:
            print(f"  Value: {value[:200]}")  # Limit output
    
    elif key_type == "list":
        length = client.llen(key)
        print(f"  Type: List, Length: {length}")
        items = client.lrange(key, 0, 9)  # First 10 items
        for i, item in enumerate(items):
            print(f"    [{i}]: {item[:100]}")
        if length > 10:
            print(f"    ... and {length - 10} more items")
    
    elif key_type == "hash":
        print(f"  Type: Hash")
        items = client.hgetall(key)
        for k, v in list(items.items())[:10]:
            print(f"    {k}: {v[:100]}")
    
    elif key_type == "set":
        members = client.smembers(key)
        print(f"  Type: Set, Members: {len(members)}")
        for member in list(members)[:10]:
            print(f"    - {member[:100]}")
    
    ttl = client.ttl(key)
    if ttl > 0:
        print(f"\n  TTL: {ttl} seconds ({ttl/60:.1f} minutes)")


def monitor_commands(client: redis.Redis, filter_pattern: Optional[str] = None):
    """Monitor Redis commands in real-time"""
    print("\n" + "="*60)
    print("👁️  MONITORING REDIS COMMANDS")
    print("="*60)
    if filter_pattern:
        print(f"   Filter: {filter_pattern}")
    print("   Press Ctrl+C to stop")
    print("-" * 60 + "\n")
    
    pubsub = client.pubsub()
    pubsub.psubscribe('__keyspace@0__:*')
    pubsub.psubscribe('__keyevent@0__:*')
    
    # Also use MONITOR for command-level monitoring
    # Note: MONITOR is blocking, so we'll use a simpler approach
    monitor = client.monitor()
    
    try:
        for command in monitor:
            if filter_pattern and filter_pattern.lower() not in command.lower():
                continue
            
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] {command}")
            
    except KeyboardInterrupt:
        print("\n\n✅ Monitoring stopped")


def show_queue_status(client: redis.Redis):
    """Show RQ queue status"""
    print("\n" + "="*60)
    print("📋 RQ QUEUE STATUS")
    print("="*60)
    
    # Check for default queue
    queue_key = "rq:queue:default"
    queue_length = client.llen(queue_key) if client.exists(queue_key) else 0
    
    print(f"Queue 'default': {queue_length} jobs")
    
    if queue_length > 0:
        jobs = client.lrange(queue_key, 0, 4)  # First 5 jobs
        print("\nFirst few jobs:")
        for i, job_id in enumerate(jobs):
            job_key = f"rq:job:{job_id}"
            job_data = client.hgetall(job_key)
            status = job_data.get('status', 'unknown')
            print(f"  [{i+1}] {job_id[:20]}... - Status: {status}")
    
    # Count all RQ keys
    rq_keys = list(client.scan_iter(match="rq:*"))
    print(f"\nTotal RQ keys: {len(rq_keys)}")


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("""
Redis Monitoring Tool
====================

Usage:
  python redis_monitor.py <command> [options]

Commands:
  stats              - Show Redis statistics
  keys [pattern]     - List keys (default: all, or specify pattern)
  show <key>         - Show value of a specific key
  monitor [filter]   - Monitor commands in real-time (optional filter)
  queue              - Show job queue status
  
Examples:
  python redis_monitor.py stats
  python redis_monitor.py keys discovery:*
  python redis_monitor.py show discovery:some_key
  python redis_monitor.py monitor discovery
  python redis_monitor.py queue
        """)
        return
    
    client = connect_redis()
    if not client:
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    try:
        if command == "stats":
            show_stats(client)
        
        elif command == "keys":
            pattern = sys.argv[2] if len(sys.argv) > 2 else "*"
            show_keys(client, pattern)
        
        elif command == "show":
            if len(sys.argv) < 3:
                print("❌ Please specify a key name")
                print("   Usage: python redis_monitor.py show <key>")
                return
            show_key_value(client, sys.argv[2])
        
        elif command == "monitor":
            filter_pattern = sys.argv[2] if len(sys.argv) > 2 else None
            monitor_commands(client, filter_pattern)
        
        elif command == "queue":
            show_queue_status(client)
        
        else:
            print(f"❌ Unknown command: {command}")
            print("   Run without arguments to see usage")
    
    except KeyboardInterrupt:
        print("\n\n✅ Interrupted by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

