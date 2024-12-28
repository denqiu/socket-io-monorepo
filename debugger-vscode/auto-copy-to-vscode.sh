#!/bin/bash

# Copy debugger config files to .vscode folder.
# Hard links are created. Changes to config files in .vscode will reflect in debugger folder and vice versa.

vscode_path="$(dirname $(pwd))/.vscode"
mkdir -p "$vscode_path"

declare -a files=($(ls $(pwd)))
for file in "${files[@]}"; do
    if [[ "$file" != "${BASH_SOURCE[0]}" ]]; then
        # echo $file 
        ln -f "$file" "$vscode_path/$file"
    fi
done

echo "Done!"