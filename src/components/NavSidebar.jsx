import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// ── Icons ───────────────────────────────────────────────────────────────────
const DashboardIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
)
const FolderIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
)
const BookIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
)
const SparkleIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
)
const SunIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
)
const MoonIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)
const SignOutIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)
const SignInIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
    </svg>
)
const UserPlusIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
)

export default function NavSidebar({ open, onClose, dark, onToggleDark, onOpenReference, onOpenPrompt }) {
    const { user, logout } = useAuth()
    const { show } = useToast()
    const navigate = useNavigate()
    const location = useLocation()

    // Close on Escape
    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    const go = (path) => { onClose(); navigate(path) }

    const handleLogout = async () => {
        onClose()
        await logout()
        show('Signed out', 'info')
        navigate('/')
    }

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <>
            {/* Backdrop */}
            <div
                className={`nav-sidebar-overlay${open ? ' visible' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar panel */}
            <aside className={`nav-sidebar${open ? ' open' : ''}`} aria-label="Navigation">
                {/* Logo in sidebar header */}
                <div className="nav-sidebar-header">
                    <div className="nav-sidebar-brand">
                        <LogoIcon />
                        <span className="nav-sidebar-brand-text">Mock<span>Crud</span></span>
                    </div>
                    <button className="nav-sidebar-close" onClick={onClose} title="Close menu">
                        <CloseIcon />
                    </button>
                </div>

                {/* User info */}
                {user && (
                    <div className="nav-sidebar-user">
                        <div className="nav-sidebar-user-avatar">{user.email?.[0]?.toUpperCase() ?? '?'}</div>
                        <div className="nav-sidebar-user-info">
                            <span className="nav-sidebar-user-label">Signed in as</span>
                            <span className="nav-sidebar-user-email">{user.email}</span>
                        </div>
                    </div>
                )}

                <div className="nav-sidebar-divider" />

                {/* Nav items */}
                <nav className="nav-sidebar-nav">
                    <p className="nav-sidebar-section-label">Navigation</p>

                    <NavItem icon={<DashboardIcon />} label="Dashboard" active={isActive('/app') && !location.pathname.includes('/app/')}
                        onClick={() => go('/app')} />
                    <NavItem icon={<FolderIcon />} label="Projects" active={false}
                        onClick={() => go('/app')} />

                    <div className="nav-sidebar-divider" style={{ margin: '0.75rem 0' }} />
                    <p className="nav-sidebar-section-label">Tools</p>

                    <NavItem icon={<BookIcon />} label="API Reference"
                        onClick={() => { onClose(); onOpenReference() }} />
                    <NavItem icon={<SparkleIcon />} label="Prompt Guide"
                        onClick={() => { onClose(); onOpenPrompt() }} />

                    <div className="nav-sidebar-divider" style={{ margin: '0.75rem 0' }} />
                    <p className="nav-sidebar-section-label">Preferences</p>

                    <button className="nav-sidebar-item theme-item" onClick={onToggleDark}>
                        <span className="nav-sidebar-item-icon">{dark ? <SunIcon /> : <MoonIcon />}</span>
                        <span className="nav-sidebar-item-label">{dark ? 'Light Mode' : 'Dark Mode'}</span>
                        <span className={`theme-pill ${dark ? 'dark' : 'light'}`}>{dark ? 'Dark' : 'Light'}</span>
                    </button>

                    <div className="nav-sidebar-divider" style={{ margin: '0.75rem 0' }} />

                    {user ? (
                        <button className="nav-sidebar-item danger-item" onClick={handleLogout}>
                            <span className="nav-sidebar-item-icon"><SignOutIcon /></span>
                            <span className="nav-sidebar-item-label">Sign Out</span>
                        </button>
                    ) : (
                        <>
                            <NavItem icon={<SignInIcon />} label="Sign In" onClick={() => go('/signin')} />
                            <NavItem icon={<UserPlusIcon />} label="Sign Up" onClick={() => go('/signup')} />
                        </>
                    )}
                </nav>

                <div className="nav-sidebar-footer">
                    <span className="nav-sidebar-footer-text">MockCrud · instant mock APIs</span>
                </div>
            </aside>
        </>
    )
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button className={`nav-sidebar-item${active ? ' active' : ''}`} onClick={onClick}>
            <span className="nav-sidebar-item-icon">{icon}</span>
            <span className="nav-sidebar-item-label">{label}</span>
            {active && <span className="nav-sidebar-item-dot" />}
        </button>
    )
}

const LogoIcon = () => (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0d9488" />
        <rect x="7" y="7" width="7" height="7" rx="2" fill="white" opacity="0.95" />
        <rect x="18" y="7" width="7" height="7" rx="2" fill="white" opacity="0.7" />
        <rect x="7" y="18" width="7" height="7" rx="2" fill="white" opacity="0.7" />
        <rect x="18" y="18" width="7" height="7" rx="2" fill="white" opacity="0.45" />
    </svg>
)

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
