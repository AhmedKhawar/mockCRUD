import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <strong>MockCRUD</strong>
                <span className="navbar-tagline">instant mock APIs</span>
            </Link>
            <div className="navbar-right">
                <button className="btn btn-outline btn-sm" onClick={() => setDark(d => !d)}>
                    {dark ? '☀ Light' : '☾ Dark'}
                </button>
                {user ? (
                    <>
                        <span className="navbar-email">{user.email}</span>
                        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/signin" className="btn btn-outline btn-sm">Sign In</Link>
                        <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
