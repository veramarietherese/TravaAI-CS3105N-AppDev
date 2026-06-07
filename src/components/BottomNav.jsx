import { CalendarDays, Compass, Home, Search, UserRound } from "lucide-react"

export default function BottomNav({
  currentScreen,
  onHome,
  onExplore,
  onTrips,
  onSmartMatch,
  onProfile,
}) {
  const items = [
    { key: "home", label: "Home", icon: Home, onClick: onHome },
    { key: "explore", label: "Explore", icon: Search, onClick: onExplore },
    { key: "smartmatch", label: "Smart Match", icon: Compass, onClick: onSmartMatch },
    { key: "trips", label: "Trips", icon: CalendarDays, onClick: onTrips },
    { key: "profile", label: "Profile", icon: UserRound, onClick: onProfile },
  ]

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <button
            key={item.key}
            type="button"
            className={currentScreen === item.key ? "active" : ""}
            onClick={item.onClick}
          >
            <Icon size={19} strokeWidth={2.3} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}