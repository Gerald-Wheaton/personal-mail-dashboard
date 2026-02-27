import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  serial,
} from "drizzle-orm/pg-core";

export const oauthTokens = pgTable("oauth_tokens", {
  provider: text("provider").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiry: timestamp("expiry", { withTimezone: true }),
  encryptedAt: timestamp("encrypted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const threads = pgTable("threads", {
  id: text("id").primaryKey(),
  subject: text("subject"),
  snippet: text("snippet"),
  lastFromName: text("last_from_name"),
  lastFromEmail: text("last_from_email"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  unreadCount: integer("unread_count").notNull().default(0),
  labels: jsonb("labels").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  fromEmail: text("from_email"),
  fromName: text("from_name"),
  to: jsonb("to").$type<string[]>().notNull().default([]),
  cc: jsonb("cc").$type<string[]>().notNull().default([]),
  bcc: jsonb("bcc").$type<string[]>().notNull().default([]),
  subject: text("subject"),
  date: timestamp("date", { withTimezone: true }),
  bodyText: text("body_text"),
  bodyHtml: text("body_html"),
  isUnread: boolean("is_unread").notNull().default(false),
  labels: jsonb("labels").$type<string[]>().notNull().default([]),
  rfcMessageId: text("rfc_message_id"),
  references: text("references"),
  inReplyTo: text("in_reply_to"),
});

export const summaries = pgTable("summaries", {
  threadId: text("thread_id")
    .primaryKey()
    .references(() => threads.id, { onDelete: "cascade" }),
  summaryText: text("summary_text").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inboxChatMessages = pgTable("inbox_chat_messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  totalTokens: integer("total_tokens"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
