import { Copy } from 'lucide-solid'

type SignaturePanelProps = {
    secret: string
    onSecretChange: (value: string) => void
    isBase64Encoded: boolean
    onBase64Toggle: (value: boolean) => void
    isValid: boolean
}

const SignaturePanel = (props: SignaturePanelProps) => {
    return (
        <section class="decoded-card signature-section">
            <div class="signature-header">
                <h3>
                    JWT Signature Verification <span class="optional-tag">(Optional)</span>
                </h3>
                <div class="base64-toggle">
                    <span>BASE64URL ENCODED</span>
                    <label class="toggle-switch" aria-label="Base64url encoded toggle">
                        <input
                            type="checkbox"
                            checked={props.isBase64Encoded}
                            onInput={(e: Event & { currentTarget: HTMLInputElement }) => props.onBase64Toggle(e.currentTarget.checked)}
                        />
                        <span class="toggle-slider" />
                    </label>
                </div>
            </div>
            <p class="signature-desc">Enter the secret used to sign the JWT below:</p>
            <div class="card">
                <div class="card-head">
                    <span class="card-head-icon">&gt;_</span>
                    <span>Secret</span>
                    <div class="card-head-actions">
                        <button type="button" class="card-action-btn" title="Copy" onClick={() => navigator.clipboard.writeText(props.secret)}>
                            <Copy size={14} />
                        </button>
                    </div>
                </div>
                <div class="secret-input-area">
                    <input
                        type="text"
                        class="secret-input"
                        value={props.secret}
                        onInput={(e: Event & { currentTarget: HTMLInputElement }) => props.onSecretChange(e.currentTarget.value)}
                        placeholder="a-string-secret-at-least-256-bits-long"
                        spellcheck={false}
                    />
                </div>
            </div>
            <div class="token-status-row">
                {props.secret.trim() && props.isValid && (
                    <div class="status-badge ok">✓ Valid secret</div>
                )}
            </div>
        </section>
    )
}

export default SignaturePanel
