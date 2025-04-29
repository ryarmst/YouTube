#!/bin/bash

# NOTE: you must modify the key below and should also consider modifying the number of iterations and prompt!
# This makes a curl request to the Gemini API
# WARNING: be aware of potential security risks before use

# API KEY
API_KEY="${GEMINI_API_KEY:-<Your Google/Gemini Key Here>}"

# Prompt Prefix
PROMPT_PREFIX="We are playing a game. You need to answer each time with ONLY a single word/string. I am going to repeat this message each time. Give me a new string each iteration. Generate a string that could conceivably be a function in an app that has the following functions:\n\n"


# Path to starting strings file (one string per line)
STARTING_STRINGS_FILE="/home/ryan/scripts/starting_strings.txt"

# Read starting strings from file into a variable
if [[ ! -f "$STARTING_STRINGS_FILE" ]]; then
  echo "Starting strings file not found: $STARTING_STRINGS_FILE"
  exit 1
fi

STARTING_STRINGS=$(paste -sd'\n' "$STARTING_STRINGS_FILE")

# Number of iterations
NUM_ITERATIONS=5

for ((i = 0; i < NUM_ITERATIONS; i++)); do
  # Build full prompt by appending starting strings
  FULL_PROMPT="${PROMPT_PREFIX}${STARTING_STRINGS}\n"

  # Build JSON payload using jq
  JSON=$(jq -n --arg text "$FULL_PROMPT" '{
    contents: [{
      parts: [{text: $text}]
    }]
  }')

  # Send request to Gemini API
  RESPONSE=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$API_KEY" \
    -H "Content-Type: application/json" \
    -X POST \
    -d "$JSON")

  # Extract the output text
  OUTPUT=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].text')

  # Print the output
  printf "%s\n" "$OUTPUT"
done
