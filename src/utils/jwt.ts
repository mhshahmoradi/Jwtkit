import type { ClaimDetail, JsonValue, JwtParseResult } from '../types/jwt'

const CLAIM_EXPLANATIONS: Record<string, string> = {
  alg: 'The algorithm used to sign the JWT.',
  typ: 'The media type of this complete JWT.',
  kid: 'The key ID is a hint indicating which key was used to secure the JWS.',
  x5t: 'X.509 certificate SHA-1 thumbprint for the key used to digitally sign the JWS.',
  iss: 'The issuer of the JWT.',
  sub: 'The subject of the JWT (the user).',
  aud: 'The audience that should accept this token.',
  exp: 'The expiration time on or after which the JWT MUST NOT be accepted for processing.',
  nbf: 'The time before which the JWT MUST NOT be accepted for processing.',
  iat: 'The time at which the JWT was issued.',
  jti: 'The unique identifier for the JWT.',
  auth_time: 'The time when the End-User authentication occurred.',
  name: 'Display name for the subject.',
  email: 'Email address claim.',
  role: 'Role or access group information.',
  scope: 'Space-delimited list of permissions.',
  client_id: 'The client identifier.',
  idp: 'The identity provider.',
  amr: 'Authentication methods references.',
  tenant: 'The tenant identifier.',
}

export const EXAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTIwNDAzMDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const formatTimestamp = (value: number): string => {
  const milliseconds = value > 1_000_000_000_000 ? value : value * 1000
  const date = new Date(milliseconds)
  if (Number.isNaN(date.getTime())) {
    return 'Invalid timestamp'
  }
  return `${date.toLocaleString()} (${date.toISOString()})`
}

const normalizeBase64Url = (value: string): string => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const padding = normalized.length % 4
  if (padding === 0) {
    return normalized
  }
  return normalized + '='.repeat(4 - padding)
}

const decodeBase64Url = (value: string): string => {
  const normalized = normalizeBase64Url(value)
  const binary = atob(normalized)
  const bytes = Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0)
  return new TextDecoder().decode(bytes)
}

const parseJson = (text: string): Record<string, JsonValue> => {
  const parsed = JSON.parse(text)
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('JWT section is not a JSON object')
  }
  return parsed as Record<string, JsonValue>
}

export const parseJwt = (tokenInput: string): JwtParseResult => {
  const token = tokenInput.trim()

  if (!token) {
    return {
      isValid: false,
      error: 'Paste a JWT token to decode',
      token,
      header: null,
      payload: null,
      signature: null,
      partsCount: 0,
    }
  }

  const parts = token.split('.')

  if (parts.length < 2 || parts.length > 3) {
    return {
      isValid: false,
      error: 'JWT must contain 2 or 3 dot-separated parts',
      token,
      header: null,
      payload: null,
      signature: null,
      partsCount: parts.length,
    }
  }

  try {
    const header = parseJson(decodeBase64Url(parts[0]))
    const payload = parseJson(decodeBase64Url(parts[1]))

    return {
      isValid: true,
      error: null,
      token,
      header,
      payload,
      signature: parts[2] ?? null,
      partsCount: parts.length,
    }
  } catch {
    return {
      isValid: false,
      error: 'Unable to decode token. Make sure it is a valid JWT.',
      token,
      header: null,
      payload: null,
      signature: null,
      partsCount: parts.length,
    }
  }
}

const valueType = (value: JsonValue): string => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

const displayValue = (value: JsonValue): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value === null) return 'null'
  return JSON.stringify(value)
}

const TIMESTAMP_CLAIMS = new Set(['exp', 'iat', 'nbf', 'auth_time'])

const getClaimDetails = (key: string, _value: JsonValue): string => {
  return CLAIM_EXPLANATIONS[key] ?? ''
}

const getTimestamp = (key: string, value: JsonValue): string | null => {
  if (TIMESTAMP_CLAIMS.has(key) && typeof value === 'number') {
    return formatTimestamp(value)
  }
  return null
}

export const extractClaimDetails = (payload: Record<string, JsonValue> | null): ClaimDetail[] => {
  if (!payload) {
    return []
  }

  return Object.entries(payload).map(([key, value]) => ({
    key,
    value: displayValue(value),
    type: valueType(value),
    details: getClaimDetails(key, value),
    timestamp: getTimestamp(key, value),
    isTimestamp: TIMESTAMP_CLAIMS.has(key) && typeof value === 'number',
  }))
}
