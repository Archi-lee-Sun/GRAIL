import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ThemeToggle } from './theme.jsx'

const API_BASE = 'http://localhost:3000/api'

function GobletIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="loginGobletGold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="0.55" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#A16207" />
        </linearGradient>
      </defs>
      <path d="M9 4h14v5c0 5.1-2.5 8.5-6.1 9.1V23h4.3v3H10.8v-3h4.3v-4.9C11.5 17.5 9 14.1 9 9V4Z" fill="url(#loginGobletGold)" />
      <path d="M8.7 7H4.6c.2 4.5 2 7.2 5.3 8.2M23.3 7h4.1c-.2 4.5-2 7.2-5.3 8.2" fill="none" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 7h8v2.5c0 2.4-1.5 4.5-4 5.2-2.5-.7-4-2.8-4-5.2V7Z" fill="rgba(255,255,255,.28)" />
    </svg>
  )
}

function AuthLogo() {
  return (
    <div className="auth-logo">
      <div className="auth-logo-row">
        <GobletIcon />
        <strong><span>GR</span><span className="logo-ai">AI</span><span>L</span></strong>
      </div>
      <span className="auth-subtitle">MASTER PROMPTS</span>
    </div>
  )
}

function EyeIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      {!open && <path d="M4 20 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } catch (loginError) {
      setError(loginError.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <style>{authStyles}</style>
      <ThemeToggle className="auth-theme-toggle" />
      <form className="auth-card" onSubmit={handleSubmit}>
        <AuthLogo />

        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  )
}

const authStyles = `
html,
body,
#root {
  width: 100%;
  min-height: 100%;
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #1A2E1A;
}

* {
  box-sizing: border-box;
}

.auth-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 32px;
  background: #1A2E1A;
}

.auth-card {
  width: 400px;
  padding: 48px;
  color: #F1F0FF;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}

.auth-logo {
  display: grid;
  justify-items: center;
  gap: 4px;
  margin-bottom: 34px;
}

.auth-logo-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-logo strong {
  color: #FFFFFF;
  font-size: 28px;
  line-height: 30px;
  font-weight: 950;
}

.auth-logo .logo-ai {
  color: #A855F7;
}

.auth-subtitle {
  color: #F59E0B;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 2px;
}

.auth-card label {
  display: block;
  margin-bottom: 18px;
}

.auth-card label span {
  display: block;
  margin-bottom: 8px;
  color: #9CA3AF;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.auth-card input {
  width: 100%;
  padding: 12px 16px;
  color: #F1F0FF;
  background: #1F361F;
  border: 1px solid #2D4A2D;
  border-radius: 8px;
  font-size: 14px;
}

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 48px;
}

.password-field button {
  position: absolute;
  top: 50%;
  right: 10px;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  transform: translateY(-50%);
  color: #F59E0B;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
}

.password-field button:hover {
  background: rgba(245, 158, 11, 0.12);
}

.auth-card input:focus {
  border-color: #7C3AED;
  outline: none;
}

.auth-button {
  width: 100%;
  padding: 14px;
  color: #FFFFFF;
  cursor: pointer;
  background: #7C3AED;
  border: 0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 900;
  transition: background 150ms ease, transform 120ms ease;
}

.auth-button:hover {
  background: #6D28D9;
}

.auth-button:active {
  transform: scale(0.98);
}

.auth-button:disabled {
  cursor: wait;
  opacity: 0.75;
}

.auth-link {
  margin: 18px 0 0;
  color: #9CA3AF;
  font-size: 14px;
  text-align: center;
}

.auth-link a {
  color: #7C3AED;
  font-weight: 850;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}

.auth-error {
  margin: -4px 0 14px;
  color: #F87171;
  font-size: 13px;
  font-weight: 750;
}
`
