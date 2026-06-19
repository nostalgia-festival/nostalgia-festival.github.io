import { useMemo, useState } from 'react'
import XPWindow from './XPWindow'
import Icon from './Icon'
import { CONFIG } from '../lib/config'
import { isSupabaseConfigured, logTicketClick } from '../lib/supabase'
import { calculatePrice, formatPrice } from '../lib/pricing'

type SubmitState = 'idle' | 'saving' | 'redirecting' | 'error'

/**
 * The "אשף רכישת כרטיסים" (ticket purchase wizard). A single step: the buyer
 * enters their name and how many tickets they want, the price is calculated
 * live, and the button logs the intent to Supabase then redirects straight to
 * the payment service. Data is captured BEFORE the redirect because we may not
 * be able to bring the user back after they pay.
 */
export default function TicketWizard() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [numTickets, setNumTickets] = useState(1)

  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const price = useMemo(() => calculatePrice({ numTickets }), [numTickets])

  // Simple email sanity check — enough to catch typos without over-validating.
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const formValid = fullName.trim().length >= 2 && emailValid && numTickets >= 1

  async function handlePurchase() {
    setSubmitState('saving')

    // Log first — but never let a logging failure block the user from paying.
    await logTicketClick({
      full_name: fullName.trim(),
      email: email.trim(),
      num_tickets: numTickets,
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

  const busy = submitState === 'saving' || submitState === 'redirecting'

  return (
    <XPWindow
      title="אשף רכישת הכרטיסים"
      icon={<Icon name="tickets" e="🎟️" />}
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
      className="wizard-window"
    >
      <div className="wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">רכישת כרטיסים</h2>
          <p className="wizard-notice">מכירת הכרטיסים עד גמר המלאי</p>
        </div>

        <div className="wizard-body">
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

          <button
            className="xp-button xp-button--green wizard-pay"
            onClick={handlePurchase}
            disabled={!formValid || busy}
          >
            {busy ? 'רק רגע…' : <><Icon name="payment" e="💳" /> מעבר לתשלום מאובטח</>}
          </button>
        </div>
      </div>
    </XPWindow>
  )
}
