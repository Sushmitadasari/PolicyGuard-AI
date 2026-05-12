import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import lottieReact from "lottie-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import botAnimation from "../../assets/chatbot/bot-animation.json";

const LottiePlayer =
  typeof lottieReact?.default === "function"
    ? lottieReact.default
    : typeof lottieReact?.default?.default === "function"
      ? lottieReact.default.default
      : null;

const HIDDEN_ROUTES = new Set(["/", "/login", "/register"]);

const SUGGESTED_QUESTIONS = [
  "How do I interpret risk score and confidence?",
  "What does third-party data sharing mean?",
  "How can I compare website and PDF privacy risks?",
  "Where can I view my recent analyses?",
];

const extractAnalysisCandidate = (state) => {
  if (!state || typeof state !== "object") {
    return null;
  }

  return (
    state.pdfAnalysis ||
    state.websiteAnalysis ||
    state.analysis ||
    state.data?.analysis ||
    state.data ||
    null
  );
};

const deriveRouteType = (pathname = "") => {
  if (pathname.startsWith("/pdf")) {
    return "pdf";
  }

  if (pathname.startsWith("/website")) {
    return "website";
  }

  return "platform";
};

function FloatingChatWidget() {
  const location = useLocation();
  const { user, initializing } = useAuth();
  const analytics = useAnalytics();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Hi! I am your PolicyGuard AI Assistant. Ask me about platform usage, privacy terms, clauses, or your current analysis.",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);

  const [sessionId] = useState(() => {
    const key = "policyguard-floating-chat-session";
    const existing = sessionStorage.getItem(key);
    if (existing) {
      return existing;
    }

    const created = `floating-${Date.now()}`;
    sessionStorage.setItem(key, created);
    return created;
  });

  const routeType = deriveRouteType(location.pathname);
  const stateCandidate = extractAnalysisCandidate(location.state);

  const analysisContext = useMemo(() => {
    const latestPdf = analytics?.latestAnalyses?.pdf || null;
    const latestWebsite = analytics?.latestAnalyses?.website || null;

    const fallbackCandidate = routeType === "pdf"
      ? latestPdf
      : routeType === "website"
        ? latestWebsite
        : (stateCandidate || latestWebsite || latestPdf || null);

    const candidate = stateCandidate || fallbackCandidate;

    if (!candidate || typeof candidate !== "object") {
      return {
        analysisId: "",
        documentName: "",
        sourceLabel: "",
      };
    }

    return {
      analysisId: candidate._id || candidate.id || candidate.analysisId || "",
      documentName:
        candidate.fileName ||
        candidate.documentName ||
        candidate.metadata?.fileName ||
        "",
      sourceLabel: routeType === "pdf"
        ? "PDF Analysis"
        : routeType === "website"
          ? "Website Analysis"
          : "Latest Analysis",
    };
  }, [analytics?.latestAnalyses?.pdf, analytics?.latestAnalyses?.website, routeType, stateCandidate]);

  useEffect(() => {
    if (!open) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const sendMessage = async (text = inputValue) => {
    const normalizedText = typeof text === "string" ? text.trim() : "";
    if (!normalizedText || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: normalizedText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const payload = {
        message: normalizedText,
        sessionId,
      };

      if (analysisContext.analysisId) {
        payload.analysisId = analysisContext.analysisId;
      }

      if (analysisContext.documentName) {
        payload.documentName = analysisContext.documentName;
      }

      const response = await api.post("/chatbot/chat", payload);
      const reply =
        response.data?.reply ||
        response.data?.message ||
        response.data?.response ||
        "I understand. Could you share a little more detail?";

      const assistantMessage = {
        id: Date.now() + 1,
        type: "ai",
        text: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantError = {
        id: Date.now() + 1,
        type: "ai",
        isError: true,
        text:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "I hit an issue while replying. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantError]);
    } finally {
      setLoading(false);
    }
  };

  const shouldRender = !initializing && Boolean(user) && !HIDDEN_ROUTES.has(location.pathname);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mb-4 flex h-[68vh] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#05101f]/95 shadow-2xl shadow-cyan-900/35 backdrop-blur-xl sm:h-[560px]"
          >
            <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-cyan-300/30 bg-cyan-400/10 p-1">
                  {LottiePlayer ? <LottiePlayer animationData={botAnimation} loop autoplay /> : null}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">PolicyGuard AI</p>
                  <p className="text-xs text-cyan-200/80">Global Privacy Assistant</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </header>

            {analysisContext.analysisId && (
              <div className="border-b border-white/10 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-100">
                Context active: {analysisContext.sourceLabel}
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.type === "user"
                      ? "bg-cyan-500 text-slate-950"
                      : message.isError
                        ? "border border-red-400/40 bg-red-500/15 text-red-100"
                        : "border border-white/10 bg-white/10 text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/70">
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 2 && !loading && (
              <div className="border-t border-white/10 px-4 py-3">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Suggested</p>
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 2).map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <footer className="border-t border-white/10 bg-black/20 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Ask about privacy, clauses, or dashboard usage..."
                  disabled={loading}
                  className="flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-300/40 focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={loading || !inputValue.trim()}
                  className="rounded-xl bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={open ? "Close assistant" : "Open assistant"}
        whileHover={{ scale: 1.07, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((prev) => !prev)}
        className="group relative flex h-14 w-14 items-center justify-center bg-transparent sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28"
      >
        {LottiePlayer ? (
          <LottiePlayer
            animationData={botAnimation}
            loop
            autoplay
            className="h-full w-full object-contain drop-shadow-[0_10px_22px_rgba(6,182,212,0.35)] transition-[filter,transform] duration-200 ease-out group-hover:drop-shadow-[0_14px_28px_rgba(6,182,212,0.42)] lg:drop-shadow-[0_14px_28px_rgba(6,182,212,0.48)] lg:group-hover:drop-shadow-[0_18px_36px_rgba(6,182,212,0.56)]"
          />
        ) : null}
      </motion.button>
    </div>
  );
}

export default FloatingChatWidget;