import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bot,
  CircleStop,
  Mic,
  MoreHorizontal,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import "./AIChatScreen.css";
import { supabase } from "../auth/supabaseClient";

const STORAGE_PREFIX = "trava-ai-conversation";

const DEFAULT_CARDS = [
  {
    id: "paris",
    title: "Paris, France",
    subtitle: "5 days • Romantic",
    priceLabel: "Plan from ₱58k",
    tag: "Best for romance",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=85&w=900&auto=format&fit=crop",
  },
  {
    id: "prague",
    title: "Prague, Czechia",
    subtitle: "5 days • Culture",
    priceLabel: "Plan from ₱49k",
    tag: "Most popular",
    image:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?q=85&w=900&auto=format&fit=crop",
  },
  {
    id: "amalfi",
    title: "Amalfi Coast",
    subtitle: "5 days • Coastal",
    priceLabel: "Plan from ₱67k",
    tag: "Coastal view",
    image:
      "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?q=85&w=900&auto=format&fit=crop",
  },
];

const DEFAULT_QUICK_PROMPTS = [
  "Plan a solo trip to Japan",
  "Best beaches in Asia",
  "Budget trip to Switzerland",
  "Visa requirements for Bali",
];

function createId(prefix = "message") {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function getUserName(user) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Explorer"
  );
}

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStorageKey(user) {
  return `${STORAGE_PREFIX}:${user?.id || "guest"}`;
}

function loadConversation(user) {
  try {
    const stored = window.localStorage.getItem(
      getStorageKey(user),
    );

    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversation(user, messages) {
  try {
    window.localStorage.setItem(
      getStorageKey(user),
      JSON.stringify(messages.slice(-40)),
    );
  } catch {
    // The chat remains usable even without local storage.
  }
}

function BotAvatar() {
  return (
    <div className="trava-ai-bot-avatar" aria-hidden="true">
      <Bot size={19} />
      <i />
    </div>
  );
}

function MessageText({ text }) {
  const paragraphs = String(text || "")
    .split(/\n{2,}/)
    .filter(Boolean);

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 20)}-${index}`}>
          {paragraph.split("\n").map((line, lineIndex) => (
            <span key={`${line.slice(0, 20)}-${lineIndex}`}>
              {line}
              {lineIndex < paragraph.split("\n").length - 1 && (
                <br />
              )}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function DestinationCards({ cards, onSelect }) {
  if (!cards?.length) return null;

  return (
    <div className="trava-ai-card-track">
      {cards.slice(0, 4).map((card) => (
        <button
          type="button"
          className="trava-ai-destination-card"
          key={card.id || card.title}
          onClick={() => onSelect(card)}
        >
          <div className="trava-ai-destination-image">
            <img src={card.image} alt={card.title} />
            {card.tag && <span>{card.tag}</span>}
          </div>

          <div className="trava-ai-destination-copy">
            <strong>{card.title}</strong>
            <span>{card.subtitle}</span>
            <small>{card.priceLabel}</small>
          </div>
        </button>
      ))}
    </div>
  );
}

function PromptConfirmModal({ prompt, onConfirm, onCancel }) {
  const [editedPrompt, setEditedPrompt] = useState(prompt);

  return (
    <div className="trava-modal-overlay" onClick={onCancel}>
      <div className="trava-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trava-modal-header">
          <h2>Review your prompt</h2>
          <p>Edit the message below before sending it to TravaAI.</p>
        </div>

        <textarea
          className="trava-modal-editor"
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          rows={5}
        />

        <div className="trava-modal-actions">
          <button
            type="button"
            className="trava-modal-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="trava-modal-confirm"
            onClick={() => onConfirm(editedPrompt)}
            disabled={!editedPrompt.trim()}
          >
            Confirm ✈️
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIChatScreen({
  onBack,
  tripContext = null,
}) {
  const { user } = useAuth();
  const userName = useMemo(() => getUserName(user), [user]);

  const [messages, setMessages] = useState(() =>
    loadConversation(user),
  );
  const [input, setInput] = useState("");
  const [quickPrompts, setQuickPrompts] = useState(
    DEFAULT_QUICK_PROMPTS,
  );
  const [recommendationCards, setRecommendationCards] =
    useState(DEFAULT_CARDS);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCard, setPendingCard] = useState(null);
  const [activeTripId, setActiveTripId] = useState(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
  async function fetchLatestTrip() {
    if (!user?.id) return;

    // check localStorage first (if they opened a specific trip)
    const stored = localStorage.getItem("trava-active-trip-id");
    if (stored) {
      setActiveTripId(stored);
      return;
    }

    // otherwise fetch their most recently created trip
    const { data, error } = await supabase
      .from("trips")
      .select("trip_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setActiveTripId(data.trip_id);
    }
  }

  fetchLatestTrip();
}, [user?.id]);

async function handleModalConfirm(editedPrompt) {
  setModalOpen(false);
  setPendingPrompt(null);

  const destination = pendingCard?.title || "";
  const country = pendingCard?.country || "";

  // const activeTripId = localStorage.getItem("trava-active-trip-id");
  if (activeTripId && destination) {
  try {
    await supabase
      .from("trips")
      .update({ destination })
      .eq("trip_id", activeTripId);
  } catch (err) {
    console.error("Failed to update trip destination:", err);
  }
}

  setMessages((prev) => [
    ...prev,
    {
      id: createId("user"),
      role: "user",
      text: editedPrompt,
      createdAt: new Date().toISOString(),
    },
    {
      id: createId("assistant"),
      role: "assistant",
      text: `${destination}${country ? `, ${country}` : ""} is a great choice! Updating your planned trip right now! ✈️`,
      createdAt: new Date().toISOString(),
    },
  ]);

  setPendingCard(null);
}

function handleModalCancel() {
  setModalOpen(false);
  setPendingPrompt(null);
  setPendingCard(null);
}

  const welcomeMessage = useMemo(
    () => ({
      id: "welcome",
      role: "assistant",
      text: `Hello, ${userName}! 👋\nWhere shall we wander today?`,
      createdAt: new Date().toISOString(),
    }),
    [userName],
  );

  useEffect(() => {
    setMessages(loadConversation(user));
  }, [user?.id]);

  useEffect(() => {
    saveConversation(user, messages);
  }, [messages, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading, recommendationCards]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      recognitionRef.current?.stop?.();
    };
  }, []);

  const visibleMessages = messages.length
    ? messages
    : [welcomeMessage];

  function clearConversation() {
    abortRef.current?.abort();
    setMessages([]);
    setRecommendationCards(DEFAULT_CARDS);
    setQuickPrompts(DEFAULT_QUICK_PROMPTS);
    setInput("");
    setNotice("");
    setMenuOpen(false);

    try {
      window.localStorage.removeItem(getStorageKey(user));
    } catch {
      // Nothing else is required.
    }
  }

  function stopGeneration() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setNotice("Generation stopped.");
  }

function handleDestinationCard(card) {
  const question = `Give me a practical ${card.subtitle.toLowerCase()} plan for ${card.title}. Include a realistic Philippine-peso budget and the best areas to stay. Skip any introductory greeting — go straight into the plan.`;
  setPendingPrompt(question);
  setPendingCard(card);
  setModalOpen(true);
}

  async function sendMessage(rawMessage = input) {
    const messageText = String(rawMessage || "").trim();

    if (!messageText || loading) return;

    const userMessage = {
      id: createId("user"),
      role: "user",
      text: messageText,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setNotice("");
    setMenuOpen(false);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 35000);

    try {
      const history = nextMessages
        .slice(-8)
        .map(({ role, text }) => ({
          role,
          text: String(text).slice(0, 1200),
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: messageText,
          history,
          user: {
            id: user?.id || null,
            name: userName,
          },
          tripContext,
          locale: "en-PH",
          currency: "PHP",
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "TRAVA AI could not answer right now.",
        );
      }

      const assistantMessage = {
        id: createId("assistant"),
        role: "assistant",
        text:
          payload?.reply ||
          "I’m ready to help with your trip. What destination are you considering?",
        createdAt: new Date().toISOString(),
        source: payload?.source || "gemini",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      if (Array.isArray(payload?.cards)) {
        setRecommendationCards(payload.cards);
      }

      if (Array.isArray(payload?.quickReplies)) {
        setQuickPrompts(payload.quickReplies.slice(0, 4));
      }

      if (payload?.source === "fallback") {
        setNotice(
          "Gemini is temporarily busy, so TRAVA used a lightweight travel fallback.",
        );
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        setNotice(
          "The request took too long or was stopped. Please send it again.",
        );
      } else {
        setMessages((current) => [
          ...current,
          {
            id: createId("assistant-error"),
            role: "assistant",
            text:
              "I couldn’t reach the travel assistant just now. Please try again in a moment.",
            createdAt: new Date().toISOString(),
            error: true,
          },
        ]);

        setNotice(error?.message || "Something went wrong.");
      }
    } finally {
      window.clearTimeout(timeout);
      abortRef.current = null;
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setNotice(
        "Voice input is not supported by this browser.",
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop?.();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-PH";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setNotice("Listening…");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join("");

      setInput(transcript);
    };

    recognition.onerror = () => {
      setNotice("Voice input could not start.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setNotice("");
      inputRef.current?.focus();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  return (
    <section className="trava-ai-screen">
      <header className="trava-ai-header">
        <div className="trava-ai-brand">
          <div className="trava-ai-brand-icon">
            <Sparkles size={23} />
          </div>

          <div>
            <h1>TRAVA AI</h1>
            <p>Your smart travel companion</p>
          </div>
        </div>

        <div className="trava-ai-header-actions">
          {onBack && (
            <button
              type="button"
              className="trava-ai-header-secondary"
              onClick={onBack}
              aria-label="Close AI assistant"
            >
              <X size={19} />
            </button>
          )}

          <button
            type="button"
            className="trava-ai-menu-button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="AI chat menu"
          >
            <MoreHorizontal size={21} />
          </button>

          {menuOpen && (
            <div className="trava-ai-menu">
              <button type="button" onClick={clearConversation}>
                <Trash2 size={16} />
                Clear conversation
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="trava-ai-conversation">
        <div className="trava-ai-chat-column">
          {visibleMessages.map((message) => {
            const isAssistant = message.role === "assistant";

            return (
              <article
                className={`trava-ai-message-row ${
                  isAssistant ? "assistant" : "user"
                }`}
                key={message.id}
              >
                {isAssistant && <BotAvatar />}

                <div className="trava-ai-message-group">
                  <div
                    className={`trava-ai-message-bubble ${
                      message.error ? "error" : ""
                    }`}
                  >
                    <MessageText text={message.text} />
                  </div>

                  <time>
                    {formatTime(
                      new Date(message.createdAt || Date.now()),
                    )}
                  </time>
                </div>
              </article>
            );
          })}

          {loading && (
            <article className="trava-ai-message-row assistant">
              <BotAvatar />

              <div className="trava-ai-message-group">
                <div className="trava-ai-message-bubble trava-ai-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </article>
          )}

          <DestinationCards
            cards={recommendationCards}
            onSelect={handleDestinationCard}
          />

          <div className="trava-ai-prompt-section">
            <strong>You can also try asking:</strong>

            <div className="trava-ai-prompt-grid">
              {quickPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div ref={endRef} />
        </div>
      </div>

      <div className="trava-ai-composer-area">
        {notice && (
          <div className="trava-ai-notice">
            {notice}
          </div>
        )}

        <form
          className="trava-ai-composer"
          onSubmit={handleSubmit}
        >
          <button
            type="button"
            className={`trava-ai-mic-button ${
              listening ? "active" : ""
            }`}
            onClick={startVoiceInput}
            aria-label={
              listening
                ? "Stop voice input"
                : "Start voice input"
            }
          >
            {listening ? (
              <CircleStop size={19} />
            ) : (
              <Mic size={19} />
            )}
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={1500}
            placeholder="Ask me anything about travel..."
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            type={loading ? "button" : "submit"}
            className="trava-ai-send-button"
            onClick={loading ? stopGeneration : undefined}
            disabled={!loading && !input.trim()}
            aria-label={
              loading ? "Stop generating" : "Send message"
            }
          >
            {loading ? (
              <CircleStop size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        <p className="trava-ai-disclaimer">
          AI suggestions may be inaccurate. Confirm prices,
          availability, visas, and bookings with official sources
          or the travel agency.
        </p>
      </div>
      {modalOpen && pendingPrompt && (
  <PromptConfirmModal
    prompt={pendingPrompt}
    onConfirm={handleModalConfirm}
    onCancel={handleModalCancel}
  />
)}
    </section>
  );
}