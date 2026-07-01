import { useState } from "react";
import { supabase } from "./supabaseClient"; // Import our shared client

export default function AuthScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // New state tracking the selected account role (defaulting to 'Traveler')
  const [userType, setUserType] = useState("Traveler");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Step 1: Create the secure authentication account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      setErrorMessage(authError.message);
      return;
    }

    // Step 2: Manually insert their profile data into public.users using their new ID
    if (authData?.user) {
      const { error: dbError } = await supabase
        .from("users") // Looks directly at public.users
        .insert([
          {
            user_id: authData.user.id, // Links the newly generated auth UUID
            email: email,
            full_name: name || "New User",
            user_type: userType, // 'Traveler' or 'Agency'
          },
        ]);

      if (dbError) {
        console.error("Database Insert Error:", dbError);
        setErrorMessage(
          "Account created, but profile setup failed: " + dbError.message,
        );
      } else {
        console.log("Registration completely successful!");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setErrorMessage("Error: " + error.message);
  };

  const handleAnonymousTest = async () => {
    setErrorMessage("");
    const { error } = await supabase.auth.signInAnonymously();
    if (error) setErrorMessage(error.message);
  };

  return (
    <div
      className="auth-container"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h2>Sign In / Create Account</h2>
      <form style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Account Role Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "640", color: "#4b5563" }}
          >
            I am signing up as a:
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setUserType("Traveler")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "4px",
                border:
                  userType === "Traveler"
                    ? "2px solid #2563eb"
                    : "1px solid #d1d5db",
                backgroundColor: userType === "Traveler" ? "#eff6ff" : "#fff",
                color: userType === "Traveler" ? "#2563eb" : "#374151",
                fontWeight: userType === "Traveler" ? "600" : "400",
                cursor: "pointer",
              }}
            >
              🧳 Traveler
            </button>
            <button
              type="button"
              onClick={() => setUserType("Agency")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "4px",
                border:
                  userType === "Agency"
                    ? "2px solid #2563eb"
                    : "1px solid #d1d5db",
                backgroundColor: userType === "Agency" ? "#eff6ff" : "#fff",
                color: userType === "Agency" ? "#2563eb" : "#374151",
                fontWeight: userType === "Agency" ? "600" : "400",
                cursor: "pointer",
              }}
            >
              🏢 Travel Agency
            </button>
          </div>
        </div>

        {/* Full Name Input field */}
        <input
          type="text"
          placeholder={
            userType === "Traveler" ? "Full Name" : "Agency Business Name"
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
          }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
          }}
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            type="button"
            onClick={handleLogin}
            style={{ flex: 1, padding: "8px", cursor: "pointer" }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Sign Up
          </button>
        </div>
      </form>

      <div style={{ textAlign: "center", margin: "4px 0", color: "#6b7280" }}>
        or
      </div>

      <button
        onClick={handleAnonymousTest}
        style={{
          padding: "10px",
          background: "#34d399",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          borderRadius: "4px",
          fontWeight: "600",
        }}
      >
        ⚡ Fast Test (Skip Forms)
      </button>

      {errorMessage && (
        <p style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
