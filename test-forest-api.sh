#!/bin/bash

# 森林API测试脚本 - 简洁版本
# 用法: ./test-forest-api.sh [south] [west] [north] [east]

SOUTH=${1:-35.8}
WEST=${2:-100.2}
NORTH=${3:-36.8}
EAST=${4:-101.2}

echo "🌲 测试森林API - 区域: [$SOUTH, $WEST, $NORTH, $EAST]"

node src/lib/data/forestApi.js $SOUTH $WEST $NORTH $EAST
