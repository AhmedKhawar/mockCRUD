import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './Navbar.css'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { show } = useToast()
    const navigate = useNavigate()
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    const handleLogout = async () => {
        await logout()
        show('You have been signed out', 'info')
        navigate('/')
    }

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <strong>MockCRUD</strong>
                <span className="navbar-tagline">instant mock APIs</span>
            </Link>
            <div className="navbar-right">
                <button className="btn btn-outline btn-sm theme-btn" onClick={() => setDark(d => !d)} title="Toggle theme">
                    {dark ? <SunIcon /> : <MoonIcon />}
                </button>
                {user ? (
                    <>
                        <span className="navbar-email">{user.email}</span>
                        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign out</button>
                    </>
                ) : (
                    <>
                        <Link to="/signin" className="btn btn-outline btn-sm">Sign in</Link>
                        <Link to="/signup" className="btn btn-teal btn-sm">Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

const SunIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
)
const MoonIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)
