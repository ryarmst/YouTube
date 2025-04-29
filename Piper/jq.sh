#!/bin/bash
# jq
jq -r 'to_entries[] | "\u001b[1;34m\(.key)\u001b[0m: \u001b[1;32m\(.value)\u001b[0m"'
