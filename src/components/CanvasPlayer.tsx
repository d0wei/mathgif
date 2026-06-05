import { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasRenderer } from '../core/canvas/renderer';
import { createEvaluator } from '../core/math/parser';
import { useAnimation } from '../hooks/useAnimation';
import type { ParsedFunction, RenderConfig } from '../types/index';

interface CanvasPlayerProps {
  parsedFunction: ParsedFunction | null;
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
}

export function CanvasPlayer({
  parsedFunction,
  width = 800,
  height = 600,
  xRange = [-10, 10],
  yRange = [-10, 10],
}: CanvasPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 渲染配置
  const renderConfig: RenderConfig = {
    width,
    height,
    xRange,
    yRange,
    showGrid: true,
    showAxis: true,
    backgroundColor: '#ffffff',
    gridColor: '#e5e7eb',
    axisColor: '#374151',
    curveColor: '#3b82f6',
  };

  // 初始化渲染器
  useEffect(() => {
    if (!canvasRef.current || rendererRef.current) return;

    const renderer = new CanvasRenderer(canvasRef.current, renderConfig);
    rendererRef.current = renderer;
    setIsReady(true);

    // 初始渲染
    renderer.clear();
    renderer.drawGrid();
    renderer.drawAxes();

    return () => {
      renderer.stop();
      rendererRef.current = null;
    };
  }, []);

  // 动画控制
  const { state, play, pause, reset, seek, updateParam, resetParams } = useAnimation({
    duration: 3,
    initialParams: parsedFunction?.defaults || {},
  });

  // 更新参数默认值
  useEffect(() => {
    if (parsedFunction) {
      resetParams(parsedFunction.defaults);
    }
  }, [parsedFunction, resetParams]);

  // 渲染帧
  const renderFrame = useCallback(() => {
    if (!rendererRef.current || !parsedFunction) return;

    const evaluator = createEvaluator(parsedFunction);
    rendererRef.current.renderFrame(evaluator, {
      time: state.currentTime,
      params: state.params,
    });
  }, [parsedFunction, state.currentTime, state.params]);

  // 播放动画
  useEffect(() => {
    if (!rendererRef.current || !parsedFunction) return;

    const evaluator = createEvaluator(parsedFunction);
    
    if (state.isPlaying) {
      rendererRef.current.start(evaluator, () => ({
        time: state.currentTime,
        params: state.params,
      }));
    } else {
      rendererRef.current.stop();
      renderFrame();
    }

    return () => {
      rendererRef.current?.stop();
    };
  }, [state.isPlaying, parsedFunction, state.currentTime, state.params, renderFrame]);

  // 参数变化时重新渲染
  useEffect(() => {
    if (!state.isPlaying) {
      renderFrame();
    }
  }, [state.params, renderFrame, state.isPlaying]);

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <canvas
          ref={canvasRef}
          className="block max-w-full h-auto"
          style={{ width: '100%', aspectRatio: `${width}/${height}` }}
        />
      </div>

      {/* 控制面板 */}
      {parsedFunction && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          {/* 播放控制 */}
          <div className="flex items-center gap-4">
            <button
              onClick={state.isPlaying ? pause : play}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              {state.isPlaying ? '暂停' : '播放'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              重置
            </button>
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={state.currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">
                {(state.currentTime * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* 参数控制 */}
          {parsedFunction.params.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">参数调节</h4>
              {parsedFunction.params.map((param) => {
                // 使用 AI 返回的参数范围，如果没有则使用默认值
                const config = parsedFunction.paramConfigs?.[param];
                const min = config?.min ?? -5;
                const max = config?.max ?? 5;
                const step = config?.step ?? 0.1;
                
                return (
                  <div key={param} className="flex items-center gap-4">
                    <label className="w-12 font-mono text-sm">{param}:</label>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={state.params[param] ?? 1}
                      onChange={(e) => updateParam(param, parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-mono text-sm">
                      {state.params[param]?.toFixed(2) ?? '1.00'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!isReady && (
        <div className="text-center text-gray-500">加载中...</div>
      )}
    </div>
  );
}
