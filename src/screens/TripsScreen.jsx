import { useState, useEffect, useRef } from "react"
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
  Plus,
  MapPin,
  Home,
  Search,
  Ticket,
  User,
} from "lucide-react"

import {
  Utensils,
  Bus,
  Bed,
  Download,
} from "lucide-react"

import "./trips.css"
import { getFlightSchedule } from "../lib/flightService"

const tabs = ["Overview", "Itinerary", "Budget", "Expenses"]

// AirLabs' /schedules response only gives IATA codes, not city names.
// Look city names up via AirLabs' Airports DB endpoint instead of hardcoding them.
async function fetchAirportCity(baseUrl, apiKey, iataCode, signal) {
  if (!iataCode) return "—"

  try {
    const params = new URLSearchParams({ iata_code: iataCode, api_key: apiKey })
    const response = await fetch(`${baseUrl}/airports?${params.toString()}`, {
      signal,
      cache: "no-store",
    })

    if (!response.ok) return iataCode

    const payload = await response.json()
    const airports = Array.isArray(payload.response) ? payload.response : []
    return airports[0]?.city || iataCode
  } catch (err) {
    if (err.name === "AbortError") throw err // let the caller handle cancellation
    return iataCode // don't let a city-lookup failure break the whole search
  }
}

// Converts AirLabs' "YYYY-MM-DD HH:mm" into "Mon, Jul 14".
function formatFlightDate(rawTimestamp) {
  if (!rawTimestamp) return "—"
  const datePart = rawTimestamp.split(" ")[0]
  if (!datePart) return "—"

  const parsed = new Date(`${datePart}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function formatFlightTime(rawTimestamp) {
  if (!rawTimestamp) return "—"
  const timePart = rawTimestamp.split(" ")[1]
  if (!timePart) return "—"

  const [hourStr, minuteStr] = timePart.split(":")
  let hour = parseInt(hourStr, 10)
  if (Number.isNaN(hour)) return "—"

  const period = hour >= 12 ? "PM" : "AM"
  hour = hour % 12
  if (hour === 0) hour = 12

  return `${hour}:${minuteStr} ${period}`
}

export default function TripsScreen() {
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [activeTab, setActiveTab] = useState("Overview")

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

      {activeTab === "Overview" && <TripOverview />}
      {activeTab === "Itinerary" && <TripItinerary />}
      {activeTab === "Budget" && <TripBudget />}
      {activeTab === "Expenses" && <TripExpenses />}
    </div>
  )
}

function TripsLanding({ onOpenTrip }) {
  const [flight, setFlight] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [savedMessage, setSavedMessage] = useState("")
  const searchAbortRef = useRef(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const fallback = {
        departureTime: "9:00 AM",
        arrivalTime: "2:30 PM",
        date: "Demo flight",
        originCode: "CEB",
        originName: "Cebu",
        destCode: "NRT",
        destName: "Tokyo (Narita)",
        terminal: "Cebu Terminal 2",
      }

      try {
        const debugEnabled = import.meta.env.DEV && import.meta.env.VITE_AIRLABS_DEBUG === "true"
        if (!debugEnabled) {
          if (mounted) {
            setFlight(fallback)
            setUsingFallback(true)
          }
          return
        }

        const now = Math.floor(Date.now() / 1000)
        const twelveHours = now + 60 * 60 * 12
        const schedules = await getFlightSchedule("CEB", now, twelveHours)
        const first = schedules && schedules.length ? schedules[0] : null

        if (mounted) {
          setFlight(first || fallback)
          setUsingFallback(!first)
        }
      } catch (err) {
        console.error("Flight schedule load failed", err)
        if (mounted) {
          setFlight(fallback)
          setUsingFallback(true)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  // IATA airline codes are always exactly 2 alphanumeric chars (e.g. PR, 5J, 6E).
  // Using {2} instead of {2,3} avoids ambiguous parsing on no-space input like "5J2515".
  const FLIGHT_REGEX = /^([A-Za-z0-9]{2})\s*(\d{1,4})$/i

  async function searchFlight(event) {
    event.preventDefault()
    setSearchError("")
    setSavedMessage("")

    const flightNumber = searchValue.trim()
    if (!flightNumber) {
      setSearchError("Please enter a flight number to lookup.")
      return
    }

    const flightMatch = flightNumber.match(FLIGHT_REGEX)
    if (!flightMatch) {
      setSearchError("Use a format like 'PR 641' or '5J 5062'.")
      return
    }

    // Cancel any in-flight request before starting a new one
    searchAbortRef.current?.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller

    setSearching(true)

    try {
      const baseUrl = import.meta.env.VITE_AIRLABS_BASE_URL.replace(/\/$/, "")
      const apiKey = import.meta.env.VITE_AIRLABS_API_KEY
      const params = new URLSearchParams({
        flight_iata: `${flightMatch[1].toUpperCase()}${flightMatch[2]}`,
        api_key: apiKey,
      })

      // baseUrl already includes /api/v9 — do not prefix another /api here.
      // /schedules covers upcoming scheduled flights, not just airborne ones.
      const response = await fetch(`${baseUrl}/schedules?${params.toString()}`, {
        signal: controller.signal,
        cache: "no-store",
      })

      let payload
      try {
        payload = await response.json()
      } catch {
        setSearchError("Unexpected response from the server.")
        return
      }

      if (!response.ok) {
        setSearchError(payload.error?.message || "Could not find that flight.")
        return
      }

      // /schedules returns an array of matches (e.g. codeshares); take the first.
      const matches = Array.isArray(payload.response) ? payload.response : []
      const match = matches[0]
      if (!match) {
        setSearchError("No scheduled flight found for that number.")
        return
      }

      const [originName, destName] = await Promise.all([
        fetchAirportCity(baseUrl, apiKey, match.dep_iata, controller.signal),
        fetchAirportCity(baseUrl, apiKey, match.arr_iata, controller.signal),
      ])

      const flightDetails = {
        departureTime: formatFlightTime(match.dep_time),
        arrivalTime: formatFlightTime(match.arr_time),
        date: formatFlightDate(match.dep_time),
        originCode: match.dep_iata,
        originName,
        destCode: match.arr_iata,
        destName,
        terminal: match.dep_terminal ? `Terminal ${match.dep_terminal}` : "—",
        status: match.status,
      }

      setFlight(flightDetails)
      setUsingFallback(false)

      const saveResponse = await fetch(`${baseUrl}/api/flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flightDetails),
        signal: controller.signal,
      })

      if (saveResponse.ok) {
        const savePayload = await saveResponse.json()
        setSavedMessage(`Saved flight ${savePayload.flight.flightNumber} to the backend.`)
      } else {
        console.warn("Failed to save flight")
      }
      // Save failures don't block the user — lookup already succeeded.
    } catch (err) {
      if (err.name === "AbortError") return // superseded by a newer request
      console.error("Flight search failed", err)
      setSearchError("Flight lookup failed. Please try again.")
    } finally {
      if (searchAbortRef.current === controller) {
        setSearching(false)
      }
    }
  }

  return (
    <div className="scroll-area trips-premium-home">
      <header className="trips-hero-header">
        <div>
          <p>Hey, Dhan! 👋</p>
          <h1>My Trips</h1>
          <p className="flight-status-note">
            {loading
              ? "Loading flight details..."
              : "Using demo schedule to preserve AirLabs usage"}
          </p>
        </div>

        <div className="trips-avatar">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Dhan" alt="Dhan" />
          <span />
        </div>
      </header>

      <section className="flight-search-panel">
        <h2>Lookup by flight number</h2>
        <form className="flight-search-form" onSubmit={searchFlight}>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="e.g. PR 641 or 5J 5062"
            aria-label="Flight number"
          />
          <button type="submit" disabled={searching || !searchValue.trim()}>
            {searching ? "Searching…" : "Lookup flight"}
          </button>
        </form>
        {searchError ? <p className="flight-search-error">{searchError}</p> : null}
        {savedMessage ? <p className="flight-search-saved">{savedMessage}</p> : null}
      </section>

      <section className="ios-flight-card" onClick={onOpenTrip}>
        <div className="flight-top">
          <div>
            <span>DEPARTURE</span>
            <strong>{flight?.departureTime || "—"}</strong>
            <h2>{flight?.originCode || "—"}</h2>
            <p>{flight?.originName || "—"}</p>
          </div>

          <div>
            <span>ARRIVAL</span>
            <strong>{flight?.arrivalTime || "—"}</strong>
            <h2>{flight?.destCode || "—"}</h2>
            <p>{flight?.destName || "—"}</p>
          </div>
        </div>

        <div className="sky-arc" />
        <div className="plane-glow">✈</div>

        <div className="flight-bottom">
          <span>
            <MapPin size={18} /> {flight?.terminal || "—"}
          </span>
          <span>
            <CalendarDays size={18} /> {flight?.date || "—"}
          </span>
        </div>
      </section>

      <section className="ios-trip-detail-card" onClick={onOpenTrip}>
        <div className="trip-detail-main">
          <div>
            <span>Trip</span>
            <h3>Japan<br />Adventure</h3>
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
            <p><CalendarDays size={15} /> Mar 10 – Mar 18, 2026</p>
            <p><UsersRound size={15} /> 8 Days • 4 Travelers</p>
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

function TripItinerary() {
  return <section className="placeholder-panel">Itinerary content here.</section>
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
              <div className={`budget-category-icon ${color}`}>
                {icon}
              </div>

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
