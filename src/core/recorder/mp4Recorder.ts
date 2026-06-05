import type { RecorderConfig } from '../../types/index';

export class MP4Recorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(config: RecorderConfig): Promise<void> {
    const { canvas, fps } = config;
    
    // 获取 canvas 的媒体流
    this.stream = canvas.captureStream(fps);
    
    // 配置录制参数
    const mimeType = this.getSupportedMimeType();
    const options: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: this.getBitrate(config.quality),
    };

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    return new Promise((resolve) => {
      this.mediaRecorder!.onstart = () => resolve();
      this.mediaRecorder!.start(100); // 每 100ms 收集一次数据
    });
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not started'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder!.mimeType });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'video/webm';
  }

  private getBitrate(quality: 'low' | 'medium' | 'high'): number {
    const bitrates = {
      low: 1000000,      // 1 Mbps
      medium: 5000000,   // 5 Mbps
      high: 10000000,    // 10 Mbps
    };
    return bitrates[quality];
  }

  // 下载视频
  static download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
