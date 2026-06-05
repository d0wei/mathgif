import { useEffect } from 'react';
import { useExplanation } from '../hooks/useExplanation';
import type { ParsedFunction } from '../types/index';

interface ExplanationPanelProps {
  parsedFunction: ParsedFunction | null;
  apiKey: string;
  usePreset?: boolean;
}

export function ExplanationPanel({
  parsedFunction,
  apiKey,
  usePreset = true,
}: ExplanationPanelProps) {
  const { explanation, isGenerating, generate, clear } = useExplanation({
    apiKey,
    usePreset,
  });

  // 当函数变化时，自动生成解释
  useEffect(() => {
    if (parsedFunction) {
      generate(parsedFunction);
    } else {
      clear();
    }
  }, [parsedFunction?.expression, parsedFunction?.defaults, generate, clear]);

  if (!parsedFunction || !explanation) {
    return null;
  }

  return (
    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <span>📚</span>
        知识点讲解
        {isGenerating && <span className="text-sm text-gray-400 animate-pulse">生成中...</span>}
      </h3>
      
      <div className="prose prose-sm max-w-none">
        <div className="text-gray-700 whitespace-pre-line leading-relaxed">
          {explanation}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-purple-100 flex items-center gap-2 text-xs text-gray-500">
        <span>💡</span>
        <span>AI 自动生成，结合当前参数实时讲解</span>
      </div>
    </div>
  );
}
