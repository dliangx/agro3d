#!/bin/bash

# 森林API测试脚本 - 简洁版本
# 用法: ./test-forest-api.sh [south] [west] [north] [east]

# 默认查询区域（北京周边）
SOUTH=${1:-39.95}
WEST=${2:-116.15}
NORTH=${3:-40.05}
EAST=${4:-116.35}

echo "🌲 测试森林API - 区域: [$SOUTH, $WEST, $NORTH, $EAST]"

node -e "
import('./src/lib/data/forestApi.js').then(async module => {
  try {
    const result = await module.testForestAPI($SOUTH, $WEST, $NORTH, $EAST);
    console.log('✅ 成功获取', result.length, '个森林区域');
    console.log('📊 总面积:', (result.reduce((sum, item) => sum + item.area, 0) / 1000000).toFixed(2), 'km²');
  } catch (error) {
    console.error('❌ 失败:', error.message);
    process.exit(1);
  }
});
"
