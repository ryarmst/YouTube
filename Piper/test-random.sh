#!/bin/bash

# Generate and print a randomish 10-digit number 5 times
printf "%010d\n" $(( (RANDOM % 100000) * 100000 + (RANDOM % 100000) ))
printf "%010d\n" $(( (RANDOM % 100000) * 100000 + (RANDOM % 100000) ))
printf "%010d\n" $(( (RANDOM % 100000) * 100000 + (RANDOM % 100000) ))
printf "%010d\n" $(( (RANDOM % 100000) * 100000 + (RANDOM % 100000) ))
printf "%010d\n" $(( (RANDOM % 100000) * 100000 + (RANDOM % 100000) ))
