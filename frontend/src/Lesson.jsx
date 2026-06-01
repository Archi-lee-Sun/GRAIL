import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const API_BASE = 'http://localhost:3000/api'

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function parseInlineMarkdown(value = '') {
  return escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function markdownToHtml(markdown = '') {
  const blocks = []
  const codeBlockRegex = /```([\s\S]*?)```/g
  let cursor = 0
  let match

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({ type: 'text', value: markdown.slice(cursor, match.index) })
    blocks.push({ type: 'code', value: match[1].trim() })
    cursor = match.index + match[0].length
  }
  blocks.push({ type: 'text', value: markdown.slice(cursor) })

  return blocks
    .map((block) => {
      if (block.type === 'code') {
        return `<pre><code>${escapeHtml(block.value)}</code></pre>`
      }

      return block.value
        .split(/\n{2,}/)
        .map((chunk) => {
          const trimmed = chunk.trim()
          if (!trimmed) return ''
          if (trimmed.startsWith('### ')) return `<h3>${parseInlineMarkdown(trimmed.slice(4))}</h3>`
          if (trimmed.startsWith('## ')) return `<h2>${parseInlineMarkdown(trimmed.slice(3))}</h2>`
          if (trimmed.startsWith('> ')) return `<blockquote>${parseInlineMarkdown(trimmed.slice(2))}</blockquote>`
          return `<p>${parseInlineMarkdown(trimmed).replace(/\n/g, '<br />')}</p>`
        })
        .join('')
    })
    .join('')
}

function XPModal({ result, onBack }) {
  if (!result) return null
  const xpEarned = Number(result.xp_earned || 0)

  return (
    <div className="xp-overlay">
      <div className="xp-card">
        {xpEarned > 0 ? <div className="xp-amount">+{xpEarned} XP</div> : <div className="stage-complete-title">Stage Complete!</div>}
        {result.streak_increased && <div className="streak-gain">🔥 Streak +1!</div>}
        <button type="button" onClick={onBack}>BACK TO MAP</button>
      </div>
    </div>
  )
}

function ConceptReader({ markdown, onComplete, completing, isReplay, onBack }) {
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const contentRef = useRef(null)
  const html = useMemo(() => markdownToHtml(markdown), [markdown])

  useEffect(() => {
    const element = contentRef.current
    if (!element) return
    const card = document.getElementById('concept-card')
    if (card) card.scrollTop = 0
    setOverflowing(element.scrollHeight > 500)
  }, [html])

  return (
    <>
      <button
        type="button"
        id="concept-card"
        className={`concept-card ${expanded ? 'expanded' : ''}`}
        onClick={() => setExpanded(true)}
      >
        <div
          ref={contentRef}
          className="concept-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {!expanded && overflowing && (
          <div className="read-more-fade">
            <span>Read more ↓</span>
          </div>
        )}
      </button>

      <button type="button" className="understand-button" onClick={isReplay ? onBack : onComplete} disabled={completing}>
        {isReplay ? 'BACK TO MAP' : completing ? 'SAVING...' : 'I UNDERSTAND ✓'}
      </button>
    </>
  )
}

function ProgressHeader({ current, total }) {
  const progressPercent = ((current - 1) / total) * 100

  return (
    <div className="task-progress">
      <div>Task {current} of {total}</div>
      <div className="progress-track">
        <span style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  )
}

function getTaskQuestion(task) {
  const payload = task.payload || {}
  if (task.task_type === 'which_better') return payload.scenario
  if (task.task_type === 'true_false') return payload.statement
  if (task.task_type === 'whats_wrong') return 'What is wrong with this prompt?'
  if (task.task_type === 'fill_blank') return payload.scenario
  if (task.task_type === 'rank') return payload.scenario
  return payload.scenario || 'Complete the task.'
}

function getOptions(task) {
  const payload = task.payload || {}
  if (task.task_type === 'which_better') {
    return [
      { label: 'Option A', value: 'a', text: payload.prompt_a },
      { label: 'Option B', value: 'b', text: payload.prompt_b },
    ]
  }
  if (task.task_type === 'true_false') {
    return [
      { label: 'True', value: true, text: 'True' },
      { label: 'False', value: false, text: 'False' },
    ]
  }
  if (task.task_type === 'whats_wrong') {
    return (payload.options || []).map((option, index) => ({
      label: String.fromCharCode(65 + index),
      value: index,
      text: option.text,
    }))
  }
  if (task.task_type === 'fill_blank') {
    return (payload.options || []).map((option, index) => ({
      label: String.fromCharCode(65 + index),
      value: index,
      text: option,
    }))
  }
  return []
}

function answerMatches(optionValue, selectedAnswer) {
  return JSON.stringify(optionValue) === JSON.stringify(selectedAnswer)
}

function TaskBody({ task, selectedAnswer, setSelectedAnswer, checked, feedback }) {
  const payload = task.payload || {}
  const options = getOptions(task)

  if (task.task_type === 'rank') {
    const chosen = Array.isArray(selectedAnswer) ? selectedAnswer : []
    const remaining = (payload.prompts || [])
      .map((prompt, index) => ({ prompt, index }))
      .filter((item) => !chosen.includes(item.index))

    return (
      <>
        <p className="task-question">{getTaskQuestion(task)}</p>
        <div className="rank-layout">
          <div>
            <h3>Choose order</h3>
            {remaining.map((item) => (
              <button
                type="button"
                className="answer-option"
                key={item.index}
                disabled={checked}
                onClick={() => setSelectedAnswer([...chosen, item.index])}
              >
                {item.prompt}
              </button>
            ))}
          </div>
          <div>
            <h3>Your ranking</h3>
            {chosen.map((index, order) => (
              <button
                type="button"
                className="answer-option selected"
                key={index}
                disabled={checked}
                onClick={() => setSelectedAnswer(chosen.filter((item) => item !== index))}
              >
                {order + 1}. {payload.prompts[index]}
              </button>
            ))}
          </div>
        </div>
        <Feedback checked={checked} feedback={feedback} />
      </>
    )
  }

  return (
    <>
      <p className="task-question">{getTaskQuestion(task)}</p>

      {task.task_type === 'which_better' && (
        <div className="prompt-comparison">
          {options.map((option) => (
            <button
              type="button"
              className={`prompt-block ${answerMatches(option.value, selectedAnswer) ? 'selected' : ''}`}
              key={option.value}
              disabled={checked}
              onClick={() => setSelectedAnswer(option.value)}
            >
              <span>{option.label}</span>
              <code>{option.text}</code>
            </button>
          ))}
        </div>
      )}

      {task.task_type === 'whats_wrong' && <pre className="bad-prompt"><code>{payload.prompt}</code></pre>}

      {task.task_type === 'fill_blank' && (
        <div className="fill-template">
          {String(payload.template || '').split(payload.blank_marker || '__').map((part, index, parts) => (
            <span key={`${part}-${index}`}>
              {part}
              {index < parts.length - 1 && <mark>{payload.blank_marker || '__'}</mark>}
            </span>
          ))}
        </div>
      )}

      {task.task_type !== 'which_better' && (
        <div className="answers-list">
          {options.map((option) => (
            <button
              type="button"
              className={`answer-option ${answerMatches(option.value, selectedAnswer) ? 'selected' : ''} ${checked ? getCheckedClass(feedback, option.value, selectedAnswer) : ''}`}
              key={String(option.value)}
              disabled={checked}
              onClick={() => setSelectedAnswer(option.value)}
            >
              <span>{option.label}</span>
              {option.text}
            </button>
          ))}
        </div>
      )}

      <Feedback checked={checked} feedback={feedback} />
    </>
  )
}

function getCheckedClass(feedback, optionValue, selectedAnswer) {
  if (!answerMatches(optionValue, selectedAnswer)) return ''
  return feedback?.isCorrect || feedback?.passed ? 'correct' : 'wrong'
}

function Feedback({ checked, feedback }) {
  if (!checked || !feedback) return null

  if (feedback.isCorrect || feedback.passed) {
    return <div className="feedback success">✓ Correct!</div>
  }

  return (
    <div className="feedback error">
      <strong>✗ Incorrect</strong>
      <p>{feedback.feedback?.explanation || feedback.feedback?.summary || 'Try reviewing the prompt details.'}</p>
    </div>
  )
}

function calculateStage2Correct(task, answer) {
  if (!task) return false

  if (task.task_type === 'which_better' || task.task_type === 'true_false') {
    return task.payload.correct === answer
  }
  if (task.task_type === 'fill_blank') {
    return task.payload.correct === answer || task.payload.correct_index === answer
  }
  if (task.task_type === 'whats_wrong') {
    return task.payload.correct_index === answer
  }
  if (task.task_type === 'rank') {
    return JSON.stringify(task.payload.correct_order) === JSON.stringify(answer)
  }
  return false
}

function StageTwoTasks({ tasks, slug, stage, token, onStageComplete, isReplay, onBack }) {
  const [taskIndex, setTaskIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [checked, setChecked] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showNext, setShowNext] = useState(false)
  const currentTask = tasks[taskIndex]
  const isLastTask = taskIndex === tasks.length - 1
  const canCheck = Array.isArray(selectedAnswer) ? selectedAnswer.length === (currentTask?.payload?.prompts || []).length : selectedAnswer !== null

  const checkAnswer = () => {
    if (!canCheck || !currentTask) return

    const isCorrect = calculateStage2Correct(currentTask, selectedAnswer)
    setChecked(true)
    setFeedback({ isCorrect, feedback: { explanation: currentTask.payload.explanation } })
    setShowNext(true)

    fetch(`${API_BASE}/lessons/${slug}/stage/${stage}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ task_id: currentTask.id, answer: selectedAnswer }),
    }).catch((error) => console.error('Background save failed:', error))
  }

  const nextTask = () => {
    setTaskIndex((value) => value + 1)
    setSelectedAnswer(null)
    setChecked(false)
    setFeedback(null)
    setShowNext(false)
  }

  if (!currentTask) {
    return <div className="state-card">No tasks found for this stage.</div>
  }

  return (
    <>
      <ProgressHeader current={taskIndex + 1} total={tasks.length} />
      <div className="task-card">
        <TaskBody
          task={currentTask}
          selectedAnswer={selectedAnswer}
          setSelectedAnswer={setSelectedAnswer}
          checked={checked}
          feedback={feedback}
        />

        {!checked && (
          <button type="button" className="check-button" disabled={!canCheck} onClick={checkAnswer}>
            CHECK
          </button>
        )}

        {checked && showNext && !isLastTask && (
          <button type="button" className="check-button ready" onClick={nextTask}>
            NEXT →
          </button>
        )}

        {checked && showNext && isLastTask && (
          <button type="button" className="check-button ready" onClick={isReplay ? onBack : onStageComplete}>
            {isReplay ? 'BACK TO MAP' : 'COMPLETE STAGE →'}
          </button>
        )}
      </div>
    </>
  )
}

function ScoreRow({ label, score }) {
  const value = Number(score || 0)
  const color = value >= 7 ? '#7C3AED' : value >= 5 ? '#F59E0B' : '#EF4444'

  return (
    <div className="score-row">
      <div className="score-meta">
        <span>{label}</span>
        <strong>{value}/10</strong>
      </div>
      <div className="score-bar">
        <span style={{ width: `${Math.min(100, value * 10)}%`, background: color }} />
      </div>
    </div>
  )
}

function GradingResults({ result, dimensions }) {
  if (!result) return null
  const composite = Number(result.composite_score || 0)
  const passed = composite >= 7

  return (
    <div className="grading-results">
      <h2>AI Feedback</h2>
      {dimensions.map((dimension) => (
        <ScoreRow
          key={dimension.key}
          label={dimension.label}
          score={result.scores?.[dimension.key]}
        />
      ))}
      <div className="composite-score">{composite.toFixed(1)} / 10</div>
      <div className={`pass-badge ${passed ? 'passed' : 'failed'}`}>
        {passed ? 'PASSED' : 'NEEDS WORK'}
      </div>
      <div className="user-output">
        <span>Your prompt generated:</span>
        <p>{result.user_output || 'No output returned.'}</p>
      </div>
      <div className="dimension-feedback">
        {dimensions.map((dimension) => (
          <div key={dimension.key}>
            <strong>{dimension.label}</strong>
            <p>{result.feedback?.[dimension.key] || 'No feedback returned.'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PromptGradingStage({ tasks, slug, stage, token, onStageComplete, isReplay, onBack }) {
  const [taskIndex, setTaskIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [grading, setGrading] = useState(false)
  const [error, setError] = useState('')
  const currentTask = tasks[taskIndex]
  const isStage3 = stage === 3
  const isLastTask = taskIndex === tasks.length - 1
  const dimensions = isStage3
    ? [
        { key: 'coverage', label: 'Coverage' },
        { key: 'depth', label: 'Depth' },
        { key: 'structure', label: 'Structure' },
      ]
    : [
        { key: 'clarity', label: 'Clarity' },
        { key: 'context', label: 'Context' },
        { key: 'specificity', label: 'Specificity' },
      ]

  const submitPrompt = async () => {
    if (!answer.trim() || !currentTask) return
    setGrading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/lessons/${slug}/stage/${stage}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task_id: currentTask.id, answer }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Prompt grading failed')
      setResult(data)
    } catch (submitError) {
      setError(submitError.message || 'Prompt grading failed')
    } finally {
      setGrading(false)
    }
  }

  const nextTask = () => {
    setTaskIndex((value) => value + 1)
    setAnswer('')
    setResult(null)
    setError('')
  }

  if (!currentTask) {
    return <div className="state-card">No tasks found for this stage.</div>
  }

  return (
    <>
      <ProgressHeader current={taskIndex + 1} total={tasks.length} />
      <div className={isStage3 ? 'task-card prompt-stage-card' : 'prompt-stage-card'}>
        {isStage3 ? (
          <div className="scenario-block">
            <span>Your scenario:</span>
            <p>{currentTask.payload.scenario_context}</p>
          </div>
        ) : (
          <div className="scenario-card">
            <span>YOUR CHALLENGE</span>
            <p>{currentTask.payload.scenario}</p>
          </div>
        )}

        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder={isStage3 ? 'Write your prompt here...' : 'Write your best prompt for this scenario...'}
          disabled={Boolean(result) || grading}
        />
        <div className="character-count">{answer.length} characters</div>

        {!isStage3 && (
          <div className="tips-card">
            <strong>Good prompts usually include:</strong>
            <ul>
              <li>Role or persona for the AI</li>
              <li>Specific format requirements</li>
              <li>Tone and audience</li>
              <li>Length constraints</li>
              <li>What to avoid</li>
            </ul>
          </div>
        )}

        {error && <div className="feedback error"><strong>{error}</strong></div>}

        {!result && (
          <button type="button" className="check-button" disabled={!answer.trim() || grading} onClick={submitPrompt}>
            {grading ? (isStage3 ? 'Grading...' : 'Grading your prompt...') : 'SUBMIT PROMPT'}
          </button>
        )}

        <GradingResults result={result} dimensions={dimensions} />

        {result && !isLastTask && (
          <button type="button" className="check-button ready" onClick={nextTask}>
            NEXT
          </button>
        )}
        {result && isLastTask && (
          <button type="button" className="check-button ready" onClick={isReplay ? onBack : onStageComplete}>
            {isReplay ? 'BACK TO MAP' : 'COMPLETE STAGE'}
          </button>
        )}
      </div>
    </>
  )
}

export default function Lesson() {
  const { slug, stage } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const stageNumber = Number(stage || 1)
  const replayFromRoute = Boolean(location.state?.isReplay || location.state?.replay)
  const [lessonTitle, setLessonTitle] = useState('Lesson')
  const [conceptMarkdown, setConceptMarkdown] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completing, setCompleting] = useState(false)
  const [xpResult, setXpResult] = useState(null)
  const [initialStreak, setInitialStreak] = useState(null)
  const [alreadyPassedMessage, setAlreadyPassedMessage] = useState('')
  const [allAlreadyPassed, setAllAlreadyPassed] = useState(false)
  const [isReplay, setIsReplay] = useState(replayFromRoute)
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true })
      return
    }

    setLoading(true)
    setError('')
    setAlreadyPassedMessage('')
    setAllAlreadyPassed(false)
    setIsReplay(replayFromRoute)

    Promise.all([
      fetch(`${API_BASE}/lessons/${slug}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/lessons/${slug}/stage/${stageNumber}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/users/me/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([lessonResponse, stageResponse, dashboardResponse]) => {
        if (!lessonResponse.ok) throw new Error(`Lesson request failed (${lessonResponse.status})`)
        const lessonData = await lessonResponse.json()
        setLessonTitle(location.state?.lessonTitle || lessonData.lesson?.title || lessonData.title || slug)

        if (stageResponse.status === 403) {
          if (replayFromRoute) {
            setIsReplay(true)
            setConceptMarkdown(stageNumber === 1 ? lessonData.lesson?.concept_markdown || lessonData.concept_markdown || '' : '')
            setTasks([])
            return
          }
          setError('This stage is not available yet. Return to the map to continue your journey.')
          return
        }
        if (!stageResponse.ok) throw new Error(`Stage request failed (${stageResponse.status})`)

        const stageData = await stageResponse.json()
        const dashboardData = dashboardResponse.ok ? await dashboardResponse.json() : null
        setConceptMarkdown(stageData.concept_markdown || '')
        if (stageNumber === 3 || stageNumber === 4) {
          const allTasks = stageData.tasks || []
          if (replayFromRoute) {
            setTasks(allTasks)
            setAllAlreadyPassed(false)
            setAlreadyPassedMessage('')
            return
          }
          const pendingTasks = allTasks.filter((task) => !task.already_passed)
          const alreadyPassedCount = allTasks.filter((task) => task.already_passed).length

          setTasks(pendingTasks)
          if (pendingTasks.length === 0 && allTasks.length > 0) {
            setAllAlreadyPassed(true)
          }
          if (alreadyPassedCount > 0 && pendingTasks.length > 0) {
            setAlreadyPassedMessage(`${alreadyPassedCount} task(s) already passed - showing remaining tasks only`)
          }
        } else {
          setTasks(stageData.tasks || [])
        }
        setInitialStreak(dashboardData?.user?.streak_count ?? null)
      })
      .catch((fetchError) => setError(fetchError.message || 'Unable to load lesson'))
      .finally(() => setLoading(false))
  }, [location.state?.lessonTitle, navigate, replayFromRoute, slug, stageNumber, token])

  const completeStage = async () => {
    if (completing || isReplay) return
    setCompleting(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/lessons/${slug}/stage/${stageNumber}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not complete stage')
      const dashboardResponse = await fetch(`${API_BASE}/users/me/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dashboardData = dashboardResponse.ok ? await dashboardResponse.json() : null
      const latestStreak = dashboardData?.user?.streak_count
      setXpResult({
        ...data,
        streak_increased:
          Number.isFinite(Number(initialStreak)) &&
          Number.isFinite(Number(latestStreak)) &&
          Number(latestStreak) > Number(initialStreak),
      })
    } catch (completeError) {
      setError(completeError.message || 'Could not complete stage')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="lesson-page">
      <style>{styles}</style>
      <header className="lesson-topbar">
        <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>←</button>
        <div className="lesson-title">{lessonTitle}</div>
        <div className="stage-indicator">Stage {stageNumber} of 4</div>
      </header>

      <main className="lesson-main">
        {loading && <div className="state-card">Loading...</div>}
        {!loading && isReplay && (
          <div className="replay-banner">
            Practice mode — XP will not be awarded for this stage
          </div>
        )}
        {!loading && error && (
          <div className="state-card error">
            {error}
            <button type="button" className="map-back-button" onClick={() => navigate('/dashboard')}>BACK TO MAP</button>
          </div>
        )}
        {!loading && !error && stageNumber === 1 && (
          <ConceptReader
            markdown={conceptMarkdown}
            onComplete={completeStage}
            completing={completing}
            isReplay={isReplay}
            onBack={() => navigate('/dashboard')}
          />
        )}
        {!loading && !error && stageNumber === 2 && (
          <StageTwoTasks
            tasks={tasks}
            slug={slug}
            stage={stageNumber}
            token={token}
            onStageComplete={completeStage}
            isReplay={isReplay}
            onBack={() => navigate('/dashboard')}
          />
        )}
        {!loading && !error && (stageNumber === 3 || stageNumber === 4) && (
          <>
            {alreadyPassedMessage && <div className="already-passed-banner">{alreadyPassedMessage}</div>}
            {allAlreadyPassed ? (
              <div className="state-card">
                All tasks in this stage are already passed.
                <button
                  type="button"
                  className="map-back-button"
                  onClick={isReplay ? () => navigate('/dashboard') : completeStage}
                  disabled={completing}
                >
                  {isReplay ? 'BACK TO MAP' : completing ? 'Completing...' : 'COMPLETE STAGE'}
                </button>
              </div>
            ) : (
              <PromptGradingStage
                tasks={tasks}
                slug={slug}
                stage={stageNumber}
                token={token}
                onStageComplete={completeStage}
                isReplay={isReplay}
                onBack={() => navigate('/dashboard')}
              />
            )}
          </>
        )}
      </main>

      <XPModal result={xpResult} onBack={() => navigate('/dashboard')} />
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

.lesson-page {
  min-height: 100vh;
  background: #1A2E1A;
}

.lesson-topbar {
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

.lesson-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #FFFFFF;
  font-size: 17px;
  font-weight: 950;
}

.stage-indicator {
  margin-left: auto;
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 800;
}

.lesson-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 24px 48px;
}

.concept-card,
.task-card,
.state-card {
  width: 100%;
  color: #F1F0FF;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.25);
}

.prompt-stage-card {
  width: 100%;
  color: #F1F0FF;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.25);
}

.concept-card {
  position: relative;
  display: block;
  max-height: 500px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  transition: max-height 260ms ease;
}

.concept-card.expanded {
  max-height: 2400px;
}

.concept-content h2 {
  margin: 0 0 18px;
  color: #FFFFFF;
  font-size: 28px;
  line-height: 34px;
}

.concept-content h3 {
  margin: 28px 0 12px;
  color: #FFFFFF;
  font-size: 19px;
}

.concept-content p,
.concept-content blockquote {
  margin: 0 0 18px;
  color: #D9D7E8;
  font-size: 16px;
  line-height: 1.7;
}

.concept-content blockquote {
  padding-left: 16px;
  border-left: 3px solid #F59E0B;
}

.concept-content strong {
  color: #FFFFFF;
}

.concept-content code {
  color: #F97316;
  background: #0D1117;
  border-radius: 5px;
  padding: 2px 5px;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

.concept-content pre {
  margin: 18px 0;
  overflow-x: auto;
  background: #0D1117;
  border-radius: 8px;
  padding: 16px;
}

.concept-content pre code {
  padding: 0;
  color: #F97316;
  background: transparent;
}

.read-more-fade {
  position: absolute;
  inset: auto 0 0 0;
  display: grid;
  place-items: end center;
  height: 118px;
  padding-bottom: 18px;
  background: linear-gradient(180deg, rgba(20, 35, 20, 0), #142314 78%);
  color: #F59E0B;
  font-size: 13px;
  font-weight: 900;
}

.understand-button,
.check-button,
.xp-card button {
  display: block;
  cursor: pointer;
  color: #0F0F0F;
  background: #F59E0B;
  border: 0;
  border-radius: 12px;
  font-weight: 950;
}

.understand-button {
  margin: 32px auto 0;
  padding: 16px 48px;
  font-size: 16px;
}

.understand-button:disabled {
  cursor: wait;
  opacity: 0.75;
}

.task-progress {
  margin-bottom: 22px;
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 850;
  text-align: center;
}

.progress-track {
  width: 100%;
  height: 6px;
  margin-top: 12px;
  overflow: hidden;
  background: #1F361F;
  border-radius: 3px;
}

.progress-track span {
  display: block;
  height: 100%;
  background: #7C3AED;
  border-radius: inherit;
}

.task-question {
  margin: 0 0 24px;
  color: #FFFFFF;
  font-size: 16px;
  line-height: 1.6;
}

.prompt-comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.prompt-block,
.answer-option {
  width: 100%;
  cursor: pointer;
  color: #F1F0FF;
  background: #1F361F;
  border: 2px solid #2D4A2D;
  border-radius: 12px;
  padding: 16px 20px;
  text-align: left;
  transition: border-color 150ms ease, background 150ms ease;
}

.prompt-block:hover,
.answer-option:hover {
  border-color: #4D6A4D;
}

.prompt-block.selected,
.answer-option.selected {
  background: #1F1040;
  border-color: #7C3AED;
}

.answer-option.correct {
  background: #0D2E1F;
  border-color: #10B981;
}

.answer-option.wrong {
  background: #2E0D0D;
  border-color: #EF4444;
}

.prompt-block span,
.answer-option span {
  display: block;
  margin-bottom: 8px;
  color: #9CA3AF;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.prompt-block code,
.bad-prompt code {
  display: block;
  white-space: pre-wrap;
  color: #F97316;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  line-height: 1.55;
}

.bad-prompt {
  margin: 0 0 18px;
  background: #0D1117;
  border-radius: 8px;
  padding: 16px;
}

.fill-template {
  margin-bottom: 18px;
  color: #FFFFFF;
  font-size: 18px;
  line-height: 1.7;
}

.fill-template mark {
  color: #0F0F0F;
  background: #F59E0B;
  border-radius: 6px;
  padding: 2px 8px;
}

.rank-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.rank-layout h3 {
  margin: 0 0 10px;
  color: #9CA3AF;
  font-size: 13px;
  text-transform: uppercase;
}

.scenario-block {
  margin-bottom: 20px;
}

.scenario-block span,
.scenario-card span {
  display: block;
  margin-bottom: 8px;
  color: #9CA3AF;
  font-size: 12px;
  font-weight: 900;
}

.scenario-block p,
.scenario-card p {
  margin: 0;
  color: #FFFFFF;
  font-size: 16px;
  line-height: 1.6;
}

.scenario-card {
  margin-bottom: 20px;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 16px;
  padding: 24px;
}

.scenario-card span {
  font-size: 11px;
  letter-spacing: 1.6px;
}

.prompt-stage-card textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  color: #F1F0FF;
  background: #0D1117;
  border: 1px solid #2D4A2D;
  border-radius: 8px;
  padding: 16px;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 14px;
  line-height: 1.55;
}

.prompt-stage-card textarea:focus {
  border-color: #7C3AED;
  outline: none;
}

.character-count {
  margin-top: 8px;
  color: #9CA3AF;
  font-size: 13px;
  text-align: right;
}

.tips-card {
  margin-top: 16px;
  padding: 16px;
  background: #1F1040;
  border: 1px solid #7C3AED;
  border-radius: 8px;
}

.tips-card strong {
  color: #F1F0FF;
  font-size: 14px;
  font-weight: 600;
}

.tips-card ul {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #9CA3AF;
  font-size: 13px;
  line-height: 1.6;
}

.grading-results {
  margin-top: 24px;
  padding: 24px;
  background: #0D1117;
  border: 1px solid #2D4A2D;
  border-radius: 12px;
}

.grading-results h2 {
  margin: 0 0 18px;
  color: #FFFFFF;
  font-size: 20px;
}

.score-row {
  margin-bottom: 14px;
}

.score-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}

.score-meta span {
  color: #F1F0FF;
  font-weight: 600;
}

.score-meta strong {
  color: #F59E0B;
}

.score-bar {
  height: 8px;
  overflow: hidden;
  background: #2D4A2D;
  border-radius: 4px;
}

.score-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.composite-score {
  margin-top: 22px;
  color: #F59E0B;
  font-size: 32px;
  font-weight: 950;
  text-align: center;
}

.pass-badge {
  width: fit-content;
  margin: 10px auto 20px;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 950;
}

.pass-badge.passed {
  color: #FFFFFF;
  background: #7C3AED;
}

.pass-badge.failed {
  color: #FFFFFF;
  background: #EF4444;
}

.user-output {
  margin-top: 18px;
}

.user-output span,
.dimension-feedback strong {
  display: block;
  margin-bottom: 8px;
  color: #F1F0FF;
  font-size: 13px;
  font-weight: 600;
}

.user-output p {
  max-height: 180px;
  overflow-y: auto;
  margin: 0;
  color: #D9D7E8;
  background: #080B10;
  border-radius: 8px;
  padding: 14px;
  line-height: 1.6;
}

.dimension-feedback {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.dimension-feedback p {
  margin: 0;
  color: #9CA3AF;
  line-height: 1.55;
}

.answers-list .answer-option {
  margin-bottom: 12px;
}

.check-button {
  width: 100%;
  margin-top: 20px;
  padding: 16px;
  font-size: 16px;
}

.check-button:disabled {
  cursor: not-allowed;
  color: #4D6A4D;
  background: #1F361F;
}

.check-button.ready {
  color: #0F0F0F;
  background: #F59E0B;
}

.feedback {
  margin-top: 18px;
  border-radius: 12px;
  padding: 14px 16px;
  font-weight: 900;
}

.feedback.success {
  color: #34D399;
  background: #0D2E1F;
}

.feedback.error {
  color: #F87171;
  background: #2E0D0D;
}

.feedback p {
  margin: 8px 0 0;
  color: #9CA3AF;
  font-weight: 700;
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

.map-back-button:disabled {
  cursor: wait;
  opacity: 0.75;
}

.already-passed-banner {
  margin-bottom: 18px;
  color: #F59E0B;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 850;
}

.replay-banner {
  margin-bottom: 18px;
  color: #F59E0B;
  background: #142314;
  border: 1px solid #7C3AED;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 850;
}

.xp-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.65);
}

.xp-card {
  width: min(420px, calc(100vw - 32px));
  padding: 40px;
  text-align: center;
  background: #142314;
  border: 1px solid #2D4A2D;
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.xp-amount {
  color: #F59E0B;
  font-size: 48px;
  line-height: 1;
  font-weight: 950;
}

.stage-complete-title {
  color: #FFFFFF;
  font-size: 36px;
  line-height: 1.1;
  font-weight: 950;
}

.streak-gain {
  margin-top: 14px;
  color: #F97316;
  font-size: 18px;
  font-weight: 900;
}

.xp-card button {
  margin: 28px auto 0;
  padding: 14px 32px;
}
`
