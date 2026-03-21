import { createMemo, Show } from 'solid-js'
import { Copy } from 'lucide-solid'

type TokenInputCardProps = {
  token: string
  onTokenChange: (value: string) => void
  isValid: boolean
  signatureVerified: boolean
}

const TokenInputCard = (props: TokenInputCardProps) => {
  let textareaRef: HTMLTextAreaElement | undefined

  const coloredHtml = createMemo(() => {
    const t = props.token
    if (!t) return ''
    const parts = t.split('.')
    if (parts.length < 2) return `<span class="jwt-header">${t}</span>`
    const header = parts[0]
    const payload = parts[1]
    const signature = parts.slice(2).join('.')
    let html = `<span class="jwt-header">${header}</span><span class="jwt-dot">.</span><span class="jwt-payload">${payload}</span>`
    if (signature) {
      html += `<span class="jwt-dot">.</span><span class="jwt-signature">${signature}</span>`
    }
    return html
  })

  return (
    <section class="editor-side">
      <div class="card token-card">
        <div class="card-head">
          <span class="card-head-icon">&gt;_</span>
          <span>JSON Web Token (JWT)</span>
          <div class="card-head-actions">
            <button type="button" class="card-action-btn" title="Copy" onClick={() => navigator.clipboard.writeText(props.token)}>
              <Copy size={14} />
            </button>
          </div>
        </div>
        <div class="token-input-area">
          <div class="token-overlay" innerHTML={coloredHtml()} aria-hidden="true" />
          <textarea
            ref={textareaRef}
            class="token-textarea"
            value={props.token}
            onInput={(e) => props.onTokenChange(e.currentTarget.value)}
            placeholder="Paste your token here..."
            spellcheck={false}
          />
        </div>
      </div>
      <div class="token-status-row">
        <Show when={props.token.trim()}>
          <div class={props.isValid ? 'status-badge ok' : 'status-badge error'}>
            {props.isValid ? '✓ Valid JWT' : '✗ Invalid JWT'}
          </div>
          <Show when={props.isValid && props.signatureVerified}>
            <div class="status-badge ok">✓ Signature Verified</div>
          </Show>
        </Show>
      </div>
    </section>
  )
}

export default TokenInputCard
