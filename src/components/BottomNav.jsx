import {
  Compass,
  Map,
  MessageCircle,
  Sparkles,
  UserRound,
  LayoutDashboard,
} from "lucide-react";

import "./bottom-nav.css";

export default function BottomNav({
  currentScreen,
  userType, // Accepts "Agency" or "Traveler"
  onExplore,
  onTrips,
  onDashboard, // Added callback handler for Agency
  onSmartMatch,
  onMessages,
  onProfile,
  unreadMessages = 0,
}) {
  console.log("userType: ", userType);
  const firstItem =
    userType === "Agency"
      ? {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          onClick: onDashboard,
        }
      : {
          key: "explore",
          label: "Explore",
          icon: Compass,
          onClick: onExplore,
        };
  const items = [
    firstItem,
    {
      key: "trips",
      label: "Trips",
      icon: Map,
      onClick: onTrips,
    },
    {
      key: "smartmatch",
      label: "AI",
      icon: Sparkles,
      onClick: onSmartMatch,
      isAi: true,
    },
    {
      key: "chat",
      label: "Messages",
      icon: MessageCircle,
      onClick: onMessages,
      badge: unreadMessages,
    },
    {
      key: "profile",
      label: "Profile",
      icon: UserRound,
      onClick: onProfile,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.key;
        const hasBadge = item.key === "chat" && Number(item.badge) > 0;

        return (
          <button
            key={item.key}
            type="button"
            className={[
              "bottom-nav-item",
              isActive ? "active" : "",
              item.isAi ? "ai-nav" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={item.onClick}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav-icon">
              <Icon
                size={item.isAi ? 24 : 21}
                strokeWidth={item.isAi ? 2.5 : 2.2}
              />

              {hasBadge && (
                <span className="bottom-nav-badge">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </span>

            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
