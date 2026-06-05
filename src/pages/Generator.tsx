import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FunctionInput } from '../components/FunctionInput';
import { NaturalLanguageInput } from '../components/NaturalLanguageInput';
import { ProblemSolver } from '../components/ProblemSolver';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { CanvasPlayer } from '../components/CanvasPlayer';
import { ExpertChat } from '../components/ExpertChat';
import { MP4Recorder } from '../core/recorder/mp4Recorder';
import type { ParsedFunction } from '../types/index';

export function Generator() {
  const [parsedFunction, setParsedFunction] = useState<ParsedFunction | null>(null);
  const [canvasRange, setCanvasRange] = useState<{xRange: [number, number], yRange: [number, number]}>({
    xRange: [-10, 10],
    yRange: [-10, 10],
  });
  const [problemInfo, setProblemInfo] = useState<{keyPoints: string[], explanation: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_AI_API_KEY || '';

  const handleRecord = async () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (!canvas) return;

    setIsRecording(true);
    setRecordProgress(0);

    const recorder = new MP4Recorder();
    
    try {
      await recorder.start({
        canvas,
        duration: 3,
        fps: 30,
        quality: 'high',
      });

      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setRecordProgress(0.5);
      
      const blob = await recorder.stop();
      MP4Recorder.download(blob, `math-animation-${Date.now()}.webm`);
      
      setRecordProgress(1);
    } catch (error) {
      console.error('Recording failed:', error);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gray-900">MathGIF</Link>
            <nav className="flex gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">首页</Link>
              <Link to="/generator" className="text-blue-600 font-medium">生成器</Link>
              <Link to="/gallery" className="text-gray-600 hover:text-gray-900">画廊</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">关于</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">函数动画生成器</h2>
          <div className="text-sm text-gray-500">
            💡 有问题？点击右下角咨询数学专家
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* AI 题目解析 */}
            {apiKey && (
              <ProblemSolver
                apiKey={apiKey}
                onSolve={({ parsedFunction, xRange, yRange, keyPoints, explanation }) => {
                  setParsedFunction(parsedFunction);
                  setCanvasRange({ xRange, yRange });
                  setProblemInfo({ keyPoints, explanation });
                }}
              />
            )}

            {/* AI 自然语言生成 */}
            {apiKey && (
              <NaturalLanguageInput
                apiKey={apiKey}
                onGenerate={({ parsedFunction, xRange, yRange }) => {
                  setParsedFunction(parsedFunction);
                  setCanvasRange({ xRange, yRange });
                  setProblemInfo(null);
                }}
              />
            )}

            {/* 传统函数输入 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-gray-100 text-sm text-gray-500">或手动输入</span>
              </div>
            </div>
            
            <FunctionInput onChange={(pf) => {
              setParsedFunction(pf);
              setProblemInfo(null);
            }} />
            
            {/* AI 知识点讲解 */}
            {apiKey && (
              <ExplanationPanel
                parsedFunction={parsedFunction}
                apiKey={apiKey}
                usePreset={true}
              />
            )}
            
            {/* Export Panel */}
            <div className="p-4 bg-white rounded-lg border shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">导出</h3>
              
              <button
                onClick={handleRecord}
                disabled={isRecording || !parsedFunction}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {isRecording ? '录制中...' : '录制 MP4'}
              </button>
              
              {isRecording && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${recordProgress * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(recordProgress * 100)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <CanvasPlayer
              parsedFunction={parsedFunction}
              width={800}
              height={600}
              xRange={canvasRange.xRange}
              yRange={canvasRange.yRange}
            />
            
            {/* 题目解析信息 */}
            {problemInfo && (
              <div className="grid md:grid-cols-2 gap-4">
                {problemInfo.keyPoints.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">📌 关键点</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                      {problemInfo.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {problemInfo.explanation && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">💡 解题思路</h4>
                    <p className="text-sm text-yellow-800">{problemInfo.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Expert Chat */}
      <ExpertChat apiKey={import.meta.env.VITE_AI_API_KEY || ''} />
    </div>
  );
}
