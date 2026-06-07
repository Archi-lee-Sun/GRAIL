import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle, useTheme } from './theme.jsx'

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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function FireStatIcon() {
  return (
    <svg className="stat-icon" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="statFireGradient" x1="12" y1="22" x2="12" y2="2">
          <stop offset="0" stopColor="#FF4500" />
          <stop offset="1" stopColor="#FFD700" />
        </linearGradient>
      </defs>
      <path d="M12.3 1.8c1.3 4.2-1.8 5.8-1.8 8.3 0 1.1.7 1.9 1.7 1.9 1.7 0 2.6-1.7 2.4-3.8 3 2.3 4.6 5.1 4.6 8 0 4.2-3.1 7-7.2 7s-7.2-2.8-7.2-7c0-3.5 2.2-6.2 5.1-8.6-.2 2 .5 3.2 1.4 3.2 1.4 0 2.2-2.5 1-9Z" fill="url(#statFireGradient)" />
      <path d="M12 13c2.2 2 3.1 3.5 3.1 5.1a3.1 3.1 0 0 1-6.2 0c0-1.7 1.1-3.4 3.1-5.1Z" fill="#FF6B00" />
    </svg>
  )
}

function DiamondStatIcon() {
  return (
    <svg className="stat-icon" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="statDiamondGradient" x1="12" y1="3" x2="12" y2="21">
          <stop offset="0" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path d="m3 8 4-5h10l4 5-9 13L3 8Z" fill="url(#statDiamondGradient)" />
      <path d="m7 3 5 18L17 3M3 8h18L7 3m10 0-5 5-5-5" fill="none" stroke="#BAE6FD" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function FreezeStatIcon() {
  return (
    <svg className="stat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M12 2 9.5 4.5M12 2l2.5 2.5M12 22l-2.5-2.5M12 22l2.5-2.5M3.3 7l3.4.9M3.3 7l.9 3.4M20.7 17l-3.4-.9M20.7 17l-.9-3.4M3.3 17l.9-3.4M3.3 17l3.4-.9M20.7 7l-.9 3.4M20.7 7l-3.4.9" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NodeStageIcon({ stage }) {
  if (stage === 1) {
    return (
      <svg className="node-state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 4.7C3 3.8 3.8 3.1 4.7 3.2 7.4 3.4 9.4 4.2 11 5.6V20c-1.7-1.3-3.8-2-6.5-2.1A1.5 1.5 0 0 1 3 16.4V4.7Zm18 0c0-.9-.8-1.6-1.7-1.5-2.7.2-4.7 1-6.3 2.4V20c1.7-1.3 3.8-2 6.5-2.1a1.5 1.5 0 0 0 1.5-1.5V4.7Z" fill="currentColor" />
        <path d="M12 5.4V20" stroke="#1A2E1A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="node-state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2.5C6.2 2.5 2 6 2 10.7c0 3.1 1.8 5.7 4.7 7.1L5.6 22l5-2.9c.5.1.9.1 1.4.1 5.8 0 10-3.5 10-8.3S17.8 2.5 12 2.5Z" fill="currentColor" />
        <path d="M9.1 8.4c.2-2 1.6-3.2 3.7-3.2 2.2 0 3.7 1.2 3.7 3.1 0 1.5-.8 2.3-2.1 3.1-.9.6-1.2 1-1.2 1.9h-2.7c0-1.6.5-2.4 1.8-3.2.9-.6 1.3-1 1.3-1.7 0-.6-.4-1-1.1-1-.7 0-1.1.4-1.2 1.2l-2.2-.2Zm1.3 6.6h2.9v2.7h-2.9V15Z" fill="#1A2E1A" />
      </svg>
    )
  }

  return (
    <svg className="node-state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4.1 15.8 10.8-10.8 4.1 4.1L8.2 19.9 3 21l1.1-5.2Z" fill="currentColor" />
      <path d="m15.7 4.2 1.7-1.7a1.7 1.7 0 0 1 2.4 0l1.7 1.7a1.7 1.7 0 0 1 0 2.4l-1.7 1.7-4.1-4.1Z" fill="currentColor" />
      <path d="m4.1 15.8 4.1 4.1L3 21l1.1-5.2Z" fill="#FFFFFF" />
    </svg>
  )
}

function StageMushroomNode({ node, onSelect }) {
  const isLocked = node.state === 'locked'

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
        <NodeStageIcon stage={node.stage} />
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

  const sortedProgress = [...progress].sort((a, b) => {
    const trackOrderDelta = Number(a.track_display_order || 0) - Number(b.track_display_order || 0)
    if (trackOrderDelta !== 0) return trackOrderDelta
    return Number(a.display_order || 0) - Number(b.display_order || 0)
  })

  sortedProgress.forEach((item, order) => {
    const lessonId = item.lesson_id || item.id || item.lesson_slug
    const shouldShow =
      !focusLessonIds ||
      focusLessonIds.has(String(lessonId))

    if (!shouldShow) return

    const track =
      bySlug.get(item.track_slug) ||
      bySlug.get(lessonTrackFallback[item.lesson_slug]) ||
      byId.get(String(item.track_id)) ||
      sections[0]

    if (item.track_title) {
      track.title = item.track_title
    }

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
  const titleGap = 51
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
        title: lesson.title,
        x: islandX,
        y: titleY,
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

function sortDashboardProgress(items = []) {
  return [...items].sort((a, b) => {
    const trackOrderDelta = Number(a.track_display_order || 0) - Number(b.track_display_order || 0)
    if (trackOrderDelta !== 0) return trackOrderDelta
    return Number(a.display_order || 0) - Number(b.display_order || 0)
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
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
  const [focusLoading, setFocusLoading] = useState('')
  const mainRef = useRef(null)
  const popupBoundaryRef = useRef(null)
  const trackSentinelRefs = useRef({})

  const refreshDashboardState = async () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Missing auth token')

    const response = await fetch(`${API_BASE}/users/me/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || data.error || 'Could not refresh dashboard')

    const sortedProgress = sortDashboardProgress(data.progress || [])
    setUser(data.user)
    setProgress(sortedProgress)
    return sortedProgress
  }

  const openFocusModal = async () => {
    setShowFocusModal(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setTracks(data.tracks || [])
      }
    } catch (trackError) {
      console.error('Could not refresh tracks:', trackError)
    }
  }

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
        setProgress(sortDashboardProgress(dashboardData.progress || []))
        setTracks(tracksData.tracks || [])
        setCurrentTrack((tracksData.tracks || [])[0]?.title || 'Foundation')
      })
      .catch((fetchError) => setError(fetchError.message || 'Unable to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const sections = useMemo(() => buildSections(tracks, progress, focusLessonIds), [tracks, progress, focusLessonIds])
  const mapLayout = useMemo(() => buildMapLayout(sections), [sections])

  useEffect(() => {
    if (sections[0]?.title) setCurrentTrack(sections[0].title)
  }, [sections])

  useEffect(() => {
    const main = mainRef.current
    if (!main || !sections.length) return undefined

    const pickTrackFromSentinels = () => {
      const sentinels = Object.values(trackSentinelRefs.current).filter(Boolean)
      const mainTop = main.getBoundingClientRect().top
      let active = null

      sentinels.forEach((sentinel) => {
        const rect = sentinel.getBoundingClientRect()
        const distanceFromTop = rect.top - mainTop
        if (distanceFromTop <= 80) {
          if (!active || distanceFromTop > active.distanceFromTop) {
            active = { title: sentinel.dataset.track, distanceFromTop }
          }
        }
      })

      if (!active) {
        const firstVisible = sentinels
          .map((sentinel) => ({
            title: sentinel.dataset.track,
            distanceFromTop: sentinel.getBoundingClientRect().top - mainTop,
          }))
          .filter((sentinel) => sentinel.distanceFromTop >= 0)
          .sort((a, b) => a.distanceFromTop - b.distanceFromTop)[0]
        active = firstVisible || { title: sections[0]?.title }
      }

      if (active?.title) {
        setCurrentTrack((previousTitle) => {
          if (previousTitle !== active.title) {
            console.log(`Track sentinel active: data-track=${active.title}, currentTrackName=${previousTitle}`)
          }
          return active.title
        })
      }
    }

    const observer = new IntersectionObserver(
      () => pickTrackFromSentinels(),
      { threshold: 0, root: main, rootMargin: '-80px 0px 0px 0px' },
    )

    Object.values(trackSentinelRefs.current).forEach((sentinel) => {
      if (sentinel) observer.observe(sentinel)
    })

    console.log('Track sentinel values:', Object.values(trackSentinelRefs.current).filter(Boolean).map((sentinel) => sentinel.dataset.track))
    pickTrackFromSentinels()
    main.addEventListener('scroll', pickTrackFromSentinels, { passive: true })

    return () => {
      observer.disconnect()
      main.removeEventListener('scroll', pickTrackFromSentinels)
    }
  }, [sections])

  useEffect(() => {
    if (!progress || progress.length === 0) return

    const visibleProgress = focusLessonIds
      ? progress.filter((item) => {
          const lessonId = item.lesson_id || item.id || item.lesson_slug
          return focusLessonIds.has(String(lessonId))
        })
      : progress
    const currentLesson =
      visibleProgress.find((item) => item.status === 'in_progress') ||
      visibleProgress.find((item) => item.status === 'unlocked')

    if (!currentLesson) return

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(`lesson-${currentLesson.lesson_id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [focusLessonIds, progress])

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

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const lessonsResponse = await fetch(`${API_BASE}/tracks/${track.slug}/lessons`, { headers })
      const lessonsData = await lessonsResponse.json()
      if (!lessonsResponse.ok) {
        throw new Error(lessonsData.message || lessonsData.error || 'Could not load track lessons')
      }

      const trackLessons = [...(lessonsData.lessons || [])].sort(
        (a, b) => Number(a.display_order || 0) - Number(b.display_order || 0),
      )
      const firstLesson = trackLessons[0]
      if (!firstLesson) {
        console.warn(`No lessons available for track ${track.slug}`)
        return
      }

      const firstLessonId = firstLesson.lesson_id || firstLesson.id
      let learningPath = []

      try {
        const pathResponse = await fetch(`${API_BASE}/users/me/learning-path/${firstLessonId}`, { headers })
        const pathData = await pathResponse.json()
        if (pathResponse.ok && Array.isArray(pathData.learningPath)) {
          learningPath = pathData.learningPath
        }

        console.log('Track slug:', track.slug)
        console.log('First lesson ID:', firstLessonId)
        console.log('Learning path response:', pathData)
      } catch (pathError) {
        console.warn(`Learning path unavailable for ${track.slug}; showing selected track only.`, pathError)
      }

      const visibleIds = new Set([
        ...learningPath.map((id) => String(id.lesson_id || id.id || id)),
        ...trackLessons.map((lesson) => String(lesson.lesson_id || lesson.id || lesson.slug)),
      ])

      setFocusLessonIds(visibleIds)
      setFocusTrack(track)
      setShowFocusModal(false)
    } catch (focusSelectError) {
      console.error('Could not select track:', focusSelectError)
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
          <span className="stat-premium streak-stat"><FireStatIcon />{user?.streak_count ?? 0}</span>
          <span className="stat-premium xp-stat"><DiamondStatIcon />{user?.xp ?? 0}</span>
          <span className="stat-premium freeze-stat"><FreezeStatIcon />{user?.streak_freeze_count ?? 0}</span>
          <span><b>🔥</b>{user?.streak_count ?? 0}</span>
          <span><b>💎</b>{user?.xp ?? 0}</span>
          <span className="freeze"><b>❄️</b>{user?.streak_freeze_count ?? 0}</span>
          <button type="button" className="avatar" onClick={() => setShowProfileMenu((value) => !value)}>
            {(user?.username || 'G').charAt(0).toUpperCase()}
          </button>
          <ThemeToggle />
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
        <button type="button" className="nav-card" onClick={openFocusModal}>
          <FocusIcon />
          <strong>Track Filter</strong>
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
                className="lesson-island-group"
                key={island.id}
                id={`lesson-${island.lessonId}`}
                style={{
                  left: `${island.x}px`,
                  top: `${island.y}px`,
                  width: `${island.width}px`,
                }}
              >
                <div className="lesson-name-label">{island.title}</div>
                <div
                  className="lesson-island"
                  style={{
                    width: `${island.width}px`,
                    height: `${island.height}px`,
                  }}
                />
              </div>
            ))}

            <svg className="path-layer" viewBox={`0 0 780 ${mapLayout.mapHeight}`} preserveAspectRatio="none" aria-hidden="true">
              {mapLayout.pathSegments.map((segment) => (
                <path
                  key={`${segment.id}-base`}
                  d={segment.d}
                  fill="none"
                  stroke={theme === 'light' ? '#C4B09A' : palette.path}
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
                  stroke={theme === 'light' ? '#D8C8B5' : '#7A5C4A'}
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>

            {mapLayout.trackRegions.map((region) => (
              <div
                className="track-sentinel"
                data-track={region.title}
                key={`track-sentinel-${region.slug || region.title}`}
                ref={(element) => {
                  const sentinelKey = region.slug || region.title
                  if (element) {
                    trackSentinelRefs.current[sentinelKey] = element
                  } else {
                    delete trackSentinelRefs.current[sentinelKey]
                  }
                }}
                style={{
                  top: `${region.y}px`,
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
            <h2>Track Filter</h2>
            <p>Choose a track to show only the lessons that matter for that route.</p>
            <div className="focus-track-list">
              {(tracks.length
                ? [...tracks].sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))
                : [
                    { slug: 'foundation', title: 'Foundation' },
                    { slug: 'code-assistant', title: 'Code Assistant' },
                    { slug: 'email-writing', title: 'Email & Professional Writing' },
                    { slug: 'decision-making', title: 'Decision Making & Strategy' },
                  ]
              ).map((track) => (
                <button
                  type="button"
                  key={track.slug}
                  onClick={() => selectFocusTrack(track)}
                  disabled={Boolean(focusLoading)}
                >
                  <span>{track.title}</span>
                  <strong>{focusLoading === track.slug ? 'Loading...' : 'Select'}</strong>
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

.theme-toggle {
  position: static;
  display: grid;
  flex: 0 0 34px;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-left: 12px;
  padding: 0;
  color: #F59E0B;
  cursor: pointer;
  background: #2D4A2D;
  border: 2px solid #3D6A3D;
  border-radius: 50%;
  transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
}

.theme-toggle:hover {
  transform: scale(1.06);
  border-color: #7C3AED;
}

.theme-toggle-icon {
  display: block;
  width: 20px;
  height: 20px;
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
  font-weight: 800;
}

.stats > span:not(.stat-premium) {
  display: none;
}

.stat-icon {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  transition: transform 0.2s ease;
}

.stat-icon:hover {
  transform: scale(1.2);
}

.streak-stat {
  color: #FF6B00;
}

.streak-stat .stat-icon {
  filter: drop-shadow(0 0 6px rgba(255, 100, 0, 0.8));
}

.xp-stat {
  color: #60A5FA;
}

.xp-stat .stat-icon {
  filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.8));
}

.freeze-stat {
  color: #BAE6FD;
}

.freeze-stat .stat-icon {
  filter: drop-shadow(0 0 5px rgba(186, 230, 253, 0.7));
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

.lesson-island-group {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.lesson-island {
  position: relative;
  z-index: 1;
  background: ${palette.chrome};
  border: 1px solid ${palette.border};
  border-radius: 24px;
  padding: 24px 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.track-sentinel {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
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
  position: relative;
  z-index: 7;
  width: 100%;
  margin-bottom: 24px;
  color: #F1F0FF;
  font-size: 22px;
  line-height: 27px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
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

.node-state-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  color: #FFFFFF;
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
  padding: 15px 24px;
  cursor: pointer;
  color: #1A2E1A;
  background: ${palette.amber};
  border: 0;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1.5px;
  transition: all 0.15s ease;
}

.continue-button:hover {
  transform: translateY(-1px);
  background: #D97706;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
}

.continue-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
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
