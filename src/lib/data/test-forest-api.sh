#!/bin/bash

# 森林API测试脚本
# 用于测试 agro3d 项目的森林数据获取功能

echo "🌲 开始测试森林API..."

echo "📁 当前目录: $(pwd)"

# 执行Node.js测试
echo "🚀 执行森林API测试..."
node -e "
import('./forestApi.js').then(module => {
  console.log('🌲 开始测试森林API...');

  module.testForestAPI().then(result => {
    console.log('✅ 测试成功！');
    console.log('📊 获取到', result.length, '个森林区域');


  }).catch(error => {
    console.error('❌ 测试失败:', error.message);
    console.error('🔧 错误详情:', error);
    process.exit(1);
  });

}).catch(error => {
  console.error('❌ 模块加载失败:', error.message);
  process.exit(1);
});
"

# 检查执行结果
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 森林API测试完成！"
    echo "💾 数据文件已保存到当前目录"
else
    echo ""
    echo "❌ 测试执行失败"
    exit 1
fi
