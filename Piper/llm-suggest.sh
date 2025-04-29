#!/bin/bash

# NOTE: you must modify the key below and should also consider modifying the input length max and prompt!
# This makes a curl request to the Gemini API
# WARNING: be aware of potential security risks before use

# API KEY
API_KEY="${GEMINI_API_KEY:-<Your Google/Gemini Key here>}"

# Max length of piped input (characters)
MAX_INPUT_LENGTH=4000

# Prompt Prefix
PROMPT_PREFIX="Consider the following HTTP request observed during application security testing and provide a concise list of recommendations for possible testing vectors and payloads. Provide only example that might be worthwhile in the unique context of the provided request, focusing on the path, parameters, and any novel or uncommon headers. Provide a small number of interesting possibilities and instead of explaining them, show just small snippets of payloads without the full context (just the original line number), separating each with \"---\" and providing a short name/title first:\n\n"

# Read piped input and merge
INPUT=$(cat)

# Trim input if too long
if [ ${#INPUT} -gt $MAX_INPUT_LENGTH ]; then
  INPUT="${INPUT:0:$MAX_INPUT_LENGTH}"
fi

FULL_PROMPT="${PROMPT_PREFIX}${INPUT}"

# Build JSON payload using jq
JSON=$(jq -n --arg text "$FULL_PROMPT" '{
  contents: [{
    parts: [{text: $text}]
  }]
}')

# Send request to Gemini API
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "$JSON" | jq -r '.candidates[0].content.parts[0].text'
