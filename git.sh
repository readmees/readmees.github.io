#!/bin/bash
echo What would you like to commit?
read input
echo "$input"
git pull
git add *
git commit -m "$input"
git push
