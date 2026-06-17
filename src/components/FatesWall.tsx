import { useState, type CSSProperties } from 'react'
import XPWindow from './XPWindow'

// "קיר הגורלות" — the wall of fates, inspired by the classic ששטוס segment.
// You get K keys. Each ball you flip reveals the next item in REVEALS, in
// order, no matter which ball you pick. After K flips the keys run out.
// See IMPLEMENTATION.md ("What's still left to fill").
const REVEALS: string[] = ['ששטוס', 'מסיבה', 'סופרגול', 'פוגים', 'קורנפלקס']
const K = REVEALS.length // number of keys === number of reveals

// How many balls hang on the wall (more than K, so there's a real choice).
const BALL_COUNT = 12

interface BallState {
  flipped: boolean
  reveal: string | null
}

const INITIAL: BallState[] = Array.from({ length: BALL_COUNT }, () => ({
  flipped: false,
  reveal: null,
}))

export default function FatesWall() {
  const [balls, setBalls] = useState<BallState[]>(INITIAL)
  const [keysUsed, setKeysUsed] = useState(0)

  const keysLeft = K - keysUsed
  const outOfKeys = keysLeft <= 0

  function pressBall(index: number) {
    if (outOfKeys || balls[index].flipped) return

    setBalls((prev) => {
      const next = [...prev]
      // The n-th flip always reveals REVEALS[n] — deterministic, like the show.
      next[index] = { flipped: true, reveal: REVEALS[keysUsed] }
      return next
    })
    setKeysUsed((n) => n + 1)
  }

  function reset() {
    setBalls(INITIAL)
    setKeysUsed(0)
  }

  return (
    <XPWindow title="קיר הגורלות — ששטוס.exe" icon="🔮">
      <div className="fates">
        <div className="fates-header">
          <p className="fates-intro">
            בחרו כדור, הפכו אותו, וגלו מה מחכה בקפסולה. יש לכם{' '}
            <strong>{K} מפתחות</strong> — בדיוק כמו פעם.
          </p>
          <div className="fates-keys" aria-live="polite">
            <span className="fates-keys-icon" aria-hidden="true">
              🔑
            </span>
            {outOfKeys ? 'אזלו המפתחות' : `נותרו ${keysLeft} מפתחות`}
          </div>
        </div>

        <div className={'fates-wall' + (outOfKeys ? ' is-locked' : '')}>
          {balls.map((ball, i) => (
            <button
              type="button"
              key={i}
              className={
                'fate-ball' +
                (ball.flipped ? ' is-flipped' : '') +
                (outOfKeys && !ball.flipped ? ' is-disabled' : '')
              }
              style={{ '--ball-hue': `${(i * 31) % 360}deg` } as CSSProperties}
              onClick={() => pressBall(i)}
              disabled={ball.flipped || outOfKeys}
              aria-label={ball.flipped ? `נחשף: ${ball.reveal}` : `כדור ${i + 1}`}
            >
              <span className="fate-ball-inner">
                <span className="fate-front">
                  <span className="fate-number">{i + 1}</span>
                  {outOfKeys && !ball.flipped && (
                    <span className="fate-lock" aria-hidden="true">
                      🔒
                    </span>
                  )}
                </span>
                <span className="fate-back">{ball.reveal}</span>
              </span>
            </button>
          ))}
        </div>

        {outOfKeys && (
          <div className="fates-footer">
            <p className="fates-soldout">🔒 מהדורות חדשות יוצגו בעתיד…</p>
            <button type="button" className="xp-button fates-reset" onClick={reset}>
              ↻ קיר חדש
            </button>
          </div>
        )}
      </div>
    </XPWindow>
  )
}
