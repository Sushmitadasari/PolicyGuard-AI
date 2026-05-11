import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/common/PageHeader";
import api from "../services/api";
import { generateSuggestedQuestions, getRiskEmoji } from "../utils/suggestedQuestionsHelper";

function PDFChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfAnalysis = location.state?.pdfAnalysis;

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "👋 Hi! I'm your AI Legal Assistant. I've reviewed the PDF you uploaded. Ask me anything about the clauses, risks, or legal concepts. How can I help?",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = generateSuggestedQuestions(pdfAnalysis);

  // Dynamic greeting based on analysis
  const riskEmoji = pdfAnalysis ? getRiskEmoji(pdfAnalysis.riskScore) : "📄";
  const greeting = pdfAnalysis
    ? `${riskEmoji} AI Legal Assistant - Risk Score: ${pdfAnalysis.riskScore}/10`
    : "📄 AI Legal Assistant";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const payload = {
        message: text.trim(),
        sessionId,
      };

      if (pdfAnalysis) {
          payload.context = {
            summary: pdfAnalysis?.summary,
            riskScore: pdfAnalysis?.riskScore,
            riskLevel: pdfAnalysis?.riskLevel,
            risks: pdfAnalysis?.risks?.slice(0, 5),
            clauses: pdfAnalysis?.clauses?.slice(0, 5),
            confidence: pdfAnalysis?.confidence,
            metadata: pdfAnalysis?.metadata,
            fileName: pdfAnalysis?.fileName || pdfAnalysis?.documentName,
          };
          // Pass analysisId if available for better DB lookup
          if (pdfAnalysis?._id) {
            payload.analysisId = pdfAnalysis._id;
          }
          if (pdfAnalysis?.id) {
            payload.analysisId = pdfAnalysis.id;
          }
      }

      const response = await api.post("/chatbot/chat", payload);

      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        text:
          response.data?.reply ??
          response.data?.message ??
          response.data?.response ??
          "I understand your question. Let me help you with that.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: "ai",
        text: error.response?.data?.message ||
          "I encountered an issue. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Legal Assistant"
        subtitle="Ask questions about your PDF document"
      />

      <div className="h-[70vh] flex flex-col rounded-[3rem] border border-white/10 bg-white/3 backdrop-blur-3xl overflow-hidden">
        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-6 py-4 ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white"
                      : msg.isError
                      ? "bg-red-500/20 border border-red-500/50 text-red-300"
                      : "bg-white/10 border border-white/20 text-white/90"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white/90">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED QUESTIONS (Show if no user messages yet) */}
        {messages.length === 1 && !loading && (
          <div className="px-8 pb-4">
            <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
              Suggested Questions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((q, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="text-left px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm text-white/70 hover:text-white/90 transition-all"
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT AREA */}
        <div className="border-t border-white/10 bg-black/20 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me about this document..."
              disabled={loading}
              className="flex-1 rounded-2xl bg-white/10 border border-white/20 px-6 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage()}
              disabled={loading || !inputValue.trim()}
              className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </motion.button>
          </div>
        </div>
      </div>

      {/* BACK BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
        >
          Back to Results
        </button>
        <button
          onClick={() => navigate("/pdf-analyzer")}
          className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
        >
          Analyze Another PDF
        </button>
      </div>
    </DashboardLayout>
  );
}

export default PDFChatPage;
