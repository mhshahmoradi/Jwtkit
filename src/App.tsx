import { createEffect, createMemo, createSignal } from 'solid-js'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TokenInputCard from './components/TokenInputCard'
import DecodedCard from './components/DecodedCard'
import SignaturePanel from './components/SignaturePanel'
import SettingsModal from './components/SettingsModal'
import { EXAMPLE_JWT, extractClaimDetails, parseJwt, verifySignature } from './utils/jwt'
import { useSettings } from './context/settings'
import './App.css'

function App() {
  const [token, setToken] = createSignal(EXAMPLE_JWT)
  const [secret, setSecret] = createSignal('')
  const [isBase64Encoded, setIsBase64Encoded] = createSignal(false)
  const [signatureVerified, setSignatureVerified] = createSignal(false)
  const { settings } = useSettings()

  const parsed = createMemo(() => parseJwt(token()))
  const headerClaims = createMemo(() =>
    extractClaimDetails(parsed().header, settings().timezone, settings().calendar)
  )
  const payloadClaims = createMemo(() =>
    extractClaimDetails(parsed().payload, settings().timezone, settings().calendar)
  )

  createEffect(() => {
    const t = token()
    const s = secret()
    const b64 = isBase64Encoded()
    if (!parsed().isValid || !s.trim()) {
      setSignatureVerified(false)
      return
    }
    verifySignature(t, s, b64).then(setSignatureVerified)
  })

  return (
    <main class="page">
      <Navbar />
      <Hero />

      <section class="workspace-grid">
        <div class="column-header left-column-header">
          <span class="helper-text">Paste a JWT below that you'd like to decode, validate, and verify.</span>
          <h2 class="section-title">Encoded Token</h2>
        </div>
        <div class="column-header right-column-header">
          <h2 class="section-title">Decoded Header</h2>
        </div>

        <TokenInputCard
          token={token()}
          onTokenChange={setToken}
          isValid={parsed().isValid}
          signatureVerified={signatureVerified()}
        />

        <section class="decoded-side">
          <DecodedCard
            json={parsed().header}
            claims={headerClaims()}
            colorClass="header-color"
            defaultTab="json"
          />
          <DecodedCard
            title="Decoded Payload"
            json={parsed().payload}
            claims={payloadClaims()}
            colorClass="payload-color"
          />
          <SignaturePanel
            secret={secret()}
            onSecretChange={setSecret}
            isBase64Encoded={isBase64Encoded()}
            onBase64Toggle={setIsBase64Encoded}
            signatureVerified={signatureVerified()}
            hasSecret={secret().trim().length > 0}
          />
        </section>
      </section>

      <footer class="page-footer">
        <span>Share feedback</span>
        <span class="footer-sep">|</span>
        <span>Report Issue</span>
      </footer>

      <SettingsModal />
    </main>
  )
}

export default App
