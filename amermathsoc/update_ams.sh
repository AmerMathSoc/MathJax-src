#!/bin/bash

git fetch mathjax

while read p; do
  echo "merging mathjax/$p"
  git merge mathjax/"$p"
done <branches.md

npm run compile
