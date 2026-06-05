import { useState, useRef, useCallback } from 'react';
import { expertRoles, recommendExpert, type ExpertRole } from '../core/ai/expertRoles';

interface Message {
  id: string;
  role: 'user' | 'expert';
  content: string;
  expertName?: string;
  expertAvatar?: string;
}

interface UseExpertChatOptions {
  apiKey: string;
  apiEndpoint?: string;
}

export function useExpertChat({ apiKey, apiEndpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions' }: UseExpertChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentExpert, setCurrentExpert] = useState<ExpertRole | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 发送消息
  const sendMessage = useCallback(async (content: string, expertId?: string) => {
    // 选择专家
    const expert = expertId 
      ? expertRoles.find(e => e.id === expertId) || recommendExpert(content)
      : recommendExpert(content);
    
    setCurrentExpert(expert);

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            { role: 'system', content: expert.systemPrompt },
            ...messages.filter(m => m.role === 'user').map(m => ({ 
              role: 'user' as const, 
              content: m.content 
            })),
            { role: 'user', content },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';

      // 添加专家回复
      const expertMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'expert',
        content: reply,
        expertName: expert.name,
        expertAvatar: expert.avatar,
      };
      setMessages(prev => [...prev, expertMessage]);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      // 错误回复
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'expert',
        content: '抱歉，网络有点问题，请稍后再试。',
        expertName: expert.name,
        expertAvatar: expert.avatar,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, apiEndpoint, messages]);

  // 清空对话
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentExpert(null);
  }, []);

  // 取消请求
  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    currentExpert,
    expertRoles,
    sendMessage,
    clearMessages,
    cancelRequest,
  };
}
