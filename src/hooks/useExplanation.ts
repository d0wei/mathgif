import { useState, useCallback } from 'react';
import { generateExplanationPrompt, getPresetExplanation } from '../core/ai/explanation';
import type { ParsedFunction } from '../types/index';

interface UseExplanationOptions {
  apiKey: string;
  apiEndpoint?: string;
  usePreset?: boolean;  // 是否使用预设解释（更快，不消耗API）
}

export function useExplanation({
  apiKey,
  apiEndpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  usePreset = true,
}: UseExplanationOptions) {
  const [explanation, setExplanation] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    parsedFunction: ParsedFunction | null
  ): Promise<string> => {
    if (!parsedFunction) {
      setExplanation('');
      return '';
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 如果使用预设解释，直接返回
      if (usePreset) {
        const preset = getPresetExplanation(
          parsedFunction.expression,
          parsedFunction.defaults
        );
        setExplanation(preset);
        setIsGenerating(false);
        return preset;
      }

      // 否则调用 AI API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            {
              role: 'user',
              content: generateExplanationPrompt(
                parsedFunction.expression,
                parsedFunction.defaults
              ),
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      setExplanation(content);
      return content;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '生成失败';
      setError(errorMsg);
      
      // 失败时回退到预设解释
      const fallback = getPresetExplanation(
        parsedFunction.expression,
        parsedFunction.defaults
      );
      setExplanation(fallback);
      return fallback;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, apiEndpoint, usePreset]);

  const clear = useCallback(() => {
    setExplanation('');
    setError(null);
  }, []);

  return {
    explanation,
    isGenerating,
    error,
    generate,
    clear,
  };
}
