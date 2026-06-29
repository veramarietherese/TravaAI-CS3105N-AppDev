import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import "./AIChatScreen.css";

function buildRecommendation(query) {
  const normalized = query.toLowerCase();

  if (normalized.includes("bali") || normalized.includes("beach")) {
    return {
      title: "Bali Wellness Escape",
      location: "Ubud, Bali",
      price: "₱28,900",
      duration: "5 days",
      summary: "Spa, beach club, and airport transfers in a calm island retreat.",
    };
  }

  if (normalized.includes("japan") || normalized.includes("tokyo")) {
    return {
      title: "Tokyo Cherry Sprint",
      location: "Tokyo, Japan",
      price: "₱35,500",
      duration: "6 days",
      summary: "A stylish urban getaway with rail passes and local food experiences.",
    };
  }

  if (normalized.includes("philippines") || normalized.includes("palawan")) {
    return {
      title: "Palawan Island Loop",
      location: "Coron, Philippines",
      price: "₱24,700",
      duration: "7 days",
      summary: "Island hopping, guided dives, and budget-friendly beachfront stays.",
    };
  }

  return {
    title: "Seoul City Lights",
    location: "Seoul, South Korea",
    price: "₱26,300",
    duration: "6 days",
    summary: "Modern city stays, food tours, and nightlife with a premium finish.",
  };
}

export default function AIChatScreen({ onBack, onSendSuggestion }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "I can recommend a package for you. Tap 'Like this' if you want me to send it to a travel agency.",
      recommendation: {
        title: "Bali Wellness Escape",
        location: "Ubud, Bali",
        price: "₱28,900",
        duration: "5 days",
        summary: "A relaxing beach-and-spa package with transfers and premium stays.",
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState("")
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");

    const recommendation = buildRecommendation(userMessage);
    const fallbackText = `I’d recommend ${recommendation.title} in ${recommendation.location}. It matches your vibe and packages ${recommendation.summary}`;

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: fallbackText,
        recommendation,
      },
    ]);
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
          <div key={i} className="ai-chat-thread">
            <div className={`ai-chat-bubble ai-chat-bubble--${m.role}`}>
              {m.text}
            </div>

            {m.recommendation && (
              <div className="ai-chat-recommendation">
                <div className="ai-chat-recommendation__header">
                  <strong>{m.recommendation.title}</strong>
                  <span>{m.recommendation.price}</span>
                </div>
                <p>
                  {m.recommendation.location} • {m.recommendation.duration}
                </p>
                <small>{m.recommendation.summary}</small>
                <div className="ai-chat-recommendation__actions">
                  <button
                    type="button"
                    className="ai-chat-action-btn ai-chat-action-btn--primary"
                    onClick={async () => {
                      setSuggestionStatus("Sending recommendation...")
                      try {
                        await onSendSuggestion?.(m.recommendation)
                        setSuggestionStatus("Recommendation sent to agency.")
                      } catch (error) {
                        setSuggestionStatus("Could not send recommendation. Try again.")
                      }
                    }}
                  >
                    Like this
                  </button>
                  <button type="button" className="ai-chat-action-btn">
                    Not for me
                  </button>
                </div>
                {suggestionStatus && (
                  <p className="ai-chat-suggestion-status">{suggestionStatus}</p>
                )}
              </div>
            )}
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