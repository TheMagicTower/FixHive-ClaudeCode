---
description: Report an error resolution to help the community
---

# FixHive Report

Report an error resolution to help the community.

## Usage

After resolving an error, use this command to share your solution with other developers.

## Instructions

1. **Normalize the error signature** using placeholders:
   - `{class}` - Class/type names
   - `{file}` - File names
   - `{id}` - Numeric IDs
   - `{uuid}` - UUIDs
   - `{path}` - File paths
   - `{table}.{column}` - Database identifiers

2. **Call the MCP tool** `fixhive_report_resolution` with:
   - `error_message`: The original error message
   - `error_signature`: The normalized signature
   - `solution`: Brief description of the fix
   - `cause`: Root cause of the error (optional)
   - `solution_steps`: Step-by-step resolution (optional)
   - `code_diff`: Code changes that fixed it (optional)
   - `language`: Programming language
   - `framework`: Framework if applicable
   - `used_variant_id`: If an existing solution helped (optional)

3. **Confirm success** and thank the user for contributing.

## Example

```
fixhive_report_resolution(
  error_message="TypeError: Cannot read property 'name' of undefined",
  error_signature="TypeError: Cannot read property '{prop}' of undefined",
  solution="Added null check before accessing property",
  cause="Object was not initialized before use",
  language="typescript",
  framework="react"
)
```

## Arguments

$ARGUMENTS
