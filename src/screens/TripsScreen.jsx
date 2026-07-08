import { useState } from "react"
import {
  ArrowLeft,
  Bed,
  Bus,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Download,
  FileText,
  Hotel,
  MapPin,
  MoreHorizontal,
  Plane,
  ShieldCheck,
  Ticket,
  UsersRound,
  Utensils,
} from "lucide-react"

import "./trips.css"
import BudgetScreen from "./BudgetScreen"
import TripItinerary, { createPlaceholderItinerary } from "./TripItinerary"

const tabs = ["Overview", "Itinerary", "Budget", "Expenses"]

export default function TripsScreen() {
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [activeTab, setActiveTab] = useState("Overview")
  const [itinerary, setItinerary] = useState(() => createPlaceholderItinerary())

  if (!selectedTrip) {
    return <TripsLanding onOpenTrip={() => setSelectedTrip("japan")} />
  }

  return (
    <div className="scroll-area trip-workspace">
      <header className="trip-header">
        <button className="trip-icon-btn" onClick={() => setSelectedTrip(null)}>
          <ArrowLeft size={20} />
        </button>

        <h1>Japan Trip</h1>

        <button className="trip-icon-btn">
          <MoreHorizontal size={22} />
        </button>
      </header>

      <nav className="trip-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "Overview" && <TripOverview itinerary={itinerary} />}

      {activeTab === "Itinerary" && (
        <TripItinerary itinerary={itinerary} onChange={setItinerary} />
      )}

{activeTab === "Budget" && <BudgetScreen />}
      {activeTab === "Expenses" && <TripExpenses />}
    </div>
  )
}

function TripsLanding({ onOpenTrip }) {
  return (
    <div className="scroll-area trips-premium-home">
      <header className="trips-hero-header">
        <div>
          <p>Hey, Dhan! 👋</p>
          <h1>My Trips</h1>
        </div>

        <div className="trips-avatar">
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Dhan"
            alt="Dhan"
          />
          <span />
        </div>
      </header>

      <section className="ios-flight-card" onClick={onOpenTrip}>
        <div className="flight-top">
          <div>
            <span>DEPARTURE</span>
            <strong>9:00 AM</strong>
            <h2>CEB</h2>
            <p>Cebu</p>
          </div>

          <div>
            <span>ARRIVAL</span>
            <strong>2:30 PM</strong>
            <h2>NRT</h2>
            <p>Tokyo (Narita)</p>
          </div>
        </div>

        <div className="sky-arc" />
        <div className="plane-glow">✈</div>

        <div className="flight-bottom">
          <span>
            <MapPin size={18} /> Cebu Terminal 2
          </span>
          <span>🎟️ Gate C6</span>
        </div>
      </section>

      <section className="ios-trip-detail-card" onClick={onOpenTrip}>
        <div className="trip-detail-main">
          <div>
            <span>Trip</span>
            <h3>
              Japan
              <br />
              Adventure
            </h3>
            <em>8 Days</em>
          </div>

          <div>
            <span>Travelers</span>
            <h3>4 Friends</h3>

            <div className="ios-avatar-stack">
              <b>👩🏻</b>
              <b>👩🏻</b>
              <b>👨🏻</b>
              <b>👦🏻</b>
              <b>+</b>
            </div>
          </div>

          <div className="readiness-ring">
            <span>Status</span>
            <h3>86%</h3>
            <p>Ready</p>
            <i />
          </div>
        </div>

        <div className="trip-arrival-row">
          <span>🕘 Arriving in 5h 30m</span>
          <strong>›</strong>
        </div>
      </section>

      <section className="ios-stats-grid">
        <article>
          <span>🗓️</span>
          <strong>8</strong>
          <p>Days</p>
        </article>

        <article>
          <span>👛</span>
          <strong>₱32.4k</strong>
          <p>Spent</p>
        </article>

        <article>
          <span>👥</span>
          <strong>4</strong>
          <p>People</p>
        </article>
      </section>

      <section className="ios-upcoming">
        <div className="ios-section-title">
          <div>
            <h2>Upcoming Trips</h2>
            <p>Tap a pass to open your workspace.</p>
          </div>

          <button type="button">View All ›</button>
        </div>

        <article className="ios-trip-pass japan" onClick={onOpenTrip}>
          <div className="pass-icon">✈</div>

          <div>
            <h3>Japan Trip</h3>
            <p>Tokyo • Kyoto • Osaka</p>

            <div className="ios-avatar-stack small">
              <b>👩🏻</b>
              <b>👩🏻</b>
              <b>👨🏻</b>
              <b>👦🏻</b>
              <b>+2</b>
            </div>
          </div>

          <div className="pass-date">
            <strong>Mar 10</strong>
            <span>2026</span>
            <em>Upcoming</em>
          </div>
        </article>

        <article className="ios-trip-pass korea">
          <div className="pass-icon">✈</div>

          <div>
            <h3>Korea Trip</h3>
            <p>Seoul • Busan • Jeju</p>
            <em className="draft-chip">Draft</em>
          </div>

          <div className="pass-date">
            <strong>Apr 18</strong>
            <span>2026</span>
          </div>
        </article>
      </section>
    </div>
  )
}

function TripOverview() {
  return (
    <>
      <section className="premium-trip-hero">
        <div className="premium-map">
          <div className="flight-glass">
            <Plane size={28} />
            <div>
              <h3>CEB → NRT</h3>
              <p>Mar 10, 9:00 AM – 2:30 PM</p>
              <span>On Time</span>
            </div>
          </div>

          <span className="route-city city-tokyo">1 Tokyo</span>
          <span className="route-city city-osaka">2 Osaka</span>
          <span className="route-city city-kyoto">3 Kyoto</span>
          <div className="premium-route-line" />
        </div>

        <div className="boarding-glass-card">
          <div>
            <small>Terminal</small>
            <strong>2</strong>
          </div>

          <div>
            <small>Gate</small>
            <strong>C6</strong>
          </div>

          <div>
            <small>Seat</small>
            <strong>12A</strong>
          </div>

          <button type="button">
            <Ticket size={17} />
            View Boarding Pass
          </button>
        </div>

        <div className="trip-date-glass">
          <div>
            <small>MAR</small>
            <strong>10</strong>
            <small>TUE</small>
          </div>

          <section>
            <h3>Travelers</h3>
            <div className="mini-members">
              <span>🧑🏻</span>
              <span>👩🏻</span>
              <span>👨🏻</span>
              <span>👩🏻</span>
              <span>+1</span>
            </div>
          </section>

          <button type="button">
            <UsersRound size={16} />
            Invite
          </button>
        </div>
      </section>

      <section className="premium-readiness-card">
        <div className="readiness-top">
          <div className="readiness-circle">
            <strong>86%</strong>
            <span>Ready</span>
          </div>

          <div>
            <h2>Trip Readiness</h2>
            <em>Great progress!</em>
            <p>You’re all set for an amazing trip!</p>

            <div className="readiness-progress">
              <i />
            </div>

            <small>✨ 4 more to reach 100%</small>
          </div>

          <button type="button" className="improve-readiness-btn">
            Improve Readiness
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="readiness-grid premium">
          <ReadinessItem
            icon={<Plane size={18} />}
            title="Flights"
            status="Confirmed"
          />
          <ReadinessItem
            icon={<Hotel size={18} />}
            title="Hotels"
            status="Confirmed"
          />
          <ReadinessItem
            icon={<FileText size={18} />}
            title="Visa"
            status="Pending"
            warning
          />
          <ReadinessItem
            icon={<CheckCircle2 size={18} />}
            title="Budget"
            status="Within Budget"
          />
          <ReadinessItem
            icon={<CloudSun size={18} />}
            title="Weather"
            status="Good"
          />
          <ReadinessItem
            icon={<ShieldCheck size={18} />}
            title="Insurance"
            status="Added"
          />
        </div>
      </section>

      <section className="premium-quick-card">
        <h2>Quick Access</h2>

        <div className="premium-quick-grid">
          <button type="button">
            <CalendarDays size={24} />
            <strong>Checklist</strong>
            <span>6 items</span>
          </button>

          <button type="button">
            <FileText size={24} />
            <strong>Notepad</strong>
            <span>3 notes</span>
          </button>

          <button type="button">
            <CoinsIcon />
            <strong>Expenses</strong>
            <span>₱32.4k</span>
          </button>

          <button type="button">
            <MapPin size={24} />
            <strong>Itinerary</strong>
            <span>View plan</span>
          </button>

          <button type="button">
            <FileText size={24} />
            <strong>Documents</strong>
            <span>5 saved</span>
          </button>
        </div>
      </section>

      <section className="premium-upcoming-card">
        <div>
          <h2>Upcoming</h2>
          <button type="button">View All</button>
        </div>

        <article>
          <img
            src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=900&auto=format&fit=crop"
            alt="Tokyo"
          />

          <div>
            <h3>Tokyo, Japan</h3>
            <p>Explore Shinjuku & Shibuya</p>
            <span>📍 3 activities planned</span>
          </div>

          <ChevronRight size={22} />
        </article>
      </section>
    </>
  )
}

function CoinsIcon() {
  return <span className="peso-icon">₱</span>
}

function ReadinessItem({ icon, title, status, warning }) {
  return (
    <article className={warning ? "readiness-item warning" : "readiness-item"}>
      {icon}
      <div>
        <h3>{title}</h3>
        <p>{status}</p>
      </div>
    </article>
  )
}

function TripBudget() {
  const budgetItems = [
    [<Plane size={17} />, "Flights", "₱18,000 / ₱25,000", 72, "purple"],
    [<Bed size={17} />, "Hotels", "₱8,400 / ₱20,000", 42, "blue"],
    [<Utensils size={17} />, "Food", "₱3,500 / ₱10,000", 35, "pink"],
    [<Bus size={17} />, "Transport", "₱1,800 / ₱5,000", 36, "orange"],
    [<Ticket size={17} />, "Activities", "₱600 / ₱5,000", 12, "green"],
  ]

  return (
    <>
      <section className="budget-overview-panel">
        <div className="budget-panel-head">
          <h2>Budget Overview</h2>

          <button type="button">
            <Download size={15} />
            Export
          </button>
        </div>

        <div className="budget-total-row">
          <div>
            <strong>₱80,000</strong>
            <span>Total Budget</span>
          </div>

          <div>
            <strong className="used">₱32,400</strong>
            <span>Used (40%)</span>
          </div>
        </div>

        <div className="budget-main-progress">
          <i />
        </div>
      </section>

      <section className="budget-mini-grid">
        <article>
          <strong>₱47,600</strong>
          <span>Remaining</span>
        </article>

        <article>
          <strong>40%</strong>
          <span>Used</span>
        </article>

        <article>
          <strong>₱10,000</strong>
          <span>Daily Avg.</span>
        </article>
      </section>

      <section className="budget-breakdown-panel">
        <div className="budget-breakdown-head">
          <h2>Budget Breakdown</h2>
          <button type="button">Edit ›</button>
        </div>

        <div className="budget-category-list">
          {budgetItems.map(([icon, label, amount, percent, color]) => (
            <article className="budget-category" key={label}>
              <div className={`budget-category-icon ${color}`}>{icon}</div>

              <div className="budget-category-info">
                <div className="budget-category-top">
                  <strong>{label}</strong>
                  <span>{amount}</span>
                </div>

                <div className="budget-category-bar">
                  <i className={color} style={{ width: `${percent}%` }} />
                </div>
              </div>

              <em>{percent}%</em>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function TripExpenses() {
  return <section className="placeholder-panel">Expenses content here.</section>
}