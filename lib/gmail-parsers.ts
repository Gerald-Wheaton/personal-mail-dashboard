import type { gmail_v1 } from "googleapis";

function headerValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
  const match = headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return match?.value ?? "";
}

function parseAddressList(value: string) {
  if (!value) return [] as string[];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function extractBody(part?: gmail_v1.Schema$MessagePart): { text?: string; html?: string } {
  if (!part) return {};
  if (part.mimeType === "text/plain" && part.body?.data) {
    return { text: decodeBase64Url(part.body.data) };
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    return { html: decodeBase64Url(part.body.data) };
  }
  if (part.parts) {
    let text: string | undefined;
    let html: string | undefined;
    for (const child of part.parts) {
      const result = extractBody(child);
      if (!text && result.text) text = result.text;
      if (!html && result.html) html = result.html;
    }
    return { text, html };
  }
  return {};
}

export function parseMessage(message: gmail_v1.Schema$Message) {
  const headers = message.payload?.headers ?? [];
  const fromRaw = headerValue(headers, "From");
  const subject = headerValue(headers, "Subject");
  const dateRaw = headerValue(headers, "Date");
  const toRaw = headerValue(headers, "To");
  const ccRaw = headerValue(headers, "Cc");
  const bccRaw = headerValue(headers, "Bcc");
  const messageId = headerValue(headers, "Message-ID") || headerValue(headers, "Message-Id");
  const references = headerValue(headers, "References");
  const inReplyTo = headerValue(headers, "In-Reply-To");

  const fromMatch = /^(.*)<(.+)>$/.exec(fromRaw);
  const fromName = fromMatch ? fromMatch[1].trim().replace(/\"/g, "") : "";
  const fromEmail = fromMatch ? fromMatch[2].trim() : fromRaw;

  const body = extractBody(message.payload ?? undefined);
  return {
    id: message.id ?? "",
    threadId: message.threadId ?? "",
    fromName,
    fromEmail,
    subject,
    date: dateRaw ? new Date(dateRaw) : null,
    to: parseAddressList(toRaw),
    cc: parseAddressList(ccRaw),
    bcc: parseAddressList(bccRaw),
    bodyText: body.text ?? "",
    bodyHtml: body.html ?? "",
    labels: message.labelIds ?? [],
    isUnread: (message.labelIds ?? []).includes("UNREAD"),
    rfcMessageId: messageId || null,
    references: references || null,
    inReplyTo: inReplyTo || null,
    snippet: message.snippet ?? "",
  };
}
