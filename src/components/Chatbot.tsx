import { useState, useRef, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSendMessage, useConversationStarters } from "../hooks/useChatbot";
import type { ChatMessage } from "../hooks/useChatbot";
import "./Chatbot.css";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { data: starters = [] } = useConversationStarters();

  const isLoading = isSending;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "👋 Xin chào! Mình có thể giúp bạn nhận nuôi thú cưng hoặc hướng dẫn cứu hộ động vật. Mình có thể giúp gì cho bạn?",
            timestamp: new Date(),
          },
        ]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage("");

    try {
      sendMessage(
        {
          message: currentMessage,
          conversationHistory: messages.slice(-4),
        },
        {
          onSuccess: (data) => {
            const assistantMessage: ChatMessage = {
              role: "assistant",
              content: data.response,
              timestamp: new Date(data.timestamp),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          },
          onError: (error: unknown) => {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = {
              role: "assistant",
              content:
                "Mình đang gặp chút trục trặc. Bạn thử lại sau giây lát nhé.",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          },
        }
      );
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  const handleStarterClick = (starter: string) => {
    setInputMessage(starter);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl animate-in fade-in zoom-in"
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
          aria-label="Mở chatbot"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl bg-white shadow-2xl ${
            isClosing ? "chatbox-exit" : "chatbox-enter"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Trợ Lý AI</h3>
                <p className="text-xs opacity-90">Second Chance Sanctuary</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-white transition-colors hover:bg-white/20"
              aria-label="Đóng chatbot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex animate-in slide-in-from-bottom-2 fade-in duration-300 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ ...props }) => (
                            <a
                              {...props}
                              className="text-blue-600 hover:text-blue-800 underline font-medium"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          p: ({ ...props }) => (
                            <p {...props} className="mb-2 last:mb-0" />
                          ),
                          ul: ({ ...props }) => (
                            <ul
                              {...props}
                              className="list-disc list-inside mb-2"
                            />
                          ),
                          ol: ({ ...props }) => (
                            <ol
                              {...props}
                              className="list-decimal list-inside mb-2"
                            />
                          ),
                          strong: ({ ...props }) => (
                            <strong {...props} className="font-bold" />
                          ),
                          em: ({ ...props }) => (
                            <em {...props} className="italic" />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </p>
                  )}
                  <p className="mt-1 text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Conversation Starters */}
          {messages.length <= 1 && starters.length > 0 && (
            <div className="border-t border-gray-200 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-600">
                Bắt đầu nhanh:
              </p>
              <div className="flex flex-wrap gap-2">
                {starters.slice(0, 3).map((starter, index) => (
                  <button
                    key={index}
                    onClick={() => handleStarterClick(starter)}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    {starter.length > 40
                      ? starter.substring(0, 40) + "..."
                      : starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-end gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <Button
                isIconOnly
                size="sm"
                color="primary"
                onClick={handleSendMessage}
                isDisabled={!inputMessage.trim() || isLoading}
                className="shrink-0"
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
