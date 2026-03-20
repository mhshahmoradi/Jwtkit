import { createMemo, createSignal } from 'solid-js'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TokenInputCard from './components/TokenInputCard'
import DecodedCard from './components/DecodedCard'
import StatusPanel from './components/StatusPanel'
import { EXAMPLE_JWT, extractClaimDetails, parseJwt } from './utils/jwt'
import './App.css'

function App() {
  const [token, setToken] = createSignal('')
  const [autoFocus, setAutoFocus] = createSignal(false)

  const parsed = createMemo(() => parseJwt(token()))
  const headerClaims = createMemo(() => extractClaimDetails(parsed().header))
  const payloadClaims = createMemo(() => extractClaimDetails(parsed().payload))

  return (
    <main class="page">
      <Navbar />
      <Hero />

      <section class="workspace-grid">
        <TokenInputCard
          token={token()}
          autoFocus={autoFocus()}
          onTokenChange={setToken}
          onAutoFocusChange={setAutoFocus}
          onGenerateExample={() => setToken(EXAMPLE_JWT)}
        />

        <section class="decoded-side">
          <DecodedCard
            title="Decoded Header"
            json={parsed().header}
            claims={headerClaims()}
          />
          <DecodedCard
            title="Decoded Payload"
            json={parsed().payload}
            claims={payloadClaims()}
          />
        </section>
      </section>

      <StatusPanel
        isValid={parsed().isValid}
        hasSignature={Boolean(parsed().signature)}
        error={parsed().error}
      />
    </main>
  )
}

export default App
