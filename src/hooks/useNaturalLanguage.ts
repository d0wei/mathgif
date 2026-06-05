import { useState, useCallback } from 'react';
import { naturalLanguagePrompt, parseAIResponse } from '../core/ai/naturalLanguage';
import { FunctionParser } from '../core/math/parser';
import type { ParsedFunction, ParamConfig } from '../types/index';

interface UseNaturalLanguageOptions {
  apiKey: string;
  apiEndpoint?: string;
}

interface GenerationResult {
  parsedFunction: ParsedFunction | null;
  xRange: [number, number];
  yRange: [number, number];
  duration: number;
  description: string;
}

export function useNaturalLanguage({
  apiKey,
  apiEndpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
}: UseNaturalLanguageOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);

  const generate = useCallback(async (
    description: string
  ): Promise<GenerationResult | null> => {
    if (!description.trim()) {
      setError('请输入描述');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            { role: 'system', content: naturalLanguagePrompt },
            { role: 'user', content: description },
          ],
          temperature: 0.3, // 低温度，更确定性的输出
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || '';

      // 解析 AI 返回的 JSON
      const parsed = parseAIResponse(aiResponse);
      
      if (!parsed || !parsed.expression) {
        throw new Error('AI 返回格式错误');
      }

      // 用 FunctionParser 解析表达式
      const parser = new FunctionParser();
      const parsedFunction = parser.parse(parsed.expression);
      
          // 合并 AI 返回的参数配置
      const paramConfigs: Record<string, ParamConfig> = {};
      if (parsed.params) {
        parsedFunction.params = Object.keys(parsed.params);
        parsedFunction.defaults = {};
        
        Object.entries(parsed.params).forEach(([key, config]: [string, any]) => {
          parsedFunction.defaults[key] = config.default ?? 1;
          paramConfigs[key] = {
            default: config.default ?? 1,
            min: config.min ?? -5,
            max: config.max ?? 5,
            step: config.step ?? 0.1,
          };
        });
      }
      parsedFunction.paramConfigs = paramConfigs;

      const result: GenerationResult = {
        parsedFunction,
        xRange: parsed.xRange || [-10, 10],
        yRange: parsed.yRange || [-10, 10],
        duration: parsed.duration || 3,
        description: parsed.description || '',
      };

      setLastResult(result);
      return result;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '生成失败';
      setError(errorMsg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, apiEndpoint]);

  return {
    generate,
    isGenerating,
    error,
    lastResult,
  };
}
