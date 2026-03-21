import { createMemo, createSignal } from 'solid-js'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TokenInputCard from './components/TokenInputCard'
import DecodedCard from './components/DecodedCard'
import SignaturePanel from './components/SignaturePanel'
import { EXAMPLE_JWT, extractClaimDetails, parseJwt } from './utils/jwt'
import './App.css'

function App() {
  const [token, setToken] = createSignal(EXAMPLE_JWT)
  const [secret, setSecret] = createSignal('a-string-secret-at-least-256-bits-long')
  const [isBase64Encoded, setIsBase64Encoded] = createSignal(false)

  const parsed = createMemo(() => parseJwt(token()))
  const headerClaims = createMemo(() => extractClaimDetails(parsed().header))
  const payloadClaims = createMemo(() => extractClaimDetails(parsed().payload))

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
          signatureVerified={parsed().isValid && Boolean(parsed().signature)}
        />

        <section class="decoded-side">
          <DecodedCard
            json={parsed().header}
            claims={headerClaims()}
            colorClass="header-color"
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
            isValid={parsed().isValid}
          />
        </section>
      </section>

      <footer class="page-footer">
        <span>Share feedback</span>
        <span class="footer-sep">|</span>
        <span>Report Issue</span>
      </footer>
    </main>
  )
}

export default App
