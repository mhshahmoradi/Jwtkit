import { For, Show, createMemo, createSignal } from 'solid-js'
import type { ClaimDetail, JsonValue } from '../types/jwt'

type DecodedCardProps = {
  title: string
  json: Record<string, JsonValue> | null
  claims: ClaimDetail[]
}

const DecodedCard = (props: DecodedCardProps) => {
  const [tab, setTab] = createSignal<'json' | 'claims'>('json')

  const jsonString = createMemo(() => {
    if (!props.json) {
      return '{}'
    }
    return JSON.stringify(props.json, null, 2)
  })

  return (
    <section class="decoded-card">
      <h3>{props.title}</h3>
      <div class="card with-tabs">
        <div class="card-head tabs">
          <button
            type="button"
            class={tab() === 'json' ? 'tab active' : 'tab'}
            onClick={() => setTab('json')}
          >
            JSON
          </button>
          <button
            type="button"
            class={tab() === 'claims' ? 'tab active' : 'tab'}
            onClick={() => setTab('claims')}
          >
            Claims Breakdown
          </button>
        </div>
        <Show
          when={tab() === 'json'}
          fallback={
            <div class="claims-view">
              <Show
                when={props.claims.length > 0}
                fallback={<p class="muted">No claims available</p>}
              >
                <For each={props.claims}>
                  {(claim) => (
                    <div class="claim-row">
                      <div>
                        <strong>{claim.key}</strong>
                        <span>{claim.type}</span>
                      </div>
                      <p>{claim.value}</p>
                      <small>{claim.details}</small>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          }
        >
          <pre>{jsonString()}</pre>
        </Show>
      </div>
    </section>
  )
}

export default DecodedCard
