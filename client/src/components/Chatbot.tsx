import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { chatWithKrishiMitra } from "../services/api";
import "./Chatbot.css"; // We will create this next

interface ChatMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      parts: [
        {
          text: "Namaste! I am Krishi Mitra, your AI Agricultural Advisor. How can I help you today?",
        },
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");

    const newHistory: ChatMessage[] = [
      ...messages,
      { role: "user", parts: [{ text: userMsg }] },
    ];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      // Send the entire history (excluding the first initial greeting if it causes issues, but Gemini usually handles it fine if we pass all)
      const res = await chatWithKrishiMitra({
        history: messages
          .slice(1)
          .map((m) => ({ role: m.role, parts: m.parts })), // Skip initial hardcoded message that isn't really from an established session
        message: userMsg,
      });

      const reply = res.data.data.reply;
      setMessages([...newHistory, { role: "model", parts: [{ text: reply }] }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newHistory,
        {
          role: "model",
          parts: [
            {
              text: "Sorry, I am facing network issues connecting to the brain. Please try again.",
            },
          ],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper function to render very basic markdown
  const renderMarkdownText = (text: string) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\n\n/g, "<br/><br/>");
    html = html.replace(/\n/g, "<br/>");
    html = html.replace(/\*\s+(.*?)<br\/>/g, "<li>$1</li>");
    html = html.replace(/<li>(.*?)<\/li>/g, "<ul><li>$1</li></ul>");
    html = html.replace(/<\/ul><ul>/g, "");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window fade-in">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <Sparkles size={18} />
              <span>Ask Krishi Mitra</span>
            </div>
            <button
              className="chatbot-close"
              onClick={toggleChat}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble-container ${
                  msg.role === "user" ? "user-message" : "bot-message"
                }`}
              >
                <div className="chat-bubble">
                  {renderMarkdownText(msg.parts[0].text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble-container bot-message">
                <div className="chat-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask me about crops, fertilizers..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" disabled={!inputMessage.trim() || isTyping}>
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <button
          className="chatbot-fab bounce"
          onClick={toggleChat}
          title="Ask Krishi Mitra"
        >
          <Sparkles className="fab-icon-bg" size={32} />
          <MessageSquare className="fab-icon-fg" size={24} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
