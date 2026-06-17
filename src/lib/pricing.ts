// ---------------------------------------------------------------------------
// Ticket pricing.
//
// !!! PLACEHOLDER LOGIC !!!
// The brief says the price is "calculated according to what they fill" (number
// of tickets, age, and who they're coming with) but does not specify the actual
// numbers. The scheme below is a reasonable placeholder — replace the constants
// and rules with the management's real pricing before launch. See IMPLEMENTATION.md.
// ---------------------------------------------------------------------------

export type Companion = 'friends' | 'family' | 'kids' | 'solo'

export const COMPANION_OPTIONS: { value: Companion; label: string; emoji: string }[] = [
  { value: 'friends', label: 'עם חברים', emoji: '🧑‍🤝‍🧑' },
  { value: 'family', label: 'עם המשפחה', emoji: '👨‍👩‍👧‍👦' },
  { value: 'kids', label: 'עם הילדים', emoji: '🧒' },
  { value: 'solo', label: 'לבד (וזה בסדר גמור)', emoji: '🕺' },
]

// Base price per ticket, in ILS.
export const BASE_PRICE = 149

// Discount applied based on who you're coming with (group / family vibes).
const COMPANION_DISCOUNT: Record<Companion, number> = {
  friends: 0.05, // small group discount
  family: 0.1,
  kids: 0.15, // family-with-kids discount
  solo: 0,
}

export interface PriceInput {
  numTickets: number
  age: number | null
  companion: Companion | null
}

export interface PriceResult {
  total: number
  perTicket: number
  appliedDiscountPct: number
  currency: string
}

export function calculatePrice({ numTickets, age, companion }: PriceInput): PriceResult {
  const tickets = Math.max(1, Math.floor(numTickets || 1))

  const companionDiscount = companion ? COMPANION_DISCOUNT[companion] : 0

  // Age-based discount for the buyer (PLACEHOLDER): kids and seniors pay less.
  let ageDiscount = 0
  if (age != null) {
    if (age <= 12) ageDiscount = 0.5
    else if (age >= 65) ageDiscount = 0.2
  }

  // Use the better of the two discounts (they don't stack).
  const discount = Math.max(companionDiscount, ageDiscount)

  const perTicket = Math.round(BASE_PRICE * (1 - discount))
  const total = perTicket * tickets

  return {
    total,
    perTicket,
    appliedDiscountPct: Math.round(discount * 100),
    currency: '₪',
  }
}

export function formatPrice(amount: number, currency = '₪'): string {
  return `${currency}${amount.toLocaleString('he-IL')}`
}
