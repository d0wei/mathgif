import { useState } from 'react';
import { useNaturalLanguage } from '../hooks/useNaturalLanguage';
import type { ParsedFunction } from '../types/index';

interface NaturalLanguageInputProps {
  apiKey: string;
  onGenerate: (result: {
    parsedFunction: ParsedFunction;
    xRange: [number, number];
    yRange: [number, number];
  }) => void;
}

const examples = [
  '画一个正弦波，振幅从1变到3',
  '展示二次函数 y=x² 的图像',
  '演示指数增长，底数为2',
  '正切函数在 -π/2 到 π/2 的范围',
  '余弦函数，频率从1变到5',
];

// 错误提示映射
const errorMessages: Record<string, string> = {
  'API error: 401': 'API Key 无效，请检查配置',
  'API error: 429': '请求太频繁，请稍后再试',
  'API error: 500': 'AI 服务暂时不可用',
  'Failed to parse': 'AI 返回格式错误，请重试',
  'Missing expression': 'AI 未能识别函数表达式',
  'NetworkError': '网络连接失败，请检查网络',
};

export function NaturalLanguageInput({ apiKey, onGenerate }: NaturalLanguageInputProps) {
  const [input, setInput] = useState('');
  const { generate, isGenerating, error, lastResult } = useNaturalLanguage({ apiKey });

  const handleGenerate = async () => {
    if (!input.trim()) {
      return;
    }
    
    const result = await generate(input);
    if (result && result.parsedFunction) {
      onGenerate({
        parsedFunction: result.parsedFunction,
        xRange: result.xRange,
        yRange: result.yRange,
      });
    }
  };

  // 获取友好的错误提示
  const getErrorMessage = (err: string | null): string => {
    if (!err) return '';
    for (const [key, msg] of Object.entries(errorMessages)) {
      if (err.includes(key)) return msg;
    }
    return err;
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
        <span>✨</span>
        AI 智能生成
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        用自然语言描述你想要的动画，AI 会自动生成
      </p>

      {/* 输入框 */}
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：画一个正弦波，振幅从1变到3"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={2}
          disabled={isGenerating}
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !input.trim()}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">⚡</span>
              AI 生成中...
            </>
          ) : (
            <>
              <span>✨</span>
              生成动画
            </>
          )}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded flex items-start gap-2">
          <span className="mt-0.5">❌</span>
          <div>
            <p className="font-medium">生成失败</p>
            <p className="text-red-500">{getErrorMessage(error)}</p>
            <p className="text-xs text-red-400 mt-1">
              提示：尝试简化描述，如"正弦波，振幅2"
            </p>
          </div>
        </div>
      )}

      {/* 生成结果描述 */}
      {lastResult?.description && (
        <div className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded">
          ✅ {lastResult.description}
        </div>
      )}

      {/* 示例 */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">试试这些例子：</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-xs px-2 py-1 bg-white border rounded-full text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
