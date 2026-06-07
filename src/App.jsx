import { useState } from "react"
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  Filter,
  Heart,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react"

import StatusBar from "./components/StatusBar"
import BottomNav from "./components/BottomNav"
import BudgetScreen from "./screens/BudgetScreen"
import TripsScreen from "./screens/TripsScreen"
import ProfileScreen from "./screens/ProfileScreen"
import SmartMatchScreen from "./screens/SmartMatchScreen"

import {
  discoverCategories,
  featuredDestinations,
  quickActions,
  trendingDeals,
  trip,
  tourPackages,
} from "./data/mockData"

import "./index.css"

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home")

  const goToHome = () => setCurrentScreen("home")
  const goToExplore = () => setCurrentScreen("explore")
  const goToTrips = () => setCurrentScreen("trips")
  const goToSmartMatch = () => setCurrentScreen("smartmatch")
  const goToProfile = () => setCurrentScreen("profile")

  return (
    <main className="app-shell">
    <section className="phone">
      <StatusBar />
  
      {
        currentScreen === "explore" ? (
          <DiscoverScreen onBack={goToHome} />
        ) : currentScreen === "trips" ? (
          <TripsScreen />
        ) : currentScreen === "smartmatch" ? (
          <SmartMatchScreen />
        ) : currentScreen === "profile" ? (
          <ProfileScreen />
        ) : (
          <HomeScreen onDiscover={goToExplore} />
        )
      }
  
      <BottomNav
        currentScreen={currentScreen}
        onHome={goToHome}
        onExplore={goToExplore}
        onTrips={goToTrips}
        onSmartMatch={goToSmartMatch}
        onProfile={goToProfile}
      />
    </section>
  </main>
  )
}

function HomeScreen({ onDiscover }) {
  const progress = Math.round((trip.spent / trip.budget) * 100)

  return (
    <div className="scroll-area home-screen">
      <header className="header">
        <div className="profile">
          <div className="profile-avatar">🧑🏻</div>
          <div>
            <p>Hey, Dhan! 👋</p>
            <h1>Where to next?</h1>
          </div>
        </div>

        <button className="bell-btn" type="button">
          <Bell size={30} strokeWidth={2.5} />
          <span />
        </button>
      </header>

      <section className="section-title">
        <h2>Upcoming Trips</h2>
        <button type="button">
          View All <ChevronRight size={24} />
        </button>
      </section>

      <article className="trip-card">
        <div className="trip-photo" style={{ backgroundImage: `url(${trip.image})` }}>
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
            <button
              type="button"
              className={`quick-card ${action.className}`}
              key={action.title}
              onClick={() => {
                if (action.title.includes("Explore")) onDiscover()
              }}
            >
              <img src={action.image} alt="" />
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="agency-package-section">
        <div className="home-section-row">
          <div>
            <h2>AI-Matched Agency Packages</h2>
            <p>Curated trips from verified travel partners.</p>
          </div>
          <button type="button">View all</button>
        </div>

        <div className="agency-package-carousel">
          {tourPackages.map((pkg) => (
            <article className="agency-package-card" key={pkg.title}>
              <img src={pkg.image} alt={pkg.title} />
              <div className="agency-package-overlay" />
              <div className="match-badge">{pkg.match || "94% Match"}</div>

              <div className="agency-package-content">
                <span className="agency-name">{pkg.agency || "Verified Partner"}</span>
                <h3>{pkg.title}</h3>
                <p>{pkg.location}</p>

                <div className="package-meta">
                  <span>{pkg.days}</span>
                  <span>{pkg.places || "Tours • Hotel • Transfers"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="trusted-agencies-section">
        <div className="home-section-row">
          <div>
            <h2>Trusted Agencies for You</h2>
            <p>Verified partners matched to your trip style.</p>
          </div>
          <button type="button">View all</button>
        </div>

        <div className="premium-agency-carousel">
          <article className="premium-agency-card">
            <div className="agency-cover japan-cover">
              <span>96% Match</span>
            </div>

            <div className="premium-agency-body">
              <div className="premium-agency-logo">🌸</div>
              <h3>Sakura Travels</h3>
              <p>Japan • Korea • Visa support</p>

              <div className="agency-stats">
                <span>4.9 ★</span>
                <span>Fast reply</span>
                <span>Family trips</span>
              </div>

              <button type="button">View Agency</button>
            </div>
          </article>

          <article className="premium-agency-card">
            <div className="agency-cover dubai-cover">
              <span>93% Match</span>
            </div>

            <div className="premium-agency-body">
              <div className="premium-agency-logo">✈️</div>
              <h3>PAPH Travel</h3>
              <p>Dubai • Abu Dhabi • Group tours</p>

              <div className="agency-stats">
                <span>4.8 ★</span>
                <span>Visa help</span>
                <span>Packages</span>
              </div>

              <button type="button">View Agency</button>
            </div>
          </article>
        </div>
      </section>

      <section className="smart-match-final">
        <div className="smart-match-copy">
          <span>
            <Sparkles size={15} /> Smart Match
          </span>
          <h2>Find the right trip and agency in minutes.</h2>
          <p>
            Answer 3 quick questions and TravAI will match you with packages,
            agencies, and services that fit your budget.
          </p>

          <button type="button">
            Find My Trip <ChevronRight size={18} />
          </button>
        </div>

        <div className="smart-match-visual">
          <div className="orbit-globe">🌍</div>
          <div className="orbit-plane">✈️</div>
          <div className="orbit-pin">📍</div>
        </div>
      </section>
    </div>
  )
}

function DiscoverScreen({ onBack }) {
  const featuredPlaces = [
    {
      title: "Obernberg am Brenner",
      country: "Austria",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=900&auto=format&fit=crop",
    },
    {
      title: "Ao Nang, Krabi",
      country: "Thailand",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop",
    },
  ]

  const exploreMore = [
    {
      title: "Tower Bridge Suite",
      location: "London",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=700&auto=format&fit=crop",
    },
    {
      title: "Seaside Villa",
      location: "Bali",
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=700&auto=format&fit=crop",
    },
  ]

  return (
    <div className="scroll-area discover-screen premium-discover-page">
      <section className="discover-hero-v4">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
          alt="Tropical destination"
        />

        <div className="discover-hero-shade" />

        <div className="discover-hero-top">
          <button className="hero-icon-glass" onClick={onBack} type="button">
            <ArrowLeft size={19} />
          </button>

          <button className="hero-book-btn" type="button">
            Book Now
          </button>
        </div>

        <div className="discover-hero-copy">
          <span>Hi, Dhan!</span>
          <h1>Explore the world</h1>

          <p>Where do you want to go?</p>

          <div className="discover-glass-search">
            <Search size={18} />
            <span>Search destinations, hotels, or stays</span>
          </div>
        </div>
      </section>

      <section className="discover-service-row">
        {["Stays", "Flights", "Tours", "Visa"].map((item, index) => (
          <button className={index === 0 ? "active" : ""} type="button" key={item}>
            {item}
          </button>
        ))}
      </section>

      <section className="featured-deal-banner">
        <div>
          <span>Featured Deal</span>
          <h2>Bali private villa escape</h2>
          <p>4D3N · airport transfer · agency assisted</p>
          <button type="button">See deal</button>
        </div>
      </section>

      <section className="discover-section-row">
        <div>
          <h2>Featured Places</h2>
          <p>Most trending places this season</p>
        </div>
        <button type="button">See All</button>
      </section>

      <section className="featured-place-grid">
        {featuredPlaces.map((place) => (
          <article className="featured-place-card" key={place.title}>
            <img src={place.image} alt={place.title} />
            <div className="featured-place-shade" />

            <button type="button">Book Now</button>

            <div>
              <h3>{place.title}</h3>
              <p>
                {place.country} <span>⭐ 4.9</span>
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="discover-section-row category-title-row">
        <div>
          <h2>Explore More</h2>
          <p>Curated stays and luxury escapes</p>
        </div>
        <button type="button">See All</button>
      </section>

      <section className="explore-more-row">
        {exploreMore.map((place) => (
          <article className="explore-more-card" key={place.title}>
            <img src={place.image} alt={place.title} />
            <div />
            <button type="button">
              <Heart size={16} />
            </button>

            <section>
              <h3>{place.title}</h3>
              <p>{place.location}</p>
            </section>
          </article>
        ))}
      </section>

      <section className="discover-genius-card">
        <div>
          <span>Smart Match</span>
          <h2>Save more with agency-matched trips.</h2>
          <p>Unlock verified packages, visa help, hotels, tours, and transfers.</p>
        </div>

        <button type="button">
          <ChevronRight size={18} />
        </button>
      </section>
    </div>
  )
}

function PlaceholderScreen({ title, subtitle }) {
  return (
    <div className="scroll-area placeholder-screen">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}