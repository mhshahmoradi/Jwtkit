import type { ClaimDetail, JsonValue, JwtParseResult } from '../types/jwt'
import type { CalendarType } from '../context/settings'
import { formatTimestamp as formatTs, formatTimestampShort } from './time'

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

const CLAIM_LEARN_MORE: Record<string, string> = {
  alg: 'https://www.rfc-editor.org/rfc/rfc7515#section-4.1.1',
  typ: 'https://www.rfc-editor.org/rfc/rfc7519#section-5.1',
  kid: 'https://www.rfc-editor.org/rfc/rfc7515#section-4.1.4',
  x5t: 'https://www.rfc-editor.org/rfc/rfc7515#section-4.1.7',
  iss: 'https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1',
  sub: 'https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2',
  aud: 'https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3',
  exp: 'https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4',
  nbf: 'https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5',
  iat: 'https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6',
  jti: 'https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7',
  auth_time: 'https://openid.net/specs/openid-connect-core-1_0.html#IDToken',
}

export const EXAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTIwNDAzMDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const formatTimestamp = (value: number, timezone: string, calendar: CalendarType): string => {
  const full = formatTs(value, timezone, calendar)
  const short = formatTimestampShort(value, timezone, calendar)
  return `${short} (${full})`
}

const normalizeBase64Url = (value: string): string => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const padding = normalized.length % 4
  if (padding === 0) {
    return normalized
  }
  return normalized + '='.repeat(4 - padding)
}

const decodeBase64UrlToBytes = (value: string): Uint8Array => {
  const normalized = normalizeBase64Url(value)
  const binary = atob(normalized)
  return Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0)
}

const decodeBase64Url = (value: string): string => {
  return new TextDecoder().decode(decodeBase64UrlToBytes(value))
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

const getTimestamp = (key: string, value: JsonValue, timezone: string, calendar: CalendarType): string | null => {
  if (TIMESTAMP_CLAIMS.has(key) && typeof value === 'number') {
    return formatTimestamp(value, timezone, calendar)
  }
  return null
}

export const extractClaimDetails = (
  payload: Record<string, JsonValue> | null,
  timezone: string = 'local',
  calendar: CalendarType = 'gregorian',
): ClaimDetail[] => {
  if (!payload) {
    return []
  }

  return Object.entries(payload).map(([key, value]) => ({
    key,
    value: displayValue(value),
    type: valueType(value),
    details: getClaimDetails(key, value),
    timestamp: getTimestamp(key, value, timezone, calendar),
    isTimestamp: TIMESTAMP_CLAIMS.has(key) && typeof value === 'number',
    learnMoreUrl: CLAIM_LEARN_MORE[key] ?? null,
  }))
}

const ALG_MAP: Record<string, { hash: string }> = {
  HS256: { hash: 'SHA-256' },
  HS384: { hash: 'SHA-384' },
  HS512: { hash: 'SHA-512' },
}

const getSecretKeyBytes = (secret: string, isBase64Encoded: boolean): Uint8Array => {
  if (isBase64Encoded) {
    return decodeBase64UrlToBytes(secret)
  }
  return new TextEncoder().encode(secret)
}

export const verifySignature = async (
  token: string,
  secret: string,
  isBase64Encoded: boolean,
): Promise<boolean> => {
  const trimmed = token.trim()
  if (!trimmed || !secret) return false

  const parts = trimmed.split('.')
  if (parts.length !== 3 || !parts[2]) return false

  try {
    const headerJson = decodeBase64Url(parts[0])
    const header = JSON.parse(headerJson)
    const alg = header?.alg as string | undefined
    if (!alg || !ALG_MAP[alg]) return false

    const { hash } = ALG_MAP[alg]
    const keyBytes = getSecretKeyBytes(secret, isBase64Encoded)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes.buffer as ArrayBuffer,
      { name: 'HMAC', hash },
      false,
      ['verify'],
    )

    const signatureInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    const signatureBytes = decodeBase64UrlToBytes(parts[2])

    return await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes.buffer as ArrayBuffer, signatureInput.buffer as ArrayBuffer)
  } catch {
    return false
  }
}
