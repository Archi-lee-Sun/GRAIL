import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:3000/api'

function SwordsIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="leaderboardBlade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F8FAFC" />
          <stop offset="0.45" stopColor="#C0C0C0" />
          <stop offset="1" stopColor="#8A8A8A" />
        </linearGradient>
      </defs>
      <g transform="translate(16 15)">
        {[42, -42].map((rotation) => (
          <g transform={`rotate(${rotation})`} key={rotation}>
            <path d="M-2 -15 L0 -20 L2 -15 L1 4 L-1 4 Z" fill="url(#leaderboardBlade)" />
            <rect x="-9" y="5.5" width="18" height="4" rx="2" fill="#F59E0B" />
            <rect x="-2.5" y="11" width="5" height="12" rx="2" fill="#8B4513" />
            <circle cx="0" cy="25" r="4" fill="#F59E0B" />
          </g>
        ))}
      </g>
    </svg>
  )
}

function RankBadge({ rank }) {
  if (rank > 3) return <span className="rank-number">#{rank}</span>
  const colors = ['#F59E0B', '#9CA3AF', '#92400E']
  return (
    <span className="medal" style={{ color: colors[rank - 1] }}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <circle cx="17" cy="17" r="14" fill="currentColor" opacity="0.18" />
        <circle cx="17" cy="17" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="17" y="21" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="900">{rank}</text>
      </svg>
    </span>
  )
}

function normalizeEntry(entry, index) {
  return {
    ...entry,
    rank: index + 1,
    arena_points: Number(entry.arena_points ?? entry.arena_point ?? 0),
  }
}

function getVisibleRows(entries, currentUsername) {
  const currentIndex = entries.findIndex((entry) => entry.username === currentUsername)
  if (entries.length <= 10 || currentIndex < 10) return entries.slice(0, 10)
  const cluster = entries.slice(Math.max(0, currentIndex - 1), Math.min(entries.length, currentIndex + 2))
  return [...entries.slice(0, 3), { ellipsis: true, id: 'ellipsis' }, ...cluster]
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const visibleRows = useMemo(() => getVisibleRows(entries, user?.username), [entries, user])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/', { replace: true })
      return
    }

    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API_BASE}/arena/current`, { headers }),
      fetch(`${API_BASE}/auth/me`, { headers }),
    ])
      .then(async ([challengeResponse, meResponse]) => {
        const challengeData = await challengeResponse.json()
        const meData = await meResponse.json()
        if (!challengeResponse.ok) throw new Error(challengeData.error || 'Could not load arena challenge')
        if (!meResponse.ok) throw new Error(meData.error || 'Could not load user')
        setUser(meData.user)

        const challenge = challengeData.current_challenge
        if (!challenge?.id) {
          setEntries([])
          return
        }

        const leaderboardResponse = await fetch(`${API_BASE}/arena/${challenge.id}/leaderboard`, { headers })
        const leaderboardData = await leaderboardResponse.json()
        if (!leaderboardResponse.ok) throw new Error(leaderboardData.error || 'Could not load leaderboard')
        setEntries((leaderboardData.leaderBoard || leaderboardData.leaderboard || []).map(normalizeEntry))
      })
      .catch((leaderboardError) => setError(leaderboardError.message || 'Could not load leaderboard'))
      .finally(() => setLoading(false))
  }, [navigate])

  return (
    <div className="leaderboard-page">
      <style>{styles}</style>
      <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>←</button>
      <header className="leaderboard-header">
        <SwordsIcon />
        <h1>WEEKLY ARENA</h1>
        <p>Prompt Masters Leaderboard</p>
        <div />
      </header>

      <main>
        {loading && <div className="empty-state">Loading...</div>}
        {!loading && error && <div className="empty-state error">{error}</div>}
        {!loading && !error && entries.length === 0 && (
          <div className="empty-state">
            <SwordsIcon size={48} />
            <strong>No arena challenge active this week</strong>
          </div>
        )}
        {!loading && !error && entries.length > 0 && visibleRows.map((entry) => {
          if (entry.ellipsis) return <div className="ellipsis-row" key="ellipsis">• • •</div>
          const isCurrent = entry.username === user?.username
          return (
            <div className={`rank-row rank-${entry.rank} ${isCurrent ? 'current-user' : ''}`} key={`${entry.username}-${entry.rank}`}>
              <div className="rank-left">
                <RankBadge rank={entry.rank} />
                <span className="username">{entry.username}{isCurrent && <em> (You)</em>}</span>
              </div>
              <div className="score">
                <strong>{entry.arena_points}</strong>
                <span>pts</span>
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}

const styles = `
* { box-sizing: border-box; }
html, body, #root {
  width: 100%;
  min-height: 100%;
  margin: 0;
  background: #1A2E1A;
  color: #F1F0FF;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
button { font: inherit; }
.leaderboard-page {
  min-height: 100vh;
  background: #1A2E1A;
  padding: 32px 24px 56px;
}
.back-button {
  position: fixed;
  top: 20px;
  left: 24px;
  width: 40px;
  height: 40px;
  color: #F1F0FF;
  cursor: pointer;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 10px;
  font-size: 22px;
}
.leaderboard-header {
  display: grid;
  justify-items: center;
  margin: 18px auto 24px;
  text-align: center;
}
.leaderboard-header h1 {
  margin: 12px 0 4px;
  color: #F1F0FF;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 2px;
}
.leaderboard-header p {
  margin: 0;
  color: #F59E0B;
  font-size: 13px;
  letter-spacing: 1px;
}
.leaderboard-header div {
  width: min(640px, 100%);
  height: 1px;
  margin: 24px 0 0;
  background: #2D4A2D;
}
.rank-row {
  display: flex;
  width: min(640px, 100%);
  align-items: center;
  justify-content: space-between;
  margin: 6px auto;
  padding: 14px 20px;
  background: #1F361F;
  border: 1px solid #2D4A2D;
  border-radius: 12px;
}
.rank-1 { background: linear-gradient(135deg, #2D1F00, #1A1200); border-color: #F59E0B; }
.rank-2 { background: linear-gradient(135deg, #1A1F1A, #101510); border-color: #9CA3AF; }
.rank-3 { background: linear-gradient(135deg, #1A1210, #120D0A); border-color: #92400E; }
.rank-row.current-user {
  background: #1F1040;
  border-color: #7C3AED;
}
.rank-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.rank-number {
  min-width: 36px;
  color: #9CA3AF;
  font-weight: 700;
}
.username {
  color: #F1F0FF;
  font-size: 16px;
  font-weight: 600;
}
.username em {
  color: #7C3AED;
  font-style: normal;
}
.score {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.score strong {
  color: #F59E0B;
  font-size: 20px;
  font-weight: 800;
}
.score span {
  color: #9CA3AF;
  font-size: 11px;
}
.ellipsis-row {
  display: grid;
  width: min(640px, 100%);
  height: 40px;
  place-items: center;
  margin: 6px auto;
  color: #9CA3AF;
  font-size: 20px;
  letter-spacing: 8px;
}
.empty-state {
  display: grid;
  min-height: 280px;
  place-items: center;
  gap: 12px;
  color: #9CA3AF;
  text-align: center;
}
.empty-state strong {
  color: #9CA3AF;
  font-size: 16px;
}
.empty-state.error {
  color: #F87171;
}
`
