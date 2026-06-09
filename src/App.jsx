import { useState } from "react"
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  Globe2,
  Plane,
  Flag,
} from "lucide-react"

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
  routeMaps,
  travelAgencies,
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
    <div className="scroll-area home-screen travel-home-v2">
      <header className="home-v2-header">
        <div className="home-v2-profile">
          <div className="home-v2-avatar">🧑🏻</div>

          <div>
            <p>Hey, Dhan! 👋</p>
            <h1>Where to next?</h1>
          </div>
        </div>

        <button className="home-v2-bell" type="button">
          <Bell size={30} strokeWidth={2.45} />
          <span />
        </button>
      </header>

      <section className="travel-footprint-card">
        <div className="footprint-copy">
          <div>
            <h2>Your Travel Footprint</h2>
            <p>
              A recap of everywhere you’ve been
              <br />
              and where you’re going.
            </p>
          </div>

          <button type="button" aria-label="Expand travel footprint">
            ⛶
          </button>
        </div>

        <div className="globe-visual">
          <div className="globe-sphere">
            <span className="route route-one" />
            <span className="route route-two" />

            <span className="plane-marker plane-one">✈</span>
            <span className="plane-marker plane-two">✈</span>

            <div className="map-location cebu">
              <i />
              <strong>Cebu</strong>
              <small>Philippines</small>
            </div>

            <div className="map-location tokyo">
              <i />
              <strong>Tokyo</strong>
              <small>Japan</small>
            </div>

            <div className="map-location seoul">
              <i />
              <strong>Seoul</strong>
              <small>Korea</small>
            </div>

            <div className="map-location bali">
              <i />
              <strong>Bali</strong>
              <small>Indonesia</small>
            </div>
          </div>
        </div>

        <div className="travel-stats-glass">
          <article>
            <Globe2 size={25} />
            <strong>46,380 km</strong>
            <span>Total Miles</span>
          </article>

          <article>
            <Plane size={25} />
            <strong>12</strong>
            <span>Flights Taken</span>
          </article>

          <article>
            <Flag size={25} />
            <strong>8</strong>
            <span>Countries</span>
          </article>

          <article>
            <CalendarDays size={25} />
            <strong>104</strong>
            <span>Days Traveled</span>
          </article>
        </div>
      </section>

      <section className="home-v2-section-title">
        <h2>Upcoming Trips</h2>
        <button type="button">
          View All <ChevronRight size={22} />
        </button>
      </section>

      <article className="home-v2-trip-card">
        <div
          className="home-v2-trip-photo"
          style={{ backgroundImage: `url(${trip.image})` }}
        >
          <div className="home-v2-trip-shade" />

          <div className="home-v2-trip-info">
            <h3>{trip.title}</h3>

            <p>
              <CalendarDays size={21} />
              {trip.date}
            </p>

            <div className="home-v2-people">
              {trip.people.map((person, index) => (
                <span key={`${person}-${index}`}>{person}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="home-v2-budget-row">
          <div>
            <span>Budget used</span>
            <strong>
              ₱{trip.spent.toLocaleString()} / ₱{trip.budget.toLocaleString()}
            </strong>
          </div>

          <div className="home-v2-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </article>

      <section className="home-v2-quick">
        <h2>Quick Actions</h2>

        <div className="home-v2-quick-grid">
          {quickActions.map((action) => (
            <button
              type="button"
              className={`home-v2-quick-card ${action.className}`}
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

      <section className="tour-section">
        <h2>Tour Packages for you</h2>

        <div className="tour-grid">
          {routeMaps.map((pkg) => (
            <article className="tour-card-v2" key={pkg.title}>
              <img className="tour-main-img" src={pkg.image} alt={pkg.title} />

              <div className="tour-info-glass">
                <div>
                  <h3>{pkg.title}</h3>
                  <p>▰ {pkg.date}</p>
                </div>

                <img className="route-map-thumb" src={pkg.routeMap} alt="Trip route map" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="travel-agencies">
        <h2>Travel Agencies</h2>
        <p>AI finds the match. Travel experts make it happen.</p>

        <div className="agency-grid-v2">
          {travelAgencies.map((agency, index) => (
            <article className="agency-card-v2" key={`${agency.name}-${index}`}>
              <img src={agency.image} alt={agency.name} />

              <div className="agency-body-v2">
                <div className="agency-logo-v2">{agency.logo}</div>
                <h3>{agency.name}</h3>
                <p>{agency.subtitle}</p>

                <div className="agency-tags-v2">
                  <span>★ 4.9</span>
                  <span>Fast Reply</span>
                  <span>Budget Friendly</span>
                </div>
              </div>
            </article>
          ))}
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