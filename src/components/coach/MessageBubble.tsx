/**
 * Single chat-message bubble.
 *
 * User messages render as a primary-coloured bubble on the right; assistant
 * messages render with markdown styling on the left. Extracted from the
 * coach route to keep that file a thin composition.
 */
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground"
            : "max-w-[85%] rounded-2xl rounded-bl-sm border border-border/70 bg-card px-3.5 py-2 text-sm text-foreground"
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-strong:text-foreground">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
