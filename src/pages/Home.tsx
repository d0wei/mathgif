import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FunctionInput } from '../components/FunctionInput';
import { CanvasPlayer } from '../components/CanvasPlayer';
import type { ParsedFunction } from '../types/index';

export function Home() {
  const [parsedFunction, setParsedFunction] = useState<ParsedFunction | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">MathGIF</h1>
            <nav className="flex gap-4">
              <Link to="/" className="text-blue-600 font-medium">首页</Link>
              <Link to="/generator" className="text-gray-600 hover:text-gray-900">生成器</Link>
              <Link to="/gallery" className="text-gray-600 hover:text-gray-900">画廊</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">关于</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">数学可视化，零代码生成</h2>
          <p className="text-xl text-blue-100 mb-8">
            输入函数表达式，一键生成高清数学动画
          </p>
          <Link
            to="/generator"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition"
          >
            开始创作
          </Link>
        </div>
      </section>

      {/* Quick Demo */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">快速体验</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <FunctionInput onChange={setParsedFunction} />
            <CanvasPlayer 
              parsedFunction={parsedFunction}
              width={600}
              height={450}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">功能特点</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">零代码</h4>
              <p className="text-gray-600">无需编程，输入表达式即可生成动画</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📹</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">高清导出</h4>
              <p className="text-gray-600">支持 MP4/GIF 格式，适配各种场景</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">实时预览</h4>
              <p className="text-gray-600">参数调节即时反馈，所见即所得</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 MathGIF. 让数学更直观。</p>
        </div>
      </footer>
    </div>
  );
}
