import {
    BarChart3,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Coins,
    Plus,
  } from "lucide-react"
  
  const trips = [
    {
      title: "Japan Trip",
      date: "May 15 – May 24, 2025",
      spent: 32450,
      budget: 80000,
      progress: 41,
      image:
        "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=900&auto=format&fit=crop",
      color: "purple",
    },
    {
      title: "Bali Escape",
      date: "Jun 10 – Jun 17, 2025",
      spent: 12000,
      budget: 35000,
      progress: 34,
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=900&auto=format&fit=crop",
      color: "pink",
    },
    {
      title: "Cebu Getaway",
      date: "Jul 5 – Jul 8, 2025",
      spent: 8500,
      budget: 20000,
      progress: 42,
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop",
      color: "orange",
    },
    {
      title: "Korea Adventure",
      date: "Aug 20 – Aug 28, 2025",
      spent: 19480,
      budget: 45000,
      progress: 43,
      image:
        "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=900&auto=format&fit=crop",
      color: "green",
    },
  ]
  
  export default function BudgetScreen() {
    return (
      <div className="scroll-area budget-screen">
        <header className="budget-top">
          <div>
            <h1>Budget</h1>
            <p>Overview of all your trips</p>
          </div>
  
          <button className="budget-chart-btn" type="button">
            <BarChart3 size={24} />
          </button>
        </header>
  
        <section className="budget-overview-card">
          <div className="overview-card-head">
            <h2>Total Overview</h2>
            <button type="button">
              All Trips <ChevronDown size={15} />
            </button>
          </div>
  
          <div className="overview-main">
            <div>
              <span>Total Budget</span>
              <strong>₱180,000</strong>
            </div>
  
            <div className="budget-ring">
              <div>
                <strong>40%</strong>
                <span>Spent</span>
              </div>
            </div>
  
            <div>
              <span>Total Spent</span>
              <strong>₱72,430</strong>
            </div>
          </div>
  
          <div className="overview-remaining">
            <span>Remaining</span>
            <strong>₱107,570</strong>
          </div>
        </section>
  
        <section className="budget-list-head">
          <h2>Your Trips</h2>
          <button type="button">+ Add Trip</button>
        </section>
  
        <section className="trip-budget-list">
          {trips.map((trip) => (
            <article className="trip-budget-card" key={trip.title}>
              <img src={trip.image} alt={trip.title} />
  
              <div className="trip-budget-info">
                <div className="trip-budget-title">
                  <h3>{trip.title}</h3>
                  <ChevronRight size={21} />
                </div>
  
                <p>
                  <CalendarDays size={13} />
                  {trip.date}
                </p>
  
                <div className="trip-budget-amount">
                  <strong>₱{trip.spent.toLocaleString()}</strong>
                  <span>/ ₱{trip.budget.toLocaleString()}</span>
                  <em>{trip.progress}%</em>
                </div>
  
                <div className="trip-budget-bar">
                  <span className={trip.color} style={{ width: `${trip.progress}%` }} />
                </div>
              </div>
            </article>
          ))}
        </section>
  
        <section className="budget-tip-card">
          <div>
            <h2>Track smarter, travel better</h2>
            <p>Set budgets, track expenses and make every trip count.</p>
            <button type="button">Learn More</button>
          </div>
  
          <div className="tip-illustration">
            <Coins size={40} />
            <Plus size={22} />
          </div>
        </section>
      </div>
    )
  }