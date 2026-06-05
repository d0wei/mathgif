import { useState, useCallback, useRef, useEffect } from 'react';
import type { AnimationState, AnimationFrame } from '../types/index';

interface UseAnimationOptions {
  duration: number;  // 秒
  initialParams: Record<string, number>;
  onFrame?: (frame: AnimationFrame) => void;
}

export function useAnimation({
  duration,
  initialParams,
  onFrame,
}: UseAnimationOptions) {
  const [state, setState] = useState<AnimationState>({
    isPlaying: false,
    currentTime: 0,
    duration,
    params: { ...initialParams },
  });

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // 获取当前帧
  const getCurrentFrame = useCallback((): AnimationFrame => {
    return {
      time: state.currentTime,
      params: { ...state.params },
    };
  }, [state.currentTime, state.params]);

  // 播放
  const play = useCallback(() => {
    if (state.isPlaying) return;

    setState(prev => ({ ...prev, isPlaying: true }));
    startTimeRef.current = performance.now() - pausedTimeRef.current;

    const loop = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      setState(prev => ({
        ...prev,
        currentTime: progress,
      }));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(loop);
      } else {
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    animationRef.current = requestAnimationFrame(loop);
  }, [state.isPlaying, duration]);

  // 暂停
  const pause = useCallback(() => {
    if (!state.isPlaying) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    pausedTimeRef.current = state.currentTime * duration * 1000;
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [state.isPlaying, state.currentTime, duration]);

  // 重置
  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    pausedTimeRef.current = 0;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));
  }, []);

  // 跳转到指定时间
  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(1, time));
    pausedTimeRef.current = clampedTime * duration * 1000;
    
    if (state.isPlaying) {
      startTimeRef.current = performance.now() - pausedTimeRef.current;
    }

    setState(prev => ({
      ...prev,
      currentTime: clampedTime,
    }));
  }, [state.isPlaying, duration]);

  // 更新参数
  const updateParam = useCallback((key: string, value: number) => {
    setState(prev => ({
      ...prev,
      params: { ...prev.params, [key]: value },
    }));
  }, []);

  // 重置所有参数
  const resetParams = useCallback((newParams: Record<string, number>) => {
    setState(prev => ({
      ...prev,
      params: { ...newParams },
    }));
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 帧回调
  useEffect(() => {
    onFrame?.(getCurrentFrame());
  }, [state.currentTime, state.params, onFrame, getCurrentFrame]);

  return {
    state,
    play,
    pause,
    reset,
    seek,
    updateParam,
    resetParams,
    getCurrentFrame,
  };
}
