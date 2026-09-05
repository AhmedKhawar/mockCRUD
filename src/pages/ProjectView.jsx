import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import './ProjectView.css'

const API = 'https://mock-crud-backend.vercel.app'

const TOP_GRADIENTS = [
    'linear-gradient(180deg, #0d9488, #6366f1)',
    'linear-gradient(180deg, #6366f1, #ec4899)',
    'linear-gradient(180deg, #f59e0b, #ef4444)',
    'linear-gradient(180deg, #10b981, #3b82f6)',
    'linear-gradient(180deg, #8b5cf6, #06b6d4)',
]

const resourceInitial = name => name.charAt(0).toUpperCase()

const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
)

const ChevronIcon = ({ open }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

const CopyIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
)

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

function MethodBadge({ method }) {
    return <span className={`badge badge-${method}`}>{method}</span>
}

function ConfirmBar({ onConfirm, onCancel, loading }) {
    return (
        <div className="confirm-bar">
            <span className="confirm-bar-msg">Delete this resource and its data?</span>
            <div className="confirm-bar-actions">
                <button className="btn btn-sm confirm-cancel" onClick={onCancel}>Cancel</button>
                <button className="btn btn-sm confirm-delete" onClick={onConfirm} disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Delete'}
                </button>
            </div>
        </div>
    )
}

function ResourceCard({ resource, index, onDelete }) {
    const [open, setOpen] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [copied, setCopied] = useState(false)
    const gradient = TOP_GRADIENTS[index % TOP_GRADIENTS.length]

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

    return (
        <div className="resource-card">
            <div className="resource-topbar" style={{ background: gradient }} />
            <div className="resource-header">
                <div className="resource-header-left" onClick={() => setOpen(o => !o)}>
                    <div className="resource-header-icon">{resourceInitial(resource.name)}</div>
                    <div className="resource-header-meta">
                        <span className="resource-name">{resource.name}</span>
                        <div className="resource-url-row">
                            <span className="resource-url-text">{resource.mockUrl}</span>
                            <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={e => { e.stopPropagation(); copy() }} title="Copy URL">
                                {copied ? <CheckIcon /> : <CopyIcon />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="resource-header-right">
                    {resource.endpoints?.length > 0 && !open && (
                        <span className="ep-count">{resource.endpoints.length} ep</span>
                    )}
                    <button className="bin-btn" onClick={() => setConfirming(c => !c)} title="Delete">
                        <TrashIcon />
                    </button>
                    <button className="chevron-btn" onClick={() => setOpen(o => !o)}>
                        <ChevronIcon open={open} />
                    </button>
                </div>
            </div>

            {confirming && (
                <ConfirmBar loading={deleting} onConfirm={handleDelete} onCancel={() => setConfirming(false)} />
            )}

            {open && resource.endpoints?.length > 0 && (
                <div className="resource-endpoints">
                    {resource.endpoints.map((ep, i) => (
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
                                            {p.fieldName} <span className="field-type mono">{p.fieldType}</span>
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
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to load resources')
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ projectId, description: prompt }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to generate resource')
            setPrompt('')
            const r = data.resource
            const mockUrl = `${API}/m/${project?.slug || ''}/${r.name}`
            show(`Resource "${r.name}" generated!`, 'success')
            setResources(prev => [
                { id: r.id, name: r.name, mockUrl, endpoints: r.spec?.endpoints || [] },
                ...prev
            ])
        } catch (err) { setGenError(err.message) }
        finally { setGenerating(false) }
    }

    const deleteResource = async (resourceId) => {
        const res = await fetch(`${API}/api/resource${resourceId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
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
                <div className="proj-view-header">
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/app')}>← Back</button>
                    <div className="proj-view-title-group">
                        <h1>{project?.name || '…'}</h1>
                        {project?.slug && <code className="mono proj-view-slug">/{project.slug}</code>}
                    </div>
                </div>

                <form onSubmit={generateResource} className="gen-form card">
                    <p className="gen-form-label">Add a resource</p>
                    <textarea className="form-textarea"
                        placeholder="e.g. 'a users table with name, age, email and address'"
                        value={prompt} onChange={e => setPrompt(e.target.value)}
                        disabled={generating} rows={3} />
                    {genError && <div className="alert alert-error">{genError}</div>}
                    <div className="gen-form-footer">
                        <button type="submit" className="btn btn-teal"
                            disabled={generating || !prompt.trim()}>
                            {generating ? <><span className="spinner" /> Generating…</> : '✦ Generate resource'}
                        </button>
                    </div>
                </form>

                <div>
                    <p className="resources-label">
                        Resources {!loading && `(${resources.length})`}
                    </p>
                    {loading && <p className="dash-empty">Loading…</p>}
                    {loadError && <div className="alert alert-error">{loadError}</div>}
                    {!loading && !loadError && resources.length === 0 && (
                        <p className="dash-empty">No resources yet — describe one above to get started.</p>
                    )}
                    {resources.length > 0 && (
                        <div className="resources-list">
                            {resources.map((r, i) => (
                                <ResourceCard key={r.id} resource={r} index={i} onDelete={deleteResource} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
