// AI 解释模块

// AI 解释动图的 Prompt
export function generateExplanationPrompt(
  expression: string,
  params: Record<string, number>
): string {
  return `你是一个数学教师，正在为学生讲解一个数学动画。

动画信息：
- 函数表达式：${expression}
- 当前参数：${JSON.stringify(params)}

请用通俗易懂的语言，解释：
1. 这个函数的基本概念
2. 参数变化对图像的影响
3. 这个知识点在考试/实际中的应用
4. 学习这个知识点的建议

要求：
- 语言亲切，像老师在课堂上讲解
- 适当使用比喻和例子
- 控制在200字以内
- 使用emoji增加可读性

请直接输出讲解内容，不要加标题。`;
}

// 根据函数类型生成预设解释
export function getPresetExplanation(
  expression: string,
  params: Record<string, number>
): string {
  const lowerExpr = expression.toLowerCase();
  
  // 正弦/余弦
  if (lowerExpr.includes('sin') || lowerExpr.includes('cos')) {
    const amplitude = params.a || 1;
    const frequency = params.b || 1;
    return `📊 这是${lowerExpr.includes('sin') ? '正弦' : '余弦'}函数图像，展示了周期性变化的规律。

🎯 **关键概念**：振幅${amplitude}决定了波峰的高度，频率${frequency}决定了波形的密集程度。

💡 **生活应用**：声波、光波、交流电都是这种波形！理解它，你就理解了自然界中很多周期现象。

📚 **学习建议**：记住"一周期、两最值、三零点"，画几遍就熟练了！`;
  }
  
  // 指数函数
  if (lowerExpr.includes('exp')) {
    return `📈 这是指数函数，展示了"爆炸式"增长的特性！

🎯 **关键概念**：底数越大，增长越快。这就是为什么复利被称为"世界第八大奇迹"。

💡 **实际应用**：人口增长、细菌繁殖、复利计算都用指数函数。

📚 **学习建议**：重点理解"指数增长 vs 线性增长"的区别，这是高考常考点！`;
  }
  
  // 二次函数
  if (lowerExpr.includes('x^2') || lowerExpr.includes('x**2')) {
    return `📊 这是抛物线，二次函数的典型图像！

🎯 **关键概念**：开口方向由二次项系数决定，顶点是最值点。

💡 **实际应用**：抛物体运动轨迹、拱桥设计、卫星天线都用抛物线。

📚 **学习建议**：掌握"配方求顶点"和"判别式"，中考必考！`;
  }
  
  // 线性函数
  if (lowerExpr.includes('x') && !lowerExpr.includes('x^') && !lowerExpr.includes('x**')) {
    const slope = params.a || 1;
    const intercept = params.b || 0;
    return `📏 这是一条直线，一次函数的图像！

🎯 **关键概念**：斜率${slope}决定倾斜程度，截距${intercept}是与y轴交点。

💡 **实际应用**：路程-时间图、成本-产量分析都是直线。

📚 **学习建议**：记住"斜正右上，斜负右下"，画图先找两点！`;
  }
  
  // 默认解释
  return `📊 这是函数 ${expression} 的图像。

🎯 **观察要点**：注意图像的形状、趋势和特殊点（零点、极值点）。

💡 **学习方法**：试着改变参数，观察图像如何变化，这是理解函数性质的最佳方式！

📚 **建议**：结合课本定义，理解"数形结合"的思想。`;
}
