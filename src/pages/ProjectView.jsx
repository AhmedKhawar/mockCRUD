import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import CreationMode from './CreationMode'
import './ProjectView.css'

const API = 'https://mock-crud-backend.vercel.app'

const ACCENT_COLORS = [
    { from: '#0d9488', to: '#6366f1' },
    { from: '#6366f1', to: '#ec4899' },
    { from: '#f59e0b', to: '#ef4444' },
    { from: '#10b981', to: '#3b82f6' },
    { from: '#8b5cf6', to: '#06b6d4' },
]

const METHOD_ORDER = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const resourceInitial = name => name.charAt(0).toUpperCase()

// ── Icons ──────────────────────────────────────────────────────────────────
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
)
const ChevronIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s ease' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
)
const CopyIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
)
const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)
const SparkleIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
)

// Datatypes for auth fields
const FIELD_TYPES = { email: 'String', password: 'String', name: 'String', dob: 'Date' }

// ── Method badge ───────────────────────────────────────────────────────────
function MethodBadge({ method }) {
    return <span className={`badge badge-${method}`}>{method}</span>
}

// ── Auth API Panel ─────────────────────────────────────────────────────────
function AuthAPIPanel({ slug }) {
    const base = `${API}/m/${slug}`
    const [copied, setCopied] = useState(null)

    const endpoints = [
        {
            method: 'POST',
            path: `${base}/auth/signup`,
            desc: 'Register a new user.',
            reqs: ['email', 'password', 'name', 'dob'],
        },
        {
            method: 'POST',
            path: `${base}/auth/login`,
            desc: 'Returns a JWT token — authenticate with email + password.',
            reqs: ['email', 'password'],
        },
        {
            method: 'POST',
            path: `${base}/auth/logout`,
            desc: 'Invalidate session — requires Bearer token header.',
        },
    ]

    const copy = (url, i) => {
        navigator.clipboard.writeText(url)
        setCopied(i)
        setTimeout(() => setCopied(null), 1800)
    }

    return (
        <div className="auth-api-panel">
            <div className="auth-api-panel-header">
                <span className="auth-api-panel-icon">🔐</span>
                <div>
                    <p className="auth-api-panel-title">Auth API</p>
                    <p className="auth-api-panel-sub">This project has auth-protected resources. Use these endpoints to manage user sessions.</p>
                </div>
            </div>
            <div className="auth-api-endpoints">
                {endpoints.map((ep, i) => (
                    <div key={i} className="auth-api-row">
                        {/* Method + description */}
                        <div className="auth-api-header-row">
                            <MethodBadge method={ep.method} />
                            <p className="auth-api-desc">{ep.desc}</p>
                        </div>

                        {/* Full-width URL container */}
                        <div className="auth-url-bar">
                            <code className="mono auth-api-path">{ep.path}</code>
                            <button
                                className={`url-copy-btn${copied === i ? ' copied' : ''}`}
                                onClick={() => copy(ep.path, i)}
                                title="Copy URL"
                            >
                                {copied === i ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                            </button>
                        </div>

                        {/* Body fields */}
                        {ep.reqs && (
                            <div className="auth-body-fields">
                                <span className="auth-body-label">Body</span>
                                <div className="auth-field-chips">
                                    {ep.reqs.map(r => (
                                        <span key={r} className="auth-field-chip">
                                            <span className="auth-field-name">{r}</span>
                                            <span className="auth-field-type">{FIELD_TYPES[r] ?? 'String'}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Resource Card ──────────────────────────────────────────────────────────
function ResourceCard({ resource, index, onDelete, onToggleAuth }) {
    const [open, setOpen] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [copied, setCopied] = useState(false)
    const [authEnabled, setAuthEnabled] = useState(resource.auth ?? false)
    const [togglingAuth, setTogglingAuth] = useState(false)
    const color = ACCENT_COLORS[index % ACCENT_COLORS.length]

    const copy = () => {
        navigator.clipboard.writeText(resource.mockUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(resource.id)
        setDeleting(false)
        setConfirming(false)
    }

    const handleToggleAuth = async () => {
        setTogglingAuth(true)
        const newVal = await onToggleAuth(resource.id)
        if (newVal !== null) setAuthEnabled(newVal)
        setTogglingAuth(false)
    }

    const endpoints = [...(resource.endpoints || [])].sort(
        (a, b) => METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method)
    )

    return (
        <div className="resource-card" style={{ '--card-from': color.from, '--card-to': color.to }}>
            <div className="resource-topbar" />

            <div className="resource-card-inner">
                {/* Top row: identity LEFT + actions RIGHT */}
                <div className="resource-meta-row">
                    <div className="resource-identity">
                        <div className="resource-icon" style={{ background: `linear-gradient(135deg, ${color.from}22, ${color.to}22)`, color: color.from }}>
                            {resourceInitial(resource.name)}
                        </div>
                        <div className="resource-name-group">
                            <h3 className="resource-name">{resource.name}</h3>
                            <div className="endpoint-chips">
                                {endpoints.slice(0, 5).map((ep, i) => (
                                    <span key={i} className={`chip badge-${ep.method}`}>{ep.method}</span>
                                ))}
                                {endpoints.length > 5 && <span className="chip-more">+{endpoints.length - 5}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons — top right */}
                    <div className="resource-actions">
                        <button
                            className={`auth-toggle-btn${authEnabled ? ' auth-on' : ''}`}
                            onClick={handleToggleAuth}
                            disabled={togglingAuth}
                            title={authEnabled ? 'Auth enabled — click to disable' : 'Click to enable auth'}
                        >
                            {togglingAuth ? <span className="spinner" /> : <>{authEnabled ? '🔒' : '🔓'} Auth</>}
                        </button>
                        <button className="icon-btn bin-btn" onClick={() => setConfirming(c => !c)} title="Delete">
                            <TrashIcon />
                        </button>
                        {/* Big chevron */}
                        <button className="icon-btn chevron-btn big-chevron" onClick={() => setOpen(o => !o)} title={open ? 'Collapse' : 'Expand'}>
                            <ChevronIcon open={open} />
                        </button>
                    </div>
                </div>

                <div className="resource-url-bar">
                    <span className="url-bar-text mono">{resource.mockUrl}</span>
                    <button className={`url-copy-btn${copied ? ' copied' : ''}`} onClick={copy} title="Copy URL">
                        {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                    </button>
                </div>
            </div>

            {confirming && (
                <div className="confirm-bar">
                    <span className="confirm-bar-msg">Delete "{resource.name}" and all mock data?</span>
                    <div className="confirm-bar-actions">
                        <button className="btn btn-sm confirm-cancel" onClick={() => setConfirming(false)}>Cancel</button>
                        <button className="btn btn-sm confirm-delete" onClick={handleDelete} disabled={deleting}>
                            {deleting ? <span className="spinner" /> : 'Delete'}
                        </button>
                    </div>
                </div>
            )}

            {open && endpoints.length > 0 && (
                <div className="resource-endpoints">
                    {endpoints.map((ep, i) => (
                        <div key={i} className="endpoint-row">
                            <div className="endpoint-top">
                                <MethodBadge method={ep.method} />
                                <code className="mono endpoint-path">{ep.path}</code>
                            </div>
                            {ep.description && <p className="endpoint-desc">{ep.description}</p>}
                            {ep.properties?.length > 0 && (
                                <div className="endpoint-fields">
                                    {ep.properties.map(p => (
                                        <span key={p.fieldName} className="field-pill">
                                            {p.fieldName}<span className="field-type"> {p.fieldType}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                            {ep.requiredFields?.length > 0 && (
                                <div className="endpoint-required-list">
                                    <span className="required-label">Required:</span>
                                    {ep.requiredFields.map(reqF => (
                                        <span key={reqF} className="required-pill">{reqF}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Main view ──────────────────────────────────────────────────────────────
export default function ProjectView() {
    const { projectId } = useParams()
    const { token } = useAuth()
    const { show } = useToast()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        if (!token) { navigate('/signin'); return }
        fetchResources()
    }, [projectId, token])

    const fetchResources = async () => {
        setLoading(true); setLoadError('')
        try {
            const res = await fetch(`${API}/api/resource?projectId=${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to load')
            setProject(data.project || null)
            setResources(data.resources?.map(r => ({
                ...r,
                mockUrl: r.mockUrl?.replace(/^http:/, 'https:')
            })) || [])
        } catch (err) { setLoadError(err.message) }
        finally { setLoading(false) }
    }

    // Receives the structured payload from CreationMode
    const generateResource = async (payload) => {
        setGenerating(true)
        try {
            const res = await fetch(`${API}/api/resource`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ projectId, ...payload }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Generation failed')
            const newCards = (data.resources || []).map(r => ({
                id: r.id,
                name: r.name,
                auth: r.auth ?? false,
                mockUrl: `${API}/m/${project?.slug || ''}/${r.name}`,
                endpoints: r.spec?.endpoints || [],
            }))
            const names = newCards.map(r => `"${r.name}"`).join(', ')
            show(`${newCards.length > 1 ? `${newCards.length} resources` : names} created!`, 'success')
            setResources(prev => [...newCards, ...prev])
        } catch (err) {
            // Re-throw so CreationMode's error dialog displays it
            throw err
        } finally { setGenerating(false) }
    }

    const deleteResource = async (resourceId) => {
        const res = await fetch(`${API}/api/resource/${resourceId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) { show(data.message || 'Delete failed', 'error'); return }
        show('Resource deleted', 'info')
        setResources(prev => prev.filter(r => r.id !== resourceId))
    }

    const toggleResourceAuth = async (resourceId) => {
        try {
            const res = await fetch(`${API}/api/resource/${resourceId}/enableAuth`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok) { show(data.message || 'Toggle failed', 'error'); return null }
            show(data.message, data.auth ? 'success' : 'info')
            setResources(prev => prev.map(r => r.id === resourceId ? { ...r, auth: data.auth } : r))
            return data.auth
        } catch {
            show('Toggle failed', 'error')
            return null
        }
    }

    return (
        <>
            <Navbar />

            <div className="container proj-view">
                {/* Header */}
                <div className="proj-view-header">
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/app')}>← Back</button>
                    <div className="proj-view-title-group">
                        <h1>{project?.name || '…'}</h1>
                        {project?.slug && <code className="mono proj-view-slug">/{project.slug}</code>}
                    </div>
                </div>

                {/* Creation Mode */}
                <CreationMode onSubmit={generateResource} loading={generating} />

                {/* Auth API panel */}
                {!loading && resources.some(r => r.auth) && project?.slug && (
                    <AuthAPIPanel slug={project.slug} />
                )}

                {/* Resources */}
                <div className="resources-section">
                    <div className="resources-header-row">
                        <p className="section-label">Resources {!loading && `(${resources.length})`}</p>
                    </div>
                    {loading && <p className="empty-state">Loading…</p>}
                    {loadError && <div className="alert alert-error">{loadError}</div>}
                    {!loading && !loadError && resources.length === 0 && (
                        <div className="empty-state-box">
                            <p className="empty-icon">⚡</p>
                            <p className="empty-title">No resources yet</p>
                            <p className="empty-desc">Describe a data model above and AI will generate the full CRUD API for it.</p>
                        </div>
                    )}
                    <div className="resources-list">
                        {resources.map((r, i) => (
                            <ResourceCard key={r.id} resource={r} index={i} onDelete={deleteResource} onToggleAuth={toggleResourceAuth} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
