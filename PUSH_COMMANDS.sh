#!/bin/bash

# 🚀 Push to GitHub with Token
# Replace YOUR_TOKEN with the Personal Access Token you generated

cd /Users/user/CascadeProjects/ai-detector-pro/production

# Push using token (replace YOUR_TOKEN)
git push https://YOUR_TOKEN@github.com/randomnessmagic/aitextdetector.git main

# Or set credential helper to cache (easier for future)
# git config --global credential.helper osxkeychain
# Then just: git push -u origin main
