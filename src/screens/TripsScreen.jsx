import { useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CloudSun,
  FileText,
  Hotel,
  MoreHorizontal,
  Plane,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

const tabs = ["Overview", "Itinerary", "Budget", "Expenses"]

const itinerary = [
  {
    time: "09:30",
    title: "Arrive at Narita Airport",
    place: "Narita, Chiba, Japan",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=500&auto=format&fit=crop",
  },
  {
    time: "12:00",
    title: "Train to Tokyo",
    place: "Narita Express",
    image:
      "https://images.unsplash.com/photo-1558560618-5272794d82aa?q=80&w=500&auto=format&fit=crop",
  },
  {
    time: "14:00",
    title: "Check-in at Hotel",
    place: "Shinjuku, Tokyo",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format&fit=crop",
  },
  {
    time: "16:00",
    title: "Shinjuku Gyoen National Garden",
    place: "Shinjuku, Tokyo",
    image:
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=500&auto=format&fit=crop",
  },
  {
    time: "19:00",
    title: "Dinner at Omoide Yokocho",
    place: "Shinjuku, Tokyo",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=500&auto=format&fit=crop",
  },
]

const budgetRows = [
  ["Flights", "₱18,000 / ₱24,000", "75%", 75],
  ["Accommodation", "₱9,200 / ₱20,000", "46%", 46],
  ["Food", "₱3,800 / ₱10,000", "38%", 38],
  ["Transport", "₱1,950 / ₱5,000", "39%", 39],
  ["Activities", "₱2,500 / ₱8,000", "31%", 31],
  ["Shopping", "₱0 / ₱5,000", "0%", 0],
]

const expenses = [
  ["Dhan paid", "Hotel in Tokyo", "₱12,000", "You paid"],
  ["Lisa paid", "Team dinner", "₱2,450", ""],
  ["Migz paid", "Suica Cards", "₱1,600", ""],
  ["Aye paid", "Narita Express Tickets", "₱4,800", ""],
  ["You paid", "Snacks & Drinks", "₱1,200", ""],
]

export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState("Overview")

  return (
    <div className="scroll-area trip-workspace">
      <header className="trip-header">
        <button type="button" className="trip-icon-btn">
          <ArrowLeft size={20} />
        </button>

        <h1>Japan Trip</h1>

        <button type="button" className="trip-icon-btn">
          <MoreHorizontal size={22} />
        </button>
      </header>

      <nav className="trip-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "Overview" && <TripOverview />}
      {activeTab === "Itinerary" && <TripItinerary />}
      {activeTab === "Budget" && <TripBudget />}
      {activeTab === "Expenses" && <TripExpenses />}
    </div>
  )
}

function TripOverview() {
  return (
    <>
      <section className="trip-map-card">
        <div className="map-bg">
          <span className="map-label tokyo">Tokyo</span>
          <span className="map-label hakone">Hakone</span>
          <span className="map-label kyoto">Kyoto</span>
          <span className="map-label osaka">Osaka</span>

          <div className="route-line" />
          <span className="route-dot dot-1">1</span>
          <span className="route-dot dot-2">2</span>
          <span className="route-dot dot-3">3</span>
          <span className="route-dot dot-4">4</span>
        </div>

        <div className="trip-summary-card">
          <div>
            <p>
              <CalendarDays size={15} />
              Mar 10 – Mar 18, 2026
            </p>
            <p>
              <UsersRound size={15} />8 Days • 4 Travelers
            </p>
          </div>

          <div className="trip-member-row">
            <div className="mini-members">
              <span>🧑🏻</span>
              <span>👩🏻</span>
              <span>👨🏻</span>
              <span>👩🏻</span>
            </div>

            <button type="button">Invite</button>
          </div>
        </div>
      </section>

      <BoardingPassCard />

      <section className="trip-health-card">
        <div className="trip-section-head">
          <div>
            <h2>Trip Readiness</h2>
            <p>All good! Your trip is ready to go.</p>
          </div>
          <span>86%</span>
        </div>

        <div className="readiness-grid">
          <ReadinessItem icon={<Plane size={17} />} title="Flights" status="Confirmed" />
          <ReadinessItem icon={<Hotel size={17} />} title="Hotels" status="Confirmed" />
          <ReadinessItem icon={<FileText size={17} />} title="Visa" status="Pending" warning />
          <ReadinessItem icon={<CheckCircle2 size={17} />} title="Budget" status="Within Budget" />
          <ReadinessItem icon={<CloudSun size={17} />} title="Weather" status="Good" />
          <ReadinessItem icon={<ShieldCheck size={17} />} title="Insurance" status="Added" />
        </div>
      </section>
    </>
  )
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

function BoardingPassCard() {
  return (
    <section className="boarding-pass-screen">
      <div className="boarding-hero">
        <div className="boarding-clouds">
          <span>☁️</span>
          <span>✈️</span>
          <span>🌏</span>
        </div>

        <div className="boarding-ticket">
          <div className="qr-badge">▦</div>

          <div className="route-row">
            <div>
              <h2>CEB</h2>
              <p>Cebu</p>
            </div>

            <div className="plane-mid">✈</div>

            <div>
              <h2>NRT</h2>
              <p>Tokyo</p>
            </div>
          </div>

          <div className="ticket-divider" />

          <div className="ticket-info-grid">
            <div>
              <span>Passenger</span>
              <strong>Dhan Alcover</strong>
            </div>

            <div>
              <span>Date</span>
              <strong>10/03/2026</strong>
            </div>

            <div>
              <span>Flight No.</span>
              <strong>5J 5068</strong>
            </div>

            <div>
              <span>Gate</span>
              <strong>C6</strong>
            </div>

            <div>
              <span>Seat</span>
              <strong>9D</strong>
            </div>

            <div>
              <span>Class</span>
              <strong>Economy</strong>
            </div>

            <div>
              <span>Boarding</span>
              <strong>08:20</strong>
            </div>

            <div>
              <span>Departure</span>
              <strong>09:00</strong>
            </div>

            <div>
              <span>Arrival</span>
              <strong>14:30</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TripItinerary() {
  return (
    <>
      <div className="day-scroll">
        {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"].map((day, index) => (
          <button key={day} className={index === 0 ? "active" : ""} type="button">
            {day}
          </button>
        ))}
      </div>

      <section className="timeline-section">
        <h2>Day 1 · Tue, Mar 10</h2>

        <div className="timeline-list">
          {itinerary.map((item) => (
            <article className="timeline-item" key={item.title}>
              <time>{item.time}</time>
              <div className="timeline-dot" />
              <div className="timeline-card">
                <img src={item.image} alt={item.title} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.place}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button className="primary-trip-btn" type="button">
          + Add Activity
        </button>
      </section>
    </>
  )
}

function TripBudget() {
  return (
    <>
      <section className="trip-budget-summary">
        <div className="trip-section-head">
          <div>
            <p>Total Budget</p>
            <h2>₱80,000</h2>
          </div>
          <button type="button">Edit</button>
        </div>

        <div className="budget-split-row">
          <div>
            <span>Used</span>
            <strong>₱32,450</strong>
            <small>(41%)</small>
          </div>
          <div>
            <span>Remaining</span>
            <strong className="purple">₱47,550</strong>
          </div>
        </div>

        <div className="wide-progress">
          <span style={{ width: "41%" }} />
        </div>
      </section>

      <section className="budget-breakdown">
        <h2>Breakdown</h2>

        {budgetRows.map(([label, amount, percent, width]) => (
          <article className="budget-line" key={label}>
            <span>{label}</span>
            <strong>{amount}</strong>
            <em>{percent}</em>
            <div>
              <i style={{ width: `${width}%` }} />
            </div>
          </article>
        ))}
      </section>

      <section className="ai-budget-card">
        <span>✨ AI Budget Insight</span>
        <p>Adding Universal Studios Japan tickets will exceed your budget by ₱3,200.</p>
        <button type="button">View Details</button>
      </section>
    </>
  )
}

function TripExpenses() {
  return (
    <>
      <section className="expenses-top-card">
        <div>
          <p>Total Expenses</p>
          <h2>₱32,450</h2>
        </div>
        <button type="button">+ Add Expense</button>
      </section>

      <section className="expenses-summary">
        <p>Per person (4)</p>
        <strong>₱8,112.50</strong>
      </section>

      <section className="expense-list">
        {expenses.map(([person, item, amount, note]) => (
          <article className="expense-item" key={`${person}-${item}`}>
            <div className="expense-avatar">🧑🏻</div>
            <div>
              <h3>{person}</h3>
              <p>{item}</p>
              {note && <span>{note}</span>}
            </div>
            <strong>{amount}</strong>
          </article>
        ))}
      </section>
    </>
  )
}