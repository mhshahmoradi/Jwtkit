import { createSignal, createContext, useContext, type JSX } from 'solid-js'

type Theme = 'dark' | 'light'

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem('jwtkit-theme')
    if (stored === 'light' || stored === 'dark') return stored
    return 'dark'
}

const ThemeContext = createContext<{
    theme: () => Theme
    toggle: () => void
}>()

export const ThemeProvider = (props: { children: JSX.Element }) => {
    const [theme, setTheme] = createSignal<Theme>(getInitialTheme())

    document.documentElement.setAttribute('data-theme', theme())

    const toggle = () => {
        const next = theme() === 'dark' ? 'light' : 'dark'
        setTheme(next)
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('jwtkit-theme', next)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {props.children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}
