/* @refresh reload */
import { render } from 'solid-js/web'
import { ThemeProvider } from './context/theme'
import { SettingsProvider } from './context/settings'
import App from './App.tsx'

const root = document.getElementById('root')

render(() => (
    <ThemeProvider>
        <SettingsProvider>
            <App />
        </SettingsProvider>
    </ThemeProvider>
), root!)
