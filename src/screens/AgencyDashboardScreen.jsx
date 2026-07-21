import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CalendarDays,
  DollarSign,
  MapPin,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  Briefcase,
  Users,
  Compass,
  Copy,
  ExternalLink,
  Send,
  Compass as StyleIcon,
} from "lucide-react";
import "./agency-dashboard.css";
import { supabase } from "../auth/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { createTripFromAgencyPackage } from "../services/tripService.js";

const TRAVEL_STYLE_OPTIONS = ["Standard", "Premium", "Budget"];

export default function AgencyDashboardScreen({
  onBack,
  onNavigateToChat,
  onOpenTripWorkspace,
}) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("packages"); // "packages" | "rosters"
  const [agencyId, setAgencyId] = useState(null);
  const [packages, setPackages] = useState([]);
  const [hostedTrips, setHostedTrips] = useState([]);
  const [editingId, setEditingId] = useState(null); // stores package_id when editing
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("Loading agency profile...");

  // Package Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    currency_code: "PHP",
    duration_days: "",
    duration_nights: "",
    target_travel_style: "Standard",
    image_url: "",
    destination: "",
    country: "Philippines",
    category: "Beach",
  });

  // Calculate Metrics
  const totalPackages = packages.length;
  const totalHostedTrips = hostedTrips.length;
  const totalTravelersJoined = hostedTrips.reduce(
    (sum, trip) => sum + (trip.trip_members?.length || 0),
    0,
  );

  // --- INITIAL LOAD: FETCH AGENCY & RELATED DATA ---
  useEffect(() => {
    if (user?.id) {
      initDashboard();
    } else {
      setFeedback("Error: No authenticated agency user context.");
    }
  }, [user]);

  async function initDashboard() {
    setIsLoading(true);

    try {
      // 1. Fetch agency profile
      const { data: agencyData, error: agencyError } = await supabase
        .from("travel_agencies")
        .select("agency_id")
        .eq("owner_user_id", user.id)
        .single();

      if (agencyError || !agencyData) {
        setFeedback(
          `Unable to verify agency ownership: ${
            agencyError?.message || "No agency record found."
          }`,
        );
        setIsLoading(false);
        return;
      }

      setAgencyId(agencyData.agency_id);

      // 2. Fetch Packages published by this Agency
      const { data: packageData, error: packageError } = await supabase
        .from("tour_packages")
        .select("*")
        .eq("agency_id", agencyData.agency_id)
        .order("package_id", { ascending: false });

      if (packageError) throw packageError;
      setPackages(packageData || []);

      // 3. Fetch Trips hosted by this Agency
      const { data: tripsData, error: tripsError } = await supabase
        .from("trips")
        .select(
          `
          trip_id,
          trip_name,
          destination,
          start_date,
          end_date,
          package_id,
          status,
          trip_members (
            user_id,
            status,
            profiles ( full_name, email )
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (tripsError) {
        console.warn(
          "Could not load hosted trips relation:",
          tripsError.message,
        );
      } else {
        setHostedTrips(tripsData || []);
      }

      setFeedback("Agency workspace loaded successfully.");
    } catch (err) {
      console.error("Dashboard init error:", err);
      setFeedback(`Error loading dashboard: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      price: "",
      currency_code: "PHP",
      duration_days: "",
      duration_nights: "",
      target_travel_style: "Standard",
      image_url: "",
      destination: "",
      country: "Philippines",
      category: "Beach",
    });
  }

  // --- SAVE / UPDATE TOUR PACKAGE ---
  async function handleSubmitPackage(event) {
    event.preventDefault();

    if (!agencyId) {
      setFeedback("Cannot save: Missing valid agency account context.");
      return;
    }

    if (!form.title.trim() || !form.destination.trim() || !form.price) {
      setFeedback("Please add title, destination, and pricing before saving.");
      return;
    }

    const payload = {
      agency_id: agencyId,
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      currency_code: form.currency_code,
      duration_days: parseInt(form.duration_days, 10) || 1,
      duration_nights: parseInt(form.duration_nights, 10) || 0,
      target_travel_style: form.target_travel_style,
      image_url:
        form.image_url.trim() ||
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      destination: form.destination.trim(),
      country: form.country.trim() || "Philippines",
      category: form.category,
    };

    setIsLoading(true);

    try {
      if (editingId) {
        // UPDATE Existing Package
        const { data, error } = await supabase
          .from("tour_packages")
          .update(payload)
          .eq("package_id", editingId)
          .select();

        if (error) throw error;

        setPackages((prev) =>
          prev.map((item) => (item.package_id === editingId ? data[0] : item)),
        );

        setFeedback("Package spec updated successfully.");
        resetForm();
      } else {
        // INSERT New Package
        const { data: pkgData, error: pkgError } = await supabase
          .from("tour_packages")
          .insert([payload])
          .select()
          .single();

        if (pkgError) throw pkgError;

        setPackages((prev) => [pkgData, ...prev]);
        setFeedback("New package published to catalog!");
        resetForm();
      }
    } catch (err) {
      console.error("Submit error:", err);
      setFeedback(`Failed to save package: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // --- MANUAL ACTION: CONVERT PACKAGE TO TRIP WORKSPACE WITH AUTO-BUDGET ---
  async function handleCreateTripFromPackage(pkg) {
    setIsLoading(true);
    setFeedback(
      `Creating trip workspace with auto-budget for "${pkg.title}"...`,
    );

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const newTrip = await createTripFromAgencyPackage(pkg, user, todayStr);

      setHostedTrips((prev) => [newTrip, ...prev]);
      setFeedback("Trip workspace created with pre-filled budget!");

      if (onOpenTripWorkspace) {
        onOpenTripWorkspace(newTrip.trip_id);
      }
    } catch (err) {
      console.error("Create trip error:", err);
      setFeedback(`Failed to create trip workspace: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEditPackage(item) {
    setEditingId(item.package_id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      price: item.price ? String(item.price) : "",
      currency_code: item.currency_code || "PHP",
      duration_days: item.duration_days ? String(item.duration_days) : "",
      duration_nights: item.duration_nights ? String(item.duration_nights) : "",
      target_travel_style: item.target_travel_style || "Standard",
      image_url: item.image_url || "",
      destination: item.destination || "",
      country: item.country || "Philippines",
      category: item.category || "Beach",
    });
    setFeedback(`Modifying specs for "${item.title}".`);
  }

  // --- DELETE PACKAGE ---
  async function handleDeletePackage(packageId) {
    const confirmed = window.confirm(
      "Delete this package from the marketplace?",
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("tour_packages")
      .delete()
      .eq("package_id", packageId);

    if (error) {
      setFeedback(`Failed to delete: ${error.message}`);
    } else {
      setPackages((prev) =>
        prev.filter((item) => item.package_id !== packageId),
      );
      if (editingId === packageId) resetForm();
      setFeedback("Package removed from marketplace.");
    }
  }

  function handleCopyInviteLink(tripId) {
    const link = `${window.location.origin}/join/${tripId}`;
    navigator.clipboard.writeText(link);
    setFeedback(`Invite link copied to clipboard: ${link}`);
  }

  return (
    <div className="scroll-area agency-dashboard-screen">
      {/* Header */}
      <header className="agency-dashboard-header">
        <button className="agency-back-btn" type="button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="agency-eyebrow">Organization Account</p>
          <h1>Agency Command Center</h1>
        </div>
      </header>

      {/* KPI Overview */}
      <section className="agency-hero-card">
        <div>
          <p className="agency-eyebrow">Operations Overview</p>
          <h2>Marketplace performance and customer engagement stats.</h2>
        </div>
        <div className="agency-hero-stats">
          <article>
            <Briefcase size={22} className="stat-icon-color" />
            <strong>{totalPackages}</strong>
            <span>Published Packages</span>
          </article>
          <article>
            <Compass size={22} className="stat-icon-color" />
            <strong>{totalHostedTrips}</strong>
            <span>Hosted Group Trips</span>
          </article>
          <article>
            <Users size={22} className="stat-icon-color" />
            <strong>{totalTravelersJoined}</strong>
            <span>Travelers Joined</span>
          </article>
        </div>
      </section>

      {/* Tab Controls */}
      <div className="agency-tab-bar">
        <button
          className={activeTab === "packages" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("packages")}
        >
          Tour Packages Catalog
        </button>
        <button
          className={activeTab === "rosters" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("rosters")}
        >
          Hosted Group Rosters ({totalHostedTrips})
        </button>
      </div>

      {/* =========================================================
          TAB 1: TOUR PACKAGES CATALOG
      ========================================================= */}
      {activeTab === "packages" && (
        <>
          {/* AI Shortcut Card */}
          <section className="agency-ai-shortcut-card">
            <div className="ai-shortcut-info">
              <Sparkles size={20} className="ai-sparkle-icon" />
              <div>
                <h4>Need help drafting tour package specs?</h4>
                <p>
                  Use our AI Strategist to brainstorm high-converting
                  itineraries, pricing, and specs.
                </p>
              </div>
            </div>
            {onNavigateToChat && (
              <button
                type="button"
                className="agency-secondary-btn"
                onClick={onNavigateToChat}
              >
                Open AI Chatbot <Send size={14} style={{ marginLeft: 6 }} />
              </button>
            )}
          </section>

          {/* Form Panel */}
          <section className="agency-panel">
            <div className="agency-panel-header">
              <div>
                <p className="agency-eyebrow">Package Editor</p>
                <h3>
                  {editingId
                    ? "Edit Existing Spec Matrix"
                    : "Create New Package"}
                </h3>
              </div>
              {editingId && (
                <button
                  className="agency-secondary-btn"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form className="agency-form" onSubmit={handleSubmitPackage}>
              <label>
                <span>Package Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Cebu Island Explorer & Whale Shark Safari"
                  required
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Provide an engaging story/itinerary overview..."
                  rows={3}
                />
              </label>

              <div className="agency-form-grid">
                <label>
                  <span>Destination / City</span>
                  <input
                    value={form.destination}
                    onChange={(e) =>
                      setForm({ ...form, destination: e.target.value })
                    }
                    placeholder="e.g. Oslob, Cebu"
                    required
                  />
                </label>

                <label>
                  <span>Country</span>
                  <input
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    placeholder="e.g. Philippines"
                  />
                </label>
              </div>

              <div className="agency-form-grid">
                <label>
                  <span>Duration Days</span>
                  <input
                    type="number"
                    value={form.duration_days}
                    onChange={(e) =>
                      setForm({ ...form, duration_days: e.target.value })
                    }
                    placeholder="e.g. 4"
                  />
                </label>

                <label>
                  <span>Duration Nights</span>
                  <input
                    type="number"
                    value={form.duration_nights}
                    onChange={(e) =>
                      setForm({ ...form, duration_nights: e.target.value })
                    }
                    placeholder="e.g. 3"
                  />
                </label>
              </div>

              <div className="agency-form-grid">
                <label>
                  <span>Price Amount</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="e.g. 18500"
                    required
                  />
                </label>

                <label>
                  <span>Currency Code</span>
                  <select
                    value={form.currency_code}
                    onChange={(e) =>
                      setForm({ ...form, currency_code: e.target.value })
                    }
                  >
                    <option value="PHP">PHP (₱)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </label>
              </div>

              <div className="agency-form-grid">
                <label>
                  <span>Category</span>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="Beach">Beach</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Culture">Culture</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Food Tour">Food Tour</option>
                  </select>
                </label>

                <label>
                  <span>Target Travel Style</span>
                  <select
                    value={form.target_travel_style}
                    onChange={(e) =>
                      setForm({ ...form, target_travel_style: e.target.value })
                    }
                  >
                    {TRAVEL_STYLE_OPTIONS.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                className="agency-primary-btn agency-submit"
                type="submit"
                disabled={isLoading}
              >
                <Plus size={16} />
                {editingId ? "Save Spec Updates" : "Publish Dynamic Package"}
              </button>
            </form>
            <p className="agency-feedback">{feedback}</p>
          </section>

          {/* Active Postings List */}
          <section className="agency-package-list">
            <div className="agency-panel-header">
              <div>
                <p className="agency-eyebrow">Catalog Overview</p>
                <h3>Active Marketplace Postings</h3>
              </div>
            </div>

            {packages.map((item) => (
              <article className="agency-package-card" key={item.package_id}>
                <div className="agency-package-main">
                  <div className="agency-package-heading">
                    <h4>{item.title}</h4>
                    <span className="agency-status live">{item.category}</span>
                  </div>

                  <p className="package-desc-preview">{item.description}</p>

                  <div className="agency-package-meta field-grid-meta">
                    <span>
                      <MapPin size={14} /> {item.destination}, {item.country}
                    </span>
                    <span>
                      <CalendarDays size={14} /> {item.duration_days}D /{" "}
                      {item.duration_nights}N
                    </span>
                    <span>
                      <DollarSign size={14} /> {item.currency_code}{" "}
                      {Number(item.price).toLocaleString()}
                    </span>
                  </div>

                  <div className="agency-tag-row relational-spec-row">
                    <span>
                      <StyleIcon size={12} /> Style: {item.target_travel_style}
                    </span>
                  </div>
                </div>

                {/* Package Card Actions (Create Trip Workspace, Edit, Delete) */}
                <div className="agency-package-actions">
                  <button
                    type="button"
                    className="agency-primary-btn"
                    onClick={() => handleCreateTripFromPackage(item)}
                    disabled={isLoading}
                  >
                    <Compass size={16} /> Create Trip
                  </button>
                  <button type="button" onClick={() => handleEditPackage(item)}>
                    <PencilLine size={16} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePackage(item.package_id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* =========================================================
          TAB 2: HOSTED GROUP ROSTERS & CUSTOMERS
      ========================================================= */}
      {activeTab === "rosters" && (
        <section className="agency-panel">
          <div className="agency-panel-header">
            <div>
              <p className="agency-eyebrow">Customer Headcount Tracker</p>
              <h3>Active Hosted Group Trips</h3>
            </div>
          </div>

          {hostedTrips.length === 0 ? (
            <p className="agency-empty-state">
              No active trip workspaces created yet. Go to the{" "}
              <strong>Tour Packages Catalog</strong> and click{" "}
              <strong>"Create Trip Workspace"</strong> on a package to launch
              one!
            </p>
          ) : (
            <div className="roster-list-container">
              {hostedTrips.map((trip) => {
                const joinedMembers = trip.trip_members || [];

                return (
                  <article className="agency-roster-card" key={trip.trip_id}>
                    <div className="roster-card-header">
                      <div>
                        <h4>{trip.trip_name}</h4>
                        <span className="roster-destination-tag">
                          <MapPin size={12} /> {trip.destination}
                        </span>
                      </div>
                      <span className="roster-count-badge">
                        <Users size={14} /> {joinedMembers.length} Traveler(s)
                        Joined
                      </span>
                    </div>

                    <div className="roster-members-list">
                      <p className="roster-subtitle">Confirmed Roster:</p>
                      {joinedMembers.length === 0 ? (
                        <p className="roster-no-members">
                          No travelers joined yet. Share the invite link in chat
                          to build your roster!
                        </p>
                      ) : (
                        <ul>
                          {joinedMembers.map((member, i) => (
                            <li key={i} className="roster-member-item">
                              <span>
                                {member.profiles?.full_name ||
                                  member.profiles?.email ||
                                  member.user_id}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="roster-card-actions">
                      <button
                        type="button"
                        className="agency-secondary-btn"
                        onClick={() => handleCopyInviteLink(trip.trip_id)}
                      >
                        <Copy size={14} /> Copy Invite Link
                      </button>

                      {onOpenTripWorkspace && (
                        <button
                          type="button"
                          className="agency-primary-btn"
                          onClick={() => onOpenTripWorkspace(trip.trip_id)}
                        >
                          <ExternalLink size={14} /> Open Trip Workspace
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
