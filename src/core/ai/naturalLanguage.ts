import type { ParsedFunction } from '../../types/index';

// 自然语言生成动图的 AI Prompt
export const naturalLanguagePrompt = `你是一个数学动图生成助手。你的任务是把用户的自然语言描述转换成结构化的动画参数。

用户输入示例：
- "画一个正弦波，振幅从1变到3"
- "展示二次函数 y=x² 的图像"
- "演示指数增长，底数为2"
- "正切函数在 -π/2 到 π/2 的范围"

你需要返回严格的 JSON 格式，不要有任何其他文字：

{
  "expression": "数学表达式，如 a*sin(b*x)",
  "params": {
    "参数名": {
      "default": 默认值,
      "min": 最小值,
      "max": 最大值,
      "step": 步长,
      "animateFrom": 动画起始值（可选）,
      "animateTo": 动画结束值（可选）
    }
  },
  "xRange": [x轴最小值, x轴最大值],
  "yRange": [y轴最小值, y轴最大值],
  "duration": 动画时长秒数,
  "description": "简短描述这个动画展示什么"
}

规则：
1. 表达式使用标准数学符号：sin, cos, tan, exp, log, sqrt, ^表示幂
2. 参数名用单个字母：a, b, c, k, m, n
3. 如果没有动画效果，不要加 animateFrom/animateTo
4. xRange 和 yRange 根据函数特性合理设置
5. duration 默认 3 秒

只返回 JSON，不要任何解释文字。`;

// 解析 AI 返回的 JSON
export function parseAIResponse(response: string): Partial<ParsedFunction> & {
  xRange?: [number, number];
  yRange?: [number, number];
  duration?: number;
  description?: string;
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
    
    return {
      expression: data.expression,
      params: data.params || {},
      xRange: data.xRange || [-10, 10],
      yRange: data.yRange || [-10, 10],
      duration: data.duration || 3,
      description: data.description || '',
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return null;
  }
}

// 根据描述推荐函数类型
export function recommendFunctionType(description: string): string {
  const lower = description.toLowerCase();
  
  if (lower.includes('正弦') || lower.includes('sin')) return 'sine';
  if (lower.includes('余弦') || lower.includes('cos')) return 'cosine';
  if (lower.includes('正切') || lower.includes('tan')) return 'tangent';
  if (lower.includes('指数') || lower.includes('exp')) return 'exponential';
  if (lower.includes('对数') || lower.includes('log')) return 'logarithmic';
  if (lower.includes('二次') || lower.includes('抛物线')) return 'quadratic';
  if (lower.includes('线性') || lower.includes('直线')) return 'linear';
  if (lower.includes('三次')) return 'cubic';
  
  return 'sine'; // 默认
}
