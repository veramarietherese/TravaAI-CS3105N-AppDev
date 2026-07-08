import "./budget.css"

const DEFAULT_ASSETS = {
  // Replace these with your real asset paths later.
  // Example: "/assets/budget/wallet-3d.png"
  wallet: "/assets/budget/replace-wallet-asset.png",

  // Example: "/assets/budget/money-3d.png"
  money: "/assets/budget/replace-money-asset.png",

  // Example: "/assets/budget/chart-3d.png"
  chart: "/assets/budget/replace-chart-asset.png",
}

export default function BudgetScreen({
  totalBudget = 80000,
  spent = 32400,
  tripDays = 8,
  currencySymbol = "₱",
  assets = DEFAULT_ASSETS,
}) {
  const remainingBalance = Math.max(totalBudget - spent, 0)
  const dailyAverage = Math.round(totalBudget / tripDays)

  return (
    <section className="budget-screen">
      <article className="budget-hero-card">
        <div className="budget-orb budget-orb-pink" />
        <div className="budget-orb budget-orb-blue" />

        <img
          className="budget-wallet-asset"
          src={assets.wallet}
          alt="3D wallet"
        />

        <div className="budget-hero-copy">
          <span>Overall Balance</span>
          <h2>
            {currencySymbol}
            {totalBudget.toLocaleString()}
          </h2>
          <p>Total planned budget for this trip</p>
        </div>
      </article>

      <div className="budget-card-grid">
        <BudgetMiniCard
          label="Remaining Balance"
          value={`${currencySymbol}${remainingBalance.toLocaleString()}`}
          caption="Still available to spend"
          image={assets.money}
          alt="3D money"
        />

        <BudgetMiniCard
          label="Daily Average"
          value={`${currencySymbol}${dailyAverage.toLocaleString()}`}
          caption="Suggested spending per day"
          image={assets.chart}
          alt="3D chart"
        />
      </div>

      <section className="budget-clean-summary">
        <div>
          <span>Spent so far</span>
          <strong>
            {currencySymbol}
            {spent.toLocaleString()}
          </strong>
        </div>

        <div>
          <span>Trip days</span>
          <strong>{tripDays} days</strong>
        </div>
      </section>
    </section>
  )
}

function BudgetMiniCard({ label, value, caption, image, alt }) {
  return (
    <article className="budget-mini-card">
      <img className="budget-mini-asset" src={image} alt={alt} />

      <div>
        <span>{label}</span>
        <h3>{value}</h3>
        <p>{caption}</p>
      </div>
    </article>
  )
}