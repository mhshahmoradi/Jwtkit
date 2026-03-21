export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type JwtParseResult = {
  isValid: boolean
  error: string | null
  token: string
  header: Record<string, JsonValue> | null
  payload: Record<string, JsonValue> | null
  signature: string | null
  partsCount: number
}

export type ClaimDetail = {
  key: string
  value: string
  type: string
  details: string
  timestamp: string | null
  isTimestamp: boolean
  learnMoreUrl: string | null
}
