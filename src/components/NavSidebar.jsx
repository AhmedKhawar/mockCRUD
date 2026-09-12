import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const API = 'https://mock-crud-backend.vercel.app'

// ── Icons ─────────────────────────────────────────────────────────────────
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
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const ChevronRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
)
const DotIcon = () => (
    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
)

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

// ── Main Component ─────────────────────────────────────────────────────────
export default function NavSidebar({ open, onClose, currentPath, dark, onToggleDark, onOpenReference, onOpenPrompt }) {
    const { user, token, logout } = useAuth()
    const { show } = useToast()
    const navigate = useNavigate()
    const location = useLocation()
    const path = currentPath || location.pathname

    const [projects, setProjects] = useState([])
    const [projectsOpen, setProjectsOpen] = useState(true)
    const [openProjectIds, setOpenProjectIds] = useState(new Set())

    // Fetch user projects when sidebar is opened + user is logged in
    useEffect(() => {
        if (!open || !token) return
        fetchProjects()
    }, [open, token])

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API}/api/project`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (res.ok) setProjects(data.projects || [])
        } catch (err) { }
    }

    // Close on Escape
    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    const go = (dest) => { onClose(); navigate(dest) }

    const handleLogout = async () => {
        onClose()
        await logout()
        show('Signed out', 'info')
        navigate('/')
    }

    const toggleProject = (id, e) => {
        e.stopPropagation()
        setOpenProjectIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const isDashboard = path === '/app'
    const isAnyProjectActive = path.startsWith('/app/') && path !== '/app'

    return (
        <>
            <div
                className={`nav-sidebar-overlay${open ? ' visible' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside className={`nav-sidebar${open ? ' open' : ''}`} aria-label="Navigation">

                {/* Header */}
                <div className="nav-sidebar-header">
                    <div className="nav-sidebar-brand" onClick={() => go('/')} style={{ cursor: 'pointer' }}>
                        <LogoIcon />
                        <span className="nav-sidebar-brand-text">Mock<span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Crud</span></span>
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

                {/* ── Navigation ── */}
                <nav className="nav-sidebar-nav">
                    <p className="nav-sidebar-section-label">Navigation</p>

                    <button className={`nav-sidebar-item${isDashboard ? ' active' : ''}`} onClick={() => go('/app')}>
                        <span className="nav-sidebar-item-icon"><DashboardIcon /></span>
                        <span className="nav-sidebar-item-label">Dashboard</span>
                        {isDashboard && <span className="nav-sidebar-item-dot" />}
                    </button>

                    {/* Expandable Projects Folder */}
                    {user && (
                        <div className={`nav-group${isAnyProjectActive ? ' active' : ''}`}>
                            <button className={`nav-sidebar-item projects-root-btn${isAnyProjectActive ? ' active' : ''}`} onClick={() => setProjectsOpen(o => !o)}>
                                <span className="nav-sidebar-item-icon"><FolderIcon /></span>
                                <span className="nav-sidebar-item-label">Projects</span>
                                <span className="nav-group-chevron" style={{ transform: projectsOpen ? 'rotate(90deg)' : 'none' }}>
                                    <ChevronRightIcon />
                                </span>
                            </button>

                            {projectsOpen && (
                                <div className="nav-tree">
                                    {projects.map(p => {
                                        const isThisProject = path === `/app/${p.id}`
                                        const isOpen = openProjectIds.has(p.id) || isThisProject
                                        return (
                                            <div key={p.id} className="nav-tree-item">
                                                <button className={`nav-tree-btn${isThisProject ? ' active' : ''}`} onClick={(e) => toggleProject(p.id, e)}>
                                                    <span className="nav-group-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}><ChevronRightIcon /></span>
                                                    <FolderIcon />
                                                    <span className="nav-tree-label">{p.name || 'Untitled'}</span>
                                                </button>
                                                {isOpen && (
                                                    <div className="nav-tree-children">
                                                        <button className={`nav-tree-child-btn${isThisProject ? ' active-child' : ''}`} onClick={() => go(`/app/${p.id}`)}>
                                                            <DotIcon />
                                                            <span>Resource Page</span>
                                                            <DotIcon />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {projects.length === 0 && (
                                        <div className="nav-tree-empty">No projects yet</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!user && (
                        <button className="nav-sidebar-item" onClick={() => go('/app')}>
                            <span className="nav-sidebar-item-icon"><FolderIcon /></span>
                            <span className="nav-sidebar-item-label">Projects</span>
                        </button>
                    )}

                    <div className="nav-sidebar-divider" style={{ margin: '0.75rem 0' }} />
                    <p className="nav-sidebar-section-label">Preferences & Tools</p>

                    <button className="nav-sidebar-item" onClick={() => { onClose(); onOpenPrompt() }}>
                        <span className="nav-sidebar-item-icon"><SparkleIcon /></span>
                        <span className="nav-sidebar-item-label">Prompt Guide</span>
                    </button>

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
                            <button className="nav-sidebar-item" onClick={() => go('/signin')}>
                                <span className="nav-sidebar-item-icon"><SignInIcon /></span>
                                <span className="nav-sidebar-item-label">Sign In</span>
                            </button>
                            <button className="nav-sidebar-item" onClick={() => go('/signup')}>
                                <span className="nav-sidebar-item-icon"><UserPlusIcon /></span>
                                <span className="nav-sidebar-item-label">Sign Up</span>
                            </button>
                        </>
                    )}
                </nav>
            </aside>
        </>
    )
}
