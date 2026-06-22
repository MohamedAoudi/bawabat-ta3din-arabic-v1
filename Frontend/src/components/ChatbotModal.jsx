import { useContext, useState, useEffect, useRef } from "react";
import { LanguageContext, ThemeContext } from "../App";
import { chatbotService } from "../services/chatbotService";
import { Send, X, Loader, AlertCircle } from "lucide-react";

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
    },
    fr: {
      title: "Assistant Intelligent",
      subtitle: "Analyste de Données Minières",
      welcome: "Bienvenue! Posez vos questions sur les statistiques et données minières arabes.",
      placeholder: "Tapez votre question ici...",
      send: "Envoyer",
      error: "Désolé, une erreur s'est produite. Veuillez réessayer.",
      offline: "Le serveur de chat n'est pas disponible actuellement.",
    },
    en: {
      title: "Smart Assistant",
      subtitle: "Mining Data Analyst",
      welcome: "Welcome! Ask about Arab mining statistics and data.",
      placeholder: "Type your question here...",
      send: "Send",
      error: "Sorry, an error occurred. Please try again.",
      offline: "Chat server is not available right now.",
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    // Add user message
    const userMessage = {
      type: "user",
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(
        inputValue,
        language,
        sessionId
      );

      if (response.error) {
        setMessages((prev) => [
          ...prev,
          {
            type: "error",
            text: response.error || t.error,
            timestamp: new Date(),
          },
        ]);
      } else {
        // Add bot response
        const botMessage = {
          type: "bot",
          text: response.answer || t.error,
          timestamp: new Date(),
          sql: response.sql,
          chartData: response.chart_data,
          intent: response.intent,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          text: t.error,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const bgColor = isDarkMode ? "#0a2f28" : "#f5f3ef";
  const borderColor = isDarkMode ? "rgba(201,168,76,0.3)" : "rgba(8,39,33,0.1)";
  const textColor = isDarkMode ? "#efe8d4" : "#082721";
  const mutedColor = isDarkMode ? "#C9A84C" : "#C9A84C";

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
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: mutedColor }}>
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

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                direction: isArabic ? "rtl" : "ltr",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
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
                {msg.text}
              </div>
            </div>
          ))}

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
            onClick={handleSendMessage}
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
      `}</style>
    </div>
  );
};

export default ChatbotModal;
