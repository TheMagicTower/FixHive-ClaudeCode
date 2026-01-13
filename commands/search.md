---
description: Search FixHive for error solutions from the community knowledge base
---

# FixHive Search

Search the community knowledge base for error solutions.

## Usage

When you encounter an error, use this command to find solutions from the community.

## Instructions

1. **Normalize the error message** by replacing variable parts with placeholders:
   - `{class}` - Class/type names
   - `{file}` - File names
   - `{id}` - Numeric IDs (4+ digits)
   - `{uuid}` - UUIDs
   - `{path}` - File paths
   - `{timestamp}` - Timestamps
   - `{table}.{column}` - Database identifiers

2. **Call the MCP tool** `fixhive_search_cases` with:
   - `error_message`: The original error message
   - `error_signature`: The normalized signature
   - `language`: Programming language (e.g., typescript, python)
   - `framework`: Framework if applicable (e.g., react, nextjs)
   - `packages`: Key dependencies with versions

3. **Present the results** ranked by environment match and community votes.

## Example

For error: `TypeError: Cannot read property 'name' of undefined at UserComponent.tsx:42`

```
fixhive_search_cases(
  error_message="TypeError: Cannot read property 'name' of undefined at UserComponent.tsx:42",
  error_signature="TypeError: Cannot read property 'name' of undefined at {file}:{id}",
  language="typescript",
  framework="react"
)
```

## Arguments

$ARGUMENTS
