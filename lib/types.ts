export type ThreadSummary = {
  threadId: string;
  summaryText: string;
  updatedAt: string;
};

export type UnreadSender = {
  email: string;
  name?: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: number;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ThreadListItem = {
  id: string;
  subject: string;
  snippet: string;
  lastMessageAt: string | null;
  unreadCount: number;
  labels: string[];
  lastFromName?: string | null;
  lastFromEmail?: string | null;
};

export type InboxChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  createdAt: string;
};

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type ThreadMessage = {
  id: string;
  threadId: string;
  fromName?: string | null;
  fromEmail?: string | null;
  subject?: string | null;
  date?: string | null;
  bodyText?: string | null;
  bodyHtml?: string | null;
  isUnread: boolean;
};
