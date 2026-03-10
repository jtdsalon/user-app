/** Root-level actions that affect the entire store */

export const RESET = 'RESET' as const

export const resetStore = () => ({ type: RESET } as const)
