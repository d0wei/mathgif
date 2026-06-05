import type { RenderConfig, AnimationFrame } from '../../types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: RenderConfig;
  private animationId: number | null = null;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement, config: RenderConfig) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;
    this.config = config;
    
    // 设置 canvas 尺寸
    canvas.width = config.width;
    canvas.height = config.height;
  }

  // 数学坐标 → 屏幕坐标
  mathToScreen(x: number, y: number): [number, number] {
    const { width, height, xRange, yRange } = this.config;
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    
    const sx = ((x - xMin) / (xMax - xMin)) * width;
    const sy = height - ((y - yMin) / (yMax - yMin)) * height;
    
    return [sx, sy];
  }

  // 屏幕坐标 → 数学坐标
  screenToMath(sx: number, sy: number): [number, number] {
    const { width, height, xRange, yRange } = this.config;
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    
    const x = xMin + (sx / width) * (xMax - xMin);
    const y = yMax - (sy / height) * (yMax - yMin);
    
    return [x, y];
  }

  // 清空画布
  clear(): void {
    const { width, height, backgroundColor } = this.config;
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, width, height);
  }

  // 绘制网格
  drawGrid(): void {
    if (!this.config.showGrid) return;
    
    const { width, height, xRange, yRange, gridColor } = this.config;
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    
    // 计算网格间隔
    const xStep = this.calculateGridStep(xMax - xMin);
    const yStep = this.calculateGridStep(yMax - yMin);
    
    // 垂直线
    const xStart = Math.floor(xMin / xStep) * xStep;
    for (let x = xStart; x <= xMax; x += xStep) {
      const [sx] = this.mathToScreen(x, 0);
      this.ctx.beginPath();
      this.ctx.moveTo(sx, 0);
      this.ctx.lineTo(sx, height);
      this.ctx.stroke();
    }
    
    // 水平线
    const yStart = Math.floor(yMin / yStep) * yStep;
    for (let y = yStart; y <= yMax; y += yStep) {
      const [, sy] = this.mathToScreen(0, y);
      this.ctx.beginPath();
      this.ctx.moveTo(0, sy);
      this.ctx.lineTo(width, sy);
      this.ctx.stroke();
    }
  }

  // 计算合适的网格间隔
  private calculateGridStep(range: number): number {
    const roughStep = range / 10;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;
    
    if (normalized < 1.5) return magnitude;
    if (normalized < 3) return 2 * magnitude;
    if (normalized < 7) return 5 * magnitude;
    return 10 * magnitude;
  }

  // 绘制坐标轴
  drawAxes(): void {
    if (!this.config.showAxis) return;
    
    const { width, height, xRange, yRange, axisColor } = this.config;
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    
    this.ctx.strokeStyle = axisColor;
    this.ctx.lineWidth = 2;
    
    // X轴
    if (yMin <= 0 && yMax >= 0) {
      const [, sy] = this.mathToScreen(0, 0);
      this.ctx.beginPath();
      this.ctx.moveTo(0, sy);
      this.ctx.lineTo(width, sy);
      this.ctx.stroke();
    }
    
    // Y轴
    if (xMin <= 0 && xMax >= 0) {
      const [sx] = this.mathToScreen(0, 0);
      this.ctx.beginPath();
      this.ctx.moveTo(sx, 0);
      this.ctx.lineTo(sx, height);
      this.ctx.stroke();
    }
  }

  // 绘制函数曲线
  drawFunction(
    fn: (x: number, params: Record<string, number>) => number,
    frame: AnimationFrame,
    steps: number = 1000
  ): void {
    const { xRange, curveColor } = this.config;
    const [xMin, xMax] = xRange;
    
    this.ctx.strokeStyle = curveColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    let firstPoint = true;
    const dx = (xMax - xMin) / steps;
    
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = fn(x, frame.params);
      
      // 检查 y 是否在有效范围内
      if (!isFinite(y) || isNaN(y)) {
        firstPoint = true;
        continue;
      }
      
      const [sx, sy] = this.mathToScreen(x, y);
      
      if (firstPoint) {
        this.ctx.moveTo(sx, sy);
        firstPoint = false;
      } else {
        this.ctx.lineTo(sx, sy);
      }
    }
    
    this.ctx.stroke();
  }

  // 渲染单帧
  renderFrame(
    fn: (x: number, params: Record<string, number>) => number,
    frame: AnimationFrame
  ): void {
    this.clear();
    this.drawGrid();
    this.drawAxes();
    this.drawFunction(fn, frame);
  }

  // 开始动画循环
  start(
    fn: (x: number, params: Record<string, number>) => number,
    getFrame: () => AnimationFrame
  ): void {
    const loop = (timestamp: number) => {
      if (!this.lastTime) this.lastTime = timestamp;
      
      const frame = getFrame();
      this.renderFrame(fn, frame);
      
      this.animationId = requestAnimationFrame(loop);
    };
    
    this.lastTime = 0;
    this.animationId = requestAnimationFrame(loop);
  }

  // 停止动画
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // 获取 canvas 元素
  getCanvas(): HTMLCanvasElement {
    return this.ctx.canvas;
  }
}
