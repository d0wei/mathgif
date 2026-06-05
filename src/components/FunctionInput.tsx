import { useState } from 'react';
import { FunctionParser } from '../core/math/parser';
import type { ParsedFunction } from '../types/index';

interface FunctionInputProps {
  onChange: (parsed: ParsedFunction | null) => void;
}

export function FunctionInput({ onChange }: FunctionInputProps) {
  const [expression, setExpression] = useState('a * sin(b * x)');
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('sine');

  const parser = new FunctionParser();

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    setError(null);

    try {
      const parsed = parser.parse(value);
      onChange(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
      onChange(null);
    }
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    try {
      const parsed = parser.fromTemplate(template);
      setExpression(parsed.expression);
      setError(null);
      onChange(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '模板加载失败');
      onChange(null);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border shadow-sm">
      <h3 className="font-medium text-gray-900">函数输入</h3>

      {/* 模板选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          快速选择
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="sine">正弦函数 (sin)</option>
          <option value="cosine">余弦函数 (cos)</option>
          <option value="tangent">正切函数 (tan)</option>
          <option value="exponential">指数函数 (exp)</option>
          <option value="logarithmic">对数函数 (log)</option>
          <option value="linear">线性函数</option>
          <option value="quadratic">二次函数</option>
          <option value="cubic">三次函数</option>
        </select>
      </div>

      {/* 表达式输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          数学表达式
        </label>
        <div className="relative">
          <input
            type="text"
            value={expression}
            onChange={(e) => handleExpressionChange(e.target.value)}
            placeholder="例如: a * sin(b * x)"
            className="w-full px-3 py-2 border rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute right-3 top-2 text-gray-400 text-sm">
            y =
          </span>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* 提示 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>支持的函数: sin, cos, tan, exp, log, sqrt, abs</p>
        <p>变量: x (自变量), a, b, c... (参数)</p>
        <p>运算符: +, -, *, /, ^ (幂)</p>
      </div>
    </div>
  );
}
