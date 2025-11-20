#!/bin/bash

# 森林API测试脚本 - 简洁版本
# 用法: ./test-forest-api.sh [south] [west] [north] [east]

# 默认查询区域（北京周边）
SOUTH=${1:-39.95}
WEST=${2:-116.15}
NORTH=${3:-40.05}
EAST=${4:-116.35}

echo "🌲 测试森林API - 区域: [$SOUTH, $WEST, $NORTH, $EAST]"

node src/lib/data/forestApi.js $SOUTH $WEST $NORTH $EAST
