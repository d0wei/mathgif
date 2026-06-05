import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gray-900">MathGIF</Link>
            <nav className="flex gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">首页</Link>
              <Link to="/generator" className="text-gray-600 hover:text-gray-900">生成器</Link>
              <Link to="/gallery" className="text-gray-600 hover:text-gray-900">画廊</Link>
              <Link to="/about" className="text-blue-600 font-medium">关于</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">关于 MathGIF</h2>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            MathGIF 是一个专注于数学可视化的在线工具，旨在让数学概念变得更加直观和易于理解。
          </p>

          <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">我们的使命</h3>
          <p className="text-gray-600 mb-4">
            数学不应该是抽象的符号堆砌，而应该是直观的图形和动画。通过可视化，
            我们希望帮助学生更好地理解数学概念，帮助老师制作更生动的教学材料，
            帮助创作者制作更吸引人的数学内容。
          </p>

          <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">使用指南</h3>
          <div className="bg-white rounded-lg p-6 border space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">1. 输入函数</h4>
              <p className="text-gray-600 text-sm">
                在生成器页面输入数学表达式，如 <code>a * sin(b * x)</code>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">2. 调节参数</h4>
              <p className="text-gray-600 text-sm">
                使用滑块实时调节参数，观察图形变化
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">3. 导出动画</h4>
              <p className="text-gray-600 text-sm">
                点击录制按钮，生成 MP4 或 GIF 格式的动画
              </p>
            </div>
          </div>

          <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">支持的函数</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>三角函数: sin, cos, tan</li>
            <li>指数对数: exp, log</li>
            <li>其他函数: sqrt, abs</li>
            <li>运算符: +, -, *, /, ^</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">联系我们</h3>
          <p className="text-gray-600">
            如有问题或建议，欢迎通过以下方式联系我们：
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>邮箱: contact@mathgif.tech</li>
            <li>GitHub: github.com/mathgif</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
