import { For, Show, createMemo, createSignal, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Copy, Maximize2, Minimize2 } from 'lucide-solid'
import type { ClaimDetail, JsonValue } from '../types/jwt'

type DecodedCardProps = {
  title?: string
  json: Record<string, JsonValue> | null
  claims: ClaimDetail[]
  colorClass: string
}

const TIMESTAMP_KEYS = new Set(['exp', 'iat', 'nbf', 'auth_time'])

const escapeHtml = (str: string): string =>
  str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const formatTimestampTooltip = (value: number): string => {
  const ms = value > 1_000_000_000_000 ? value : value * 1000
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return ''
  return date.toString()
}

const highlightJson = (obj: Record<string, JsonValue> | null): string => {
  if (!obj) return '{}'
  const lines: string[] = ['{']
  const entries = Object.entries(obj)

  entries.forEach(([key, value], i) => {
    const comma = i < entries.length - 1 ? ',' : ''
    const escapedKey = escapeHtml(key)

    if (TIMESTAMP_KEYS.has(key) && typeof value === 'number') {
      const tooltip = escapeHtml(formatTimestampTooltip(value))
      lines.push(
        `  <span class="json-key">"${escapedKey}"</span>: <span class="json-number json-timestamp" data-tooltip="${tooltip}">${value}</span>${comma}`
      )
    } else if (typeof value === 'string') {
      lines.push(
        `  <span class="json-key">"${escapedKey}"</span>: <span class="json-string">"${escapeHtml(value)}"</span>${comma}`
      )
    } else if (typeof value === 'number') {
      lines.push(
        `  <span class="json-key">"${escapedKey}"</span>: <span class="json-number">${value}</span>${comma}`
      )
    } else if (typeof value === 'boolean') {
      lines.push(
        `  <span class="json-key">"${escapedKey}"</span>: <span class="json-boolean">${value}</span>${comma}`
      )
    } else if (value === null) {
      lines.push(
        `  <span class="json-key">"${escapedKey}"</span>: <span class="json-null">null</span>${comma}`
      )
    } else if (Array.isArray(value)) {
      const inner = value.map((v) =>
        typeof v === 'string'
          ? `    <span class="json-string">"${escapeHtml(v)}"</span>`
          : `    ${escapeHtml(JSON.stringify(v))}`
      )
      lines.push(
        `  <span class="json-key">"${escapedKey}"</span>: [`,
        inner.join(',\n'),
        `  ]${comma}`
      )
    } else {
      lines.push(
        `  <span class="json-key">"${escapedKey}"</span>: ${escapeHtml(JSON.stringify(value))}${comma}`
      )
    }
  })

  lines.push('}')
  return lines.join('\n')
}

const CardContent = (props: {
  tab: 'json' | 'claims'
  setTab: (t: 'json' | 'claims') => void
  claims: ClaimDetail[]
  highlightedJson: string
  jsonString: string
  expanded: boolean
  onCopy: () => void
  onToggleExpand: () => void
}) => (
  <>
    <div class="card-head">
      <div class="tabs">
        <button
          type="button"
          class={props.tab === 'json' ? 'tab active' : 'tab'}
          onClick={() => props.setTab('json')}
        >
          JSON
        </button>
        <button
          type="button"
          class={props.tab === 'claims' ? 'tab active' : 'tab'}
          onClick={() => props.setTab('claims')}
        >
          Claims Breakdown
        </button>
      </div>
      <div class="card-head-actions">
        <button type="button" class="card-action-btn" title="Copy" onClick={props.onCopy}>
          <Copy size={14} />
        </button>
        <button type="button" class="card-action-btn" title={props.expanded ? 'Collapse' : 'Expand'} onClick={props.onToggleExpand}>
          {props.expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
    <Show
      when={props.tab === 'json'}
      fallback={
        <div class="claims-table-wrap">
          <Show
            when={props.claims.length > 0}
            fallback={<p class="muted claims-empty">No claims available</p>}
          >
            <table class="claims-table">
              <tbody>
                <For each={props.claims}>
                  {(claim) => (
                    <>
                      <tr class="claim-row">
                        <td class="claim-key">
                          <code>{claim.key}</code>
                        </td>
                        <td class="claim-value">
                          <Show when={claim.isTimestamp}>
                            <span class="claim-timestamp">
                              {claim.value} ({claim.timestamp})
                            </span>
                          </Show>
                          <Show when={!claim.isTimestamp}>
                            <span>{claim.value}</span>
                          </Show>
                        </td>
                        <td class="claim-desc">
                          <Show when={claim.details}>
                            <span>{claim.details}</span>
                          </Show>
                        </td>
                      </tr>
                      <Show when={claim.isTimestamp}>
                        <tr class="claim-note-row">
                          <td colspan="3">
                            This value must be a <code class="inline-code">NumericDate</code> type, representing seconds.
                          </td>
                        </tr>
                      </Show>
                    </>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </div>
      }
    >
      <pre class="json-display" innerHTML={props.highlightedJson} />
    </Show>
  </>
)

const DecodedCard = (props: DecodedCardProps) => {
  const [tab, setTab] = createSignal<'json' | 'claims'>('claims')
  const [expanded, setExpanded] = createSignal(false)

  const jsonString = createMemo(() => {
    if (!props.json) return '{}'
    return JSON.stringify(props.json, null, 2)
  })

  const highlightedJson = createMemo(() => highlightJson(props.json))

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString())
  }

  const toggleExpand = () => {
    setExpanded(!expanded())
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && expanded()) setExpanded(false)
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown))
  }

  return (
    <section class={`decoded-card ${props.colorClass}`}>
      <Show when={props.title}>
        <h3>{props.title}</h3>
      </Show>
      <div class="card">
        <CardContent
          tab={tab()}
          setTab={setTab}
          claims={props.claims}
          highlightedJson={highlightedJson()}
          jsonString={jsonString()}
          expanded={expanded()}
          onCopy={handleCopy}
          onToggleExpand={toggleExpand}
        />
      </div>

      <Show when={expanded()}>
        <Portal>
          <div class="expand-overlay" onClick={toggleExpand}>
            <div class="expand-modal" onClick={(e) => e.stopPropagation()}>
              <div class="expand-modal-header">
                <h3>{props.title}</h3>
              </div>
              <div class="card expand-card">
                <CardContent
                  tab={tab()}
                  setTab={setTab}
                  claims={props.claims}
                  highlightedJson={highlightedJson()}
                  jsonString={jsonString()}
                  expanded={expanded()}
                  onCopy={handleCopy}
                  onToggleExpand={toggleExpand}
                />
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </section>
  )
}

export default DecodedCard
