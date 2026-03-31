/* @refresh reload */
import { render } from 'solid-js/web'
import { ThemeProvider } from './context/theme'
import { SettingsProvider } from './context/settings'
import App from './App.tsx'
import PlausibleTracker from './components/PlausibleTracker.tsx'

const root = document.getElementById('root')

render(() => (
    <ThemeProvider>
        <SettingsProvider>
            <App />
            <PlausibleTracker />
        </SettingsProvider>
    </ThemeProvider>
), root!)
