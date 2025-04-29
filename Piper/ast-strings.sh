#!/bin/bash
/home/ryan/scripts/ast1.js | jq '.. | objects | select(.type? == "StringLiteral") | .value' 


## Line number extraction ##
# /home/ryan/scripts/ast2.js 

## Additional jq filters ##
# jq '.. | objects | select(.type? == "Identifier") | .value'
# jq '.. | objects | select(.type? == "StringLiteral") | .value' ast.json | grep -Ei 'https?://|/api|\.php|\.asp|\.jsp'
# jq '.. | objects | select(.type? == "KeyValueProperty") | .key.value' ast.json
