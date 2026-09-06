import { useState, useEffect } from 'react'
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

function MethodBadge({ method }) {
    return <span className={`badge badge-${method}`}>{method}</span>
}

function ResourceCard({ resource, index, onDelete }) {
    const [open, setOpen] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [copied, setCopied] = useState(false)
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

    // sort endpoints by method order
    const endpoints = [...(resource.endpoints || [])].sort(
        (a, b) => METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method)
    )

    return (
        <div className="resource-card" style={{ '--card-from': color.from, '--card-to': color.to }}>
            {/* Gradient top bar */}
            <div className="resource-topbar" />

            {/* Header */}
            <div className="resource-card-inner">
                <div className="resource-meta-row">
                    {/* Icon + name */}
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

                    {/* Actions */}
                    <div className="resource-actions">
                        <button className="icon-btn bin-btn" onClick={() => setConfirming(c => !c)} title="Delete">
                            <TrashIcon />
                        </button>
                        <button className="icon-btn chevron-btn" onClick={() => setOpen(o => !o)}>
                            <ChevronIcon open={open} />
                        </button>
                    </div>
                </div>

                {/* Full URL bar */}
                <div className="resource-url-bar">
                    <span className="url-bar-text mono">{resource.mockUrl}</span>
                    <button className={`url-copy-btn${copied ? ' copied' : ''}`} onClick={copy} title="Copy URL">
                        {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                    </button>
                </div>
            </div>

            {/* Confirm delete */}
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

            {/* Expanded endpoints */}
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
                                <p className="endpoint-required">Required: {ep.requiredFields.join(', ')}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

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
            setResources(data.resources || [])
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
            const r = data.resource
            const mockUrl = `${API}/m/${project?.slug || ''}/${r.name}`
            show(`"${r.name}" generated!`, 'success')
            setResources(prev => [
                { id: r.id, name: r.name, mockUrl, endpoints: r.spec?.endpoints || [] },
                ...prev,
            ])
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

                {/* Generate form */}
                <form onSubmit={generateResource} className="gen-form card">
                    <p className="gen-form-label">✦ Add a resource</p>
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
                            <ResourceCard key={r.id} resource={r} index={i} onDelete={deleteResource} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
