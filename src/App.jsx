import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Heart,
  Home,
  PieChart,
  UserRound,
} from "lucide-react"
import { discoverPlaces, quickActions, trip } from "./data/mockData"
import "./index.css"

export default function App() {
  const progress = Math.round((trip.spent / trip.budget) * 100)

  return (
    <main className="app-shell">
      <section className="phone">
        <div className="status-bar">
          <strong>9:41</strong>
          <div className="status-icons">
            <span className="signal">▮▮▮</span>
            <span>⌁</span>
            <span className="battery" />
          </div>
        </div>

        <div className="scroll-area">
          <header className="header">
            <div className="profile">
              <div className="profile-avatar">🧑🏻</div>
              <div>
                <p>Hey, Dhan! 👋</p>
                <h1>Where to next?</h1>
              </div>
            </div>

            <button className="bell-btn" aria-label="Notifications">
              <Bell size={30} strokeWidth={2.5} />
              <span />
            </button>
          </header>

          <section className="section-title">
            <h2>Upcoming Trips</h2>
            <button>
              View All <ChevronRight size={24} />
            </button>
          </section>

          <article className="trip-card">
            <div
              className="trip-photo"
              style={{ backgroundImage: `url(${trip.image})` }}
            >
              <div className="trip-shade" />
              <div className="trip-info">
                <h3>{trip.title}</h3>
                <p>
                  <CalendarDays size={24} />
                  {trip.date}
                </p>

                <div className="people">
                  {trip.people.map((person, index) => (
                    <span key={`${person}-${index}`}>{person}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="budget-row">
              <div>
                <span>Budget used</span>
                <strong>
                  ₱{trip.spent.toLocaleString()} / ₱{trip.budget.toLocaleString()}
                </strong>
              </div>

              <div className="progress">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </article>

          <section className="quick">
            <h2>Quick Actions</h2>

            <div className="quick-grid">
              {quickActions.map((action) => (
                <button className={`quick-card ${action.className}`} key={action.title}>
                  <img src={action.image} alt="" />
                  <span>{action.title}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="discover">
            <div className="section-title discover-title">
              <h2>Discover</h2>
              <button>
                Search <ChevronRight size={24} />
              </button>
            </div>

            <div className="discover-grid">
              {discoverPlaces.map((place) => (
                <article className="place-card" key={place.city}>
                  <img src={place.image} alt={place.city} />
                  <button className="heart">
                    <Heart size={22} />
                  </button>
                  <div>
                    <h3>{place.city}</h3>
                    <p>{place.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <nav className="bottom-nav">
          <button className="active">
            <Home size={30} fill="currentColor" />
            <span>Home</span>
          </button>
          <button>
            <Briefcase size={30} />
            <span>Trips</span>
          </button>
          <button>
            <PieChart size={31} />
            <span>Budget</span>
          </button>
          <button>
            <UserRound size={30} />
            <span>Profile</span>
          </button>
        </nav>
      </section>
    </main>
  )
}