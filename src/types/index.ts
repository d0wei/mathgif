// 数学函数相关类型
export interface ParsedFunction {
  expression: string;
  compiled: (scope: Record<string, number>) => number;
  params: string[];
  defaults: Record<string, number>;
  paramConfigs?: Record<string, ParamConfig>;  // AI 生成的参数配置范围
}

export interface ParamConfig {
  default: number;
  min: number;
  max: number;
  step: number;
}

// Canvas 渲染相关类型
export interface RenderConfig {
  width: number;
  height: number;
  xRange: [number, number];
  yRange: [number, number];
  showGrid: boolean;
  showAxis: boolean;
  backgroundColor: string;
  gridColor: string;
  axisColor: string;
  curveColor: string;
}

export interface AnimationFrame {
  time: number;
  params: Record<string, number>;
}

// 动画状态
export interface AnimationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  params: Record<string, number>;
}

// 预设动画
export interface PresetAnimation {
  id: string;
  name: string;
  description: string;
  category: 'function' | 'geometry' | 'calculus' | 'vector';
  expression: string;
  params: Record<string, ParamConfig>;
  animation?: {
    duration: number;
    paramAnimation?: Record<string, { from: number; to: number }>;
  };
  xRange: [number, number];
  yRange: [number, number];
}

// 录制配置
export interface RecorderConfig {
  canvas: HTMLCanvasElement;
  duration: number;
  fps: number;
  quality: 'low' | 'medium' | 'high';
}
