import { useRef, useState, type FormEvent } from 'react'
import XPWindow from './XPWindow'
import Icon from './Icon'
import { EVENT } from '../lib/config'
import { isSupabaseConfigured, logNotifySignup } from '../lib/supabase'

type SubmitState = 'idle' | 'saving' | 'done' | 'error'

// Lenient checks - enough to catch typos without rejecting real input.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Reduce whatever the visitor typed or pasted to a bare number, which is also
// what gets saved: "050-123 4567" -> "0501234567", "+972 (50) 123-4567" ->
// "+972501234567". Drops every separator - spaces, dots, brackets and dashes,
// including typographic ones (Word turns "-" into "\u2013") - plus the invisible
// bidi marks that copying a number from WhatsApp or Hebrew text wraps it in.
// Without those last two, a pasted number would fail PHONE_RE and the button
// would stay disabled for no visible reason.
function cleanPhone(raw: string): string {
  return raw.replace(/[\s().\-\u2010-\u2015\u2212\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
}

// A cleaned number must be one of:
//  1. Israeli, local format: mobiles (05X) and 07X numbers are exactly 10 digits
//     ("0501234567"); landlines (02/03/04/08/09) are exactly 9 ("031234567").
//     So "050123456" - a mobile missing a digit - is rejected.
//  2. Israeli, international format: the same number after 972 without its
//     leading 0 ("+972501234567"), written with "+", "00" or nothing in front.
//     The common slip of keeping the 0 ("+9720501234567") is accepted too.
//  3. Foreign: "+" or "00", a country code other than 972 (which must match
//     rule 2), and 8-15 digits in total (the E.164 maximum).
const PHONE_RE =
  /^(?:0(?:[57]\d{8}|[2-489]\d{7})|(?:\+|00)?9720?(?:[57]\d{8}|[2-489]\d{7})|(?:\+|00)(?!972)[1-9]\d{7,14})$/

/**
 * "אשף ההרשמה לעדכונים" - the post-festival signup window, in the slot the
 * ticket wizard used to fill (the Start button, hero sticker and desktop icon
 * all scroll here). The festival is over, but there may be another one, so
 * visitors leave their name, email and phone to hear about it first. Rows go to
 * the `notify_signups` Supabase table. There's no redirect here, unlike the old
 * ticket flow, so a failed save shows an error and the visitor can retry.
 */
export default function NotifySignup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  // Set when the phone field loses focus, so the "invalid number" hint doesn't
  // flash while the visitor is still typing.
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  // Synchronous re-entry guard. The button's `disabled` only takes effect after
  // a re-render, so a fast double-click (or click + Enter) could otherwise fire
  // two submits before React disables it.
  const submittingRef = useRef(false)

  const phoneValid = PHONE_RE.test(cleanPhone(phone))
  // The exact Israeli digit counts aren't obvious, so say why the button is
  // disabled rather than leaving the visitor to guess.
  const phoneError = phoneTouched && phone.trim() !== '' && !phoneValid
  const formValid = fullName.trim().length >= 2 && EMAIL_RE.test(email.trim()) && phoneValid
  const saving = submitState === 'saving'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current || !formValid) return
    submittingRef.current = true
    setSubmitState('saving')

    const ok = await logNotifySignup({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: cleanPhone(phone),
    })

    submittingRef.current = false
    setSubmitState(ok ? 'done' : 'error')
  }

  return (
    <XPWindow
      title="אשף ההרשמה לעדכונים"
      icon={<Icon name="calendar" e="📅" />}
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
    >
      <div className="wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">הפסטיבל הסתיים... אבל אולי נחזור!</h2>
          <p className="wizard-subtitle">
            פסטיבל נוסטלגיה התקיים ב־{EVENT.dateLabel}. רוצים לשמוע ראשונים אם יהיה פסטיבל
            נוסף? השאירו פרטים ונעדכן אתכם.
          </p>
        </div>

        {submitState === 'done' ? (
          <div className="wizard-body">
            <div className="price-box" role="status">
              <span className="price-box-label">ההרשמה הושלמה</span>
              <span className="price-box-value">
                נתראה! <Icon name="party" e="🎉" />
              </span>
              <span className="price-box-note">נעדכן אתכם ראשונים כשיהיו חדשות על הפסטיבל הבא.</span>
            </div>
          </div>
        ) : (
          <form className="wizard-body" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">שם מלא</span>
              <input
                className="xp-input"
                type="text"
                name="name"
                autoComplete="name"
                maxLength={200}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="הכנס/י את שמך המלא"
              />
            </label>

            <label className="field">
              <span className="field-label">דוא״ל</span>
              <input
                className="xp-input xp-input--ltr"
                type="email"
                name="email"
                autoComplete="email"
                maxLength={320}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </label>

            <label className="field">
              <span className="field-label">טלפון</span>
              <input
                className="xp-input xp-input--ltr"
                type="tel"
                name="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={40}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setPhoneTouched(true)}
                aria-invalid={phoneError || undefined}
                aria-describedby={phoneError ? 'phone-error' : undefined}
                placeholder="050-1234567"
              />
              {phoneError && (
                <span id="phone-error" className="field-error">
                  מספר הטלפון לא תקין. לדוגמה: 050-1234567
                </span>
              )}
            </label>

            {submitState === 'error' && (
              <p className="wizard-error" role="alert">
                {isSupabaseConfigured
                  ? 'אופס, משהו השתבש בשמירת הפרטים. אנא נסו שוב.'
                  : 'מצב הדגמה: Supabase עדיין לא הוגדר (ראו SUPABASE_SETUP.md), ולכן הפרטים לא נשמרו.'}
              </p>
            )}

            <button
              type="submit"
              className="xp-button xp-button--green wizard-pay"
              disabled={!formValid || saving}
            >
              {saving ? 'רק רגע…' : <><Icon name="mail" e="✉️" /> עדכנו אותי!</>}
            </button>

            <p className="wizard-fineprint">
              בלחיצה על הכפתור אני מאשר/ת לקבל עדכונים על אירועים עתידיים בדוא״ל ובטלפון. אפשר
              לבקש הסרה מהרשימה בכל עת.
            </p>
          </form>
        )}
      </div>
    </XPWindow>
  )
}
