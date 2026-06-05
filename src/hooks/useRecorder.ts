import { useState, useCallback, useRef } from 'react';
import { MP4Recorder } from '../core/recorder/mp4Recorder';
import type { AnimationFrame } from '../types/index';

interface UseRecorderOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  duration: number;
  fps?: number;
}

interface RecorderState {
  isRecording: boolean;
  progress: number;
  error: string | null;
}

export function useRecorder({
  canvasRef,
  duration,
  fps = 30,
}: UseRecorderOptions) {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    progress: 0,
    error: null,
  });

  const recorderRef = useRef<MP4Recorder | null>(null);
  const animationRef = useRef<number | null>(null);

  // 录制动画
  const record = useCallback(async (
    renderFrame: (frame: AnimationFrame) => void,
    totalFrames: number
  ): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setState(prev => ({ ...prev, error: 'Canvas not found' }));
      return null;
    }

    setState({ isRecording: true, progress: 0, error: null });
    recorderRef.current = new MP4Recorder();

    try {
      // 开始录制
      await recorderRef.current.start({
        canvas,
        duration,
        fps,
        quality: 'high',
      });

      // 逐帧渲染
      const frameDuration = 1000 / fps;
      let currentFrame = 0;

      await new Promise<void>((resolve) => {
        const renderLoop = () => {
          const time = currentFrame / totalFrames;
          renderFrame({ time, params: {} });
          
          currentFrame++;
          setState(prev => ({ ...prev, progress: currentFrame / totalFrames }));

          if (currentFrame <= totalFrames) {
            animationRef.current = setTimeout(renderLoop, frameDuration);
          } else {
            resolve();
          }
        };

        renderLoop();
      });

      // 停止录制并获取视频
      const blob = await recorderRef.current.stop();
      setState(prev => ({ ...prev, isRecording: false, progress: 1 }));
      return blob;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: error instanceof Error ? error.message : 'Recording failed',
      }));
      return null;
    }
  }, [canvasRef, duration, fps]);

  // 取消录制
  const cancel = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    if (recorderRef.current) {
      recorderRef.current.stop().catch(() => {});
    }
    setState({ isRecording: false, progress: 0, error: null });
  }, []);

  return {
    state,
    record,
    cancel,
  };
}
