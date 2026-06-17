import { useMemo, useState } from 'react'
import XPWindow from './XPWindow'
import { CONFIG } from '../lib/config'
import { isSupabaseConfigured, logTicketClick } from '../lib/supabase'
import {
  calculatePrice,
  COMPANION_OPTIONS,
  formatPrice,
  type Companion,
} from '../lib/pricing'

const TOTAL_STEPS = 3

type SubmitState = 'idle' | 'saving' | 'redirecting' | 'error'

/**
 * The "אשף רכישת כרטיסים" (ticket purchase wizard). Collects the buyer details
 * the brief requires — name, age, number of tickets, who they're coming with —
 * computes the price, logs the intent to Supabase, then redirects to the
 * payment service. Data is captured BEFORE the redirect because we may not be
 * able to bring the user back after they pay.
 */
export default function TicketWizard() {
  const [step, setStep] = useState(1)

  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState<string>('')
  const [numTickets, setNumTickets] = useState(1)
  const [companion, setCompanion] = useState<Companion | null>(null)

  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const ageNum = age.trim() === '' ? null : Number(age)

  const price = useMemo(
    () => calculatePrice({ numTickets, age: ageNum, companion }),
    [numTickets, ageNum, companion],
  )

  // Per-step validation gates the "next" / "submit" buttons.
  const step1Valid = fullName.trim().length >= 2 && ageNum != null && ageNum > 0 && ageNum < 120
  const step2Valid = numTickets >= 1 && companion != null

  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  const goBack = () => setStep((s) => Math.max(1, s - 1))

  async function handlePurchase() {
    setSubmitState('saving')

    // Log first — but never let a logging failure block the user from paying.
    await logTicketClick({
      full_name: fullName.trim(),
      age: ageNum,
      num_tickets: numTickets,
      companions: companion,
      calculated_price: price.total,
    })

    if (CONFIG.paymentUrl) {
      setSubmitState('redirecting')
      window.location.href = CONFIG.paymentUrl
    } else {
      // No payment URL configured (e.g. local dev) — show a placeholder notice.
      setSubmitState('error')
    }
  }

  const progressPct = (step / TOTAL_STEPS) * 100

  return (
    <XPWindow
      title={`אשף רכישת כרטיסים — שלב ${step} מתוך ${TOTAL_STEPS} 🎟️`}
      icon="🎟️"
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
      className="wizard-window"
    >
      <div className="wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">🎟️ אשף רכישת כרטיסים</h2>
          <p className="wizard-subtitle">מלאו את הפרטים לחישוב המחיר</p>
        </div>

        <div className="wizard-progress" aria-hidden="true">
          <div className="wizard-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Step dots. Rendered RTL by the page so step 1 sits on the right. */}
        <ol className="wizard-steps" aria-label={`שלב ${step} מתוך ${TOTAL_STEPS}`}>
          {[1, 2, 3].map((n) => (
            <li
              key={n}
              className={
                'wizard-step-dot' +
                (n === step ? ' is-active' : '') +
                (n < step ? ' is-done' : '')
              }
            >
              {n < step ? '✓' : n}
            </li>
          ))}
        </ol>

        {/* ---- Step 1: name + age ---- */}
        {step === 1 && (
          <div className="wizard-body">
            <label className="field">
              <span className="field-label">שם מלא</span>
              <input
                className="xp-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="הכנס/י את שמך המלא"
                autoFocus
              />
            </label>

            <label className="field">
              <span className="field-label">גיל</span>
              <input
                className="xp-input"
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="הכנס/י גיל"
              />
            </label>

            <button className="xp-button wizard-next" disabled={!step1Valid} onClick={goNext}>
              הבא →
            </button>
          </div>
        )}

        {/* ---- Step 2: number of tickets + companions ---- */}
        {step === 2 && (
          <div className="wizard-body">
            <label className="field">
              <span className="field-label">כמה כרטיסים?</span>
              <div className="stepper">
                <button
                  type="button"
                  className="xp-button stepper-btn"
                  onClick={() => setNumTickets((n) => Math.max(1, n - 1))}
                  aria-label="פחות כרטיסים"
                >
                  −
                </button>
                <span className="stepper-value">{numTickets}</span>
                <button
                  type="button"
                  className="xp-button stepper-btn"
                  onClick={() => setNumTickets((n) => Math.min(20, n + 1))}
                  aria-label="עוד כרטיסים"
                >
                  +
                </button>
              </div>
            </label>

            <fieldset className="field companions">
              <legend className="field-label">עם מי אתם מגיעים?</legend>
              <div className="companion-grid">
                {COMPANION_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    className={
                      'companion-option' + (companion === opt.value ? ' is-selected' : '')
                    }
                    onClick={() => setCompanion(opt.value)}
                  >
                    <span className="companion-emoji">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="wizard-nav">
              <button className="xp-button" onClick={goBack}>
                ← חזרה
              </button>
              <button className="xp-button wizard-next" disabled={!step2Valid} onClick={goNext}>
                הבא →
              </button>
            </div>
          </div>
        )}

        {/* ---- Step 3: summary + price + pay ---- */}
        {step === 3 && (
          <div className="wizard-body">
            <div className="summary">
              <div className="summary-row">
                <span>שם</span>
                <strong>{fullName}</strong>
              </div>
              <div className="summary-row">
                <span>גיל</span>
                <strong>{ageNum}</strong>
              </div>
              <div className="summary-row">
                <span>כרטיסים</span>
                <strong>{numTickets}</strong>
              </div>
              <div className="summary-row">
                <span>מגיעים</span>
                <strong>
                  {COMPANION_OPTIONS.find((o) => o.value === companion)?.label ?? '—'}
                </strong>
              </div>
              {price.appliedDiscountPct > 0 && (
                <div className="summary-row summary-row--discount">
                  <span>הנחה</span>
                  <strong>{price.appliedDiscountPct}%-</strong>
                </div>
              )}
            </div>

            <div className="price-box">
              <span className="price-box-label">סה״כ לתשלום</span>
              <span className="price-box-value">{formatPrice(price.total, price.currency)}</span>
              <span className="price-box-note">
                ({formatPrice(price.perTicket, price.currency)} × {numTickets} כרטיסים)
              </span>
            </div>

            {submitState === 'error' && (
              <p className="wizard-error">
                {isSupabaseConfigured
                  ? 'קישור התשלום עדיין לא הוגדר. הפרטים נשמרו — אנא נסו שוב מאוחר יותר.'
                  : 'מצב הדגמה: קישור התשלום וה-Supabase עדיין לא הוגדרו (ראו SUPABASE_SETUP.md).'}
              </p>
            )}

            <div className="wizard-nav">
              <button className="xp-button" onClick={goBack} disabled={submitState === 'saving'}>
                ← חזרה
              </button>
              <button
                className="xp-button xp-button--green wizard-pay"
                onClick={handlePurchase}
                disabled={submitState === 'saving' || submitState === 'redirecting'}
              >
                {submitState === 'saving' || submitState === 'redirecting'
                  ? 'רק רגע…'
                  : `💳 מעבר לתשלום מאובטח`}
              </button>
            </div>
          </div>
        )}
      </div>
    </XPWindow>
  )
}
