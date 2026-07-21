import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  DollarSign,
  MapPin,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  Briefcase,
  Users,
  Compass,
  Send,
  Compass as StyleIcon,
  Image as ImageIcon,
  Bot,
  CopyCheck,
} from "lucide-react";
import "./agency-dashboard.css";

const initialPackages = [
  {
    id: 1,
    title: "Bali Wellness Escape",
    description:
      "Rejuvenate your soul with deep tissue massages, organic culinary classes, and stunning sunrise terrace meditations in the heart of Ubud.",
    price: "28900",
    currency_code: "PHP",
    duration_days: "5",
    duration_nights: "4",
    target_travel_style: "Wellness, Relaxation",
    image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    destination: "Ubud, Bali",
    country: "Indonesia",
    category: "Culture",
  },
  {
    id: 2,
    title: "Palawan Island Loop",
    description:
      "Dive deep into world-renowned shipwrecks, limestone lagoons, and pristine sand bars around beautiful Coron.",
    price: "24700",
    currency_code: "PHP",
    duration_days: "7",
    duration_nights: "6",
    target_travel_style: "Backpacker, Adventure",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    destination: "Coron, Palawan",
    country: "Philippines",
    category: "Beach",
  },
];

const initialTrips = [
  {
    id: "trip-101",
    title: "Cebu Heritage Tour Group",
    destination: "Cebu City",
    startDate: "Aug 12, 2026",
    travelersCount: 8,
    status: "Active",
  },
];

// Sample AI Assistant Conversation
const initialChatMessages = [
  {
    sender: "ai",
    text: "Hello! I am your TRAVA Agency AI Strategist. Ask me to generate tour packages based on target locations, budgets, or travel trends, and I can generate full package specifications for your catalog!",
  },
];

export default function AgencyDashboardScreen({ onBack, onLogout }) {
  const [activeTab, setActiveTab] = useState("packages");
  const [packages, setPackages] = useState(initialPackages);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(
    "Ready to manage your multi-field specifications.",
  );

  // AI Assistant State
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [aiInput, setAiInput] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Structural Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    currency_code: "PHP",
    duration_days: "",
    duration_nights: "",
    target_travel_style: "",
    image_url: "",
    destination: "",
    country: "",
    category: "Beach",
  });

  const [trips, setTrips] = useState(initialTrips);
  const [inviteForm, setInviteForm] = useState({ tripId: "", travelerId: "" });
  const [tripFeedback, setTripFeedback] = useState(
    "Select a trip above to invite custom travelers.",
  );

  const totalPackages = packages.length;
  const activeTripsCount = trips.length;
  const totalCustomers = trips.reduce(
    (sum, trip) => sum + trip.travelersCount,
    0,
  );

  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      price: "",
      currency_code: "PHP",
      duration_days: "",
      duration_nights: "",
      target_travel_style: "",
      image_url: "",
      destination: "",
      country: "",
      category: "Beach",
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.destination.trim() || !form.price) {
      setFeedback(
        "Please add title, destination, and pricing fields before saving.",
      );
      return;
    }

    const packageData = {
      id: editingId ?? Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price.trim(),
      currency_code: form.currency_code,
      duration_days: form.duration_days.trim() || "1",
      duration_nights: form.duration_nights.trim() || "0",
      target_travel_style: form.target_travel_style.trim() || "Standard",
      image_url:
        form.image_url.trim() ||
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      destination: form.destination.trim(),
      country: form.country.trim() || "Philippines",
      category: form.category,
    };

    if (editingId) {
      setPackages((current) =>
        current.map((item) => (item.id === editingId ? packageData : item)),
      );
      setFeedback("Package structure updated completely.");
    } else {
      setPackages((current) => [packageData, ...current]);
      setFeedback("New structured catalog package posted live.");
    }

    resetForm();
  }

  function handleEdit(packageItem) {
    setEditingId(packageItem.id);
    setForm({
      title: packageItem.title,
      description: packageItem.description,
      price: packageItem.price,
      currency_code: packageItem.currency_code,
      duration_days: packageItem.duration_days,
      duration_nights: packageItem.duration_nights,
      target_travel_style: packageItem.target_travel_style,
      image_url: packageItem.image_url,
      destination: packageItem.destination,
      country: packageItem.country,
      category: packageItem.category,
    });
    setFeedback(`Modifying entry fields for ${packageItem.title}.`);
  }

  function handleDelete(id) {
    setPackages((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setFeedback("Package removed.");
  }

  // Pre-fill the Form from an AI Recommendation
  function applyAiPackageToForm(pkg) {
    setForm({ ...pkg });
    setActiveTab("packages");
    setFeedback(
      `AI recommendation "${pkg.title}" imported! Review and click save.`,
    );
  }

  // AI Assistant Query Handler
  function handleSendAiQuery(e) {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setAiInput("");
    setIsAiGenerating(true);

    // Simulated AI response generation
    setTimeout(() => {
      const generatedSpec = {
        title: "Bohol Eco-Adventure & Tarsier Safari",
        description:
          "Explore the Chocolate Hills, cruise down the Loboc River with a buffet lunch, and meet wild tarsiers in their natural sanctuary.",
        price: "18500",
        currency_code: "PHP",
        duration_days: "4",
        duration_nights: "3",
        target_travel_style: "Eco-Tourist, Family",
        image_url:
          "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86",
        destination: "Panglao & Carmen, Bohol",
        country: "Philippines",
        category: "Adventure",
      };

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Based on your request for "${userMsg}", here is a high-converting tour package recommendation tailored for your agency:`,
          recommendation: generatedSpec,
        },
      ]);
      setIsAiGenerating(false);
    }, 1000);
  }

  return (
    <div className="scroll-area agency-dashboard-screen">
      <header className="agency-dashboard-header">
        <button className="agency-back-btn" type="button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="agency-eyebrow">Organization account</p>
          <h1>Agency Command Center</h1>
        </div>
      </header>

      <section className="agency-hero-card">
        <div>
          <p className="agency-eyebrow">Operations overview</p>
          <h2>Workspace performance and client engagement trackers.</h2>
        </div>
        <div className="agency-hero-stats">
          <article>
            <Compass size={22} className="stat-icon-color" />
            <strong>{activeTripsCount}</strong>
            <span>Active Trips</span>
          </article>
          <article>
            <Briefcase size={22} className="stat-icon-color" />
            <strong>{totalPackages}</strong>
            <span>Tour Packages</span>
          </article>
          <article>
            <Users size={22} className="stat-icon-color" />
            <strong>{totalCustomers}</strong>
            <span>Customers Joined</span>
          </article>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="agency-tab-bar">
        <button
          className={activeTab === "packages" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("packages")}
        >
          Tour Packages Manager
        </button>
        <button
          className={
            activeTab === "ai_assistant" ? "tab-btn active" : "tab-btn"
          }
          onClick={() => setActiveTab("ai_assistant")}
        >
          <Sparkles size={15} style={{ marginRight: 4, display: "inline" }} />
          AI Ideas & Specs
        </button>
        <button
          className={activeTab === "trips" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("trips")}
        >
          Trip Invites
        </button>
      </div>

      {/* TAB 1: TOUR PACKAGES MANAGER */}
      {activeTab === "packages" && (
        <>
          <section className="agency-panel">
            <div className="agency-panel-header">
              <div>
                <p className="agency-eyebrow">Package editor</p>
                <h3>
                  {editingId
                    ? "Edit Existing Spec Matrix"
                    : "Create New Package"}
                </h3>
              </div>
              {editingId && (
                <button
                  className="agency-secondary-btn"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form className="agency-form" onSubmit={handleSubmit}>
              <label>
                <span>Package Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Cebu Island Explorer"
                  required
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Provide an engaging story/itinerary description..."
                  rows={3}
                />
              </label>

              <div className="agency-form-grid">
                <label>
                  <span>Destination / City</span>
                  <input
                    value={form.destination}
                    onChange={(e) =>
                      setForm({ ...form, destination: e.target.value })
                    }
                    placeholder="e.g. Oslob, Cebu"
                    required
                  />
                </label>

                <label>
                  <span>Country</span>
                  <input
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    placeholder="e.g. Philippines"
                  />
                </label>
              </div>

              <div className="agency-form-grid">
                <label>
                  <span>Duration Days</span>
                  <input
                    type="number"
                    value={form.duration_days}
                    onChange={(e) =>
                      setForm({ ...form, duration_days: e.target.value })
                    }
                    placeholder="e.g. 5"
                  />
                </label>

                <label>
                  <span>Duration Nights</span>
                  <input
                    type="number"
                    value={form.duration_nights}
                    onChange={(e) =>
                      setForm({ ...form, duration_nights: e.target.value })
                    }
                    placeholder="e.g. 4"
                  />
                </label>
              </div>

              <div className="agency-form-grid">
                <label>
                  <span>Price Amount</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="e.g. 24000"
                    required
                  />
                </label>

                <label>
                  <span>Currency Code</span>
                  <select
                    value={form.currency_code}
                    onChange={(e) =>
                      setForm({ ...form, currency_code: e.target.value })
                    }
                  >
                    <option value="PHP">PHP (₱)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </label>
              </div>

              <div className="agency-form-grid">
                <label>
                  <span>Category</span>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="Beach">Beach</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Culture">Culture</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Food Tour">Food Tour</option>
                  </select>
                </label>

                <label>
                  <span>Target Travel Style</span>
                  <input
                    value={form.target_travel_style}
                    onChange={(e) =>
                      setForm({ ...form, target_travel_style: e.target.value })
                    }
                    placeholder="e.g. Luxury, Backpacker, Couples"
                  />
                </label>
              </div>

              <button
                className="agency-primary-btn agency-submit"
                type="submit"
              >
                <Plus size={16} />
                {editingId ? "Save Spec Updates" : "Publish Dynamic Package"}
              </button>
            </form>
            <p className="agency-feedback">{feedback}</p>
          </section>

          <section className="agency-package-list">
            <div className="agency-panel-header">
              <div>
                <p className="agency-eyebrow">Catalog Overview</p>
                <h3>Active Marketplace Postings</h3>
              </div>
            </div>

            {packages.map((item) => (
              <article className="agency-package-card" key={item.id}>
                <div className="agency-package-main">
                  <div className="agency-package-heading">
                    <h4>{item.title}</h4>
                    <span className="agency-status live">{item.category}</span>
                  </div>

                  <p className="package-desc-preview">{item.description}</p>

                  <div className="agency-package-meta field-grid-meta">
                    <span>
                      <MapPin size={14} /> {item.destination}, {item.country}
                    </span>
                    <span>
                      <CalendarDays size={14} /> {item.duration_days}D /{" "}
                      {item.duration_nights}N
                    </span>
                    <span>
                      <DollarSign size={14} /> {item.currency_code}{" "}
                      {Number(item.price).toLocaleString()}
                    </span>
                  </div>

                  <div className="agency-tag-row relational-spec-row">
                    <span>
                      <StyleIcon size={12} /> Style: {item.target_travel_style}
                    </span>
                    {item.image_url && (
                      <span>
                        <ImageIcon size={12} /> Image Linked
                      </span>
                    )}
                  </div>
                </div>

                <div className="agency-package-actions">
                  <button type="button" onClick={() => handleEdit(item)}>
                    <PencilLine size={16} /> Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* TAB 2: AI PACKAGE STRATEGIST & RECOMMENDATIONS */}
      {activeTab === "ai_assistant" && (
        <section className="agency-panel agency-ai-section">
          <div className="agency-panel-header">
            <div>
              <p className="agency-eyebrow">Smart Catalog Creator</p>
              <h3>AI Tour Package Assistant</h3>
            </div>
            <span className="agency-badge">
              <Sparkles size={14} /> Dynamic Recommendations
            </span>
          </div>

          <div className="agency-chat-box">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`agency-chat-message ${msg.sender === "user" ? "user-msg" : "ai-msg"}`}
              >
                <div className="msg-header">
                  {msg.sender === "ai" ? (
                    <Bot size={16} />
                  ) : (
                    <Users size={16} />
                  )}
                  <span>
                    {msg.sender === "ai" ? "TRAVA AI" : "Agency Agent"}
                  </span>
                </div>

                <p>{msg.text}</p>

                {/* If AI generates a structured package recommendation */}
                {msg.recommendation && (
                  <div className="ai-recommendation-card">
                    <div className="rec-header">
                      <h4>{msg.recommendation.title}</h4>
                      <span className="rec-price">
                        {msg.recommendation.currency_code}{" "}
                        {Number(msg.recommendation.price).toLocaleString()}
                      </span>
                    </div>

                    <p className="rec-desc">{msg.recommendation.description}</p>

                    <div className="rec-grid">
                      <span>
                        <strong>Location:</strong>{" "}
                        {msg.recommendation.destination},{" "}
                        {msg.recommendation.country}
                      </span>
                      <span>
                        <strong>Duration:</strong>{" "}
                        {msg.recommendation.duration_days}D /{" "}
                        {msg.recommendation.duration_nights}N
                      </span>
                      <span>
                        <strong>Category:</strong> {msg.recommendation.category}
                      </span>
                      <span>
                        <strong>Style:</strong>{" "}
                        {msg.recommendation.target_travel_style}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="agency-primary-btn use-spec-btn"
                      onClick={() => applyAiPackageToForm(msg.recommendation)}
                    >
                      <CopyCheck size={16} /> Use Spec in Form
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isAiGenerating && (
              <div className="agency-chat-message ai-msg">
                <p className="ai-typing">
                  TRAVA AI is brainstorming package specs...
                </p>
              </div>
            )}
          </div>

          <form className="agency-ai-input-form" onSubmit={handleSendAiQuery}>
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask for ideas (e.g. 'Give me a 3-day budget island hopping package for Siargao')"
            />
            <button
              type="submit"
              className="agency-primary-btn"
              disabled={isAiGenerating}
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      {/* TAB 3: TRIP OPERATIONS & INVITES */}
      {activeTab === "trips" && (
        <section className="agency-panel">
          <div className="agency-panel-header">
            <div>
              <p className="agency-eyebrow">Invite ecosystem</p>
              <h3>Invite a Traveler to a Trip</h3>
            </div>
          </div>
          <form className="agency-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              <span>Select Target Custom Trip</span>
              <select
                value={inviteForm.tripId}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, tripId: e.target.value })
                }
                required
              >
                <option value="">-- Choose an active package trip --</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.destination})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Traveler Account ID</span>
              <input
                type="text"
                value={inviteForm.travelerId}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, travelerId: e.target.value })
                }
                placeholder="Paste Traveler's profile user_id here"
                required
              />
            </label>
            <button className="agency-primary-btn agency-submit" type="submit">
              <Send size={16} /> Dispatch Trip Invitation
            </button>
          </form>
          <p className="agency-feedback">{tripFeedback}</p>
        </section>
      )}
    </div>
  );
}
