import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { markdownToHtml } from './vaultMarkdown.js'

const API_BASE = 'http://localhost:3000/api'

function getMarkdown(entry) {
  return entry.theory_markdown || entry.content_markdown || entry.markdown || entry.description || ''
}

export default function VaultEntryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const html = useMemo(() => markdownToHtml(getMarkdown(entry || {})), [entry])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/', { replace: true })
      return
    }

    fetch(`${API_BASE}/vault/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || data.error || 'Vault entry not available')
        setEntry(data)
      })
      .catch((vaultError) => setError(vaultError.message || 'Vault entry not available'))
      .finally(() => setLoading(false))
  }, [navigate, slug])

  return (
    <div className="vault-entry-page">
      <style>{styles}</style>
      <header className="vault-topbar">
        <button type="button" className="back-button" onClick={() => navigate('/vault')}>←</button>
        <div className="vault-title">{entry?.title || 'Vault Entry'}</div>
        <div className="vault-count">{entry?.category || entry?.entry_type || 'Pattern'}</div>
      </header>

      <main className="vault-entry-main">
        {loading && <div className="state-card">Loading...</div>}
        {!loading && error && (
          <div className="state-card error">
            {error}
            <button type="button" className="map-back-button" onClick={() => navigate('/vault')}>BACK TO VAULT</button>
          </div>
        )}
        {!loading && !error && entry && (
          <article className="entry-card">
            <span className="entry-category">{entry.category || entry.entry_type || 'Pattern'}</span>
            <h1>{entry.title || entry.name || 'Vault Entry'}</h1>
            {html && <div className="entry-markdown" dangerouslySetInnerHTML={{ __html: html }} />}

            {(entry.prompt_template || entry.template) && (
              <section className="entry-section">
                <h2>Prompt Template</h2>
                <pre><code>{entry.prompt_template || entry.template}</code></pre>
              </section>
            )}

            {entry.example_input && (
              <section className="entry-section">
                <h2>Example Input</h2>
                <pre><code>{entry.example_input}</code></pre>
              </section>
            )}

            {entry.example_output && (
              <section className="entry-section">
                <h2>Example Output</h2>
                <pre><code>{entry.example_output}</code></pre>
              </section>
            )}
          </article>
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

.vault-entry-page {
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
  max-width: 520px;
  overflow: hidden;
  transform: translateX(-50%);
  color: #FFFFFF;
  font-size: 17px;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vault-count {
  margin-left: auto;
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 800;
}

.vault-entry-main {
  max-width: 840px;
  margin: 0 auto;
  padding: 88px 24px 56px;
}

.entry-card,
.state-card {
  color: #F1F0FF;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.25);
}

.entry-category {
  display: block;
  margin-bottom: 12px;
  color: #F59E0B;
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.entry-card h1 {
  margin: 0 0 26px;
  color: #FFFFFF;
  font-size: 34px;
  line-height: 1.12;
}

.entry-markdown h2,
.entry-section h2 {
  margin: 28px 0 12px;
  color: #FFFFFF;
  font-size: 22px;
}

.entry-markdown h3 {
  margin: 24px 0 10px;
  color: #FFFFFF;
  font-size: 18px;
}

.entry-markdown p,
.entry-markdown blockquote {
  margin: 0 0 18px;
  color: #D9D7E8;
  font-size: 16px;
  line-height: 1.7;
}

.entry-markdown blockquote {
  padding-left: 16px;
  border-left: 3px solid #F59E0B;
}

.entry-markdown strong {
  color: #FFFFFF;
}

.entry-markdown code,
.entry-section code {
  color: #F97316;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

.entry-markdown pre,
.entry-section pre {
  margin: 18px 0;
  overflow-x: auto;
  background: #0D1117;
  border-radius: 8px;
  padding: 16px;
}

.entry-section {
  margin-top: 24px;
  border-top: 1px solid #2D4A2D;
  padding-top: 8px;
}

.state-card {
  text-align: center;
  font-weight: 850;
}

.state-card.error {
  color: #F87171;
}

.map-back-button {
  display: block;
  margin: 18px auto 0;
  padding: 12px 24px;
  color: #0F0F0F;
  cursor: pointer;
  background: #F59E0B;
  border: 0;
  border-radius: 10px;
  font-weight: 950;
}
`
