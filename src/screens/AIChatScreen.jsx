import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Send,
  Settings2,
  Sparkles,
  Users,
  Wallet,
  Gem,
  Mountain,
  Briefcase,
} from "lucide-react";
import "./AIChatScreen.css";

const destinations = [
  {
    label: "Japan",
    image:
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=400&auto=format&fit=crop",
  },
  {
    label: "Korea",
    image:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=400&auto=format&fit=crop",
  },
  {
    label: "Europe",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop",
  },
  {
    label: "Other",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
  },
];

export default function AIChatScreen({ onBack }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "intro",
      text: "Hi there! 👋\nI’m TravaAI, your travel assistant.\nLet’s plan something amazing!",
    },
  ]);

  const [destination, setDestination] = useState("Japan");
  const [days, setDays] = useState("6 – 8 days");
  const [travelers, setTravelers] = useState("3 – 4");
  const [style, setStyle] = useState("Budget");
  const [input, setInput] = useState("");
  const [preferencesOpen, setPreferencesOpen] = useState(true);

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, preferencesOpen]);

  function chooseDestination(value) {
    setDestination(value);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: value },
      {
        role: "assistant",
        text: "Great choice! ✨\nI’ll need a few more details to find the perfect trip for you.",
      },
    ]);
  }

  async function handleSend(customMessage) {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;
  
    setMessages((prev) => [
      ...prev,
      { role: "user", text: messageToSend },
    ]);
  
    setInput("");
  
    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          preferences: {
            destination,
            days,
            travelers,
            style,
          },
          history: messages.slice(-8),
        }),
      });
  
      const data = await res.json();
  
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }
  }

  function findPerfectTrip() {
    setPreferencesOpen(false);
  
    handleSend(
      `Plan my trip to ${destination}.
      Duration: ${days}.
      Travelers: ${travelers}.
      Travel style: ${style}.`
    );
  }

  return (
    <div className="ai-concierge-screen">
      <header className="ai-concierge-header">
        <button onClick={onBack} className="ai-header-btn" type="button">
          <ArrowLeft size={24} />
        </button>

        <div className="ai-brand-orb">
          <Sparkles size={25} />
        </div>

        <div className="ai-header-title">
          <h1>AI Travel Concierge</h1>
          <p>Find your perfect trip</p>
        </div>

        <button className="ai-header-btn ai-clock" type="button">
          <Clock3 size={24} />
        </button>
      </header>

      <main className="ai-chat-scroll" ref={scrollRef}>
        {messages.map((message, index) => (
          <ChatMessage key={`${message.role}-${index}`} message={message} />
        ))}

        <div className="ai-row">
          <div className="mini-ai-avatar">
            <Sparkles size={18} />
            <span />
          </div>

          <section className="destination-card">
            <h2>
              <strong>Where</strong> do you want to go?
            </h2>

            <div className="destination-options">
              {destinations.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className={
                    destination === item.label
                      ? "destination-option active"
                      : "destination-option"
                  }
                  onClick={() => chooseDestination(item.label)}
                >
                  <img src={item.image} alt={item.label} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="preferences-shell">
          <button
            className="preferences-top"
            type="button"
            onClick={() => setPreferencesOpen((current) => !current)}
          >
            <span className="preferences-icon">
              <Sparkles size={18} />
            </span>

            <span>
              <strong>Set your trip preferences</strong>
              <small>Tap to customize your trip details</small>
            </span>

            <span className="preferences-toggle">
              <Settings2 size={23} />
            </span>

            <span className={preferencesOpen ? "chevron up" : "chevron"} />
          </button>

          {preferencesOpen && (
            <div className="preferences-panel">
              <PreferenceGroup
                icon={<CalendarDays size={24} />}
                title="Trip duration"
                subtitle="How many days are you planning?"
                options={["3 – 5 days", "6 – 8 days", "9 – 12 days", "13+ days"]}
                value={days}
                onChange={setDays}
              />

              <PreferenceGroup
                icon={<Users size={24} />}
                title="Number of travelers"
                subtitle="Who's coming with you?"
                options={["1", "2", "3 – 4", "5+"]}
                value={travelers}
                onChange={setTravelers}
              />

              <PreferenceGroup
                icon={<Briefcase size={24} />}
                title="Travel style"
                subtitle="What kind of experience are you looking for?"
                options={["Budget", "Luxury", "Backpacker", "Family"]}
                value={style}
                onChange={setStyle}
                icons={{
                  Budget: <Wallet size={16} />,
                  Luxury: <Gem size={16} />,
                  Backpacker: <Mountain size={16} />,
                  Family: <Users size={16} />,
                }}
              />

              <button
                className="find-trip-button"
                type="button"
                onClick={findPerfectTrip}
              >
                <Sparkles size={18} />
                Find My Perfect Trip
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="ai-input-dock">
        <button className="input-sparkle" type="button">
          <Sparkles size={23} />
        </button>

        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSend()}
          placeholder="Ask me anything about your trip..."
        />

        <button className="send-button" type="button" onClick={handleSend}>
          <Send size={23} />
        </button>
      </footer>
    </div>
  );
}

function ChatMessage({ message }) {

  if (message.role === "user") {
    return (
      <div className="user-message">
        <span>{message.text}</span>
        <small>9:41 AM</small>
        <b>✓✓</b>
      </div>
    );
  }

  if (message.type === "match") {
    return (
      <div className="ai-row">
        <div className="mini-ai-avatar">
          <Sparkles size={18} />
          <span />
        </div>

        <section className="match-result-card">
          <p>Great! Here's a premium match for you 👇</p>

          <div className="match-result-body">
            <img
              src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=500&auto=format&fit=crop"
              alt="Japan Spring Escape"
            />

            <div>
              <h2>Japan Spring Escape</h2>
              <strong>96% Match</strong>

              <div className="result-tags">
                <span>🌸 Cherry Blossom</span>
                <span>👨‍👩‍👧 Family Friendly</span>
                <span>💰 Within Budget</span>
              </div>

              <div className="result-meta">
                <span>📅 8 Days</span>
                <span>👥 3 – 4 Travelers</span>
                <span>🪙 ₱78,000</span>
              </div>
            </div>
          </div>

          <small>9:41 AM</small>
        </section>
      </div>
    );
  }

  return (
    <div className="ai-row">
      <div className="mini-ai-avatar">
        <Sparkles size={18} />
        <span />
      </div>

      <div className="assistant-message">
        {message.text.split("\n").map((line) => (
          <p key={line}>{line}</p>
        ))}
        <small>9:41 AM</small>
      </div>
    </div>
  );
}

function PreferenceGroup({
  icon,
  title,
  subtitle,
  options,
  value,
  onChange,
  icons = {},
}) {
  return (
    <section className="preference-group">
      <div className="preference-icon">{icon}</div>

      <div className="preference-content">
        <h3>{title}</h3>
        <p>{subtitle}</p>

        <div className="preference-options">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={value === option ? "active" : ""}
              onClick={() => onChange(option)}
            >
              {icons[option]}
              {option}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}