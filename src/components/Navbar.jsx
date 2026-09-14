import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavSidebar from './NavSidebar'
import { ReferenceDialog, PromptDialog } from './Dialogs'
import './NavSidebar.css'

const HamburgerIcon = () => (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="13" x2="10" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

export default function Navbar() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [refOpen, setRefOpen] = useState(false)
    const [promptOpen, setPromptOpen] = useState(false)
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    // Opened from the "Need help prompting?" inline button
    useEffect(() => {
        const handler = () => { setPromptOpen(true) }
        window.addEventListener('open-prompt-dialog', handler)
        return () => window.removeEventListener('open-prompt-dialog', handler)
    }, [])

    const openRef = useCallback(() => { setRefOpen(true) }, [])
    const openPrompt = useCallback(() => { setPromptOpen(true) }, [])

    const closeDialog = useCallback(() => {
        setRefOpen(false)
        setPromptOpen(false)
    }, [])

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <button
                        className="navbar-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open navigation"
                    >
                        <span className="menu-btn-pulse" />
                        <HamburgerIcon />
                    </button>
                    <button
                        className="navbar-wordmark-btn"
                        onClick={() => navigate('/')}
                        aria-label="Go to home"
                    >
                        <span className="navbar-wordmark">MockCRUD</span>
                        <span className="navbar-tagline">instant mock APIs</span>
                    </button>
                </div>
            </nav>

            <NavSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentPath={location.pathname}
                dark={dark}
                onToggleDark={() => setDark(d => !d)}
                onOpenReference={() => { setSidebarOpen(false); openRef() }}
                onOpenPrompt={() => { setSidebarOpen(false); openPrompt() }}
            />

            <ReferenceDialog open={refOpen} onClose={closeDialog} />
            <PromptDialog open={promptOpen} onClose={closeDialog} />
        </>
    )
}
