import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NavSidebar from './NavSidebar'
import { ReferenceDialog, PromptDialog } from './Dialogs'
import './NavSidebar.css'

// The actual favicon.svg icon rendered inline
const FaviconLogo = () => (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <defs>
            <linearGradient id="mcGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0EA5E9" />
                <stop offset="1" stopColor="#10B981" />
            </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="#0F172A" />
        <path
            d="M16 44V22L26 34L32 27L38 34L48 22V44"
            stroke="url(#mcGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="32" cy="44" r="3.5" fill="#10B981" />
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
                {/* Logo — click to open sidebar */}
                <button
                    className="navbar-logo-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                    title="Open navigation"
                >
                    <FaviconLogo />
                    <span className="navbar-wordmark">Mock<span>Crud</span></span>
                    <span className="navbar-tagline">· instant mock APIs</span>
                </button>

                {/* Hamburger — also opens sidebar */}
                <button
                    className="hamburger-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                    title="Menu"
                >
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
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
