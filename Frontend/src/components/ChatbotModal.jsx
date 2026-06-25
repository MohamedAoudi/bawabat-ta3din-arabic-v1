import { useContext, useState, useEffect, useRef } from "react";
import { LanguageContext, ThemeContext } from "../App";
import { chatbotService } from "../services/chatbotService";
import { Send, X, Loader, AlertCircle } from "lucide-react";
import ChatChart from "./ChatChart";
import MarkdownMessage from "./MarkdownMessage";

// A bot answer that contains a Markdown table needs the full bubble width to
// stay readable; a GFM table always has a `|---|` delimiter row.
const hasMarkdownTable = (text) =>
  typeof text === "string" && /\|\s*:?-{2,}/.test(text);

const ChatbotModal = ({ isOpen, onClose }) => {
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [isHealthy, setIsHealthy] = useState(true);
  const messagesEndRef = useRef(null);

  const isArabic = language === "ar";

  // Translations
  const translations = {
    ar: {
      title: "المساعد الذكي",
      subtitle: "محلّل البيانات التعدينية",
      welcome: "مرحباً بك! اسأل عن الإحصائيات والبيانات التعدينية العربية.",
      placeholder: "اكتب سؤالك هنا...",
      send: "إرسال",
      error: "معذرة، حدث خطأ. يرجى المحاولة لاحقاً.",
      offline: "خادم الدردشة غير متاح حالياً.",
      suggestions: "قد تسأل أيضاً",
      clarifyPrompt: "لست متأكداً مما تقصده. ماذا تريد أن أفعل؟",
    },
    fr: {
      title: "Assistant Intelligent",
      subtitle: "Analyste de Données Minières",
      welcome: "Bienvenue! Posez vos questions sur les statistiques et données minières arabes.",
      placeholder: "Tapez votre question ici...",
      send: "Envoyer",
      error: "Désolé, une erreur s'est produite. Veuillez réessayer.",
      offline: "Le serveur de chat n'est pas disponible actuellement.",
      suggestions: "Vous pourriez aussi demander",
      clarifyPrompt: "Je ne suis pas sûr de comprendre. Que souhaitez-vous ?",
    },
    en: {
      title: "Smart Assistant",
      subtitle: "Mining Data Analyst",
      welcome: "Welcome! Ask about Arab mining statistics and data.",
      placeholder: "Type your question here...",
      send: "Send",
      error: "Sorry, an error occurred. Please try again.",
      offline: "Chat server is not available right now.",
      suggestions: "You might also ask",
      clarifyPrompt: "I'm not sure what you mean. What would you like me to do?",
    },
  };

  const t = translations[language] || translations.ar;

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check chatbot health on open
  useEffect(() => {
    if (isOpen) {
      chatbotService.getHealth().then(setIsHealthy);
      if (messages.length === 0) {
        setMessages([
          {
            type: "bot",
            text: t.welcome,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [isOpen]);

  // Turn an API response into the right message bubble: an error, a
  // clarification prompt (with selectable options), or a normal bot answer.
  const appendBotResponse = (response) => {
    if (response.error) {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: response.answer || response.error || t.error, timestamp: new Date() },
      ]);
      return;
    }

    if (
      response.intent === "clarify" &&
      Array.isArray(response.clarify_options) &&
      response.clarify_options.length > 0
    ) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response.answer || t.clarifyPrompt,
          timestamp: new Date(),
          intent: "clarify",
          clarifyOptions: response.clarify_options,
          originalMessage: response.original_message,
          originalLanguage: response.original_language,
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: response.answer || t.error,
        timestamp: new Date(),
        sql: response.sql,
        chartType: response.chart_type,
        chartData: response.chart_data,
        chartTitle: response.chart_title,
        xAxis: response.x_axis,
        unit: response.unit,
        insight: response.insight,
        intent: response.intent,
        followUps: response.follow_up_questions,
      },
    ]);
  };

  const handleSendMessage = async (overrideText) => {
    // A follow-up chip passes its text directly; otherwise use the input box.
    const text = (typeof overrideText === "string" ? overrideText : inputValue).trim();
    if (!text || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text, timestamp: new Date() }]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(text, language, sessionId);
      appendBotResponse(response);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: t.error, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // User picked an option after a clarification prompt: echo their choice as a
  // bubble, then re-send the original message with the chosen intent.
  const handleClarifySelect = async (option, originalMessage, originalLanguage) => {
    if (loading) return;

    setMessages((prev) => [
      ...prev,
      { type: "user", text: option.label, timestamp: new Date() },
    ]);
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(
        originalMessage,
        originalLanguage || language,
        sessionId,
        option.intent
      );
      appendBotResponse(response);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: t.error, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const bgColor = isDarkMode ? "#0a2f28" : "#f5f3ef";
  const borderColor = isDarkMode ? "rgba(201,168,76,0.3)" : "rgba(8,39,33,0.1)";
  const textColor = isDarkMode ? "#efe8d4" : "#082721";
  const mutedColor = isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(8,39,33,0.5)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        zIndex: 2000,
        padding: "20px",
        direction: isArabic ? "rtl" : "ltr",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "500px",
          height: "600px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            background: `linear-gradient(135deg, #082721${isDarkMode ? "22" : ""}, #0d3d34${isDarkMode ? "11" : ""})`,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: textColor }}>
              {t.title}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: mutedColor }}>
              {t.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "8px",
              padding: "4px 8px",
              cursor: "pointer",
              color: textColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {!isHealthy && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                gap: "8px",
                color: "#dc2626",
                fontSize: "0.85rem",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{t.offline}</span>
            </div>
          )}

          {messages.map((msg, idx) => {
            const hasChart =
              msg.type === "bot" &&
              Array.isArray(msg.chartData) &&
              msg.chartData.length > 0;
            const wideBubble = hasChart || (msg.type === "bot" && hasMarkdownTable(msg.text));
            const isLast = idx === messages.length - 1;
            const showFollowUps =
              isLast &&
              msg.type === "bot" &&
              Array.isArray(msg.followUps) &&
              msg.followUps.length > 0 &&
              !loading;
            const showClarify =
              isLast &&
              msg.type === "bot" &&
              msg.intent === "clarify" &&
              Array.isArray(msg.clarifyOptions) &&
              msg.clarifyOptions.length > 0;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.type === "user" ? "flex-end" : "flex-start",
                  direction: isArabic ? "rtl" : "ltr",
                }}
              >
                <div
                  style={{
                    maxWidth: wideBubble ? "100%" : "80%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                    background:
                      msg.type === "user"
                        ? "#c9a84c"
                        : msg.type === "error"
                          ? "rgba(239, 68, 68, 0.1)"
                          : isDarkMode
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(8,39,33,0.05)",
                    color:
                      msg.type === "user"
                        ? "#082721"
                        : msg.type === "error"
                          ? "#dc2626"
                          : textColor,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.type === "bot" ? (
                    <MarkdownMessage
                      text={msg.text}
                      isDarkMode={isDarkMode}
                      isArabic={isArabic}
                      textColor={textColor}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
                {hasChart && (
                  <div style={{ width: "100%", maxWidth: "100%" }}>
                    <ChatChart
                      chartType={msg.chartType}
                      chartData={msg.chartData}
                      chartTitle={msg.chartTitle}
                      xAxis={msg.xAxis}
                      unit={msg.unit}
                      insight={msg.insight}
                      locale={language}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}
                {showFollowUps && (
                  <div
                    style={{
                      width: "100%",
                      marginTop: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: "0.72rem", color: mutedColor, fontWeight: 600 }}>
                      {t.suggestions}
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {msg.followUps.map((q, i) => (
                        <button
                          key={i}
                          className="amip-followup-pill"
                          onClick={() => handleSendMessage(q)}
                          disabled={loading}
                          style={{
                            background: isDarkMode
                              ? "rgba(201,168,76,0.12)"
                              : "rgba(201,168,76,0.10)",
                            border: "1px solid rgba(201,168,76,0.45)",
                            borderRadius: 14,
                            padding: "6px 12px",
                            fontSize: "0.78rem",
                            color: textColor,
                            cursor: "pointer",
                            textAlign: isArabic ? "right" : "left",
                            fontFamily: "inherit",
                            lineHeight: 1.3,
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {showClarify && (
                  <div
                    style={{
                      width: "100%",
                      marginTop: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {msg.clarifyOptions.map((opt, i) => (
                      <button
                        key={i}
                        className="amip-clarify-option"
                        onClick={() =>
                          handleClarifySelect(opt, msg.originalMessage, msg.originalLanguage)
                        }
                        disabled={loading}
                        style={{
                          background: isDarkMode
                            ? "rgba(201,168,76,0.12)"
                            : "rgba(201,168,76,0.10)",
                          border: "1px solid rgba(201,168,76,0.45)",
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          color: textColor,
                          cursor: "pointer",
                          textAlign: isArabic ? "right" : "left",
                          fontFamily: "inherit",
                          lineHeight: 1.3,
                          width: "100%",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "0.85rem", color: mutedColor }}>
                {language === "ar" ? "جاري التفكير..." : language === "fr" ? "En train de réfléchir..." : "Thinking..."}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${borderColor}`,
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t.placeholder}
            disabled={!isHealthy || loading}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(8,39,33,0.02)",
              color: textColor,
              fontSize: "0.9rem",
              fontFamily: "inherit",
              outline: "none",
              direction: isArabic ? "rtl" : "ltr",
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || loading || !isHealthy}
            style={{
              padding: "10px 16px",
              background: inputValue.trim() && !loading && isHealthy ? "#c9a84c" : "rgba(201,168,76,0.3)",
              border: "none",
              borderRadius: "8px",
              cursor: !inputValue.trim() || loading || !isHealthy ? "not-allowed" : "pointer",
              color: "#082721",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "0.85rem",
            }}
          >
            <Send size={14} />
            {t.send}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .amip-followup-pill {
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .amip-followup-pill:hover:not(:disabled) {
          background: rgba(201,168,76,0.24) !important;
          border-color: #c9a84c !important;
        }
        .amip-followup-pill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .amip-clarify-option {
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .amip-clarify-option:hover:not(:disabled) {
          background: rgba(201,168,76,0.24) !important;
          border-color: #c9a84c !important;
        }
        .amip-clarify-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ChatbotModal;
