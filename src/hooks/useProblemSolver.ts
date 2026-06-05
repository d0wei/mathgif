import { useState, useCallback } from 'react';
import { mathProblemPrompt, parseProblemResponse } from '../core/ai/problemSolver';
import { FunctionParser } from '../core/math/parser';
import type { ParsedFunction, ParamConfig } from '../types/index';

interface UseProblemSolverOptions {
  apiKey: string;
  apiEndpoint?: string;
}

interface ProblemResult {
  parsedFunction: ParsedFunction | null;
  xRange: [number, number];
  yRange: [number, number];
  duration: number;
  description: string;
  keyPoints: string[];
  explanation: string;
}

export function useProblemSolver({
  apiKey,
  apiEndpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
}: UseProblemSolverOptions) {
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ProblemResult | null>(null);

  const solve = useCallback(async (
    problem: string
  ): Promise<ProblemResult | null> => {
    if (!problem.trim()) {
      setError('请输入题目');
      return null;
    }

    setIsSolving(true);
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
            { role: 'system', content: mathProblemPrompt },
            { role: 'user', content: problem },
          ],
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || '';

      // 解析 AI 返回的 JSON
      const parsed = parseProblemResponse(aiResponse);
      
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

      const result: ProblemResult = {
        parsedFunction,
        xRange: parsed.xRange,
        yRange: parsed.yRange,
        duration: parsed.duration,
        description: parsed.description,
        keyPoints: parsed.keyPoints,
        explanation: parsed.explanation,
      };

      setLastResult(result);
      return result;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '解析失败';
      setError(errorMsg);
      return null;
    } finally {
      setIsSolving(false);
    }
  }, [apiKey, apiEndpoint]);

  return {
    solve,
    isSolving,
    error,
    lastResult,
  };
}
