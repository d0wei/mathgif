import { Link } from 'react-router-dom';

const presets = [
  {
    id: 'sine-wave',
    name: '正弦波动画',
    description: '展示 y = sin(x) 的基本波形',
    category: '三角函数',
  },
  {
    id: 'amplitude-mod',
    name: '振幅调制',
    description: '展示振幅随时间变化的正弦波',
    category: '三角函数',
  },
  {
    id: 'frequency-mod',
    name: '频率调制',
    description: '展示频率随时间变化的正弦波',
    category: '三角函数',
  },
  {
    id: 'quadratic',
    name: '二次函数',
    description: '展示 y = ax² + bx + c 的参数变化',
    category: '多项式',
  },
  {
    id: 'exponential-growth',
    name: '指数增长',
    description: '展示指数函数的快速增长特性',
    category: '指数函数',
  },
  {
    id: 'tangent-slope',
    name: '切线斜率',
    description: '展示函数在某点的切线变化',
    category: '微积分',
  },
];

export function Gallery() {
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
              <Link to="/gallery" className="text-blue-600 font-medium">画廊</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">关于</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">预设动画库</h2>
        <p className="text-gray-600 mb-8">精选数学动画，点击即可查看和编辑</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition p-6"
            >
              <div className="text-xs font-medium text-blue-600 mb-2">
                {preset.category}
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{preset.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{preset.description}</p>
              <Link
                to={`/generator?preset=${preset.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                查看详情 →
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
