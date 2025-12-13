# SSE Streaming Contract

## Overview

This document describes the exact Server-Sent Events (SSE) format that the frontend receives from the `/api/discovery` endpoint.

**Endpoint:** `POST /api/discovery?format=sse`  
**Content-Type:** `text/event-stream`  
**Format:** Server-Sent Events (SSE)

---

## Event Types

### 1. Start Event

**When:** Immediately when streaming begins  
**Format:**
```
event: start
data: {"run_id": "{uuid}", "status": "processing"}

```

**Example:**
```
event: start
data: {"run_id": "d88701bb-e72f-4b67-80cc-3c733c832084", "status": "processing"}

```

**Frontend receives:**
- Event type: `start`
- Data: JSON object with `run_id` and `status: "processing"`

---

### 2. Profile Analysis Block

**When:** After profile analysis completes  
**Format:**
```
data: ---PROFILE_ANALYSIS_START---

data: {
  "core_motivations": "...",
  "constraints": "...",
  "strengths": "...",
  "strategic_considerations": "..."
}

data: ---PROFILE_ANALYSIS_END---

data: 

---PROFILE_END---

```

**Key Properties:**
- Profile markers (`---PROFILE_ANALYSIS_START---` / `---PROFILE_ANALYSIS_END---`) are **complete chunks**, never fragmented
- JSON content is a **single chunk** (may contain newlines)
- `---PROFILE_END---` separator is a **separate chunk**

**Example:**
```
data: ---PROFILE_ANALYSIS_START---

data: {
  "core_motivations": "You are looking to generate a side income through your passion for cooking and content creation, focusing on healthy home-cooked meals.",
  "constraints": "You have a limited time commitment of 5–10 hours per week and a budget range of $1,000–5,000, which may restrict the scale of your initial efforts.",
  "strengths": "Your experience in cooking and content creation positions you well to create engaging online content that resonates with an audience interested in healthy eating.",
  "strategic_considerations": "You should consider starting with a low-cost online platform to showcase your cooking skills, while gradually building customer interaction as you gain confidence and experience."
}

data: ---PROFILE_ANALYSIS_END---

data: 

---PROFILE_END---

```

**Frontend receives:**
- Chunk 1: `"---PROFILE_ANALYSIS_START---\n"`
- Chunk 2: `"{...json...}\n"`
- Chunk 3: `"---PROFILE_ANALYSIS_END---\n"`
- Chunk 4: `"\n\n---PROFILE_END---\n\n"`

---

### 3. IDEA Headers

**When:** At the start of each recommendation idea  
**Format:**
```
data: ### IDEA_{N}

```

**Key Properties:**
- **Never fragmented** - always complete `### IDEA_1`, `### IDEA_2`, etc.
- Fragmented tokens like `["###", "IDE", "A_", "1"]` are merged into `"### IDEA_1\n"`
- Always followed by newline `\n`

**Example:**
```
data: ### IDEA_1

data: ### IDEA_2

data: ### IDEA_3

```

**Frontend receives:**
- Each header is **one complete chunk**
- Format: `"### IDEA_{N}\n"` where N is 1, 2, 3, etc.

---

### 4. IDEA Fields

**When:** After each IDEA header, contains field:value pairs  
**Format:**
```
data: {field_name}: {value}.

```

**Key Properties:**
- **Field:value pairs stay intact** - never split
- Fragmented tokens like `["title", ":", "Eco"]` become `"title: Eco"`
- Each field is flushed when sentence ends (`.` followed by space/newline)
- Fields include: `title`, `summary`, `target_market`, `revenue_model`, `validation_score`, `timeline`, `why_this_fits`

**Example:**
```
data: title: Eco-Friendly Packaging Solutions.

data: summary: A startup that creates biodegradable and sustainable packaging materials for e-commerce businesses, reducing plastic waste and appealing to environmentally conscious consumers.

data: target_market: E-commerce companies, environmentally conscious brands, and retailers.

data: revenue_model: Direct sales to businesses and subscription services for regular supply.

data: validation_score: 8

data: timeline: 6 months

data: why_this_fits: This idea aligns with the growing trend of sustainability and the increasing demand for eco-friendly products among consumers.

```

**Frontend receives:**
- Each field is **one complete chunk**
- Format: `"{field_name}: {value}.\n"` or `"{field_name}: {value}\n"`
- Field name and value are **never separated**

---

### 5. End Event

**When:** After all chunks have been streamed  
**Format:**
```
event: end
data: {"run_id": "{uuid}", "status": "completed", "cached": false}

```

**Example:**
```
event: end
data: {"run_id": "d88701bb-e72f-4b67-80cc-3c733c832084", "status": "completed", "cached": false}

```

**Frontend receives:**
- Event type: `end`
- Data: JSON object with `run_id`, `status: "completed"`, and `cached: false`

---

## Complete Stream Example

**Actual output from running SSE test (22 total chunks):**

```
<<< CHUNK #1 BOUNDARY >>>
event: start
data: {"run_id": "d88701bb-e72f-4b67-80cc-3c733c832084", "status": "processing"}

<<< CHUNK #2 BOUNDARY >>>
data: ---PROFILE_ANALYSIS_START---

<<< CHUNK #3 BOUNDARY >>>
data: {
  "core_motivations": "You are looking to generate a side income through your passion for cooking and content creation, focusing on healthy home-cooked meals.",
  "constraints": "You have a limited time commitment of 5–10 hours per week and a budget range of $1,000–5,000, which may restrict the scale of your initial efforts.",
  "strengths": "Your experience in cooking and content creation positions you well to create engaging online content that resonates with an audience interested in healthy eating.",
  "strategic_considerations": "You should consider starting with a low-cost online platform to showcase your cooking skills, while gradually building customer interaction as you gain confidence and experience."
}

<<< CHUNK #4 BOUNDARY >>>
data: ---PROFILE_ANALYSIS_END---

<<< CHUNK #5 BOUNDARY >>>
data: 

---PROFILE_END---


<<< CHUNK #6 BOUNDARY >>>
data: ### IDEA_1

<<< CHUNK #7 BOUNDARY >>>
data: title: Eco-Friendly Packaging Solutions.

<<< CHUNK #8 BOUNDARY >>>
data: summary: A startup that creates biodegradable and sustainable packaging materials for e-commerce businesses, reducing plastic waste and appealing to environmentally conscious consumers.

<<< CHUNK #9 BOUNDARY >>>
data: target_market: E-commerce companies, environmentally conscious brands, and retailers.

<<< CHUNK #10 BOUNDARY >>>
data: revenue_model: Direct sales to businesses and subscription services for regular supply.

<<< CHUNK #11 BOUNDARY >>>
data: validation_score: 8

<<< CHUNK #12 BOUNDARY >>>
data: timeline: 6 months

<<< CHUNK #13 BOUNDARY >>>
data: why_this_fits: This idea aligns with the growing trend of sustainability and the increasing demand for eco-friendly products among consumers.

<<< CHUNK #14 BOUNDARY >>>
data: ### IDEA_2

<<< CHUNK #15 BOUNDARY >>>
data: title: Virtual Fitness Coaching Platform.

<<< CHUNK #16 BOUNDARY >>>
data: summary: An online platform connecting users with certified fitness coaches for personalized training sessions, nutrition advice, and progress tracking, all from the comfort of home.

<<< CHUNK #17 BOUNDARY >>>
data: target_market: Health-conscious individuals, busy professionals, and fitness enthusiasts.

<<< CHUNK #18 BOUNDARY >>>
data: revenue_model: Subscription fees for access to coaching services and premium content.

<<< CHUNK #19 BOUNDARY >>>
data: validation_score: 9

<<< CHUNK #20 BOUNDARY >>>
data: timeline: 4 months

<<< CHUNK #21 BOUNDARY >>>
data: why_this_fits: The rise in remote work and home fitness trends makes this platform highly relevant for users seeking convenient fitness solutions.

<<< CHUNK #22 BOUNDARY >>>
event: end
data: {"run_id": "d88701bb-e72f-4b67-80cc-3c733c832084", "status": "completed", "cached": false}

```

---

## Boundary Type Reference

| Boundary Type | Chunk Number | Example | Notes |
|--------------|--------------|---------|-------|
| **Start Event** | #1 | `data: {"run_id": "...", "status": "processing"}` | Always first |
| **Profile Start** | #2 | `data: ---PROFILE_ANALYSIS_START---\n` | Complete marker, never fragmented |
| **Profile JSON** | #3 | `data: {...json...}\n` | Single chunk, may contain newlines |
| **Profile End** | #4 | `data: ---PROFILE_ANALYSIS_END---\n` | Complete marker, never fragmented |
| **Profile Separator** | #5 | `data: \n\n---PROFILE_END---\n\n` | Separates profile from recommendations |
| **IDEA Header** | #6, #14, etc. | `data: ### IDEA_1\n` | Complete header, never fragmented |
| **Field:Value** | #7-13, #15-21, etc. | `data: title: Eco-Friendly Packaging Solutions.\n` | Complete field pair, never split |
| **End Event** | Last | `data: {"run_id": "...", "status": "completed"}` | Always last |

## Chunk Boundary Rules

### ✅ Guaranteed Properties

1. **IDEA Headers Never Fragmented**
   - `### IDEA_1` is always one complete chunk
   - Never split into `###`, `IDE`, `A_`, `1`

2. **Field:Value Pairs Stay Intact**
   - `title: Eco-Friendly Packaging Solutions.` is always one complete chunk
   - Never split at the colon or mid-value

3. **Profile Markers Appear Once**
   - `---PROFILE_ANALYSIS_START---` appears exactly once
   - `---PROFILE_ANALYSIS_END---` appears exactly once
   - Never duplicated or fragmented

4. **No Partial Markers**
   - Never emits `---PRO` or `FILE_ANALYSIS` as standalone chunks
   - Only complete markers are sent

5. **Natural Boundaries**
   - Flush occurs only on:
     - Completed IDEA header (`### IDEA_1\n`)
     - Completed field (sentence end: `.` + space/newline)
     - Double newline (`\n\n`) outside fields
     - Profile markers (immediate pass-through)

---

## Frontend EventSource Usage

```javascript
const eventSource = new EventSource('/api/discovery?format=sse', {
  method: 'POST',
  body: JSON.stringify({ /* request payload */ })
});

// Start event
eventSource.addEventListener('start', (e) => {
  const data = JSON.parse(e.data);
  console.log('Stream started:', data.run_id);
});

// Data chunks (default 'message' event)
eventSource.onmessage = (e) => {
  const chunk = e.data;
  
  // Chunk boundaries are preserved
  if (chunk.includes('---PROFILE_ANALYSIS_START---')) {
    // Handle profile start
  } else if (chunk.includes('---PROFILE_ANALYSIS_END---')) {
    // Handle profile end
  } else if (chunk.startsWith('### IDEA_')) {
    // Handle IDEA header (complete, never fragmented)
  } else if (chunk.includes(':')) {
    // Handle field:value pair (complete, never split)
  }
};

// End event
eventSource.addEventListener('end', (e) => {
  const data = JSON.parse(e.data);
  console.log('Stream completed:', data.status);
  eventSource.close();
});

// Error handling
eventSource.onerror = (e) => {
  console.error('SSE error:', e);
  eventSource.close();
};
```

---

## Chunk Count Example

**Actual test run (2 IDEA recommendations):**
- 1 start event (chunk #1)
- 4 profile chunks (chunks #2-5: START, JSON, END, PROFILE_END)
- 2 IDEA headers (chunks #6, #14)
- 14 field chunks (2 ideas × 7 fields each: chunks #7-13, #15-21)
- 1 end event (chunk #22)
- **Total: 22 chunks**

**For typical run with 5 IDEA recommendations:**
- 1 start event
- 4 profile chunks
- 5 IDEA headers
- 35 field chunks (5 ideas × 7 fields)
- 1 end event
- **Total: ~45 chunks** (vs. thousands of token-level events without buffering)

---

## Version

**Contract Version:** 1.0  
**Last Updated:** 2025-01-09  
**Backend Version:** workflow_stream() with state machine buffering

