#!/bin/bash

echo "running git fetch"
git fetch mathjax

for p in "develop" "issue3082" "issue3070" "issue3083" "issue3084" "issue3085" 
do
  echo "merging mathjax/$p"
  git merge mathjax/"$p"
done

npm i
npm run compile
