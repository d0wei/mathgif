// 题目解析模块

// 题目解析的 AI Prompt
export const mathProblemPrompt = `你是一个数学题目解析助手。你的任务是把用户的数学题转换成可视化的动画参数。

支持的题目类型：
1. 函数图像题：画出某函数的图像
2. 范围分析题：展示函数在特定区间的变化
3. 参数变化题：展示参数变化对函数的影响

用户输入示例：
- "画出函数 y=2x+1 在 [0,5] 的图像"
- "展示 sin(x) 在 0 到 2π 的波形"
- "演示 y=x² 在 [-3,3] 的形状"
- "画出 y=e^x 的增长曲线"

你需要返回严格的 JSON 格式，不要有任何其他文字：

{
  "expression": "数学表达式，如 2*x+1",
  "params": {},
  "xRange": [x轴最小值, x轴最大值],
  "yRange": [y轴最小值, y轴最大值],
  "duration": 动画时长秒数,
  "description": "简短描述这个动画展示什么",
  "keyPoints": ["关键点1", "关键点2"],
  "explanation": "这个题目的解题思路"
}

规则：
1. 从题目中提取函数表达式，转换为标准格式
2. 如果有指定范围，使用题目给定的范围
3. 如果没有指定范围，根据函数特性自动选择合适范围
4. keyPoints 列出这个题目需要注意的关键点
5. explanation 给出简要的解题思路

只返回 JSON，不要任何解释文字。`;

// 解析题目 AI 返回的 JSON
export function parseProblemResponse(response: string): {
  expression: string;
  params: Record<string, any>;
  xRange: [number, number];
  yRange: [number, number];
  duration: number;
  description: string;
  keyPoints: string[];
  explanation: string;
} | null {
  try {
    // 清理可能的 markdown 代码块
    const cleanJson = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const data = JSON.parse(cleanJson);
    
    // 验证必要字段
    if (!data.expression) {
      throw new Error('Missing expression');
    }
    
    // 转换表达式格式：y=2x+1 → 2*x+1
    let expression = data.expression;
    expression = expression.replace(/^y\s*=\s*/, '');  // 去掉 y=
    expression = expression.replace(/(\d)([a-z])/gi, '$1*$2');  // 2x → 2*x
    expression = expression.replace(/(\))([a-z\d])/gi, '$1*$2');  // )x → )*x
    
    return {
      expression,
      params: data.params || {},
      xRange: parseRange(data.xRange) || [-10, 10],
      yRange: parseRange(data.yRange) || [-10, 10],
      duration: data.duration || 3,
      description: data.description || '',
      keyPoints: data.keyPoints || [],
      explanation: data.explanation || '',
    };
  } catch (error) {
    console.error('Failed to parse problem response:', error);
    return null;
  }
}

// 解析范围，处理 Math.PI 等表达式
function parseRange(range: any): [number, number] | null {
  if (!Array.isArray(range) || range.length !== 2) return null;
  
  return [
    parseNumber(range[0]),
    parseNumber(range[1]),
  ];
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  
  // 处理 Math.PI 表达式
  const cleaned = value
    .replace(/Math\.PI/gi, '3.14159265359')
    .replace(/π/g, '3.14159265359');
  
  try {
    // 使用 Function 安全计算简单表达式
    return new Function('return ' + cleaned)();
  } catch {
    return 0;
  }
}
