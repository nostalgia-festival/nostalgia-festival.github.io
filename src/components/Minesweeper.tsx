import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import XPWindow from './XPWindow'
import { logMinesweeperScore } from '../lib/supabase'
// The recycle-bin file icon and window title-bar icon use this real winmine.exe
// logo. `?inline` forces Vite to embed it as a base64 data URI in the bundle
// (it's only ~6KB) instead of emitting a separate hashed file - so the icon
// shows instantly when the recycle bin opens, with no network round-trip.
// The in-game mine cells still use the inline MineGlyph SVG below.
import minesweeperLogo from '../../images/Minesweeper.webp?inline'

// A faithful clone of the classic Windows Minesweeper (winmine.exe) - the same
// rules, the same little chrome. Self-contained: state, logic, and the pixel
// glyphs (mine / flag / faces) all live here; only its CSS lives in xp.css with
// the rest of the theme. It opens as a modal launched from the recycle bin.
//
// Authentic behaviours reproduced:
//  - first click is always safe (mines are placed *after* it, avoiding that cell)
//  - flood-fill opening of empty (0-adjacent) regions
//  - right-click cycles none → flag → question → none (classic "marks")
//  - chording: clicking an already-open number whose flag count matches it
//    opens the remaining neighbours
//  - the mine counter, the 999-capped timer, and the four smiley states
//  - on a loss every mine is revealed and wrong flags get an X; on a win the
//    remaining mines are auto-flagged

interface Cell {
  mine: boolean
  revealed: boolean
  /** 0 = unmarked, 1 = flag, 2 = question (classic right-click cycle). */
  mark: 0 | 1 | 2
  /** Number of mines in the 8 neighbours (only meaningful once mines exist). */
  adjacent: number
  /** The specific mine the player detonated - drawn on a red background. */
  exploded?: boolean
  /** A flag on a cell that turned out to be safe - drawn with a red X on loss. */
  wrongFlag?: boolean
}

interface Level {
  rows: number
  cols: number
  mines: number
}

// The three classic difficulty presets, by their original board sizes.
const LEVELS: Record<string, Level> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
}
const LEVEL_LABELS: Record<string, string> = {
  beginner: 'מתחילים',
  intermediate: 'בינוני',
  expert: 'מומחה',
}

type Status = 'ready' | 'playing' | 'won' | 'lost'

function makeBoard(level: Level): Cell[] {
  return Array.from({ length: level.rows * level.cols }, () => ({
    mine: false,
    revealed: false,
    mark: 0 as const,
    adjacent: 0,
  }))
}

// Indices of the up-to-8 neighbours of cell `i` on a rows×cols grid.
function neighbours(i: number, rows: number, cols: number): number[] {
  const r = Math.floor(i / cols)
  const c = i % cols
  const out: number[] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc)
    }
  }
  return out
}

// Place mines on a fresh board, never on `safe` (the first-clicked cell), then
// fill in every cell's adjacent-mine count. Returns a new array.
function placeMines(board: Cell[], level: Level, safe: number): Cell[] {
  const { rows, cols, mines } = level
  const candidates: number[] = []
  for (let i = 0; i < board.length; i++) if (i !== safe) candidates.push(i)
  // Fisher-Yates shuffle, take the first `mines`.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  const next = board.map((c) => ({ ...c }))
  for (let k = 0; k < mines; k++) next[candidates[k]].mine = true
  for (let i = 0; i < next.length; i++) {
    next[i].adjacent = neighbours(i, rows, cols).filter((n) => next[n].mine).length
  }
  return next
}

// Reveal `start`; if it's a 0, iteratively flood-fill its empty region open.
// Mutates `board` in place (callers pass a fresh copy).
function floodReveal(board: Cell[], level: Level, start: number) {
  const stack = [start]
  while (stack.length) {
    const i = stack.pop()!
    const cell = board[i]
    if (cell.revealed || cell.mark === 1) continue
    cell.revealed = true
    if (!cell.mine && cell.adjacent === 0) {
      for (const n of neighbours(i, level.rows, level.cols)) {
        if (!board[n].revealed && board[n].mark !== 1) stack.push(n)
      }
    }
  }
}

// Faithful pixel-ish glyphs, drawn as inline SVG so they need no asset files and
// stay crisp at any tile size.
function MineGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <g stroke="#000" strokeWidth="1.4">
        <line x1="8" y1="2" x2="8" y2="14" />
        <line x1="2" y1="8" x2="14" y2="8" />
        <line x1="3.7" y1="3.7" x2="12.3" y2="12.3" />
        <line x1="12.3" y1="3.7" x2="3.7" y2="12.3" />
      </g>
      <circle cx="8" cy="8" r="3.6" fill="#000" />
      <rect x="6.3" y="6.3" width="1.5" height="1.5" fill="#fff" />
    </svg>
  )
}

function FlagGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <polygon points="8,3 8,8 3.5,5.5" fill="#f00" />
      <line x1="8" y1="3" x2="8" y2="10.5" stroke="#000" strokeWidth="1.2" />
      <rect x="5" y="10.5" width="6" height="1.4" fill="#000" />
      <rect x="3.5" y="11.9" width="9" height="1.8" fill="#000" />
    </svg>
  )
}

// The four classic smiley-button faces, drawn from one base.
function Face({ status, pressed }: { status: Status; pressed: boolean }) {
  const mood = status === 'won' ? 'won' : status === 'lost' ? 'lost' : pressed ? 'surprised' : 'happy'
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#ffe000" stroke="#000" strokeWidth="1" />
      {mood === 'won' ? (
        // Cool sunglasses.
        <>
          <path d="M4 10 H20 V11 H4 Z" fill="#000" />
          <rect x="5" y="10.5" width="5" height="3.5" rx="1" fill="#000" />
          <rect x="14" y="10.5" width="5" height="3.5" rx="1" fill="#000" />
          <path d="M8 17 Q12 19 16 17" fill="none" stroke="#000" strokeWidth="1.3" />
        </>
      ) : mood === 'lost' ? (
        // Dead X-eyes.
        <>
          <g stroke="#000" strokeWidth="1.3">
            <line x1="6.5" y1="8.5" x2="9.5" y2="11.5" />
            <line x1="9.5" y1="8.5" x2="6.5" y2="11.5" />
            <line x1="14.5" y1="8.5" x2="17.5" y2="11.5" />
            <line x1="17.5" y1="8.5" x2="14.5" y2="11.5" />
          </g>
          <path d="M8 17 Q12 14.5 16 17" fill="none" stroke="#000" strokeWidth="1.3" />
        </>
      ) : (
        // Happy, or surprised (an O mouth) while the mouse is held down.
        <>
          <circle cx="8.5" cy="10" r="1.4" fill="#000" />
          <circle cx="15.5" cy="10" r="1.4" fill="#000" />
          {mood === 'surprised' ? (
            <circle cx="12" cy="16" r="1.8" fill="none" stroke="#000" strokeWidth="1.3" />
          ) : (
            <path d="M8 15.5 Q12 18.5 16 15.5" fill="none" stroke="#000" strokeWidth="1.3" />
          )}
        </>
      )}
    </svg>
  )
}

// The classic 3-digit red LED readout (clamped to ‑99..999 like the original).
function LedCounter({ value }: { value: number }) {
  const clamped = Math.max(-99, Math.min(999, value))
  const text = clamped < 0 ? '-' + String(-clamped).padStart(2, '0') : String(clamped).padStart(3, '0')
  return <div className="ms-led">{text}</div>
}

/**
 * The Minesweeper logo, exported for the recycle-bin file and the window title
 * bar. Defaults to the `xp-icon` sizing (1em) used by the other chrome icons
 * when no explicit className is given.
 */
export function MinesweeperGlyph({ className }: { className?: string }) {
  return <img src={minesweeperLogo} alt="" aria-hidden="true" className={className ?? 'xp-icon'} />
}

export default function Minesweeper() {
  const [levelKey, setLevelKey] = useState<keyof typeof LEVELS>('beginner')
  const level = LEVELS[levelKey]
  const [board, setBoard] = useState<Cell[]>(() => makeBoard(level))
  const [status, setStatus] = useState<Status>('ready')
  const [time, setTime] = useState(0)
  const [pressed, setPressed] = useState(false)
  // Touch flag-mode: with no right mouse button, this toggle makes taps flag.
  const [flagMode, setFlagMode] = useState(false)

  // Wall-clock start of the current game (ms), set on the first move. Used to
  // record the *exact* win duration for the high-score - the visible LED timer
  // only has 1-second resolution, so we don't reuse it here.
  const startTimeRef = useRef<number | null>(null)
  // Set when the player wins: the captured exact duration + the level played.
  // Its presence drives the high-score registration dialog. Cleared on reset.
  const [result, setResult] = useState<{ durationMs: number; difficulty: keyof typeof LEVELS } | null>(null)

  const flagCount = useMemo(() => board.filter((c) => c.mark === 1).length, [board])

  // Stamp the start time the moment the game leaves 'ready', whichever move did
  // it (a reveal or a first flag). Idempotent so the second of two moves in the
  // same render can't push the start forward.
  const startClock = useCallback(() => {
    if (startTimeRef.current === null) startTimeRef.current = Date.now()
  }, [])

  const reset = useCallback(
    (key: keyof typeof LEVELS = levelKey) => {
      setBoard(makeBoard(LEVELS[key]))
      setStatus('ready')
      setTime(0)
      setPressed(false)
      startTimeRef.current = null
      setResult(null)
    },
    [levelKey],
  )

  const changeLevel = useCallback(
    (key: keyof typeof LEVELS) => {
      setLevelKey(key)
      reset(key)
    },
    [reset],
  )

  // The 999-capped timer runs while the game is in play.
  useEffect(() => {
    if (status !== 'playing') return
    const id = setInterval(() => setTime((t) => Math.min(999, t + 1)), 1000)
    return () => clearInterval(id)
  }, [status])

  // After any reveal, settle the board: detect a loss (a revealed mine) or a win
  // (every safe cell open), and apply the end-of-game reveals.
  function settle(next: Cell[]) {
    const hitMine = next.some((c) => c.mine && c.revealed)
    if (hitMine) {
      for (const c of next) {
        if (c.mine) c.revealed = true
        if (c.mark === 1 && !c.mine) c.wrongFlag = true
      }
      setStatus('lost')
      setBoard(next)
      return
    }
    const won = next.every((c) => c.mine || c.revealed)
    if (won) {
      for (const c of next) if (c.mine) c.mark = 1
      // Capture the exact win duration before any further interaction, and arm
      // the high-score registration dialog.
      const durationMs = startTimeRef.current !== null ? Date.now() - startTimeRef.current : 0
      setResult({ durationMs, difficulty: levelKey })
      setStatus('won')
      setBoard(next)
      return
    }
    setBoard(next)
  }

  function revealCell(i: number) {
    if (status === 'won' || status === 'lost') return
    if (board[i].mark === 1) return

    let working: Cell[]
    // First click of the game: now place the mines, keeping this cell safe.
    if (status === 'ready') {
      working = placeMines(board, level, i)
      startClock()
      setStatus('playing')
    } else {
      working = board.map((c) => ({ ...c }))
    }

    const cell = working[i]
    if (cell.revealed) {
      // Chord: open the neighbours of a satisfied number.
      if (cell.adjacent > 0) {
        const nbrs = neighbours(i, level.rows, level.cols)
        const flags = nbrs.filter((n) => working[n].mark === 1).length
        if (flags === cell.adjacent) {
          for (const n of nbrs) {
            if (working[n].mark !== 1 && !working[n].revealed) {
              if (working[n].mine) working[n].exploded = true
              floodReveal(working, level, n)
            }
          }
        }
      }
    } else if (cell.mine) {
      cell.revealed = true
      cell.exploded = true
    } else {
      floodReveal(working, level, i)
    }

    settle(working)
  }

  function cycleMark(i: number) {
    if (status === 'won' || status === 'lost') return
    if (board[i].revealed) return
    if (status === 'ready') {
      startClock()
      setStatus('playing')
    }
    const next = board.map((c) => ({ ...c }))
    next[i].mark = ((next[i].mark + 1) % 3) as 0 | 1 | 2
    setBoard(next)
  }

  function onCellClick(i: number) {
    if (flagMode) cycleMark(i)
    else revealCell(i)
  }

  function onCellContext(e: React.MouseEvent, i: number) {
    e.preventDefault()
    cycleMark(i)
  }

  const boardRef = useRef<HTMLDivElement>(null)
  const inPlay = status === 'ready' || status === 'playing'

  return (
    <div className="ms-game" style={{ ['--ms-cols' as string]: level.cols }}>
      <div className="ms-menu">
        {(Object.keys(LEVELS) as Array<keyof typeof LEVELS>).map((key) => (
          <button
            key={key}
            type="button"
            className={`ms-menu-btn${key === levelKey ? ' ms-menu-btn--on' : ''}`}
            onClick={() => changeLevel(key)}
          >
            {LEVEL_LABELS[key]}
          </button>
        ))}
        <button
          type="button"
          className={`ms-menu-btn ms-flag-toggle${flagMode ? ' ms-menu-btn--on' : ''}`}
          onClick={() => setFlagMode((f) => !f)}
          aria-pressed={flagMode}
          title="מצב סימון דגלים (למסך מגע)"
        >
          <FlagGlyph className="ms-flag-toggle-glyph" /> דגל
        </button>
      </div>

      {/* The frame can be wider than the window (intermediate/expert boards), so
          it lives in its own LTR horizontal-scroll wrapper. Scrolling here rather
          than on the RTL window body is deliberate: an RTL scroll container treats
          this LTR overflow as off to the inline-start and never offers a scrollbar
          for it. The menu and hint stay outside, at window width. */}
      <div className="ms-scroll">
        <div className="ms-frame">
          <div className="ms-panel">
            <LedCounter value={level.mines - flagCount} />
            <button
              type="button"
              className="ms-face"
              onClick={() => reset()}
              aria-label="משחק חדש"
            >
              <Face status={status} pressed={pressed} />
            </button>
            <LedCounter value={time} />
          </div>

          <div
            ref={boardRef}
            className="ms-board"
            onMouseDown={() => inPlay && setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
          >
            {board.map((cell, i) => {
              if (cell.revealed) {
                return (
                  <div
                    key={i}
                    className={`ms-cell ms-cell--open${cell.exploded ? ' ms-cell--boom' : ''}`}
                  >
                    {cell.mine ? (
                      <MineGlyph className="ms-cell-glyph" />
                    ) : cell.adjacent > 0 ? (
                      <span className={`ms-num ms-num-${cell.adjacent}`}>{cell.adjacent}</span>
                    ) : null}
                  </div>
                )
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={`ms-cell ms-cell--hidden${cell.wrongFlag ? ' ms-cell--wrong' : ''}`}
                  onClick={() => onCellClick(i)}
                  onContextMenu={(e) => onCellContext(e, i)}
                  disabled={!inPlay && cell.mark !== 1}
                >
                  {cell.mark === 1 ? (
                    <FlagGlyph className="ms-cell-glyph" />
                  ) : cell.mark === 2 ? (
                    <span className="ms-question">?</span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <p className="ms-hint">
        קליק שמאלי לחשיפה · קליק ימני לדגל
        {' · '}
        במסך מגע הפעילו «דגל»
      </p>

      {result && (
        <ScoreDialog
          durationMs={result.durationMs}
          difficulty={result.difficulty}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}

/**
 * The win celebration → high-score registration flow, shown when the player
 * wins. Three stages: a yes/no prompt offering to register the score (with a
 * shot at a prize), a name+email form, and a thank-you. Closing at any stage
 * dismisses it (a "no" at the prompt). Rendered as its own modal layer above
 * the Minesweeper window.
 */
function ScoreDialog({
  durationMs,
  difficulty,
  onClose,
}: {
  durationMs: number
  difficulty: keyof typeof LEVELS
  onClose: () => void
}) {
  const [stage, setStage] = useState<'prompt' | 'register' | 'done'>('prompt')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'error'>('idle')
  // Synchronous re-entry guard against a fast double-submit (see TicketWizard).
  const submittingRef = useRef(false)

  // Same lenient email check used by the ticket wizard.
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const formValid = fullName.trim().length >= 2 && emailValid
  const seconds = (durationMs / 1000).toFixed(1)
  const saving = submitState === 'saving'

  async function handleSubmit() {
    if (submittingRef.current || !formValid) return
    submittingRef.current = true
    setSubmitState('saving')

    const ok = await logMinesweeperScore({
      full_name: fullName.trim(),
      email: email.trim(),
      duration_ms: durationMs,
      difficulty,
    })

    submittingRef.current = false
    if (ok) setStage('done')
    else setSubmitState('error')
  }

  return (
    <div className="xp-modal-overlay xp-modal-overlay--score" onClick={onClose} role="presentation">
      <div className="xp-modal xp-modal--popup" onClick={(e) => e.stopPropagation()}>
        {stage === 'prompt' && (
          <XPWindow title="ניצחת!" onClose={onClose}>
            <div className="ms-score">
              <p className="ms-score-lead">
                כל הכבוד! ניצחת ברמת {LEVEL_LABELS[difficulty]}!
              </p>
              <p className="ms-score-time">הזמן שלך: {seconds} שניות</p>
              <p>רוצה לרשום את התוצאה שלך? אולי תזכו בפרס!</p>
              <div className="ms-score-actions">
                <button
                  type="button"
                  className="xp-button xp-button--green"
                  onClick={() => setStage('register')}
                >
                  כן, אשמח
                </button>
                <button type="button" className="xp-button" onClick={onClose}>
                  לא תודה
                </button>
              </div>
            </div>
          </XPWindow>
        )}

        {stage === 'register' && (
          <XPWindow title="רישום תוצאה" onClose={onClose}>
            <div className="ms-score">
              <p className="ms-score-time">
                רמת {LEVEL_LABELS[difficulty]} · {seconds} שניות
              </p>
              <label className="field">
                <span className="field-label">שם מלא</span>
                <input
                  className="xp-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="הכנס/י את שמך המלא"
                />
              </label>
              <label className="field">
                <span className="field-label">דוא״ל</span>
                <input
                  className="xp-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="הכנס/י כתובת דוא״ל"
                />
              </label>

              {submitState === 'error' && (
                <p className="wizard-error">לא הצלחנו לשמור את התוצאה. אנא נסו שוב מאוחר יותר.</p>
              )}

              <div className="ms-score-actions">
                <button
                  type="button"
                  className="xp-button xp-button--green"
                  onClick={handleSubmit}
                  disabled={!formValid || saving}
                >
                  {saving ? 'שולח…' : 'שליחת התוצאה'}
                </button>
                <button type="button" className="xp-button" onClick={onClose} disabled={saving}>
                  ביטול
                </button>
              </div>
            </div>
          </XPWindow>
        )}

        {stage === 'done' && (
          <XPWindow title="התקבל!" onClose={onClose}>
            <div className="ms-score">
              <p className="ms-score-lead">
                התוצאה נשמרה!
              </p>
              <p>אם זכיתם בפרס - ניצור איתכם קשר. בהצלחה!</p>
              <div className="ms-score-actions">
                <button type="button" className="xp-button xp-button--green" onClick={onClose}>
                  סגירה
                </button>
              </div>
            </div>
          </XPWindow>
        )}
      </div>
    </div>
  )
}
