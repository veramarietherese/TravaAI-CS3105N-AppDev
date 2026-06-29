import { useState } from "react"
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  Compass,
  DollarSign,
  MapPin,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"

const initialPackages = [
  {
    id: 1,
    title: "Bali Wellness Escape",
    location: "Ubud, Bali",
    duration: "5 days",
    price: "₱28,900",
    status: "Live",
    highlights: ["Spa", "Beach club", "Airport transfer"],
  },
  {
    id: 2,
    title: "Tokyo Cherry Sprint",
    location: "Tokyo, Japan",
    duration: "6 days",
    price: "₱35,500",
    status: "Review",
    highlights: ["Rail pass", "Ryokan stay", "Food tour"],
  },
  {
    id: 3,
    title: "Palawan Island Loop",
    location: "Coron, Philippines",
    duration: "7 days",
    price: "₱24,700",
    status: "Live",
    highlights: ["Island hopping", "Budget stays", "Guided dive"],
  },
]

export default function AgencyDashboardScreen({ onBack, onLogout, suggestions = [] }) {
  const [packages, setPackages] = useState(initialPackages)
  const [editingId, setEditingId] = useState(null)
  const [feedback, setFeedback] = useState("AI is ready to draft package ideas in seconds.")
  const [aiPrompt, setAiPrompt] = useState("Create a premium Seoul city lights getaway for couples")
  const [form, setForm] = useState({
    title: "",
    location: "",
    duration: "",
    price: "",
    status: "Draft",
    highlights: "",
  })

  function resetForm() {
    setEditingId(null)
    setForm({
      title: "",
      location: "",
      duration: "",
      price: "",
      status: "Draft",
      highlights: "",
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim() || !form.location.trim()) {
      setFeedback("Please add a title and destination before saving.")
      return
    }

    const packageData = {
      id: editingId ?? Date.now(),
      title: form.title.trim(),
      location: form.location.trim(),
      duration: form.duration.trim() || "4 days",
      price: form.price.trim() || "₱18,000",
      status: form.status,
      highlights: form.highlights
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }

    if (editingId) {
      setPackages((current) =>
        current.map((item) => (item.id === editingId ? packageData : item))
      )
      setFeedback("Package updated successfully.")
    } else {
      setPackages((current) => [packageData, ...current])
      setFeedback("New package created and added to the catalog.")
    }

    resetForm()
  }

  function handleEdit(packageItem) {
    setEditingId(packageItem.id)
    setForm({
      title: packageItem.title,
      location: packageItem.location,
      duration: packageItem.duration,
      price: packageItem.price,
      status: packageItem.status,
      highlights: packageItem.highlights.join(", "),
    })
    setFeedback(`Editing ${packageItem.title}.`)
  }

  function handleDelete(id) {
    setPackages((current) => current.filter((item) => item.id !== id))
    if (editingId === id) resetForm()
    setFeedback("Package removed from the draft list.")
  }

  function handleAiSuggest() {
    const aiDrafts = [
      {
        title: "Kyoto Sakura Delight",
        location: "Kyoto, Japan",
        duration: "6 days",
        price: "₱32,400",
        status: "AI Draft",
        highlights: "Tea ceremony, ryokan stay, private transfer",
      },
      {
        title: "Bohol Reef Escape",
        location: "Bohol, Philippines",
        duration: "5 days",
        price: "₱19,800",
        status: "AI Draft",
        highlights: "Island tour, snorkel gear, sunset cruise",
      },
    ]

    const chosen = aiDrafts[Math.floor(Math.random() * aiDrafts.length)]
    setForm({
      title: chosen.title,
      location: chosen.location,
      duration: chosen.duration,
      price: chosen.price,
      status: chosen.status,
      highlights: chosen.highlights,
    })
    setEditingId(null)
    setFeedback(`AI suggested: ${chosen.title}`)
    setAiPrompt(aiPrompt)
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

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="agency-badge">
            <Bot size={16} />
            AI assisted
          </div>
          <button className="agency-secondary-btn" type="button" onClick={() => onLogout && onLogout()}>
            Logout
          </button>
        </div>
      </header>

      <section className="agency-hero-card">
        <div>
          <p className="agency-eyebrow">Operations hub</p>
          <h2>Manage tour packages with AI support and zero clutter.</h2>
          <p>
            Create fresh itineraries, update live offers, and retire packages in a few taps.
          </p>
        </div>

        <div className="agency-hero-stats">
          <article>
            <strong>24</strong>
            <span>Live tours</span>
          </article>
          <article>
            <strong>3</strong>
            <span>Needs review</span>
          </article>
          <article>
            <strong>92%</strong>
            <span>AI save rate</span>
          </article>
        </div>
      </section>

      {suggestions.length > 0 && (
        <section className="agency-panel">
          <div className="agency-panel-header">
            <div>
              <p className="agency-eyebrow">AI handoff</p>
              <h3>Suggestions from users</h3>
            </div>
          </div>

          {suggestions.map((suggestion) => (
            <article className="agency-package-card" key={suggestion.id}>
              <div className="agency-package-main">
                <div className="agency-package-heading">
                  <h4>{suggestion.title}</h4>
                  <span className="agency-status ai-draft">{suggestion.source}</span>
                </div>
                <div className="agency-package-meta">
                  <span>
                    <MapPin size={14} />
                    {suggestion.location}
                  </span>
                  <span>
                    <CalendarDays size={14} />
                    {suggestion.duration}
                  </span>
                  <span>
                    <DollarSign size={14} />
                    {suggestion.price}
                  </span>
                </div>
                <p style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
                  {suggestion.summary}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="agency-panel">
        <div className="agency-panel-header">
          <div>
            <p className="agency-eyebrow">AI assistant</p>
            <h3>Draft a new package</h3>
          </div>
          <button className="agency-primary-btn" type="button" onClick={handleAiSuggest}>
            <Sparkles size={16} />
            Generate with AI
          </button>
        </div>

        <label className="agency-input-row">
          <span>Prompt</span>
          <textarea
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            rows={3}
          />
        </label>

        <p className="agency-feedback">{feedback}</p>
      </section>

      <section className="agency-panel">
        <div className="agency-panel-header">
          <div>
            <p className="agency-eyebrow">Package editor</p>
            <h3>{editingId ? "Edit an existing package" : "Create a new package"}</h3>
          </div>
          {editingId ? (
            <button className="agency-secondary-btn" type="button" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>

        <form className="agency-form" onSubmit={handleSubmit}>
          <label>
            <span>Package title</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Cebu Island Explorer"
            />
          </label>

          <label>
            <span>Destination</span>
            <input
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="e.g. Cebu, Philippines"
            />
          </label>

          <div className="agency-form-grid">
            <label>
              <span>Duration</span>
              <input
                value={form.duration}
                onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                placeholder="4 days"
              />
            </label>

            <label>
              <span>Price</span>
              <input
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="₱18,000"
              />
            </label>
          </div>

          <label>
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="Draft">Draft</option>
              <option value="Review">Review</option>
              <option value="Live">Live</option>
              <option value="AI Draft">AI Draft</option>
            </select>
          </label>

          <label>
            <span>Highlights</span>
            <input
              value={form.highlights}
              onChange={(event) => setForm((current) => ({ ...current, highlights: event.target.value }))}
              placeholder="Spa, private transfer, sunset cruise"
            />
          </label>

          <button className="agency-primary-btn agency-submit" type="submit">
            <Plus size={16} />
            {editingId ? "Save changes" : "Create package"}
          </button>
        </form>
      </section>

      <section className="agency-package-list">
        <div className="agency-panel-header">
          <div>
            <p className="agency-eyebrow">Package catalog</p>
            <h3>Live offers and draft ideas</h3>
          </div>
        </div>

        {packages.map((packageItem) => (
          <article className="agency-package-card" key={packageItem.id}>
            <div className="agency-package-main">
              <div className="agency-package-heading">
                <h4>{packageItem.title}</h4>
                <span className={`agency-status ${packageItem.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {packageItem.status}
                </span>
              </div>

              <div className="agency-package-meta">
                <span>
                  <MapPin size={14} />
                  {packageItem.location}
                </span>
                <span>
                  <CalendarDays size={14} />
                  {packageItem.duration}
                </span>
                <span>
                  <DollarSign size={14} />
                  {packageItem.price}
                </span>
              </div>

              <div className="agency-tag-row">
                {packageItem.highlights.map((highlight) => (
                  <span key={highlight}>{highlight}</span>
                ))}
              </div>
            </div>

            <div className="agency-package-actions">
              <button type="button" onClick={() => handleEdit(packageItem)}>
                <PencilLine size={16} />
                Edit
              </button>
              <button type="button" onClick={() => handleDelete(packageItem.id)}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
