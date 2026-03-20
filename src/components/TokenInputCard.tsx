type TokenInputCardProps = {
  token: string
  autoFocus: boolean
  onTokenChange: (value: string) => void
  onAutoFocusChange: (value: boolean) => void
  onGenerateExample: () => void
}

const TokenInputCard = (props: TokenInputCardProps) => {
  let textAreaRef: HTMLTextAreaElement | undefined

  const handleAutoFocusChange = (checked: boolean) => {
    props.onAutoFocusChange(checked)
    if (checked) {
      textAreaRef?.focus()
    }
  }

  return (
    <section class="editor-side">
      <div class="editor-header-row">
        <p>Paste a JWT below that you&apos;d like to decode, validate, and verify.</p>
        <button type="button" class="link-btn" onClick={props.onGenerateExample}>
          Generate example
        </button>
      </div>
      <div class="editor-title-row">
        <h2>Encoded Token</h2>
        <label class="autofocus-toggle">
          <input
            type="checkbox"
            checked={props.autoFocus}
            onInput={(event) => handleAutoFocusChange(event.currentTarget.checked)}
          />
          Enable auto-focus
        </label>
      </div>
      <div class="card">
        <div class="card-head">
          <span>&gt; JSON Web Token (JWT)</span>
        </div>
        <textarea
          ref={textAreaRef}
          value={props.token}
          onInput={(event) => props.onTokenChange(event.currentTarget.value)}
          placeholder="Paste your token here"
          spellcheck={false}
        />
      </div>
    </section>
  )
}

export default TokenInputCard
