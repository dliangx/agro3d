#!/bin/bash

# 森林API测试脚本 - 简洁版本
# 用法: ./test-forest-api.sh [south] [west] [north] [east]

SOUTH=${1:-47.5}
WEST=${2:-86.5}
NORTH=${3:-48.5}
EAST=${4:-87.5}

echo "🌲 测试森林API - 区域: [$SOUTH, $WEST, $NORTH, $EAST]"

node src/lib/data/forestApi.js $SOUTH $WEST $NORTH $EAST
