#!/bin/bash

#
# firefoxに公開に必要なパッケージにビルドする。
# 


zip -r create-link-v1.0.0.zip manifest.json background.js icons/ -x "*.DS_Store" "*/.git/*" "*/node_modules/*"