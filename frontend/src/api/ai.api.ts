import apiClient from "./axios";

export interface AiPromptRequest {
  prompt: string;
  context?: string;
}

export const aiAssistantApi = {
  chat: async (prompt: string, context?: string) => {
    const response = await apiClient.post<{ answer: string }>("/ai/chat", {
      prompt,
      context,
    });
    return response.data.answer;
  },

  reporting: async (prompt: string, context?: string) => {
    const response = await apiClient.post<{ answer: string }>("/ai/reporting", {
      prompt,
      context,
    });
    return response.data.answer;
  },
};
