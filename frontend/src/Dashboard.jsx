import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:3000/api'
const lessonTrackFallback = {
  'blank-page-problem': 'foundation',
  'anatomy-of-a-prompt': 'foundation',
  'specificity-spectrum': 'foundation',
  'role-assignment': 'foundation',
  'context-injection': 'foundation',
}

const palette = {
  bg: '#1A2E1A',
  chrome: '#142314',
  surface: '#1F361F',
  complete: '#5B21B6',
  current: '#DC2626',
  locked: '#4B5563',
  amber: '#F59E0B',
  text: '#F1F0FF',
  muted: '#9CA3AF',
  path: '#5C4033',
  border: '#2D4A2D',
}

function GobletIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="gobletGold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="0.55" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#A16207" />
        </linearGradient>
      </defs>
      <path d="M9 4h14v5c0 5.1-2.5 8.5-6.1 9.1V23h4.3v3H10.8v-3h4.3v-4.9C11.5 17.5 9 14.1 9 9V4Z" fill="url(#gobletGold)" />
      <path d="M8.7 7H4.6c.2 4.5 2 7.2 5.3 8.2M23.3 7h4.1c-.2 4.5-2 7.2-5.3 8.2" fill="none" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 7h8v2.5c0 2.4-1.5 4.5-4 5.2-2.5-.7-4-2.8-4-5.2V7Z" fill="rgba(255,255,255,.28)" />
    </svg>
  )
}

function SwordsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="arenaBlade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F8FAFC" />
          <stop offset="0.45" stopColor="#C0C0C0" />
          <stop offset="1" stopColor="#8A8A8A" />
        </linearGradient>
      </defs>
      <g transform="translate(16 15)">
        <g transform="rotate(42)">
          <path d="M-2 -15 L0 -20 L2 -15 L1 4 L-1 4 Z" fill="url(#arenaBlade)" />
          <path d="M0 -20 L2 -15 L1 4 L0 4 Z" fill="#9CA3AF" opacity="0.55" />
          <rect x="-9" y="5.5" width="18" height="4" rx="2" fill="#F59E0B" />
          <rect x="-2.5" y="11" width="5" height="12" rx="2" fill="#8B4513" />
          <circle cx="0" cy="25" r="4" fill="#F59E0B" />
        </g>
        <g transform="rotate(-42)">
          <path d="M-2 -15 L0 -20 L2 -15 L1 4 L-1 4 Z" fill="url(#arenaBlade)" />
          <path d="M0 -20 L2 -15 L1 4 L0 4 Z" fill="#9CA3AF" opacity="0.55" />
          <rect x="-9" y="5.5" width="18" height="4" rx="2" fill="#F59E0B" />
          <rect x="-2.5" y="11" width="5" height="12" rx="2" fill="#8B4513" />
          <circle cx="0" cy="25" r="4" fill="#F59E0B" />
        </g>
      </g>
    </svg>
  )
}

function PixelTrophyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="10" y="4" width="12" height="4" fill="#FBBF24" />
      <rect x="8" y="8" width="16" height="8" fill="#F59E0B" />
      <rect x="5" y="8" width="3" height="4" fill="#F59E0B" />
      <rect x="24" y="8" width="3" height="4" fill="#F59E0B" />
      <rect x="6" y="12" width="4" height="3" fill="#D97706" />
      <rect x="22" y="12" width="4" height="3" fill="#D97706" />
      <rect x="12" y="16" width="8" height="4" fill="#F59E0B" />
      <rect x="14" y="20" width="4" height="4" fill="#D97706" />
      <rect x="10" y="24" width="12" height="4" fill="#FBBF24" />
      <rect x="8" y="28" width="16" height="2" fill="#A16207" />
    </svg>
  )
}

function SpellbookIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M15.5 9.2c-3.7-2.2-7.3-2.2-10.8 0v15.2c3.5-2 7.1-2 10.8.2V9.2Z" fill="#FDE68A" stroke="#A16207" strokeWidth="1.7" />
      <path d="M16.5 9.2c3.7-2.2 7.3-2.2 10.8 0v15.2c-3.5-2-7.1-2-10.8.2V9.2Z" fill="#FEF3C7" stroke="#A16207" strokeWidth="1.7" />
      <path d="M16 9v16" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M7.5 13h5M19.5 13h5M8 17h4M20 17h4" stroke="#A16207" strokeWidth="1" strokeLinecap="round" />
      <path d="M6 5v4M4 7h4M26 3v5M23.5 5.5h5M26 21v4M24 23h4" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FocusIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="10" fill="none" stroke="#7C3AED" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="4" fill="#A78BFA" />
      <path d="M16 2v6M16 24v6M2 16h6M24 16h6" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function StageMushroomNode({ node, onSelect }) {
  const isLocked = node.state === 'locked'
  const dots = Array.from({ length: node.stage })
  const dotLayouts = {
    1: [{ left: 37, top: 28 }],
    2: [{ left: 25, top: 29 }, { left: 49, top: 29 }],
    3: [{ left: 37, top: 18 }, { left: 24, top: 39 }, { left: 50, top: 39 }],
    4: [{ left: 26, top: 20 }, { left: 50, top: 20 }, { left: 26, top: 43 }, { left: 50, top: 43 }],
  }
  const dotPositions = dotLayouts[node.stage] || dotLayouts[1]

  return (
    <button
      type="button"
      className={`mushroom-node mushroom-${node.state}`}
      style={{
        top: `${node.y}px`,
        left: `${node.x}px`,
      }}
      disabled={isLocked}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(node)
      }}
      aria-label={`${node.title} stage ${node.stage} ${node.state}`}
    >
      <span className="mushroom-cap">
        {dots.map((_, dotIndex) => (
          <span
            className="mushroom-dot"
            key={dotIndex}
            style={dotPositions[dotIndex]}
          />
        ))}
      </span>
    </button>
  )
}

function LessonPopup({ node, onClose, onContinue }) {
  if (!node) return null

  return (
    <div
      className="lesson-popup"
      style={{
        top: `${node.y + 68}px`,
        left: `${node.x}px`,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" className="popup-close" onClick={onClose} aria-label="Close lesson popup">
        X
      </button>
      <h2>{node.title}</h2>
      <p>Stage {node.stage} of 4</p>
      <div className="stage-row" aria-label={`Stage ${node.stage} of 4`}>
        {[1, 2, 3, 4].map((stage) => (
          <span
            key={stage}
            style={{
              background:
                stage < node.stage || node.status === 'complete'
                  ? palette.complete
                  : stage === node.stage
                    ? palette.amber
                    : palette.border,
            }}
          />
        ))}
      </div>
      <button
        type="button"
        className="continue-button"
        onClick={() => onContinue(node)}
      >
        CONTINUE +15 XP
      </button>
    </div>
  )
}

function buildSections(tracks, progress, focusLessonIds) {
  const orderedTracks = tracks.length
    ? [...tracks].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    : [{ slug: 'foundation', title: 'Foundation', id: 'foundation', display_order: 1 }]

  const sections = orderedTracks.map((track) => ({
    ...track,
    lessons: [],
  }))

  const bySlug = new Map(sections.map((track) => [track.slug, track]))
  const byId = new Map(sections.map((track) => [String(track.id), track]))

  progress.forEach((item, order) => {
    const lessonId = item.lesson_id || item.id || item.lesson_slug
    const shouldShow =
      !focusLessonIds ||
      focusLessonIds.has(String(lessonId)) ||
      item.status === 'complete'

    if (!shouldShow) return

    const track =
      bySlug.get(item.track_slug) ||
      bySlug.get(lessonTrackFallback[item.lesson_slug]) ||
      byId.get(String(item.track_id)) ||
      sections[0]

    track.lessons.push({
      id: lessonId,
      slug: item.lesson_slug || item.slug,
      title: item.lesson_title || item.title || 'Untitled Lesson',
      status: item.status || 'locked',
      currentStage: Number(item.current_stage || 1),
      displayOrder: item.display_order || order + 1,
    })
  })

  sections.forEach((section) => {
    section.lessons.sort((a, b) => a.displayOrder - b.displayOrder)
  })

  return sections.filter((section) => section.lessons.length > 0)
}

function getStageState(lesson, stage) {
  if (lesson.status === 'complete') return 'complete'
  if (lesson.status === 'unlocked') return stage === 1 ? 'current' : 'locked'
  if (lesson.status === 'in_progress') {
    if (stage < lesson.currentStage) return 'complete'
    if (stage === lesson.currentStage) return 'current'
    return 'locked'
  }
  return 'locked'
}

function buildMapLayout(sections) {
  const nodes = []
  const lessonLabels = []
  const pathSegments = []
  const islands = []
  const trackRegions = []
  const centerX = 390
  const islandX = 118
  const islandWidth = 544
  const nodeGap = 140
  const titleGap = 72
  let y = 104
  let globalLessonNumber = 1

  sections.forEach((section) => {
    const sectionStartY = y - 72

    section.lessons.forEach((lesson) => {
      const lessonNodeIndexes = []
      const titleY = y
      const islandTop = titleY + titleGap
      const firstNodeY = islandTop + 96
      const islandHeight = 560

      for (let stage = 1; stage <= 4; stage += 1) {
        const index = nodes.length
        const direction = stage % 2 === 1 ? -1 : 1
        const x = centerX + direction * 130
        const nodeY = firstNodeY + (stage - 1) * nodeGap
        const node = {
          ...lesson,
          stage,
          state: getStageState(lesson, stage),
          x,
          y: nodeY,
          index,
        }
        nodes.push(node)
        lessonNodeIndexes.push(index)
      }

      const lessonNodes = lessonNodeIndexes.map((nodeIndex) => nodes[nodeIndex])
      const pathNodes = [
        { x: centerX, y: islandTop + 28 },
        ...lessonNodes,
        { x: centerX, y: islandTop + islandHeight - 28 },
      ]
      islands.push({
        id: lesson.slug || `${section.slug}-${globalLessonNumber}`,
        lessonId: lesson.id,
        x: islandX,
        y: islandTop,
        width: islandWidth,
        height: islandHeight,
      })
      pathSegments.push({
        id: lesson.slug || `${section.slug}-${globalLessonNumber}`,
        d: buildSmoothPath(pathNodes),
        nodes: pathNodes,
      })
      lessonLabels.push({
        title: lesson.title,
        x: centerX,
        y: titleY,
      })
      y = islandTop + islandHeight + titleGap
      globalLessonNumber += 1
    })

    trackRegions.push({
      slug: section.slug,
      title: section.title,
      y: sectionStartY,
      height: Math.max(240, y - sectionStartY),
    })
  })

  const mapHeight = Math.max(760, y + 120)

  return { nodes, lessonLabels, pathSegments, islands, trackRegions, mapHeight }
}

function buildSmoothPath(nodes) {
  if (!nodes.length) return ''
  if (nodes.length === 1) return `M ${nodes[0].x} ${nodes[0].y}`

  return nodes.reduce((path, node, index) => {
    if (index === 0) return `M ${node.x} ${node.y}`

    const previous = nodes[index - 1]
    const controlY = previous.y + (node.y - previous.y) / 2
    return `${path} C ${previous.x} ${controlY}, ${node.x} ${controlY}, ${node.x} ${node.y}`
  }, '')
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [tracks, setTracks] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [currentTrack, setCurrentTrack] = useState('Foundation')
  const [hasToken, setHasToken] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showFocusModal, setShowFocusModal] = useState(false)
  const [focusTrack, setFocusTrack] = useState(null)
  const [focusLessonIds, setFocusLessonIds] = useState(null)
  const [focusError, setFocusError] = useState('')
  const [focusLoading, setFocusLoading] = useState('')
  const mainRef = useRef(null)
  const popupBoundaryRef = useRef(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setHasToken(false)
      setLoading(false)
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_BASE}/users/me/dashboard`, { headers }),
      fetch(`${API_BASE}/tracks`, { headers }),
    ])
      .then(async ([dashboardResponse, tracksResponse]) => {
        if (!dashboardResponse.ok) throw new Error(`Dashboard request failed (${dashboardResponse.status})`)
        if (!tracksResponse.ok) throw new Error(`Tracks request failed (${tracksResponse.status})`)
        const dashboardData = await dashboardResponse.json()
        const tracksData = await tracksResponse.json()

        setUser(dashboardData.user)
        setProgress(dashboardData.progress || [])
        setTracks(tracksData.tracks || [])
        setCurrentTrack((tracksData.tracks || [])[0]?.title || 'Foundation')
      })
      .catch((fetchError) => setError(fetchError.message || 'Unable to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const sections = useMemo(() => buildSections(tracks, progress, focusLessonIds), [tracks, progress, focusLessonIds])
  const mapLayout = useMemo(() => buildMapLayout(sections), [sections])

  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    const updateTrack = () => {
      const viewportTop = main.getBoundingClientRect().top
      let best = { title: currentTrack, visible: -Infinity }

      main.querySelectorAll('[data-track-title]').forEach((section) => {
        const rect = section.getBoundingClientRect()
        const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, viewportTop)
        if (visible > best.visible) {
          best = { title: section.dataset.trackTitle, visible }
        }
      })

      if (best.title) setCurrentTrack(best.title)
    }

    updateTrack()
    main.addEventListener('scroll', updateTrack, { passive: true })
    return () => main.removeEventListener('scroll', updateTrack)
  }, [sections, currentTrack])

  useEffect(() => {
    if (!progress || progress.length === 0) return

    const currentLesson = progress.find((item) => item.status === 'in_progress' || item.status === 'unlocked')
    if (!currentLesson) return

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(`lesson-${currentLesson.lesson_id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [progress])

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!selectedLesson) return
      if (popupBoundaryRef.current?.contains(event.target)) return
      setSelectedLesson(null)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [selectedLesson])

  useEffect(() => {
    const closeMenus = (event) => {
      if (!event.target.closest('.profile-menu') && !event.target.closest('.avatar')) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('click', closeMenus)
    return () => document.removeEventListener('click', closeMenus)
  }, [])

  const selectFocusTrack = async (track) => {
    setFocusLoading(track.slug)
    setFocusError('')

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const lessonsResponse = await fetch(`${API_BASE}/tracks/${track.slug}/lessons`, { headers })
      const lessonsData = await lessonsResponse.json()
      if (!lessonsResponse.ok) throw new Error(lessonsData.message || lessonsData.error || 'Could not load track lessons')

      const trackLessons = lessonsData.lessons || []
      const firstLesson = trackLessons[0]
      if (!firstLesson?.id) throw new Error('No lessons found for this track yet.')

      const pathResponse = await fetch(`${API_BASE}/users/me/learning-path/${firstLesson.id}`, { headers })
      const pathData = await pathResponse.json()
      if (!pathResponse.ok) throw new Error(pathData.message || pathData.error || 'Could not build focus path')

      const completedIds = progress
        .filter((lesson) => lesson.status === 'complete')
        .map((lesson) => String(lesson.lesson_id || lesson.id || lesson.lesson_slug))
      const visibleIds = new Set([
        ...(pathData.learningPath || []).map((id) => String(id.lesson_id || id.id || id)),
        ...trackLessons.map((lesson) => String(lesson.lesson_id || lesson.id || lesson.slug)),
        ...completedIds,
      ])

      setFocusLessonIds(visibleIds)
      setFocusTrack(track)
      setShowFocusModal(false)
    } catch (focusSelectError) {
      setFocusError(focusSelectError.message || 'Could not enable focus mode')
    } finally {
      setFocusLoading('')
    }
  }

  if (!hasToken) {
    return (
      <div className="login-empty">
        <style>{styles}</style>
        <p>Please log in</p>
        <button type="button" onClick={() => alert('Redirect to login - not built yet')}>Log in</button>
      </div>
    )
  }

  return (
    <div className="grail-dashboard" ref={popupBoundaryRef}>
      <style>{styles}</style>

      <header className="top-bar">
        <div className="brand">
          <GobletIcon />
          <div>
            <strong><span>GR</span><span className="brand-ai">AI</span><span>L</span></strong>
            <span>MASTER PROMPTS</span>
          </div>
        </div>
        <div className="track-title">{currentTrack}</div>
        <div className="stats">
          <span><b>🔥</b>{user?.streak_count ?? 0}</span>
          <span><b>💎</b>{user?.xp ?? 0}</span>
          <span className="freeze"><b>❄️</b>{user?.streak_freeze_count ?? 0}</span>
          <button type="button" className="avatar" onClick={() => setShowProfileMenu((value) => !value)}>
            {(user?.username || 'G').charAt(0).toUpperCase()}
          </button>
          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-name">{user?.username || 'Player'}</div>
              <div className="profile-divider" />
              <button type="button" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </header>

      <aside className="sidebar">
        <button type="button" className="nav-card" onClick={() => navigate('/arena')}>
          <SwordsIcon />
          <strong>Arena</strong>
          <span>Challenge active</span>
        </button>
        <button type="button" className="nav-card" onClick={() => navigate('/leaderboard')}>
          <PixelTrophyIcon />
          <strong>Leaderboard</strong>
          <span>Top 100</span>
        </button>
        <button type="button" className="nav-card" onClick={() => navigate('/vault')}>
          <SpellbookIcon />
          <strong>Vault</strong>
          <span>3 unlocked</span>
        </button>
        <button type="button" className="nav-card" onClick={() => setShowFocusModal(true)}>
          <FocusIcon />
          <strong>Focus Mode</strong>
          <span>{focusTrack ? focusTrack.title : 'All lessons'}</span>
        </button>
      </aside>

      <main className="map-scroll" ref={mainRef}>
        {loading && (
          <div className="center-state">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && <div className="center-state error">{error}</div>}

        {!loading && !error && (
          <div className="skill-map" style={{ minHeight: `${mapLayout.mapHeight}px` }} onClick={() => setSelectedLesson(null)}>
            {mapLayout.islands.map((island) => (
              <div
                className="lesson-island"
                key={island.id}
                id={`lesson-${island.lessonId}`}
                style={{
                  left: `${island.x}px`,
                  top: `${island.y}px`,
                  width: `${island.width}px`,
                  height: `${island.height}px`,
                }}
              />
            ))}

            <svg className="path-layer" viewBox={`0 0 780 ${mapLayout.mapHeight}`} preserveAspectRatio="none" aria-hidden="true">
              {mapLayout.pathSegments.map((segment) => (
                <path
                  key={`${segment.id}-base`}
                  d={segment.d}
                  fill="none"
                  stroke={palette.path}
                  strokeWidth="36"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {mapLayout.pathSegments.map((segment) => (
                <path
                  key={`${segment.id}-highlight`}
                  d={segment.d}
                  fill="none"
                  stroke="#7A5C4A"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>

            {mapLayout.trackRegions.map((region) => (
              <section
                className="track-section"
                data-track={region.slug}
                data-track-title={region.title}
                key={region.slug || region.title}
                style={{
                  top: `${region.y}px`,
                  height: `${region.height}px`,
                }}
              />
            ))}

            {mapLayout.nodes.map((node) => (
              <StageMushroomNode
                key={`${node.slug}-${node.stage}`}
                node={node}
                onSelect={setSelectedLesson}
              />
            ))}

            {mapLayout.lessonLabels.map((label) => (
              <div
                className="lesson-name-label"
                key={`${label.title}-${label.y}`}
                style={{ top: `${label.y}px`, left: `${label.x}px` }}
              >
                {label.title}
              </div>
            ))}

            <LessonPopup
              node={selectedLesson}
              onClose={() => setSelectedLesson(null)}
              onContinue={(node) => navigate(`/lesson/${node.slug}/${node.stage}`, {
                state: {
                  replay: node.state === 'complete' || node.status === 'complete',
                  isReplay: node.state === 'complete' || node.status === 'complete',
                  lessonTitle: node.title,
                },
              })}
            />
          </div>
        )}
      </main>
      {showFocusModal && (
        <div className="focus-overlay" onClick={() => setShowFocusModal(false)}>
          <div className="focus-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="focus-close" onClick={() => setShowFocusModal(false)}>X</button>
            <h2>Focus Mode</h2>
            <p>Choose a track to show only the lessons that matter for that route.</p>
            <div className="focus-track-list">
              {[
                { slug: 'foundation', title: 'Foundation' },
                { slug: 'code-assistant', title: 'Code Assistant' },
                { slug: 'email-writing', title: 'Email and Writing' },
                { slug: 'decision-making', title: 'Decision Making' },
              ].map((track) => (
                <button
                  type="button"
                  key={track.slug}
                  onClick={() => selectFocusTrack(track)}
                  disabled={Boolean(focusLoading)}
                >
                  <span>{track.title}</span>
                  <strong>{focusLoading === track.slug ? 'Loading...' : 'Focus'}</strong>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="focus-clear"
              onClick={() => {
                setFocusTrack(null)
                setFocusLessonIds(null)
                setShowFocusModal(false)
              }}
            >
              SHOW ALL LESSONS
            </button>
            {focusError && <div className="focus-message error">{focusError}</div>}
          </div>
        </div>
      )}
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
  min-width: 1280px;
  min-height: 800px;
  margin: 0;
  background: ${palette.bg};
  color: ${palette.text};
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button {
  font: inherit;
}

.grail-dashboard {
  width: 100%;
  min-height: 800px;
  background: ${palette.bg};
}

.top-bar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 260px 1fr 330px;
  align-items: center;
  height: 56px;
  background: ${palette.chrome};
  border-bottom: 1px solid ${palette.border};
  padding: 0 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand strong {
  display: block;
  color: #FFFFFF;
  font-size: 20px;
  line-height: 20px;
  font-weight: 900;
}

.brand strong span {
  display: inline;
  color: #FFFFFF;
}

.brand strong .brand-ai {
  color: #A855F7;
}

.brand > div > span {
  display: block;
  color: ${palette.amber};
  font-size: 10px;
  line-height: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.track-title {
  position: fixed;
  left: calc(140px + (100% - 140px) / 2);
  top: 18px;
  transform: translateX(-50%);
  color: #F1F0FF;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.stats {
  position: absolute;
  right: 24px;
  top: 11px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  color: ${palette.amber};
  font-size: 15px;
  font-weight: 900;
}

.stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.stats b {
  font-size: 17px;
}

.stats .freeze {
  color: #FFFFFF;
}

.avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #111827;
  cursor: pointer;
  background: ${palette.amber};
  border: 2px solid #FDE68A;
  font-weight: 950;
}

.profile-menu {
  position: absolute;
  right: 16px;
  top: 52px;
  z-index: 100;
  min-width: 140px;
  padding: 8px;
  background: ${palette.chrome};
  border: 1px solid ${palette.border};
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.profile-name {
  padding: 8px 12px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 900;
}

.profile-divider {
  height: 1px;
  margin: 4px 0;
  background: ${palette.border};
}

.profile-menu button {
  width: 100%;
  padding: 8px 12px;
  color: #EF4444;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
  text-align: left;
  font-weight: 850;
}

.profile-menu button:hover {
  background: ${palette.surface};
}

.sidebar {
  position: fixed;
  inset: 56px auto 0 0;
  z-index: 15;
  width: 140px;
  background: ${palette.chrome};
  border-right: 1px solid ${palette.border};
  padding: 16px 8px;
}

.nav-card {
  display: flex;
  width: 100%;
  min-height: 118px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 0 0 12px;
  padding: 16px 12px;
  cursor: pointer;
  color: ${palette.text};
  background: ${palette.surface};
  border: 1px solid ${palette.border};
  border-radius: 12px;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #3E673E;
}

.nav-card strong {
  display: block;
  width: 100%;
  color: #FFFFFF;
  font-size: 14px;
  line-height: 16px;
  font-weight: 900;
  text-align: center;
}

.nav-card span {
  color: ${palette.muted};
  font-size: 11px;
  line-height: 13px;
  font-weight: 650;
  text-align: center;
}

.focus-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.7);
}

.focus-modal {
  position: relative;
  width: 440px;
  padding: 32px;
  color: ${palette.text};
  background: ${palette.chrome};
  border: 1px solid ${palette.border};
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.focus-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  color: ${palette.muted};
  cursor: pointer;
  background: transparent;
  border: 0;
  font-weight: 950;
}

.focus-modal h2 {
  margin: 0 0 6px;
  color: #FFFFFF;
  font-size: 20px;
}

.focus-modal p {
  margin: 0 0 20px;
  color: ${palette.muted};
  font-size: 13px;
}

.focus-track-list {
  display: grid;
  gap: 10px;
  max-height: 226px;
  overflow-y: auto;
  padding-right: 4px;
}

.focus-track-list::-webkit-scrollbar {
  width: 8px;
}

.focus-track-list::-webkit-scrollbar-track {
  background: #142314;
  border-radius: 999px;
}

.focus-track-list::-webkit-scrollbar-thumb {
  background: #2D4A2D;
  border-radius: 999px;
}

.focus-track-list::-webkit-scrollbar-thumb:hover {
  background: #4D6A4D;
}

.focus-track-list button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  color: #FFFFFF;
  cursor: pointer;
  background: ${palette.surface};
  border: 1px solid ${palette.border};
  border-radius: 8px;
  text-align: left;
}

.focus-track-list button:hover {
  border-color: #7C3AED;
}

.focus-track-list button:disabled {
  cursor: wait;
  opacity: 0.75;
}

.focus-track-list span {
  font-weight: 900;
}

.focus-track-list strong {
  color: ${palette.amber};
  font-size: 12px;
  text-transform: uppercase;
}

.focus-clear {
  width: 100%;
  margin-top: 14px;
  padding: 12px;
  color: #0F0F0F;
  cursor: pointer;
  background: ${palette.amber};
  border: 0;
  border-radius: 8px;
  font-weight: 950;
}

.focus-message {
  margin-top: 16px;
  color: #FFFFFF;
  background: ${palette.surface};
  border-radius: 8px;
  padding: 12px;
  line-height: 1.5;
}

.focus-message.error {
  color: #F87171;
}

.map-scroll {
  position: fixed;
  inset: 56px 0 0 140px;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 28% 18%, rgba(245, 158, 11, 0.05), transparent 22%),
    linear-gradient(180deg, ${palette.bg}, #162816 72%, ${palette.bg});
}

.skill-map {
  position: relative;
  flex: 0 0 780px;
  width: 780px;
  padding-bottom: 120px;
}

.path-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 780px;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.lesson-island {
  position: absolute;
  z-index: 1;
  background: ${palette.chrome};
  border: 1px solid ${palette.border};
  border-radius: 24px;
  padding: 24px 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.track-section {
  position: absolute;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.track-divider {
  position: absolute;
  top: 10px;
  left: 50%;
  z-index: 3;
  transform: translateX(-50%);
  color: ${palette.muted};
  background: ${palette.chrome};
  border: 1px solid ${palette.border};
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  white-space: nowrap;
}

.lesson-transition-label {
  position: absolute;
  left: 50%;
  z-index: 6;
  transform: translateX(-50%);
  color: ${palette.muted};
  background: ${palette.chrome};
  border: 1px solid ${palette.border};
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.3px;
  text-transform: uppercase;
}

.lesson-name-label {
  position: absolute;
  z-index: 7;
  width: 360px;
  transform: translateX(-50%);
  color: #F1F0FF;
  font-size: 22px;
  line-height: 27px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: left;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
}

.mushroom-node {
  position: absolute;
  z-index: 5;
  display: flex;
  width: 85px;
  height: 70px;
  flex-direction: column;
  align-items: center;
  padding: 0;
  cursor: pointer;
  pointer-events: auto;
  background: transparent;
  border: 0;
  transform: translate(-50%, -50%);
  transform-origin: center center;
  transition: transform 150ms ease, filter 150ms ease;
}

.mushroom-node:not(:disabled):hover {
  transform: translate(-50%, -50%) scale(1.08);
}

.mushroom-node:not(:disabled):active {
  transform: translate(-50%, -50%) scale(0.95);
}

.mushroom-node:disabled {
  cursor: default;
}

.mushroom-cap {
  position: relative;
  display: block;
  width: 85px;
  height: 70px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50% 50% 50% 50% / 45% 45% 55% 55%;
}

.mushroom-complete .mushroom-cap {
  background: linear-gradient(160deg, #DDD6FE 0%, ${palette.complete} 35%, #2E1065 100%);
  box-shadow: 0 8px 0 #3B0764, 0 10px 8px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.4);
}

.mushroom-current .mushroom-cap {
  background: linear-gradient(160deg, #FECACA 0%, ${palette.current} 35%, #7F1D1D 100%);
  box-shadow: 0 8px 0 #7F1D1D, 0 10px 8px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.4);
  animation: pulse-glow 2s infinite;
}

.mushroom-locked {
  opacity: 0.5;
}

.mushroom-locked .mushroom-cap {
  background: linear-gradient(160deg, #D1D5DB 0%, #374151 35%, #0B1220 100%);
  box-shadow: 0 8px 0 #111827, 0 10px 8px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.4);
}

.mushroom-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.16);
}

.mushroom-complete .mushroom-dot {
  background: #FFFFFF;
}

.lesson-popup {
  position: absolute;
  z-index: 30;
  width: 220px;
  padding: 20px;
  transform: translateX(-50%);
  color: ${palette.text};
  background: ${palette.surface};
  border: 2px solid ${palette.amber};
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.lesson-popup h2 {
  margin: 0 24px 4px 0;
  color: #FFFFFF;
  font-size: 16px;
  line-height: 20px;
  font-weight: 950;
}

.lesson-popup p {
  margin: 0 0 14px;
  color: ${palette.muted};
  font-size: 12px;
  font-weight: 750;
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 11px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  color: ${palette.muted};
  cursor: pointer;
  background: transparent;
  border: 0;
  font-size: 16px;
  font-weight: 900;
}

.stage-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.stage-row span {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.continue-button {
  width: 100%;
  padding: 12px;
  cursor: pointer;
  color: #0F0F0F;
  background: ${palette.amber};
  border: 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 950;
  transition: transform 120ms ease, filter 120ms ease;
}

.continue-button:hover {
  filter: brightness(1.07);
}

.continue-button:active {
  transform: scale(0.97);
}

.center-state,
.login-empty {
  display: grid;
  place-items: center;
  min-height: 100vh;
  color: ${palette.text};
  background: ${palette.bg};
  font-size: 18px;
  font-weight: 850;
}

.center-state {
  min-height: calc(100vh - 56px);
}

.center-state.error {
  color: #F87171;
}

.spinner {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 5px solid ${palette.border};
  border-top-color: ${palette.amber};
  animation: spin 850ms linear infinite;
}

.login-empty {
  gap: 18px;
}

.login-empty p {
  margin: 0;
}

.login-empty button {
  padding: 12px 18px;
  color: #0F0F0F;
  cursor: pointer;
  background: ${palette.amber};
  border: 0;
  border-radius: 8px;
  font-weight: 950;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 8px 0 #7F1D1D, 0 0 0 0 rgba(245, 158, 11, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 8px 0 #7F1D1D, 0 0 0 12px rgba(245, 158, 11, 0), inset 0 2px 0 rgba(255, 255, 255, 0.4);
  }
  100% {
    box-shadow: 0 8px 0 #7F1D1D, 0 0 0 0 rgba(245, 158, 11, 0), inset 0 2px 0 rgba(255, 255, 255, 0.4);
  }
}
`
