import { Moon, Sun, Settings } from 'lucide-solid'
import { useTheme } from '../context/theme'
import { useSettings } from '../context/settings'

const Navbar = () => {
  const { theme, toggle } = useTheme()
  const { setShowModal } = useSettings()

  return (
    <header class="top-nav">
      <div class="brand">
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <rect width="36" height="28" rx="6" fill="#1a1a2e" />
          <text x="4" y="20" font-size="16" font-weight="bold" fill="white" font-family="monospace">
            JWT
          </text>
        </svg>
        <span>Debugger</span>
      </div>
      <nav>
        <button type="button" class="nav-item active">Debugger</button>
      </nav>
      <div class="top-actions">
        <button type="button" class="icon-btn" aria-label="Toggle theme" onClick={toggle}>
          {theme() === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button type="button" class="icon-btn" aria-label="Settings" onClick={() => setShowModal(true)}>
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}

export default Navbar
