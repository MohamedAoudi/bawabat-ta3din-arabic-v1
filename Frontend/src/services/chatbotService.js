// Chatbot service for communicating with the FastAPI chatbot API
const API_BASE_URL = "http://localhost:8000";

export const chatbotService = {
  /**
   * Send a message to the chatbot and get a response
   * @param {string} message - User message
   * @param {string} language - Language (ar, en, fr)
   * @param {string} sessionId - Session ID for continuity
   * @returns {Promise<Object>} - Chat response with answer, sql, etc.
   */
  async sendMessage(message, language = "ar", sessionId = "web-session") {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          language,
          session_id: sessionId,
          user_type: "anonymous",
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Chatbot API error:", error);
      return {
        error: error.message || "Failed to connect to chatbot",
        answer: "معذرة، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.",
      };
    }
  },

  /**
   * Get chatbot health status
   * @returns {Promise<boolean>} - True if chatbot is healthy
   */
  async getHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Send feedback about a chatbot response
   * @param {string} sessionId - Session ID
   * @param {number} rating - Rating 1-5
   * @param {string} feedback - Optional feedback text
   */
  async sendFeedback(sessionId, rating, feedback = "") {
    try {
      await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          rating,
          feedback,
        }),
      });
    } catch (error) {
      console.error("Failed to send feedback:", error);
    }
  },
};
