"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Headphones,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface SupportChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SESSION_STORAGE_CHAT_KEY = "earnora_support_chat_session_v1";

const QUICK_QUESTIONS = [
  "How many points do I need for the next tier?",
  "What is my available & pending balance?",
  "How do M-Pesa withdrawal limits work?",
  "How does Watch Ads & Earn work?",
];

export function openSupportChat(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("earnora:open-support"));
  }
}

export const SupportChatModal: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportChatMessage[]>(() => [
    {
      id: "msg_welcome",
      role: "assistant",
      content:
        "Hello! I'm the EarnOra AI Support Assistant. Ask me about your balance, points & withdrawal limits, Watch & Earn ads, task approvals, or M-Pesa payouts.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHumanEscalation, setShowHumanEscalation] = useState(false);
  const [escalationNote, setEscalationNote] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketConfirmation, setTicketConfirmation] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session history from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SupportChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist session history
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Listen for global open-support event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("earnora:open-support", handleOpen);
    return () => window.removeEventListener("earnora:open-support", handleOpen);
  }, []);

  const sendMessage = async (textToSend?: string) => {
    const cleanText = (textToSend ?? input).trim();
    if (!cleanText || isStreaming) return;

    const userMsg: SupportChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantMsgId = `ast_${Date.now() + 1}`;
    const placeholderAssistant: SupportChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages([...updatedHistory, placeholderAssistant]);
    if (!textToSend) setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanText,
          history: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errText =
          errData.error ||
          "Sorry, I couldn't process that request right now. Please try again or tap 'Talk to a human'.";
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: errText } : m))
        );
        setIsStreaming(false);
        return;
      }

      if (!res.body) {
        const fallbackText = await res.text();
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fallbackText } : m))
        );
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snapshot = accumulated;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: snapshot } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  "Network error while connecting to EarnOra Support. You can escalate to our human team below.",
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitting(true);
    setTicketConfirmation(null);

    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Support Request from @${user?.username || "Member"}`,
          message:
            escalationNote.trim() ||
            "User requested human follow-up from the AI Support Assistant.",
          contact: user?.phoneNumber || "",
          transcript: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setTicketConfirmation(
          `Ticket ${data.ticket.id} created! Our Kenya support desk will follow up with you shortly.`
        );
        setEscalationNote("");
      } else {
        setTicketConfirmation(
          data.error || "Please email support@earnora.co.ke with your inquiry."
        );
      }
    } catch {
      setTicketConfirmation("Please email support@earnora.co.ke with your inquiry.");
    } finally {
      setTicketSubmitting(false);
    }
  };

  const buildMailtoHref = () => {
    const subject = encodeURIComponent(
      `EarnOra Support Inquiry — @${user?.username || "Member"}`
    );
    const transcriptText = messages
      .slice(-6)
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join("\n\n");
    const body = encodeURIComponent(
      `Hi EarnOra Support Team,\n\nI need assistance with my account (@${
        user?.username || "Member"
      }).\n\n${escalationNote ? `Details: ${escalationNote}\n\n` : ""}--- Chat Transcript ---\n${transcriptText}`
    );
    return `mailto:support@earnora.co.ke?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      {/* Bottom Sheet on Mobile (360-430px), Side Panel / Modal on Desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[420px] md:w-[440px] h-[86vh] sm:h-[640px] max-h-[90vh] rounded-t-[24px] sm:rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Chat Header + Privacy Notice */}
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card-elevated)] shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[var(--brand-blue)] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-display">
                    EarnOra AI Support
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[var(--accent-green)]/15 text-[var(--accent-green)]">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Instant answers on tasks, points, limits & M-Pesa
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close support chat"
              className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Short Privacy Note */}
          <div className="px-2.5 py-1.5 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0" />
            <span>
              Privacy note: Read-only session helper. Never share your password, OTP, or M-Pesa PIN.
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-page)]/50">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-[var(--brand-blue)] text-white"
                      : "bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--brand-blue)]"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-[16px] px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? "bg-[var(--brand-blue)] text-white font-medium rounded-tr-xs"
                      : "bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-xs shadow-2xs"
                  }`}
                >
                  {msg.content ? (
                    <div className="whitespace-pre-line">{msg.content}</div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] py-0.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--brand-blue)]" />
                      <span>EarnOra Assistant is typing...</span>
                    </div>
                  )}
                  <span
                    className={`block text-[9px] mt-1 ${
                      isUser ? "text-blue-100 text-right" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Suggested Quick Questions */}
          {messages.length <= 2 && !isStreaming && (
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block px-1">
                Suggested Questions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="text-left px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] text-[11px] font-semibold text-[var(--brand-blue)] transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Human Support Escalation Drawer inside Chat */}
          {showHumanEscalation && (
            <div className="p-3.5 rounded-[16px] bg-[var(--bg-card)] border border-[var(--brand-blue)]/30 space-y-2.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                  <span>Escalate to Human Support</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowHumanEscalation(false)}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Close
                </button>
              </div>

              {ticketConfirmation ? (
                <div className="p-2.5 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 text-xs text-[var(--accent-green)] flex items-start gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{ticketConfirmation}</span>
                </div>
              ) : (
                <form onSubmit={handleCreateSupportTicket} className="space-y-2">
                  <textarea
                    rows={2}
                    value={escalationNote}
                    onChange={(e) => setEscalationNote(e.target.value)}
                    placeholder="Briefly describe your issue (your chat transcript will be attached automatically)..."
                    className="w-full p-2.5 text-xs rounded-[10px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--brand-blue)]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={ticketSubmitting}
                      className="flex-1 py-2 px-3 rounded-[10px] bg-[var(--brand-blue)] text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 cursor-pointer"
                    >
                      {ticketSubmitting ? "Submitting Ticket..." : "Submit Support Ticket"}
                    </button>
                    <a
                      href={buildMailtoHref()}
                      className="py-2 px-3 rounded-[10px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-blue)] flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Controls: Human Support Fallback + Input Box */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] shrink-0 space-y-2">
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setShowHumanEscalation(!showHumanEscalation)}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-blue)] hover:underline cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Talk to a human / email support</span>
            </button>
            <span className="text-[10px] text-[var(--text-muted)]">
              {input.length}/600
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              maxLength={600}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tasks, points, limits, or M-Pesa..."
              className="flex-1 h-10 px-3.5 text-xs rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--brand-blue)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
              className="h-10 px-4 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-extrabold hover:opacity-95 disabled:opacity-40 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
