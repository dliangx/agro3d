#!/bin/bash

# GFW 森林数据获取脚本 - 简洁版本
# 用法: ./test-gfw-api.sh [south] [west] [north] [east] [data_types]
# data_types: 1=森林覆盖, 2=森林损失, 3=生物多样性 (默认: 123)

# 默认查询区域（北京周边）
SOUTH=${1:-39.95}
WEST=${2:-116.15}
NORTH=${3:-40.05}
EAST=${4:-116.35}

# 默认获取所有数据类型
DATA_TYPES=${5:-"123"}

echo "🌲 获取 GFW 森林数据 - 区域: [$SOUTH, $WEST, $NORTH, $EAST]"
echo "📊 数据类型: $DATA_TYPES (1=森林覆盖, 2=森林损失, 3=生物多样性)"

node src/lib/data/gfwApi.js $SOUTH $WEST $NORTH $EAST $DATA_TYPES
