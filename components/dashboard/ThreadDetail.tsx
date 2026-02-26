"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ThreadListItem, ThreadMessage } from "@/lib/types";

type ParsedMessage = {
  body: string;
  footerLines: string[];
};

type SenderInfo = {
  senderKey: string;
  senderName: string;
  senderEmail: string;
  emails: string[];
  phones: string[];
  websites: string[];
  company: string[];
  title: string[];
  misc: string[];
};

function formatTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString();
}

function looksLikeUrl(value: string) {
  return /(https?:\/\/|www\.)\S+/i.test(value);
}

function looksLikeEmail(value: string) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi.test(value);
}

function looksLikePhone(value: string) {
  return /(\+?\d[\d().\-\s]{7,}\d)/.test(value);
}

function looksLikeRole(value: string) {
  return /\b(ceo|coo|cto|cfo|founder|president|vp|director|manager|consultant|engineer|developer|specialist|coordinator|lead)\b/i.test(
    value
  );
}

function looksLikeCompany(value: string) {
  return /\b(inc|llc|ltd|corp|corporation|company|consulting|solutions|group|partners|systems|technologies|fm360)\b/i.test(
    value
  );
}

function isFooterDelimiter(value: string) {
  return /^(--+|__+)\s*$/.test(value) || /^sent from my /i.test(value);
}

function isDisclaimerStart(value: string) {
  return /\b(confidential|privileged|intended recipient|disclaimer|virus)\b/i.test(
    value
  );
}

function isSignoffLine(value: string) {
  return /^(thanks|thank you|best|best regards|regards|kind regards|warm regards|sincerely|cheers|respectfully)[,!]?\s*$/i.test(
    value
  );
}

function isQuotedReplyBoundary(value: string) {
  return (
    /^on .+wrote:\s*$/i.test(value) ||
    /^from:\s.+$/i.test(value) ||
    /^-{2,}\s*forwarded message\s*-{2,}$/i.test(value) ||
    /^begin forwarded message:\s*$/i.test(value)
  );
}

function isQuotedLine(value: string) {
  return /^\s*>/.test(value);
}

function findQuotedThreadStart(lines: string[]) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;

    if (isQuotedReplyBoundary(line)) {
      return i;
    }

    if (isQuotedLine(line)) {
      const window = lines.slice(i, Math.min(i + 6, lines.length));
      const quotedCount = window.reduce((count, entry) => (
        isQuotedLine(entry.trim()) ? count + 1 : count
      ), 0);
      if (quotedCount >= 2) return i;
    }
  }
  return -1;
}

function parseMessageBody(rawBody: string | null | undefined): ParsedMessage {
  const normalized = (rawBody ?? "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const quotedStart = findQuotedThreadStart(lines);
  const workingLines = quotedStart === -1 ? lines : lines.slice(0, quotedStart);

  if (!workingLines.length) {
    return { body: "", footerLines: [] };
  }

  let footerStart = -1;

  for (let i = 0; i < workingLines.length; i += 1) {
    const line = workingLines[i].trim();
    if (!line) continue;
    if (isDisclaimerStart(line)) {
      footerStart = i;
      break;
    }
  }

  if (footerStart === -1) {
    for (let i = workingLines.length - 1; i >= 0; i -= 1) {
      const line = workingLines[i].trim();
      if (!line) continue;

      if (isFooterDelimiter(line)) {
        footerStart = i;
        break;
      }

      if (isSignoffLine(line)) {
        footerStart = i;
        break;
      }

      if (
        looksLikeEmail(line) ||
        looksLikePhone(line) ||
        looksLikeUrl(line) ||
        looksLikeCompany(line) ||
        looksLikeRole(line)
      ) {
        footerStart = i;
      } else if (footerStart !== -1) {
        break;
      }
    }
  }

  if (footerStart === -1) {
    return {
      body: workingLines.join("\n").trim(),
      footerLines: [],
    };
  }

  const body = workingLines
    .slice(0, footerStart)
    .join("\n")
    .trim();
  const footerLines = workingLines.slice(footerStart).map((line) => line.trim()).filter(Boolean);

  return { body, footerLines };
}

function uniquePush(target: string[], value: string) {
  if (!value) return;
  if (!target.includes(value)) {
    target.push(value);
  }
}

function extractFooterContactInfo(footerLines: string[]) {
  const emails: string[] = [];
  const phones: string[] = [];
  const websites: string[] = [];
  const company: string[] = [];
  const title: string[] = [];
  const misc: string[] = [];

  for (const line of footerLines) {
    const emailMatches = line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
    const phoneMatches = line.match(/(\+?\d[\d().\-\s]{7,}\d)/g) ?? [];
    const webMatches = line.match(/(https?:\/\/\S+|www\.\S+)/gi) ?? [];

    emailMatches.forEach((entry) => uniquePush(emails, entry));
    phoneMatches.forEach((entry) => uniquePush(phones, entry.trim()));
    webMatches.forEach((entry) => uniquePush(websites, entry));

    if (looksLikeCompany(line)) uniquePush(company, line);
    else if (looksLikeRole(line)) uniquePush(title, line);
    else if (!isFooterDelimiter(line) && !isSignoffLine(line) && !isDisclaimerStart(line)) uniquePush(misc, line);
  }

  return { emails, phones, websites, company, title, misc };
}

function buildSenderInfo(messages: ThreadMessage[]) {
  const senderMap = new Map<string, SenderInfo>();

  for (const message of messages) {
    const senderEmail = message.fromEmail || "";
    const senderName = message.fromName || senderEmail || "Unknown sender";
    const senderKey = senderEmail || senderName;
    const parsed = parseMessageBody(message.bodyText || message.bodyHtml || "");

    if (!parsed.footerLines.length) continue;

    const extracted = extractFooterContactInfo(parsed.footerLines);
    const existing = senderMap.get(senderKey) ?? {
      senderKey,
      senderName,
      senderEmail,
      emails: [],
      phones: [],
      websites: [],
      company: [],
      title: [],
      misc: [],
    };

    extracted.emails.forEach((entry) => uniquePush(existing.emails, entry));
    extracted.phones.forEach((entry) => uniquePush(existing.phones, entry));
    extracted.websites.forEach((entry) => uniquePush(existing.websites, entry));
    extracted.company.forEach((entry) => uniquePush(existing.company, entry));
    extracted.title.forEach((entry) => uniquePush(existing.title, entry));
    extracted.misc.forEach((entry) => uniquePush(existing.misc, entry));

    if (!existing.senderEmail && senderEmail) {
      existing.senderEmail = senderEmail;
    }

    senderMap.set(senderKey, existing);
  }

  return Array.from(senderMap.values());
}

export function ThreadDetail({
  thread,
  messages,
  loading,
}: {
  thread: ThreadListItem | null;
  messages: ThreadMessage[];
  loading: boolean;
}) {
  const [mode, setMode] = useState("reply");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedMessages, setCollapsedMessages] = useState<Record<string, boolean>>({});
  const senderInfo = buildSenderInfo(messages);

  const toggleMessageCollapse = (messageId: string) => {
    setCollapsedMessages((current) => ({
      ...current,
      [messageId]: !current[messageId],
    }));
  };

  const handleSend = async () => {
    if (!thread) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/threads/${thread.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody, mode }),
      });
      if (!response.ok) {
        throw new Error("Unable to send reply.");
      }
      setReplyBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="flex h-[72vh] flex-col overflow-hidden border border-border/60 bg-card/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Thread Detail
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            {thread?.subject || "Select a thread"}
          </h2>
        </div>
        {thread ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Reply
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-border/60 bg-card">
              <DialogHeader>
                <DialogTitle>Send Reply</DialogTitle>
              </DialogHeader>
              <Tabs value={mode} onValueChange={setMode}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="reply">Reply</TabsTrigger>
                  <TabsTrigger value="reply-all">Reply All</TabsTrigger>
                </TabsList>
              </Tabs>
              <Textarea
                rows={6}
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder="Write a quick, focused reply..."
              />
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <Button
                onClick={handleSend}
                disabled={sending || !replyBody.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {sending ? "Sending..." : "Send Reply"}
              </Button>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
      <ScrollArea className="min-h-0 flex-1 px-4 py-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading thread...</div>
        ) : thread ? (
          <div className="flex flex-col gap-4">
            {senderInfo.length ? (
              <details className="rounded-2xl border border-border/60 bg-background/30 px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                  Sender information ({senderInfo.length})
                </summary>
                <div className="mt-3 space-y-3">
                  {senderInfo.map((sender) => (
                    <div
                      key={sender.senderKey}
                      className="rounded-xl border border-border/50 bg-background/40 px-3 py-3 text-xs text-muted-foreground"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {sender.senderName}
                      </p>
                      {sender.senderEmail ? <p>{sender.senderEmail}</p> : null}
                      {sender.company.map((entry) => (
                        <p key={`${sender.senderKey}-company-${entry}`}>Company: {entry}</p>
                      ))}
                      {sender.title.map((entry) => (
                        <p key={`${sender.senderKey}-title-${entry}`}>Title: {entry}</p>
                      ))}
                      {sender.emails.map((entry) => (
                        <p key={`${sender.senderKey}-email-${entry}`}>Email: {entry}</p>
                      ))}
                      {sender.phones.map((entry) => (
                        <p key={`${sender.senderKey}-phone-${entry}`}>Phone: {entry}</p>
                      ))}
                      {sender.websites.map((entry) => (
                        <p key={`${sender.senderKey}-website-${entry}`}>Website: {entry}</p>
                      ))}
                      {sender.misc.slice(0, 3).map((entry) => (
                        <p key={`${sender.senderKey}-misc-${entry}`}>Other: {entry}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
            {messages.map((message) => (
              (() => {
                const parsed = parseMessageBody(message.bodyText || message.bodyHtml || "");
                const isCollapsed = Boolean(collapsedMessages[message.id]);
                return (
                  <div
                    key={message.id}
                    className={`rounded-2xl border px-4 py-3 ${
                      message.isUnread
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/60 bg-background/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {message.fromName || message.fromEmail || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {message.fromEmail}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                          {formatTime(message.date)}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-7 bg-secondary/40 px-2 text-[10px] uppercase tracking-[0.2em]"
                          onClick={() => toggleMessageCollapse(message.id)}
                        >
                          {isCollapsed ? "Expand" : "Collapse"}
                        </Button>
                      </div>
                    </div>
                    {!isCollapsed ? (
                      <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">
                        {parsed.body || "(No new message content after cleanup)"}
                      </p>
                    ) : null}
                  </div>
                );
              })()
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a thread from the left.
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
