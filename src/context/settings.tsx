import { createSignal, createContext, useContext, type JSX } from 'solid-js'

export type CalendarType = 'gregorian' | 'solar-hijri' | 'lunar-hijri'

export type Settings = {
    timezone: string
    calendar: CalendarType
}

const STORAGE_KEY = 'tokino-settings'

const getInitial = (): Settings => {
    if (typeof window === 'undefined') return { timezone: 'local', calendar: 'gregorian' }
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            return {
                timezone: typeof parsed.timezone === 'string' ? parsed.timezone : 'local',
                calendar: ['gregorian', 'solar-hijri', 'lunar-hijri'].includes(parsed.calendar) ? parsed.calendar : 'gregorian',
            }
        }
    } catch { /* ignore */ }
    return { timezone: 'local', calendar: 'gregorian' }
}

const SettingsContext = createContext<{
    settings: () => Settings
    update: (patch: Partial<Settings>) => void
    showModal: () => boolean
    setShowModal: (v: boolean) => void
}>()

export const SettingsProvider = (props: { children: JSX.Element }) => {
    const [settings, setSettings] = createSignal<Settings>(getInitial())
    const [showModal, setShowModal] = createSignal(false)

    const update = (patch: Partial<Settings>) => {
        const next = { ...settings(), ...patch }
        setSettings(next)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }

    return (
        <SettingsContext.Provider value={{ settings, update, showModal, setShowModal }}>
            {props.children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => {
    const ctx = useContext(SettingsContext)
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
    return ctx
}
