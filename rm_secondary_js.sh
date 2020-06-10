#!/usr/bin/env bash
sudo find . -type f -regextype posix-extended -regex ".*[^.]*\.js\.map" ! -regex "\./node_modules.*" -exec rm "{}" ";"
sudo find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts" ! -regex "\./node_modules.*" -exec rm "{}" ";"
