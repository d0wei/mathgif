import { useState } from 'react';
import { useProblemSolver } from '../hooks/useProblemSolver';
import type { ParsedFunction } from '../types/index';

interface ProblemSolverProps {
  apiKey: string;
  onSolve: (result: {
    parsedFunction: ParsedFunction;
    xRange: [number, number];
    yRange: [number, number];
    keyPoints: string[];
    explanation: string;
  }) => void;
}

const examples = [
  '画出函数 y=2x+1 在 [0,5] 的图像',
  '展示 sin(x) 在 0 到 2π 的波形',
  '演示 y=x² 在 [-3,3] 的形状',
  '画出 y=e^x 在 [-2,2] 的增长曲线',
  '分析 y=1/x 在 [0.1,5] 的变化',
];

// 错误提示映射
const errorMessages: Record<string, string> = {
  'API error: 401': 'API Key 无效，请检查配置',
  'API error: 429': '请求太频繁，请稍后再试',
  'API error: 500': 'AI 服务暂时不可用',
  'Failed to parse': 'AI 返回格式错误，请重试',
  'Missing expression': '未能识别题目中的函数表达式',
  'NetworkError': '网络连接失败，请检查网络',
};

export function ProblemSolver({ apiKey, onSolve }: ProblemSolverProps) {
  const [input, setInput] = useState('');
  const { solve, isSolving, error, lastResult } = useProblemSolver({ apiKey });

  const handleSolve = async () => {
    if (!input.trim()) return;
    
    const result = await solve(input);
    if (result && result.parsedFunction) {
      onSolve({
        parsedFunction: result.parsedFunction,
        xRange: result.xRange,
        yRange: result.yRange,
        keyPoints: result.keyPoints,
        explanation: result.explanation,
      });
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const getErrorMessage = (err: string | null): string => {
    if (!err) return '';
    for (const [key, msg] of Object.entries(errorMessages)) {
      if (err.includes(key)) return msg;
    }
    return err;
  };

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
        <span>📝</span>
        题目解析
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        输入数学题，AI 自动解析并生成可视化动画
      </p>

      {/* 输入框 */}
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：画出函数 y=2x+1 在 [0,5] 的图像"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
          rows={2}
          disabled={isSolving}
        />

        <button
          onClick={handleSolve}
          disabled={isSolving || !input.trim()}
          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isSolving ? (
            <>
              <span className="animate-spin">🧠</span>
              AI 解析中...
            </>
          ) : (
            <>
              <span>📝</span>
              解析题目
            </>
          )}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded flex items-start gap-2">
          <span className="mt-0.5">❌</span>
          <div>
            <p className="font-medium">解析失败</p>
            <p className="text-red-500">{getErrorMessage(error)}</p>
            <p className="text-xs text-red-400 mt-1">
              提示：尝试输入"画出 y=x² 的图像"
            </p>
          </div>
        </div>
      )}

      {/* 解析结果 */}
      {lastResult && (
        <div className="mt-3 space-y-2">
          {lastResult.description && (
            <div className="p-2 bg-green-100 text-green-800 text-sm rounded">
              ✅ {lastResult.description}
            </div>
          )}
          
          {lastResult.keyPoints.length > 0 && (
            <div className="p-2 bg-blue-50 text-blue-800 text-sm rounded">
              <p className="font-medium mb-1">📌 关键点：</p>
              <ul className="list-disc list-inside space-y-1">
                {lastResult.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {lastResult.explanation && (
            <div className="p-2 bg-yellow-50 text-yellow-800 text-sm rounded">
              <p className="font-medium mb-1">💡 思路：</p>
              <p>{lastResult.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* 示例 */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">试试这些题目：</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-xs px-2 py-1 bg-white border rounded-full text-gray-600 hover:bg-green-50 hover:border-green-300 transition"
            >
              {example.length > 20 ? example.slice(0, 20) + '...' : example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
