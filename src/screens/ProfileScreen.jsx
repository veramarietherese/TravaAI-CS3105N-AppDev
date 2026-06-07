import {
    Bell,
    ChevronRight,
    Globe2,
    Heart,
    MapPin,
    Plane,
    Settings,
    ShieldCheck,
    Sparkles,
  } from "lucide-react"
  
  export default function ProfileScreen() {
    return (
      <div className="scroll-area profile-screen">
        <header className="profile-topbar">
          <button type="button">
            <Settings size={21} />
          </button>
          <h1>Profile</h1>
          <button type="button">
            <Bell size={21} />
          </button>
        </header>
  
        <section className="profile-hero-card">
          <div className="profile-glow" />
  
          <div className="profile-avatar-xl">🧑🏻</div>
  
          <h2>Dhan Alcover</h2>
          <p>Luxury traveler · Family trips · Japan lover</p>
  
          <div className="profile-badges">
            <span>
              <ShieldCheck size={13} /> Verified
            </span>
            <span>
              <Sparkles size={13} /> Smart Match Ready
            </span>
          </div>
        </section>
  
        <section className="profile-stats-grid">
          <article>
            <strong>8</strong>
            <span>Trips</span>
          </article>
  
          <article>
            <strong>5</strong>
            <span>Countries</span>
          </article>
  
          <article>
            <strong>24</strong>
            <span>Memories</span>
          </article>
        </section>
  
        <section className="profile-section-head">
          <div>
            <span>Travel identity</span>
            <h2>Your Travel Style</h2>
          </div>
        </section>
  
        <section className="travel-style-card">
          <div>
            <Globe2 size={24} />
            <h3>Curated Family Explorer</h3>
            <p>
              You prefer well-planned trips with comfortable stays, visa support,
              scenic routes, and agency-assisted packages.
            </p>
          </div>
  
          <button type="button">
            Improve Match <ChevronRight size={17} />
          </button>
        </section>
  
        <section className="profile-menu">
          <ProfileRow icon={<Plane size={20} />} title="Upcoming Trips" value="Japan Trip" />
          <ProfileRow icon={<Heart size={20} />} title="Saved Packages" value="12 saved" />
          <ProfileRow icon={<MapPin size={20} />} title="Visited Places" value="View map" />
          <ProfileRow icon={<ShieldCheck size={20} />} title="Travel Documents" value="Secured" />
        </section>
      </div>
    )
  }
  
  function ProfileRow({ icon, title, value }) {
    return (
      <button className="profile-row" type="button">
        <div className="profile-row-icon">{icon}</div>
  
        <div>
          <h3>{title}</h3>
          <p>{value}</p>
        </div>
  
        <ChevronRight size={18} />
      </button>
    )
  }