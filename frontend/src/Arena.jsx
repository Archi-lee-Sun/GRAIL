import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:3000/api'

function getApiErrorMessage(data, fallback) {
  if (typeof data?.error === 'string') return data.error
  if (typeof data?.error?.message === 'string') return data.error.message
  if (typeof data?.message === 'string') return data.message
  return fallback
}

function SwordsIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="arenaPageBlade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F8FAFC" />
          <stop offset="0.45" stopColor="#C0C0C0" />
          <stop offset="1" stopColor="#8A8A8A" />
        </linearGradient>
      </defs>
      <g transform="translate(16 15)">
        {[42, -42].map((rotation) => (
          <g transform={`rotate(${rotation})`} key={rotation}>
            <path d="M-2 -15 L0 -20 L2 -15 L1 4 L-1 4 Z" fill="url(#arenaPageBlade)" />
            <rect x="-9" y="5.5" width="18" height="4" rx="2" fill="#F59E0B" />
            <rect x="-2.5" y="11" width="5" height="12" rx="2" fill="#8B4513" />
            <circle cx="0" cy="25" r="4" fill="#F59E0B" />
          </g>
        ))}
      </g>
    </svg>
  )
}

function ScoreRow({ label, value }) {
  const score = Number(value || 0)
  const color = score >= 7 ? '#16FF6E' : '#FF1744'
  return (
    <div className="score-row">
      <div className="score-meta">
        <span>{label}</span>
        <strong>{score}/10</strong>
      </div>
      <div className="score-bar"><span style={{ width: `${Math.min(100, score * 10)}%`, background: color }} /></div>
    </div>
  )
}

function normalizeFeedback(value) {
  if (!value) return {}
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return { summary: value }
    }
  }
  return value
}

function FeedbackCard({ result }) {
  if (!result) return null
  const feedback = normalizeFeedback(result.feedback || result.ai_feedback)
  const scores = result.scores || {
    clarity: result.clarity_score,
    context: result.context_score,
    specificity: result.specificity_score,
  }
  const composite = Number(result.composite_score || 0)
  const passed = composite >= 7

  return (
    <section className="feedback-card">
      <h2>AI Feedback</h2>
      <ScoreRow label="Clarity" value={scores.clarity} />
      <ScoreRow label="Context" value={scores.context} />
      <ScoreRow label="Specificity" value={scores.specificity} />
      <div className="composite-score">{composite.toFixed(1)} / 10</div>
      <div className={`pass-badge ${passed ? 'passed' : 'failed'}`}>{passed ? 'PASSED' : 'NEEDS WORK'}</div>
      <div className="dimension-feedback">
        {['clarity', 'context', 'specificity'].map((key) => (
          <div
            key={key}
            style={{ borderLeftColor: Number(scores[key] || 0) >= 7 ? '#16FF6E' : '#FF1744' }}
          >
            <strong>{key}</strong>
            <p>{feedback[key] || feedback.summary || 'No feedback returned.'}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function normalizeEntry(entry, index) {
  return {
    ...entry,
    rank: index + 1,
    arena_points: Number(entry.arena_points ?? entry.arena_point ?? 0),
  }
}

export default function Arena() {
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [user, setUser] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submissionError, setSubmissionError] = useState('')
  const [scoreUpdated, setScoreUpdated] = useState(false)
  const userEntry = useMemo(() => leaderboard.find((entry) => entry.username === user?.username), [leaderboard, user])
  const hasStanding = Boolean(userEntry || result)

  const refreshLeaderboard = async (challengeId, headers) => {
    const response = await fetch(`${API_BASE}/arena/${challengeId}/leaderboard`, { headers })
    const data = await response.json()
    if (!response.ok) throw new Error(getApiErrorMessage(data, 'Could not load leaderboard'))
    const rows = (data.leaderBoard || data.leaderboard || []).map(normalizeEntry)
    setLeaderboard(rows)
    return rows
  }

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
        if (!challengeResponse.ok) throw new Error(getApiErrorMessage(challengeData, 'Could not load arena challenge'))
        if (!meResponse.ok) throw new Error(getApiErrorMessage(meData, 'Could not load user'))
        setUser(meData.user)
        setChallenge(challengeData.current_challenge || null)
        if (challengeData.current_challenge?.id) {
          await refreshLeaderboard(challengeData.current_challenge.id, headers)
        }
      })
      .catch((arenaError) => setError(arenaError.message || 'Could not load arena'))
      .finally(() => setLoading(false))
  }, [navigate])

  const submitPrompt = async () => {
    if (!answer.trim() || !challenge?.id || submitting) return
    setSubmitting(true)
    setSubmissionError('')

    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
      const response = await fetch(`${API_BASE}/arena/${challenge.id}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt_text: answer }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(getApiErrorMessage(data, 'Could not submit prompt'))
      setResult(data.result)
      await refreshLeaderboard(challenge.id, { Authorization: `Bearer ${token}` })
      setScoreUpdated(true)
      window.setTimeout(() => setScoreUpdated(false), 3000)
    } catch (submitError) {
      setSubmissionError(submitError.message || 'Could not submit prompt')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="arena-page">
      <style>{styles}</style>
      <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>←</button>
      <header className="arena-header">
        <SwordsIcon />
        <h1>WEEKLY ARENA</h1>
        <p>Weekly Prompt Challenge</p>
        <div />
      </header>

      <main>
        {loading && <div className="empty-state">Loading...</div>}
        {!loading && error && <div className="empty-state error">{error}</div>}
        {!loading && !error && !challenge && (
          <div className="empty-state">
            <SwordsIcon />
            <strong>No Active Challenge</strong>
            <span>Check back next week for a new prompt challenge</span>
          </div>
        )}
        {!loading && !error && challenge && (
          <>
            <section className="challenge-card">
              <span>THIS WEEK'S CHALLENGE</span>
              <p>{challenge.scenario}</p>
            </section>

            <section className="submission-area">
              {userEntry && (
                <div className={`submission-info-banner ${scoreUpdated ? 'updated' : ''}`}>
                  {scoreUpdated ? 'Score updated!' : 'You submitted this week. Submit again to improve your score.'}
                </div>
              )}
              <label>Your Prompt</label>
              <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} />
              <div className="character-count">{answer.length} characters</div>
              <button type="button" className="submit-button" onClick={submitPrompt} disabled={!answer.trim() || submitting}>
                {submitting ? 'Grading...' : 'SUBMIT PROMPT'}
              </button>
              {submissionError && <div className="submission-error">{submissionError}</div>}
              <FeedbackCard result={result} />
              {hasStanding && (
                <div className="standing-card">
                  <p>You are currently ranked #{(userEntry || {}).rank || '—'} on this week's leaderboard</p>
                  <strong>{(userEntry || {}).arena_points ?? result?.composite_score ?? 0}</strong>
                  <span>arena points</span>
                  <button type="button" onClick={() => navigate('/leaderboard')}>VIEW FULL LEADERBOARD →</button>
                </div>
              )}
            </section>
          </>
        )}
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
.arena-page {
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
.arena-header {
  display: grid;
  justify-items: center;
  margin: 18px auto 24px;
  text-align: center;
}
.arena-header h1 {
  margin: 12px 0 4px;
  color: #F1F0FF;
  font-size: 26px;
  font-weight: 800;
}
.arena-header p {
  margin: 0;
  color: #9CA3AF;
  font-size: 13px;
}
.arena-header div {
  width: min(720px, 100%);
  height: 1px;
  margin: 20px 0 0;
  background: #2D4A2D;
}
.challenge-card,
.submission-area {
  width: min(720px, 100%);
  margin: 0 auto 18px;
}
.challenge-card {
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 16px;
  padding: 28px;
}
.challenge-card span {
  color: #F59E0B;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}
.challenge-card p {
  margin: 12px 0 0;
  color: #F1F0FF;
  font-size: 16px;
  line-height: 1.6;
}
.submission-area label {
  display: block;
  margin: 0 0 8px;
  color: #9CA3AF;
  font-size: 13px;
  font-weight: 800;
}
.submission-area textarea {
  width: 100%;
  min-height: 160px;
  resize: vertical;
  color: #F1F0FF;
  background: #0D1117;
  border: 1px solid #2D4A2D;
  border-radius: 8px;
  padding: 16px;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 15px;
  line-height: 1.55;
}
.submission-area textarea:focus {
  border-color: #7C3AED;
  outline: none;
}
.character-count {
  margin-top: 8px;
  color: #9CA3AF;
  font-size: 13px;
  text-align: right;
}
.submit-button {
  width: 100%;
  margin-top: 16px;
  padding: 15px;
  color: #1A2E1A;
  cursor: pointer;
  background: #F59E0B;
  border: 0;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1.5px;
  transition: all 0.15s ease;
}
.submit-button:not(:disabled):hover {
  transform: translateY(-1px);
  background: #D97706;
}
.submit-button:not(:disabled):active {
  transform: translateY(1px);
}
.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
.submission-error {
  margin-top: 14px;
  color: #F87171;
  background: #2E0D0D;
  border: 1px solid #7F1D1D;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 700;
}
.submission-info-banner {
  margin-bottom: 16px;
  color: #9CA3AF;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
}
.submission-info-banner.updated {
  color: #16FF6E;
}
.feedback-card {
  margin-top: 20px;
  padding: 28px;
  color: #F1F0FF;
  background: #141414;
  border: 1px solid #2A2A2A;
  border-radius: 14px;
}
.feedback-card h2 {
  margin: 0 0 18px;
  color: #FFFFFF;
}
.score-row { margin-bottom: 14px; }
.score-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
}
.score-meta span {
  color: #F1F0FF;
  font-weight: 700;
  text-transform: capitalize;
}
.score-meta strong {
  color: #F59E0B;
  font-weight: 700;
}
.score-bar {
  height: 10px;
  overflow: hidden;
  background: #141414;
  border-radius: 6px;
}
.score-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
}
.composite-score {
  margin-top: 22px;
  color: #F59E0B;
  font-size: 40px;
  font-weight: 800;
  text-align: center;
}
.pass-badge {
  width: fit-content;
  margin: 10px auto 20px;
  border-radius: 20px;
  padding: 5px 18px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
}
.pass-badge.passed {
  color: #1A2E1A;
  background: #F59E0B;
}
.pass-badge.failed {
  color: #FFFFFF;
  background: #FF1744;
}
.dimension-feedback {
  display: grid;
}
.dimension-feedback > div {
  margin-bottom: 10px;
  padding: 14px 18px;
  background: #1A1A1A;
  border: 1px solid #2A2A2A;
  border-left: 4px solid;
  border-radius: 10px;
}
.dimension-feedback strong {
  display: block;
  margin-bottom: 6px;
  color: #F1F0FF;
  font-size: 14px;
  font-weight: 700;
  text-transform: capitalize;
}
.dimension-feedback p {
  margin: 0;
  color: #D1D5DB;
  font-size: 14px;
  line-height: 1.6;
}
.standing-card {
  margin-top: 18px;
  padding: 16px;
  background: #1F361F;
  border: 1px solid #7C3AED;
  border-radius: 12px;
  text-align: center;
}
.standing-card p {
  margin: 0 0 10px;
  color: #F1F0FF;
}
.standing-card strong {
  color: #F59E0B;
  font-size: 24px;
  font-weight: 900;
}
.standing-card span {
  margin-left: 6px;
  color: #9CA3AF;
}
.standing-card button {
  display: block;
  margin: 14px auto 0;
  color: #7C3AED;
  cursor: pointer;
  background: transparent;
  border: 0;
  font-weight: 900;
}
.empty-state {
  display: grid;
  min-height: 360px;
  place-items: center;
  gap: 10px;
  color: #9CA3AF;
  text-align: center;
}
.empty-state strong {
  color: #F1F0FF;
  font-size: 22px;
}
.empty-state span {
  color: #9CA3AF;
  font-size: 14px;
}
.empty-state.error {
  color: #F87171;
}
`
