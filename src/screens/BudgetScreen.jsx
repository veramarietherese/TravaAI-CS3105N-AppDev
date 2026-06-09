import {
  ArrowLeft,
  MoreHorizontal,
  Plane,
  Hotel,
  Utensils,
  Bus,
  Ticket,
  Download,
} from "lucide-react"
import "./budget.css"

const breakdown = [
  {
    icon: <Plane size={18} />,
    label: "Flights",
    spent: "₱18,000",
    budget: "₱25,000",
    percent: 72,
    color: "purple",
  },
  {
    icon: <Hotel size={18} />,
    label: "Hotels",
    spent: "₱8,400",
    budget: "₱20,000",
    percent: 42,
    color: "blue",
  },
  {
    icon: <Utensils size={18} />,
    label: "Food",
    spent: "₱3,500",
    budget: "₱10,000",
    percent: 35,
    color: "pink",
  },
  {
    icon: <Bus size={18} />,
    label: "Transport",
    spent: "₱1,800",
    budget: "₱5,000",
    percent: 36,
    color: "orange",
  },
  {
    icon: <Ticket size={18} />,
    label: "Activities",
    spent: "₱600",
    budget: "₱5,000",
    percent: 12,
    color: "green",
  },
]

export default function BudgetScreen() {
  return (
    <div className="scroll-area trip-budget-page">
      <header className="trip-page-header">
        <button type="button">
          <ArrowLeft size={22} />
        </button>

        <h1>Japan Trip</h1>

        <button type="button">
          <MoreHorizontal size={22} />
        </button>
      </header>

      <nav className="trip-page-tabs">
        <button>Overview</button>
        <button>Itinerary</button>
        <button className="active">Budget</button>
        <button>Expenses</button>
      </nav>

      <section className="budget-overview-panel">
        <div className="budget-panel-head">
          <div>
            <h2>Budget Overview</h2>
          </div>

          <button type="button">
            <Download size={16} />
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
          {breakdown.map((item) => (
            <article className="budget-category" key={item.label}>
              <div className={`budget-category-icon ${item.color}`}>
                {item.icon}
              </div>

              <div className="budget-category-info">
                <div className="budget-category-top">
                  <strong>{item.label}</strong>
                  <span>
                    {item.spent} / {item.budget}
                  </span>
                </div>

                <div className="budget-category-bar">
                  <i
                    className={item.color}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>

              <em>{item.percent}%</em>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}