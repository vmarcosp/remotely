
#!/bin/bash

# Create a new orphan branch
git checkout --orphan temp-branch

# Add all files to the new branch
git add -A

# Commit the files
git commit -m "Initial commit"

# Delete the old main branch
git branch -D main

# Rename the current branch to main
git branch -m main

# Force update the remote repository
git push -f origin main

# Clean up unnecessary files and optimize the local repository
git gc --aggressive --prune=all

echo "Git history has been rewritten and consolidated into a single commit."
