import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { markdownToHtml } from './vaultMarkdown.js'

const API_BASE = 'http://localhost:3000/api'

function getExcerpt(entry) {
  const source = entry.summary || entry.description || entry.theory_markdown || entry.content_markdown || ''
  return String(source).replace(/[#*_`>]/g, '').slice(0, 150)
}

export default function VaultPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const unlockedCount = entries.length
  const lockedCount = Math.max(0, 6 - unlockedCount)
  const emptyHtml = useMemo(() => markdownToHtml('## No entries yet\nComplete lessons to unlock prompt patterns for your vault.'), [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/', { replace: true })
      return
    }

    fetch(`${API_BASE}/vault`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || data.error || 'Could not load vault')
        setEntries(Array.isArray(data) ? data : data.entries || [])
      })
      .catch((vaultError) => setError(vaultError.message || 'Could not load vault'))
      .finally(() => setLoading(false))
  }, [navigate])

  return (
    <div className="vault-page">
      <style>{styles}</style>
      <header className="vault-topbar">
        <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>←</button>
        <div className="vault-title">Vault</div>
        <div className="vault-count">{unlockedCount} unlocked</div>
      </header>

      <main className="vault-main">
        <section className="vault-header">
          <h1>Prompt Vault</h1>
          <p>Unlocked patterns, frameworks, and reusable prompt structures.</p>
        </section>

        {loading && <div className="state-card">Loading...</div>}
        {!loading && error && <div className="state-card error">{error}</div>}
        {!loading && !error && entries.length === 0 && (
          <article className="vault-empty" dangerouslySetInnerHTML={{ __html: emptyHtml }} />
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="vault-grid">
            {entries.map((entry) => (
              <button
                type="button"
                className="vault-card"
                key={entry.slug || entry.id}
                onClick={() => navigate(`/vault/${entry.slug}`)}
              >
                <span>{entry.category || entry.entry_type || 'Pattern'}</span>
                <strong>{entry.title || entry.name || 'Vault Entry'}</strong>
                <p>{getExcerpt(entry)}</p>
                <em>READ</em>
              </button>
            ))}
            {Array.from({ length: lockedCount }).map((_, index) => (
              <div className="vault-card locked" key={`locked-${index}`}>
                <span>Locked</span>
                <strong>Hidden Pattern</strong>
                <p>Complete more lessons to reveal this vault entry.</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  min-height: 100%;
  margin: 0;
  background: #1A2E1A;
  color: #F1F0FF;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button {
  font: inherit;
}

.vault-page {
  min-height: 100vh;
  background: #1A2E1A;
}

.vault-topbar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 20;
  display: flex;
  align-items: center;
  height: 56px;
  background: #142314;
  border-bottom: 1px solid #2D4A2D;
  padding: 0 24px;
}

.back-button {
  width: 38px;
  height: 38px;
  color: #F1F0FF;
  cursor: pointer;
  background: #1F361F;
  border: 1px solid #2D4A2D;
  border-radius: 10px;
  font-size: 22px;
  line-height: 1;
}

.vault-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #FFFFFF;
  font-size: 17px;
  font-weight: 950;
}

.vault-count {
  margin-left: auto;
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 800;
}

.vault-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 88px 24px 56px;
}

.vault-header {
  margin-bottom: 28px;
}

.vault-header h1 {
  margin: 0 0 8px;
  color: #FFFFFF;
  font-size: 34px;
  line-height: 1.1;
}

.vault-header p {
  margin: 0;
  color: #9CA3AF;
  font-size: 15px;
}

.vault-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.vault-card,
.state-card,
.vault-empty {
  color: #F1F0FF;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.25);
}

.vault-card {
  min-height: 210px;
  cursor: pointer;
  text-align: left;
  transition: transform 150ms ease, border-color 150ms ease;
}

.vault-card:hover {
  transform: translateY(-2px);
  border-color: #7C3AED;
}

.vault-card span {
  display: block;
  margin-bottom: 12px;
  color: #F59E0B;
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.vault-card strong {
  display: block;
  color: #FFFFFF;
  font-size: 20px;
  line-height: 1.25;
}

.vault-card p {
  margin: 14px 0 0;
  color: #9CA3AF;
  line-height: 1.55;
}

.vault-card em {
  display: inline-block;
  margin-top: 22px;
  color: #A855F7;
  font-style: normal;
  font-size: 12px;
  font-weight: 950;
}

.vault-card.locked {
  cursor: default;
  opacity: 0.48;
}

.vault-card.locked:hover {
  transform: none;
  border-color: #2D4A2D;
}

.state-card {
  text-align: center;
  font-weight: 850;
}

.state-card.error {
  color: #F87171;
}

.vault-empty h2 {
  margin: 0 0 12px;
  color: #FFFFFF;
}

.vault-empty p {
  margin: 0;
  color: #9CA3AF;
}
`
