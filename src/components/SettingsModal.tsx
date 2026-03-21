import { Show, createSignal, createEffect, onCleanup, For } from 'solid-js'
import { Portal } from 'solid-js/web'
import { X } from 'lucide-solid'
import { useSettings, type CalendarType } from '../context/settings'

const COMMON_TIMEZONES = [
    { value: 'local', label: 'Local (Browser)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America / New York' },
    { value: 'America/Chicago', label: 'America / Chicago' },
    { value: 'America/Denver', label: 'America / Denver' },
    { value: 'America/Los_Angeles', label: 'America / Los Angeles' },
    { value: 'Europe/London', label: 'Europe / London' },
    { value: 'Europe/Berlin', label: 'Europe / Berlin' },
    { value: 'Europe/Paris', label: 'Europe / Paris' },
    { value: 'Europe/Moscow', label: 'Europe / Moscow' },
    { value: 'Asia/Dubai', label: 'Asia / Dubai' },
    { value: 'Asia/Tehran', label: 'Iran (Asia / Tehran)' },
    { value: 'Asia/Kolkata', label: 'Asia / Kolkata' },
    { value: 'Asia/Shanghai', label: 'Asia / Shanghai' },
    { value: 'Asia/Tokyo', label: 'Asia / Tokyo' },
    { value: 'Asia/Seoul', label: 'Asia / Seoul' },
    { value: 'Australia/Sydney', label: 'Australia / Sydney' },
    { value: 'Pacific/Auckland', label: 'Pacific / Auckland' },
]

const CALENDAR_OPTIONS: { value: CalendarType; label: string }[] = [
    { value: 'gregorian', label: 'Gregorian Calendar' },
    { value: 'solar-hijri', label: 'Solar Hijri Calendar (Shamsi)' },
    { value: 'lunar-hijri', label: 'Lunar Hijri Calendar (Qamari)' },
]

const SettingsModal = () => {
    const { settings, update, showModal, setShowModal } = useSettings()
    const [customTz, setCustomTz] = createSignal('')

    const close = () => setShowModal(false)

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close()
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeyDown)
        onCleanup(() => window.removeEventListener('keydown', handleKeyDown))
    }

    const handleCustomTz = () => {
        const tz = customTz().trim()
        if (!tz) return
        try {
            Intl.DateTimeFormat(undefined, { timeZone: tz })
            update({ timezone: tz })
            setCustomTz('')
        } catch { /* invalid tz */ }
    }

    return (
        <Show when={showModal()}>
            <Portal>
                <div class="settings-overlay" onClick={close}>
                    <div class="settings-modal" onClick={(e) => e.stopPropagation()}>
                        <div class="settings-header">
                            <h3>Settings</h3>
                            <button type="button" class="settings-close-btn" onClick={close}>
                                <X size={18} />
                            </button>
                        </div>

                        <div class="settings-body">
                            <div class="settings-group">
                                <label class="settings-label">Timezone</label>
                                <p class="settings-hint">Choose the timezone for displaying timestamp claims (iat, exp, nbf, auth_time).</p>
                                <select
                                    class="settings-select"
                                    ref={(el) => {
                                        createEffect(() => {
                                            el.value = settings().timezone
                                        })
                                    }}
                                    onChange={(e) => update({ timezone: e.currentTarget.value })}
                                >
                                    <For each={COMMON_TIMEZONES}>
                                        {(tz) => (
                                            <option value={tz.value} selected={settings().timezone === tz.value}>
                                                {tz.label}
                                            </option>
                                        )}
                                    </For>
                                    <Show when={!COMMON_TIMEZONES.some(t => t.value === settings().timezone)}>
                                        <option value={settings().timezone}>{settings().timezone}</option>
                                    </Show>
                                </select>
                                <div class="settings-custom-tz">
                                    <input
                                        type="text"
                                        class="settings-input"
                                        placeholder="Or enter custom IANA timezone..."
                                        value={customTz()}
                                        onInput={(e) => setCustomTz(e.currentTarget.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleCustomTz() }}
                                    />
                                    <button type="button" class="settings-apply-btn" onClick={handleCustomTz}>Apply</button>
                                </div>
                            </div>

                            <div class="settings-group">
                                <label class="settings-label">Calendar System</label>
                                <p class="settings-hint">Choose how timestamp dates are displayed in decoded view and tooltips.</p>
                                <div class="settings-radio-group">
                                    <For each={CALENDAR_OPTIONS}>
                                        {(opt) => (
                                            <label class="settings-radio">
                                                <input
                                                    type="radio"
                                                    name="calendar"
                                                    value={opt.value}
                                                    checked={settings().calendar === opt.value}
                                                    onChange={() => update({ calendar: opt.value })}
                                                />
                                                <span class="settings-radio-mark" />
                                                <span>{opt.label}</span>
                                            </label>
                                        )}
                                    </For>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>
        </Show>
    )
}

export default SettingsModal
