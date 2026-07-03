/** Predefined services a sitter can offer. */
export const SITTER_SERVICES = [
  { id: 'sitting-at-sitter-home', label: 'Sitting at my home', icon: '🏠' },
  { id: 'sitting-at-owner-home', label: "Sitting at pet owner's home", icon: '🏡' },
  { id: 'dog-walking', label: 'Dog walking', icon: '🐕‍🦺' },
  { id: 'cat-sitting', label: 'Cat sitting', icon: '🐈' },
  { id: 'overnight-stay', label: 'Overnight stay', icon: '🌙' },
  { id: 'drop-in-visits', label: 'Drop-in visits', icon: '👋' },
  { id: 'pet-grooming', label: 'Pet grooming', icon: '✂️' },
  { id: 'pet-taxi', label: 'Pet taxi (vet visits, etc.)', icon: '🚗' },
] as const

export type ServiceId = (typeof SITTER_SERVICES)[number]['id']

/** Convert comma-separated DB string → array of service IDs */
export function parseServices(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

/** Convert array of service IDs → comma-separated string for DB */
export function serializeServices(services: string[]): string {
  return services.filter(Boolean).join(', ')
}
