import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
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
const CloseIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const SparkleIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
)

// ── Sidebar content data ───────────────────────────────────────────────────
const DOC_ENDPOINTS = [
    { method: 'GET', path: '/m/{slug}/{resource}', desc: 'List all records' },
    { method: 'GET', path: '/m/{slug}/{resource}/:id', desc: 'Get record by ID' },
    { method: 'POST', path: '/m/{slug}/{resource}', desc: 'Create a new record' },
    { method: 'PUT', path: '/m/{slug}/{resource}/:id', desc: 'Replace a record by ID' },
    { method: 'DELETE', path: '/m/{slug}/{resource}/:id', desc: 'Delete a record by ID' },
]

const PROMPT_TIPS = [
    { icon: '🎯', label: 'Name it', example: '"create a product"', note: 'Fields are auto-inferred.' },
    { icon: '📋', label: 'List fields', example: '"user with name, email, age"', note: 'Exactly those fields are used.' },
    { icon: '🔢', label: 'Set a count', example: '"course with 5 fields"', note: 'LLM picks the best 5.' },
    { icon: '🔗', label: 'Describe a system', example: '"student management system"', note: 'Multiple related resources are inferred with foreign keys.' },
    { icon: '🚫', label: 'Avoid', example: '"how are you" / "president"', note: 'Off-topic or single vague words are rejected.' },
]

// ── Sidebar ────────────────────────────────────────────────────────────────
function HelpSidebar({ open, onClose, scrollToPrompt }) {
    return (
        <>
            {/* Overlay */}
            <div
                className={`sidebar-overlay${open ? ' visible' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`help-sidebar${open ? ' open' : ''}`} aria-label="Help sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-header-title">📚 Reference</span>
                    <button className="sidebar-close-btn" onClick={onClose} title="Close"><CloseIcon /></button>
                </div>

                {/* ── Prompt Guide ─────────────────────── */}
                <section className="sidebar-section" id="sidebar-prompt-guide">
                    <p className="sidebar-section-title">✦ Prompt Guide</p>
                    <p className="sidebar-section-intro">Write prompts that describe a data model, not a question.</p>
                    <div className="prompt-tips-list">
                        {PROMPT_TIPS.map((tip, i) => (
                            <div key={i} className="prompt-tip">
                                <span className="tip-icon">{tip.icon}</span>
                                <div>
                                    <span className="tip-label">{tip.label}</span>
                                    <code className="tip-example">{tip.example}</code>
                                    <span className="tip-note">{tip.note}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="sidebar-divider" />

                {/* ── API Reference ────────────────────── */}
                <section className="sidebar-section" id="sidebar-api-ref">
                    <p className="sidebar-section-title">📖 API Reference</p>
                    <p className="sidebar-section-intro">
                        Every resource gets a live REST API. Your project's <strong>slug</strong> is fixed and never changes.
                    </p>
                    <div className="sidebar-endpoint-table">
                        {DOC_ENDPOINTS.map((ep, i) => (
                            <div key={i} className="sidebar-ep-row">
                                <span className={`badge badge-${ep.method} sidebar-badge`}>{ep.method}</span>
                                <code className="mono sidebar-ep-path">{ep.path}</code>
                                <span className="sidebar-ep-desc">{ep.desc}</span>
                            </div>
                        ))}
                    </div>
                    <div className="sidebar-notes">
                        <div className="sidebar-note">
                            <span className="sidebar-note-label">ID field</span>
                            <p>MongoDB auto-generates <code className="mono">_id</code>; the API exposes it as <code className="mono">id</code> in all responses. Use it for GET-by-id, PUT, and DELETE.</p>
                        </div>
                        <div className="sidebar-note">
                            <span className="sidebar-note-label">Example</span>
                            <pre className="sidebar-code">{`POST /m/abc123/customers
{ "name": "Alice", "email": "a@b.com" }
→ { "id": "64a...", "name": "Alice" }

PUT /m/abc123/customers/64a...
{ "name": "Alice Updated" }`}</pre>
                        </div>
                    </div>
                </section>
            </aside>
        </>
    )
}

// ── Method badge ───────────────────────────────────────────────────────────
function MethodBadge({ method }) {
    return <span className={`badge badge-${method}`}>{method}</span>
}

// ── Auth API Panel ─────────────────────────────────────────────────────────
function AuthAPIPanel({ slug }) {
    const base = `${API}/m/${slug}`
    const [copiedIdx, setCopiedIdx] = useState(null)

    const endpoints = [
        {
            method: 'POST',
            path: `${base}/auth/signup`,
            desc: 'Register a new user.',
            reqs: ['email', 'password', 'name', 'dob']
        },
        {
            method: 'POST',
            path: `${base}/auth/login`,
            desc: <><span className="jwt-highlight">JWT token</span> — authenticate with email + password.</>,
            reqs: ['email', 'password']
        },
        {
            method: 'POST',
            path: `${base}/auth/logout`,
            desc: <>Invalidate session — requires <span className="jwt-highlight">Bearer token</span> header.</>,
        },
    ]

    const copy = (url, i) => {
        navigator.clipboard.writeText(url)
        setCopiedIdx(i)
        setTimeout(() => setCopiedIdx(null), 1800)
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
                        <div className="auth-api-row-left">
                            <MethodBadge method={ep.method} />
                            <div className="auth-api-row-info">
                                <code className="mono auth-api-path">{ep.path}</code>
                                <div className="auth-api-desc-wrap">
                                    <p className="auth-api-desc">{ep.desc}</p>
                                    {ep.reqs && (
                                        <div className="endpoint-required-list">
                                            <span className="required-label">Body:</span>
                                            {ep.reqs.map(r => <span key={r} className="required-pill">{r}</span>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            className={`url-copy-btn auth-copy-btn${copiedIdx === i ? ' copied' : ''}`}
                            onClick={() => copy(ep.path, i)}
                            title="Copy URL"
                        >
                            {copiedIdx === i ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                        </button>
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
                <div className="resource-meta-row">
                    <div className="resource-identity">
                        <div className="resource-icon" style={{ background: `linear-gradient(135deg, ${color.from}22, ${color.to}22)`, color: color.from }}>
                            {resourceInitial(resource.name)}
                        </div>
                        <div>
                            <h3 className="resource-name">{resource.name}</h3>
                            <div className="endpoint-chips">
                                {endpoints.slice(0, 5).map((ep, i) => (
                                    <span key={i} className={`chip badge-${ep.method}`}>{ep.method}</span>
                                ))}
                                {endpoints.length > 5 && <span className="chip-more">+{endpoints.length - 5}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="resource-actions">
                        <button
                            className={`auth-toggle-btn${authEnabled ? ' auth-on' : ''}`}
                            onClick={handleToggleAuth}
                            disabled={togglingAuth}
                            title={authEnabled ? 'Auth enabled — click to disable' : 'Auth disabled — click to enable'}
                        >
                            {togglingAuth
                                ? <span className="spinner" />
                                : <>{authEnabled ? '🔒' : '🔓'} Auth</>}
                        </button>
                        <button className="icon-btn bin-btn" onClick={() => setConfirming(c => !c)} title="Delete">
                            <TrashIcon />
                        </button>
                        <button className="icon-btn chevron-btn" onClick={() => setOpen(o => !o)}>
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
    const [prompt, setPrompt] = useState('')
    const [generating, setGenerating] = useState(false)
    const [genError, setGenError] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Fade the "want help?" hint once the user starts typing
    const hintVisible = prompt.trim().length === 0

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

    const generateResource = async e => {
        e.preventDefault()
        if (!prompt.trim()) return
        setGenError(''); setGenerating(true)
        try {
            const res = await fetch(`${API}/api/resource`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ projectId, description: prompt }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Generation failed')
            setPrompt('')
            const newCards = data.resources.map(r => ({
                id: r.id,
                name: r.name,
                auth: r.auth ?? false,
                mockUrl: `${API}/m/${project?.slug || ''}/${r.name}`,
                endpoints: r.spec?.endpoints || [],
            }))
            const names = newCards.map(r => `"${r.name}"`).join(', ')
            show(`${newCards.length > 1 ? `${newCards.length} resources` : names} generated!`, 'success')
            setResources(prev => [...newCards, ...prev])
        } catch (err) { setGenError(err.message) }
        finally { setGenerating(false) }
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
            <HelpSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="container proj-view">
                {/* Header */}
                <div className="proj-view-header">
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/app')}>← Back</button>
                    <div className="proj-view-title-group">
                        <h1>{project?.name || '…'}</h1>
                        {project?.slug && <code className="mono proj-view-slug">/{project.slug}</code>}
                    </div>
                </div>

                {/* Generate form */}
                <form onSubmit={generateResource} className="gen-form card">
                    <div className="gen-form-top">
                        <p className="gen-form-label">✦ Add a resource</p>
                        {/* Prompt hint — fades when user starts typing */}
                        <button
                            type="button"
                            className={`prompt-hint-btn${hintVisible ? '' : ' hidden'}`}
                            onClick={() => setSidebarOpen(true)}
                            tabIndex={hintVisible ? 0 : -1}
                            aria-hidden={!hintVisible}
                        >
                            <SparkleIcon />
                            Want help prompting?
                        </button>
                    </div>
                    <textarea className="form-textarea"
                        placeholder="e.g. 'a customers table with name, email, phone, address and plan'"
                        value={prompt} onChange={e => setPrompt(e.target.value)}
                        disabled={generating} rows={2} />
                    {genError && <div className="alert alert-error">{genError}</div>}
                    <div className="gen-form-footer">
                        <button type="submit" className="btn btn-teal"
                            disabled={generating || !prompt.trim()}>
                            {generating ? <><span className="spinner" /> Generating…</> : 'Generate resource'}
                        </button>
                    </div>
                </form>

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
