#!/bin/bash

echo "running git fetch"
git fetch mathjax

for p in "develop" "issue3082" "issue3070"
do
  echo "merging mathjax/$p"
  git merge mathjax/"$p"
done

npm i
npm run compile
