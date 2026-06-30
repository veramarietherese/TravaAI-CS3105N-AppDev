import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import "./AIChatScreen.css";
import { trip } from "../data/mockData";

export default function AIChatScreen({ onBack }) {
  const [messages, setMessages] = useState([
  {
    role: "assistant",
    text: "Hey! I'm your AI Travel Concierge ✨ Tell me your budget, travel style, and dream destination, and I'll help you find the perfect trip.",
  },
]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function handleSend() {
  if (!input.trim()) return;
  const userMessage = input;
  setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
  setInput("");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        tripContext: {
          title: trip.title,
          date: trip.date,
          budget: trip.budget,
          spent: trip.spent,
          people: trip.people,
        },
      }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "Sorry, something went wrong." },
    ]);
  }
}

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <div className="ai-chat-screen">
      <header className="ai-chat-header">
        <button onClick={onBack} aria-label="Back" className="ai-chat-back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1>AI Travel Concierge</h1>
          <p>Find your perfect trip</p>
        </div>
      </header>

      <div className="ai-chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <p className="ai-chat-empty">
            Tell me your budget, travel style, and dream destination to get started.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`ai-chat-bubble ai-chat-bubble--${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="ai-chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}