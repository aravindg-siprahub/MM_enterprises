"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";

type Tab = "signin" | "register";

export default function AdminLogin() {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regName, setRegName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Invalid credentials");
      }
      const data = await res.json();
      document.cookie = `admin_token=${data.access_token}; path=/; SameSite=Lax`;
      toast.success("Welcome back, " + (data.admin?.full_name || "Admin") + "!");
      // Hard redirect so the browser sends the cookie with the new request
      window.location.href = "/admin";
    } catch (error: any) {
      const msg = error.message?.includes("fetch")
        ? "Cannot reach server. Make sure the backend is running."
        : error.message;
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) return void toast.error("Passwords do not match");
    if (regPassword.length < 8) return void toast.error("Password must be at least 8 characters");
    setIsRegistering(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          full_name: regName,
          invite_code: inviteCode,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
      }
      const data = await res.json();
      document.cookie = `admin_token=${data.access_token}; path=/; SameSite=Lax`;
      toast.success("Account created!");
      window.location.href = "/admin";
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem" } }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        html, body { margin: 0; padding: 0; }

        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f6fa;
          font-family: 'Inter', sans-serif;
          padding: 1.5rem;
        }

        .login-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem 2.25rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08);
          animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Brand */
        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .login-brand-mark {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 800;
          color: #f59e0b;
          margin-bottom: 0.9rem;
          letter-spacing: -1px;
        }

        .login-brand-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.3px;
        }

        .login-brand-title span { color: #f59e0b; }

        .login-brand-sub {
          margin-top: 0.2rem;
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 400;
        }

        /* Tabs */
        .login-tabs {
          display: flex;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 3px;
          margin-bottom: 1.75rem;
        }

        .login-tab {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 8px;
          font-size: 0.845rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.18s ease;
          background: transparent;
          color: #9ca3af;
        }

        .login-tab.active {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .login-tab:not(.active):hover { color: #6b7280; }

        /* Heading */
        .login-heading {
          margin-bottom: 1.5rem;
        }

        .login-heading h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.4px;
          margin: 0 0 0.25rem;
        }

        .login-heading p {
          font-size: 0.845rem;
          color: #9ca3af;
          margin: 0;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .login-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
        }

        .login-input-wrap { position: relative; }

        .login-input {
          width: 100%;
          padding: 0.7rem 0.875rem;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          color: #111827;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }

        .login-input::placeholder { color: #c9cdd5; }

        .login-input:focus {
          border-color: #111827;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(17,24,39,0.06);
        }

        .login-input.pad-right { padding-right: 2.75rem; }

        .login-eye {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          color: #c9cdd5;
          padding: 0;
          line-height: 1;
          transition: color 0.15s;
        }
        .login-eye:hover { color: #6b7280; }

        /* Divider */
        .login-sep {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .login-sep-line {
          flex: 1;
          height: 1px;
          background: #f3f4f6;
        }

        .login-sep-text {
          font-size: 0.72rem;
          color: #c9cdd5;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        /* Invite hint */
        .login-invite-hint {
          font-size: 0.765rem;
          color: #f59e0b;
          font-weight: 500;
          margin-top: 0.2rem;
        }

        /* Button */
        .login-btn {
          width: 100%;
          padding: 0.8rem;
          background: #111827;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-btn:hover:not(:disabled) {
          background: #1f2937;
          box-shadow: 0 4px 14px rgba(17,24,39,0.2);
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Spinner */
        .login-spin {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Switch link */
        .login-switch {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.835rem;
          color: #9ca3af;
        }

        .login-switch button {
          background: none;
          border: none;
          color: #111827;
          font-weight: 600;
          font-size: 0.835rem;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }

        .login-switch button:hover { color: #f59e0b; }

        /* Footer */
        .login-footer {
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid #f3f4f6;
          text-align: center;
          font-size: 0.75rem;
          color: #d1d5db;
        }

        /* Inline error */
        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 0.65rem 0.875rem;
          font-size: 0.845rem;
          color: #dc2626;
          font-weight: 500;
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-mark">M</div>
            <div className="login-brand-title">MM <span>Enterprises</span></div>
            <div className="login-brand-sub">Admin Portal</div>
          </div>

          {/* Tabs */}
          <div className="login-tabs">
            <button
              id="tab-signin"
              className={`login-tab${tab === "signin" ? " active" : ""}`}
              onClick={() => { setTab("signin"); setLoginError(""); }}
              type="button"
            >
              Sign In
            </button>
            <button
              id="tab-register"
              className={`login-tab${tab === "register" ? " active" : ""}`}
              onClick={() => { setTab("register"); setLoginError(""); }}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="login-heading">
            <h2>{tab === "signin" ? "Welcome back" : "Create account"}</h2>
            <p>
              {tab === "signin"
                ? "Sign in to your admin dashboard"
                : "Register with an invite code to get access"}
            </p>
          </div>

          {/* ── Sign In Form ── */}
          {tab === "signin" && (
            <form className="login-form" onSubmit={handleLogin} key="signin">
              <div className="login-field">
                <label className="login-label" htmlFor="si-email">Email address</label>
                <input
                  id="si-email"
                  type="email"
                  required
                  className="login-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="si-pass">Password</label>
                <div className="login-input-wrap">
                  <input
                    id="si-pass"
                    type={showPass ? "text" : "password"}
                    required
                    className="login-input pad-right"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button type="button" className="login-eye" onClick={() => setShowPass(v => !v)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>


              {loginError && (
                <div className="login-error">{loginError}</div>
              )}

              <button id="btn-signin" type="submit" className="login-btn" disabled={isLoading}>
                {isLoading && <span className="login-spin" />}
                {isLoading ? "Signing in…" : "Sign In"}
              </button>

              <div className="login-switch">
                No account?{" "}
                <button type="button" onClick={() => setTab("register")}>Create one</button>
              </div>
            </form>
          )}

          {/* ── Create Account Form ── */}
          {tab === "register" && (
            <form className="login-form" onSubmit={handleRegister} key="register">
              <div className="login-field">
                <label className="login-label" htmlFor="reg-name">Full name</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  className="login-input"
                  placeholder="Your full name"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  className="login-input"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="reg-pass">Password</label>
                <div className="login-input-wrap">
                  <input
                    id="reg-pass"
                    type={showRegPass ? "text" : "password"}
                    required
                    minLength={8}
                    className="login-input pad-right"
                    placeholder="Min. 8 characters"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="login-eye" onClick={() => setShowRegPass(v => !v)}>
                    {showRegPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="reg-confirm">Confirm password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  required
                  className="login-input"
                  placeholder="Re-enter your password"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <div className="login-sep">
                <div className="login-sep-line" />
                <span className="login-sep-text">Admin access</span>
                <div className="login-sep-line" />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="reg-invite">Invite code</label>
                <input
                  id="reg-invite"
                  type="text"
                  required
                  className="login-input"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                />
                <div className="login-invite-hint">🔑 Contact your super admin for the code</div>
              </div>

              <button id="btn-register" type="submit" className="login-btn" disabled={isRegistering}>
                {isRegistering && <span className="login-spin" />}
                {isRegistering ? "Creating account…" : "Create Account"}
              </button>

              <div className="login-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("signin")}>Sign in</button>
              </div>
            </form>
          )}

          <div className="login-footer">
            MM Enterprises &copy; {new Date().getFullYear()} &nbsp;&middot;&nbsp; Admin Portal
          </div>
        </div>
      </div>
    </>
  );
}
