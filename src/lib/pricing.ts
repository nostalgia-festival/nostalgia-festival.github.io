// ---------------------------------------------------------------------------
// Ticket pricing.
//
// !!! PLACEHOLDER PRICE !!!
// The price is calculated from the number of tickets. Replace BASE_PRICE with
// the management's real per-ticket price before launch. See IMPLEMENTATION.md.
// ---------------------------------------------------------------------------

// Base price per ticket, in ILS.
export const BASE_PRICE = 180

export interface PriceInput {
  numTickets: number
}

export interface PriceResult {
  total: number
  perTicket: number
  currency: string
}

export function calculatePrice({ numTickets }: PriceInput): PriceResult {
  const tickets = Math.max(1, Math.floor(numTickets || 1))
  const perTicket = BASE_PRICE
  const total = perTicket * tickets

  return {
    total,
    perTicket,
    currency: '₪',
  }
}

export function formatPrice(amount: number, currency = '₪'): string {
  return `${currency}${amount.toLocaleString('he-IL')}`
}
