import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, ShieldAlert, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";
import { aiAssistantApi } from "@/api/ai.api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function readableForeground(hex?: string) {
  if (!hex) return "#ffffff";
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? "#172016" : "#ffffff";
}

export function ArisChatWidget() {
  const { isAuthenticated, role, permissions } = useAuth();
  const { currentTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Bonjour, je suis Aris. Je peux vous guider dans Simba_CTD et répondre uniquement sur la finance publique, les workflows, les rôles et les autorisations.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const primary = currentTenant?.primaryColor ?? "#14532d";
  const accent = currentTenant?.accentColor ?? "#d9a441";
  const primaryForeground = readableForeground(primary);
  const accentForeground = readableForeground(accent);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const canUseAris = useMemo(() => isAuthenticated && !!role, [isAuthenticated, role]);

  const sendQuestion = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !canUseAris) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const context = `Rôle: ${role ?? "inconnu"}\nPermissions: ${permissions.join(", ") || "aucune"}\nPage: ${window.location.pathname}`;
      const answer = await aiAssistantApi.chat(trimmed, context);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Je n’ai pas pu répondre pour le moment.";
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Je suis Aris. ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!canUseAris) return null;

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full border-0 shadow-lg transition-transform hover:scale-105"
        style={{
          backgroundColor: primary,
          color: primaryForeground,
          boxShadow: `0 18px 32px ${primary}33`,
        }}
        aria-label="Ouvrir Aris"
        title="Aris - Assistant IA"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] overflow-hidden rounded-2xl border bg-background shadow-2xl"
          style={{
            borderColor: `${primary}55`,
            boxShadow: `0 25px 55px ${primary}30`,
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/15 p-2">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Aris</div>
                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: accentForeground }}>
                  Assistant IA
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full text-white hover:bg-white/10"
              aria-label="Fermer Aris"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto bg-slate-50 p-3 text-sm">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 leading-6 ${
                    message.role === "user"
                      ? "text-white"
                      : "border bg-white text-slate-700"
                  }`}
                  style={
                    message.role === "user"
                      ? { backgroundColor: primary, color: primaryForeground }
                      : { borderColor: `${primary}22` }
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" style={{ color: primary }} />
                    Aris réfléchit…
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <ShieldAlert className="h-3.5 w-3.5" style={{ color: primary }} />
              Finance publique uniquement
            </div>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendQuestion();
                  }
                }}
                placeholder="Demandez un conseil sur un workflow, un module ou une action…"
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary"
              />
              <Button
                type="button"
                onClick={() => void sendQuestion()}
                disabled={loading || !input.trim()}
                className="self-end rounded-xl px-3"
                style={{ backgroundColor: primary, color: primaryForeground }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
