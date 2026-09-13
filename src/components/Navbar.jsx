import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NavSidebar from './NavSidebar'
import { ReferenceDialog, PromptDialog } from './Dialogs'
import './NavSidebar.css'

// White rectangular menu icon (lines in a box)
const RectMenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="5" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
)

export default function Navbar() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [refOpen, setRefOpen] = useState(false)
    const [promptOpen, setPromptOpen] = useState(false)
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
    const location = useLocation()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    useEffect(() => {
        const handler = () => setPromptOpen(true)
        window.addEventListener('open-prompt-dialog', handler)
        return () => window.removeEventListener('open-prompt-dialog', handler)
    }, [])

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    {/* White rectangular menu opener */}
                    <button
                        className="navbar-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open navigation"
                        title="Open navigation"
                    >
                        <RectMenuIcon />
                    </button>

                    {/* Brand text — not a button, just display */}
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
                onOpenReference={() => setRefOpen(true)}
                onOpenPrompt={() => setPromptOpen(true)}
            />

            <ReferenceDialog open={refOpen} onClose={() => setRefOpen(false)} />
            <PromptDialog open={promptOpen} onClose={() => setPromptOpen(false)} />
        </>
    )
}
