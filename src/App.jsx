import { CalendarDays, Home, Map, Plus, ReceiptText, UserRound } from "lucide-react"
import { trips } from "./data/mockData"
import "./index.css"

export default function App() {
  return (
    <main className="app-shell">
      <section className="phone-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">Good evening, Dhan</p>
            <h1>Plan smarter trips.</h1>
          </div>
          <button className="avatar">D</button>
        </header>

        <section className="hero-card">
          <div>
            <p className="hero-label">Group travel made simple</p>
            <h2>Itinerary, budget, and expenses in one place.</h2>
            <button className="primary-btn">
              <Plus size={18} />
              Create trip
            </button>
          </div>
        </section>

        <section className="section-head">
          <h3>Upcoming trips</h3>
          <button>See all</button>
        </section>

        <section className="trip-list">
          {trips.map((trip) => {
            const progress = Math.round((trip.spent / trip.budget) * 100)

            return (
              <article className="trip-card" key={trip.id}>
                <img src={trip.image} alt={trip.title} />
                <div className="trip-content">
                  <div className="trip-meta">
                    <span>{trip.status}</span>
                    <span>{progress}% used</span>
                  </div>

                  <h4>{trip.title}</h4>
                  <p>{trip.location}</p>

                  <div className="trip-info">
                    <span>
                      <CalendarDays size={15} />
                      {trip.date}
                    </span>
                  </div>

                  <div className="progress-track">
                    <div style={{ width: `${progress}%` }} />
                  </div>

                  <div className="trip-bottom">
                    <div>
                      <small>Budget</small>
                      <strong>₱{trip.budget.toLocaleString()}</strong>
                    </div>

                    <div className="people">
                      {trip.people.map((person) => (
                        <span key={person}>{person}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <nav className="bottom-nav">
          <button className="active">
            <Home size={20} />
            Home
          </button>
          <button>
            <Map size={20} />
            Map
          </button>
          <button className="nav-main">
            <Plus size={24} />
          </button>
          <button>
            <ReceiptText size={20} />
            Budget
          </button>
          <button>
            <UserRound size={20} />
            Profile
          </button>
        </nav>
      </section>
    </main>
  )
}