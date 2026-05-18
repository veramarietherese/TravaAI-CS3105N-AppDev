import {
  Bell,
  Briefcase,
  Home,
  PieChart,
  Plus,
  UserRound,
  ChevronRight,
  CalendarDays,
} from "lucide-react"
import { trips, quickActions, discoverTrips } from "./data/mockData"
import "./index.css"

export default function App() {
  const trip = trips[0]
  const progress = Math.round((trip.spent / trip.budget) * 100)

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="screen-scroll">
          <header className="home-header">
            <div className="avatar-img">🧑🏻</div>

            <div className="greeting">
              <p>Hey, Dhan! 👋</p>
              <h1>Where to next?</h1>
            </div>

            <button className="notif-btn">
              <Bell size={24} />
              <span />
            </button>
          </header>

          <section className="section-row">
            <h2>Upcoming Trips</h2>
            <button>
              View all <ChevronRight size={18} />
            </button>
          </section>

          <article className="featured-trip">
            <div className="trip-image" style={{ backgroundImage: `url(${trip.image})` }}>
              <div className="trip-overlay">
                <h3>{trip.title}</h3>

                <p>
                  <CalendarDays size={18} />
                  {trip.date}
                </p>

                <div className="avatar-stack">
                  {trip.people.map((person) => (
                    <span key={person}>{person}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="budget-box">
              <div>
                <p>Budget used</p>
                <strong>
                  ₱{trip.spent.toLocaleString()} / ₱{trip.budget.toLocaleString()}
                </strong>
              </div>

              <div className="budget-track">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </article>

          <section className="quick-section">
            <h2>Quick Actions</h2>

            <div className="quick-grid">
              {quickActions.map((action) => (
                <button className="quick-card" key={action.label}>
                  <span className={`quick-icon ${action.tone}`}>{action.icon}</span>
                  <p>{action.label}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="discover-section">
            <div className="section-row compact">
              <h2>Discover</h2>
              <button>
                Search <ChevronRight size={18} />
              </button>
            </div>

            <div className="discover-list">
              {discoverTrips.map((item) => (
                <article className="discover-card" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.location}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <nav className="bottom-nav">
          <button className="active">
            <Home size={22} />
            <span>Home</span>
          </button>

          <button>
            <Briefcase size={22} />
            <span>Trips</span>
          </button>

          <button>
            <PieChart size={22} />
            <span>Budget</span>
          </button>

          <button>
            <UserRound size={22} />
            <span>Profile</span>
          </button>
        </nav>
      </section>
    </main>
  )
}