#!/bin/bash

files=()

while IFS= read -r f; do
  rel="${f#*_site/}"
  file="-F${rel}=@${f}"
  echo $file
  files+=("$file")
done < <(find _site -type f)

curl -H "Authorization: Bearer ${NEO_API_KEY}" \
  "${files[@]}" \
  "https://neocities.org/api/upload"