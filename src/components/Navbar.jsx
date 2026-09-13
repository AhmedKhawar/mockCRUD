import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import NavSidebar from './NavSidebar'
import { ReferenceDialog, PromptDialog } from './Dialogs'
import './NavSidebar.css'

const RectMenuIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.75" y="0.75" width="16.5" height="16.5" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="4.5" y1="6" x2="13.5" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="4.5" y1="9" x2="13.5" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="4.5" y1="12" x2="13.5" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
)

export default function Navbar() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [refOpen, setRefOpen] = useState(false)
    const [promptOpen, setPromptOpen] = useState(false)
    // true when the currently-open dialog was launched from the sidebar
    const [fromSidebar, setFromSidebar] = useState(false)
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
    const location = useLocation()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    // Opened from the "Need help prompting?" inline button → NOT from sidebar
    useEffect(() => {
        const handler = () => {
            setFromSidebar(false)
            setPromptOpen(true)
        }
        window.addEventListener('open-prompt-dialog', handler)
        return () => window.removeEventListener('open-prompt-dialog', handler)
    }, [])

    const openRef = useCallback((isSidebar) => {
        setFromSidebar(isSidebar)
        setRefOpen(true)
    }, [])

    const openPrompt = useCallback((isSidebar) => {
        setFromSidebar(isSidebar)
        setPromptOpen(true)
    }, [])

    const closeDialog = useCallback(() => {
        setRefOpen(false)
        setPromptOpen(false)
        if (fromSidebar) {
            // Small delay so the dialog exit animation finishes first
            setTimeout(() => setSidebarOpen(true), 150)
        }
        setFromSidebar(false)
    }, [fromSidebar])

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <button
                        className="navbar-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open navigation"
                    >
                        <RectMenuIcon />
                    </button>
                    <span className="navbar-wordmark">MockCRUD</span>
                    <span className="navbar-tagline">instant mock APIs</span>
                </div>
            </nav>

            <NavSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentPath={location.pathname}
                dark={dark}
                onToggleDark={() => setDark(d => !d)}
                onOpenReference={() => { setSidebarOpen(false); openRef(true) }}
                onOpenPrompt={() => { setSidebarOpen(false); openPrompt(true) }}
            />

            <ReferenceDialog open={refOpen} onClose={closeDialog} />
            <PromptDialog open={promptOpen} onClose={closeDialog} />
        </>
    )
}
