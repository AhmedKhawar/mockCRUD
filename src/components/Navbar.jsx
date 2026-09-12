import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NavSidebar from './NavSidebar'
import { ReferenceDialog, PromptDialog } from './Dialogs'
import './NavSidebar.css'

// The original 4-dot grid Logo block
const LogoIcon = () => (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0d9488" />
        <rect x="7" y="7" width="7" height="7" rx="2" fill="white" opacity="0.95" />
        <rect x="18" y="7" width="7" height="7" rx="2" fill="white" opacity="0.7" />
        <rect x="7" y="18" width="7" height="7" rx="2" fill="white" opacity="0.7" />
        <rect x="18" y="18" width="7" height="7" rx="2" fill="white" opacity="0.45" />
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

    // Allow any page to open the prompt dialog via a custom event
    useEffect(() => {
        const handler = () => setPromptOpen(true)
        window.addEventListener('open-prompt-dialog', handler)
        return () => window.removeEventListener('open-prompt-dialog', handler)
    }, [])

    return (
        <>
            <nav className="navbar">
                {/* Logo — click to open sidebar. Hamburger on right removed. */}
                <button
                    className="navbar-logo-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                    title="Open navigation"
                >
                    <LogoIcon />
                    <span className="navbar-wordmark">Mock<span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Crud</span></span>
                    <span className="navbar-tagline">· instant mock APIs</span>
                </button>
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
