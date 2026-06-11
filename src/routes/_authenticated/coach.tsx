import { useEffect, useMemo, useRef, useState } from "react";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachEmptyState, MessageBubble } from "@/components/coach";
import { getCoachHistory, clearCoachHistory } from "@/lib/coach.functions";
import logoUrl from "@/assets/carbonlens-logo.png";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach · CarbonLens" },
      {
        name: "description",
        content:
          "Chat with your CarbonLens AI Coach for personalized footprint advice grounded in your real activity log.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CoachPage,
});

function CoachPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const fetchHistory = useServerFn(getCoachHistory);
  const clearHistory = useServerFn(clearCoachHistory);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["coach-history", user.id],
    queryFn: () => fetchHistory(),
  });

  const initialMessages = useMemo<UIMessage[]>(() => {
    return (historyData?.messages ?? []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    }));
  }, [historyData]);

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      }),
  );

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: `coach-${user.id}`,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Coach is unavailable right now"),
  });

  useEffect(() => {
    if (initialMessages.length && messages.length === 0) {
      setMessages(initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages.length]);

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    try {
      await sendMessage({ text: trimmed });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function onClear() {
    await clearHistory();
    setMessages([]);
    qc.invalidateQueries({ queryKey: ["coach-history", user.id] });
    toast.success("Chat cleared");
  }

  return (
    <main id="main-content" className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back to dashboard"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <img
              src={logoUrl}
              alt=""
              aria-hidden
              width={28}
              height={28}
              className="size-7 rounded"
            />
            <div>
              <p className="text-sm font-semibold tracking-tight">AI Coach</p>
              <p className="text-[11px] text-muted-foreground">Grounded in your last 30 days</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={messages.length === 0 || isLoading}
            aria-label="Clear chat"
          >
            <Trash2 className="size-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4">
        <div
          className="flex-1 space-y-4 overflow-y-auto pb-4"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {historyLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="ml-auto h-12 w-1/2" />
            </div>
          ) : messages.length === 0 ? (
            <CoachEmptyState onPick={send} />
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
          {isLoading && messages.at(-1)?.role === "user" ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
              Coach is thinking…
            </div>
          ) : null}
          {error ? <p className="text-xs text-destructive">{error.message}</p> : null}
          <div ref={endRef} />
        </div>

        <form
          className="mt-2 flex items-end gap-2 border-t border-border/60 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <label htmlFor="coach-input" className="sr-only">
            Message the coach
          </label>
          <Textarea
            id="coach-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Ask anything about your footprint…"
            rows={1}
            className="min-h-[44px] resize-none"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} aria-label="Send">
            <Send className="size-4" />
          </Button>
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">
          AI Coach can make mistakes. Verify high-impact decisions.{" "}
          <Link to="/dashboard" className="underline-offset-2 hover:underline">
            Back to dashboard
          </Link>
        </p>
      </section>
    </main>
  );
}
