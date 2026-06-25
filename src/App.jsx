import { useEffect, useMemo, useState } from "react"

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
import TravelGlobe from "./components/TravelGlobe"
import ChatWidget from "./components/ChatWidget"


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

const AIRPORTS = {
  CEB: { code: "CEB", city: "Cebu", country: "Philippines", lat: 10.3157, lng: 123.8854 },
  NRT: { code: "NRT", city: "Tokyo", country: "Japan", lat: 35.772, lng: 140.3929 },
  HND: { code: "HND", city: "Tokyo", country: "Japan", lat: 35.5494, lng: 139.7798 },
  ICN: { code: "ICN", city: "Seoul", country: "Korea", lat: 37.4602, lng: 126.4407 },
  DPS: { code: "DPS", city: "Bali", country: "Indonesia", lat: -8.7482, lng: 115.1672 },
  MNL: { code: "MNL", city: "Manila", country: "Philippines", lat: 14.5086, lng: 121.0194 },
  SIN: { code: "SIN", city: "Singapore", country: "Singapore", lat: 1.3644, lng: 103.9915 },
  HKG: { code: "HKG", city: "Hong Kong", country: "Hong Kong", lat: 22.308, lng: 113.9185 },
  KIX: { code: "KIX", city: "Osaka", country: "Japan", lat: 34.4347, lng: 135.244 },
  BKK: { code: "BKK", city: "Bangkok", country: "Thailand", lat: 13.69, lng: 100.7501 },
}

function getDistanceKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

const starterFlights = [
  {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    originCode: "NRT",
    destinationCode: "NRT",
    airline: "Cebu Pacific",
    flightNumber: "5J 5062",
    date: "2026-03-10",
    tripName: "Japan Trip",
  },
  {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    originCode: "NRT",
    destinationCode: "ICN",
    airline: "Korean Air",
    flightNumber: "KE 704",
    date: "2026-04-18",
    tripName: "Korea Trip",
  },
  {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      originCode: "CEB",
    destinationCode: "DPS",
    airline: "Scoot",
    flightNumber: "",
    date: "2026-05-12",
    tripName: "Bali Escape",
  },
]

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

      <ChatWidget />
  
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

  const [flights, setFlights] = useState(() => {
    const saved = localStorage.getItem("roamyFlights")
    return saved ? JSON.parse(saved) : starterFlights
  })
  
  const [flightForm, setFlightForm] = useState({
    originCode: "CEB",
    destinationCode: "NRT",
    date: "",
    airline: "",
    flightNumber: "",
    tripName: "",
  })
  
  useEffect(() => {
    localStorage.setItem("roamyFlights", JSON.stringify(flights))
  }, [flights])
  
  const enrichedFlights = useMemo(() => {
    return flights
      .map((flight) => {
        const origin = AIRPORTS[flight.originCode?.toUpperCase()]
        const destination = AIRPORTS[flight.destinationCode?.toUpperCase()]
  
        if (!origin || !destination) return null
  
        return {
          ...flight,
          origin,
          destination,
          distanceKm: getDistanceKm(origin, destination),
        }
      })
      .filter(Boolean)
  }, [flights])
  
  const travelStats = useMemo(() => {
    const totalKm = enrichedFlights.reduce((sum, flight) => sum + flight.distanceKm, 0)
    const countries = new Set()
  
    enrichedFlights.forEach((flight) => {
      countries.add(flight.origin.country)
      countries.add(flight.destination.country)
    })
  
    return {
      totalKm,
      flightsTaken: enrichedFlights.length,
      countriesVisited: countries.size,
      daysTraveled: 104,
    }
  }, [enrichedFlights])
  
  function addFlight(event) {
    event.preventDefault()
  
    const originCode = flightForm.originCode.toUpperCase().trim()
    const destinationCode = flightForm.destinationCode.toUpperCase().trim()
  
    if (!AIRPORTS[originCode] || !AIRPORTS[destinationCode]) {
      alert("Airport not found. Try CEB, NRT, ICN, DPS, MNL, SIN, HKG, KIX, HND, or BKK.")
      return
    }
  
    setFlights((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        ...flightForm,
        originCode,
        destinationCode,
      },
    ])
  }

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

         <TravelGlobe flights={enrichedFlights} />

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
  const aiPicks = [
    {
      title: "Japan Sakura Escape",
      meta: "7 Days • Tokyo, Kyoto, Osaka",
      price: "₱32,450",
      oldPrice: "₱45,000",
      match: "96%",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=900&auto=format&fit=crop",
      includes: ["Flights", "Hotel", "Visa", "Transfers"],
    },
    {
      title: "Bali Wellness Retreat",
      meta: "5 Days • Ubud, Seminyak",
      price: "₱28,900",
      oldPrice: "₱38,000",
      match: "94%",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=900&auto=format&fit=crop",
      includes: ["Flights", "Hotel", "Activities", "Breakfast"],
    },
    {
      title: "Seoul City Lights",
      meta: "6 Days • Seoul, Busan",
      price: "₱26,300",
      oldPrice: "₱34,000",
      match: "90%",
      image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=900&auto=format&fit=crop",
      includes: ["Flights", "Hotel", "Tours", "Food"],
    },
  ]

  const trending = [
    { flag: "🇯🇵", place: "Japan", growth: "+34% searches" },
    { flag: "🇰🇷", place: "Korea", growth: "+18% searches" },
    { flag: "🇹🇭", place: "Thailand", growth: "+12% searches" },
    { flag: "🇦🇺", place: "Australia", growth: "+9% searches" },
  ]

  const budgetPicks = [
    {
      title: "Da Nang",
      country: "Vietnam",
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=700&auto=format&fit=crop",
    },
    {
      title: "Bohol",
      country: "Philippines",
      image: "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=700&auto=format&fit=crop",
    },
    {
      title: "Siargao",
      country: "Philippines",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700&auto=format&fit=crop",
    },
  ]

  return (
    <div className="scroll-area discover-screen premium-discover-page">
      <header className="explore-premium-header">
        <div className="explore-avatar">🧑🏻</div>

        <div>
          <h1>Explore ✨</h1>
          <p>Discover places that match your vibe.</p>
        </div>

        <button className="explore-bell-btn" type="button">
          <Bell size={25} />
          <span />
        </button>
      </header>

      <section className="explore-hero-card">
        <img
          src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1400&auto=format&fit=crop"
          alt="Tokyo"
        />

        <div className="explore-hero-shade" />

        <div className="hero-top-badges">
          <span>✨ Top Match for You</span>
          <strong>☀️ 24°<small>Sunny</small></strong>
        </div>

        <div className="explore-hero-main">
          <h2>Tokyo</h2>
          <p>
            <MapPin size={18} />
            Japan
          </p>

          <div className="hero-people-row">
            <span>🧑🏻</span>
            <span>👩🏻</span>
            <span>👨🏻</span>
            <span>👩🏻</span>
            <b>+12</b>
          </div>
        </div>

        <div className="hero-match-pill">
          <span>💗</span>
          <div>
            <strong>92% Match</strong>
            <small>Perfect for you</small>
          </div>
        </div>

        <div className="explore-search-glass">
          <Search size={23} />
          <span>Search destinations, hotels, flights...</span>
          <button type="button">⌘</button>
        </div>
      </section>

      <div className="explore-dots">
        <span className="active" />
        <span />
        <span />
      </div>

      <section className="explore-category-row">
  {[
    {
      icon: "https://i.pinimg.com/736x/f9/1f/b9/f91fb96acf35c760df6269ee25573299.jpg",
      label: "Flights",
    },
    {
      icon: "https://i.pinimg.com/736x/34/85/31/348531dd77623fd9c205e0b96843d889.jpg",
      label: "Hotels",
    },
    {
      icon: "https://i.pinimg.com/736x/58/2a/cc/582acc2728a1c12eb776b95653fb0bfb.jpg",
      label: "Packages",
    },
    {
      icon: "https://i.pinimg.com/736x/63/8a/73/638a73b7e315a7d5b977214a4e6c01e9.jpg",
      label: "Visa",
    },
    {
      icon: "https://i.pinimg.com/1200x/56/b8/36/56b836f5a5ad4ec9cb4622b24da7eb28.jpg",
      label: "Activities",
    },
    {
      icon: "https://i.pinimg.com/736x/56/f2/fe/56f2fecae466528efb1aed40ea706585.jpg",
      label: "Food",
    },
  ].map((item) => (
    <button type="button" key={item.label}>
      <img src={item.icon} alt={item.label} />
      <strong>{item.label}</strong>
    </button>
  ))}
</section>

      <section className="explore-section-head">
        <h2>✈️ AI Picks for You ✨</h2>
        <button type="button">See All ›</button>
      </section>

      <section className="ai-picks-row">
        {aiPicks.map((item) => (
          <article className="ai-pick-card" key={item.title}>
            <div className="ai-pick-image">
              <img src={item.image} alt={item.title} />
              <span>💗 {item.match} Match</span>
            </div>

            <div className="ai-pick-body">
              <h3>{item.title}</h3>
              <p>{item.meta}</p>

              <div className="ai-includes">
                {item.includes.map((include) => (
                  <span key={include}>✈ {include}</span>
                ))}
              </div>

              <div className="ai-price-row">
                <strong>{item.price}</strong>
                <em>{item.oldPrice}</em>
                <button type="button">View Deal</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="explore-section-head">
        <h2>Trending Now 🔥</h2>
        <button type="button">See All ›</button>
      </section>

      <section className="trending-row">
        {trending.map((item) => (
          <article className="trending-chip" key={item.place}>
            <strong>{item.flag} {item.place}</strong>
            <span>{item.growth}</span>
            <i />
          </article>
        ))}
      </section>

      <section className="explore-section-head">
        <h2>Budget Friendly Picks 💸</h2>
        <button type="button">See All ›</button>
      </section>

      <section className="budget-picks-row">
        {budgetPicks.map((item) => (
          <article className="budget-pick-card" key={item.title}>
            <img src={item.image} alt={item.title} />
            <div />
            <span>Under ₱10k</span>

            <section>
              <h3>{item.title}</h3>
              <p>{item.country}</p>
            </section>
          </article>
        ))}
      </section>
    </div>
  )
}