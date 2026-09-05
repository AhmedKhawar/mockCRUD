import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import './Dashboard.css'

const API = 'https://mock-crud-backend.vercel.app'

const ICONS = ['📦', '🗄️', '🧩', '⚡', '🌐', '🔧', '📐', '🎯', '🚀', '🛠️']
const projectIcon = name => ICONS[(name.charCodeAt(0) || 0) % ICONS.length]

const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
)

const DOC_ENDPOINTS = [
    { method: 'GET', path: '/m/{slug}/{resource}', desc: 'List all records' },
    { method: 'GET', path: '/m/{slug}/{resource}/:id', desc: 'Get single record by ID' },
    { method: 'POST', path: '/m/{slug}/{resource}', desc: 'Create a new record' },
    { method: 'PUT', path: '/m/{slug}/{resource}/:id', desc: 'Replace a record by ID' },
    { method: 'DELETE', path: '/m/{slug}/{resource}/:id', desc: 'Delete a record by ID' },
]

function DocPanel() {
    const [open, setOpen] = useState(false)
    return (
        <div className="doc-panel">
            <button className="doc-panel-toggle" onClick={() => setOpen(o => !o)}>
                <span className="doc-panel-icon">📖</span>
                <span className="doc-panel-title">API Reference</span>
                <svg className={`doc-chevron${open ? ' open' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div className="doc-panel-body">
                    <p className="doc-intro">
                        Every resource you generate gets a live REST API at the URL shown on its card.
                        Your project's <strong>slug</strong> is the unique identifier — it never changes.
                    </p>

                    <div className="doc-table">
                        <div className="doc-table-head">
                            <span>Method</span><span>Endpoint</span><span>Description</span>
                        </div>
                        {DOC_ENDPOINTS.map((ep, i) => (
                            <div key={i} className="doc-table-row">
                                <span className={`badge badge-${ep.method}`}>{ep.method}</span>
                                <code className="mono doc-path">{ep.path}</code>
                                <span className="doc-row-desc">{ep.desc}</span>
                            </div>
                        ))}
                    </div>

                    <div className="doc-notes">
                        <div className="doc-note">
                            <span className="doc-note-label">ID field</span>
                            <p>MongoDB auto-generates a unique <code className="mono">_id</code> for every record.
                                The API exposes it as <code className="mono">id</code> in all JSON responses.
                                Use this <code className="mono">id</code> for GET-by-id, PUT, and DELETE calls.</p>
                        </div>
                        <div className="doc-note">
                            <span className="doc-note-label">Example</span>
                            <pre className="doc-code">{`// Create a customer
POST /m/yaecqzrr/customers
{ "name": "Alice", "email": "alice@ex.com" }

// Response → { "id": "64a...", "name": "Alice", ... }

// Update using returned id
PUT /m/yaecqzrr/customers/64a...
{ "name": "Alice Updated" }`}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ProjectCard({ project, onNavigate, onDelete }) {
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(project.id)
        setDeleting(false)
    }

    return (
        <div className="proj-card">
            <div className="proj-card-strip" />
            <div className="proj-card-body" onClick={() => !confirming && onNavigate(project.id)}>
                <span className="proj-card-icon">{projectIcon(project.name)}</span>
                <span className="proj-name">{project.name}</span>
                <code className="mono proj-slug">{project.slug}</code>
            </div>
            <div className="proj-card-footer">
                {confirming ? (
                    <div className="proj-confirm">
                        <span className="proj-confirm-msg">Delete?</span>
                        <div className="proj-confirm-actions">
                            <button className="btn btn-sm confirm-cancel" onClick={() => setConfirming(false)}>No</button>
                            <button className="btn btn-sm confirm-delete" onClick={handleDelete} disabled={deleting}>
                                {deleting ? <span className="spinner" /> : 'Yes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button className="bin-btn" onClick={() => setConfirming(true)} title="Delete"><TrashIcon /></button>
                        <button className="proj-open-btn" onClick={() => onNavigate(project.id)}>Open →</button>
                    </>
                )}
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { token } = useAuth()
    const { show } = useToast()
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [newName, setNewName] = useState('')
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('')

    useEffect(() => {
        if (!token) { navigate('/signin'); return }
        fetchProjects()
    }, [token])

    const fetchProjects = async () => {
        setLoading(true); setLoadError('')
        try {
            const res = await fetch(`${API}/api/project`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to load')
            setProjects(data.projects || [])
        } catch (err) { setLoadError(err.message) }
        finally { setLoading(false) }
    }

    const createProject = async e => {
        e.preventDefault()
        if (!newName.trim()) return
        setCreateError(''); setCreating(true)
        try {
            const res = await fetch(`${API}/api/project`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newName.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed')
            setNewName('')
            show(`"${data.project.name}" created!`, 'success')
            navigate(`/app/${data.project.id}`)
        } catch (err) { setCreateError(err.message) }
        finally { setCreating(false) }
    }

    const deleteProject = async (projectId) => {
        const res = await fetch(`${API}/api/project/${projectId}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) { show(data.message || 'Delete failed', 'error'); return }
        show('Project deleted', 'info')
        setProjects(prev => prev.filter(p => p.id !== projectId))
    }

    return (
        <>
            <Navbar />
            <div className="container dashboard">
                <div className="dash-header">
                    <h1>Projects</h1>
                    <p className="dash-sub">Each project groups your mock API resources under a shared slug.</p>
                </div>

                <form onSubmit={createProject} className="create-form card">
                    <h2>New project</h2>
                    <div className="create-row">
                        <input className="form-input" placeholder="e.g. Blog API, E-commerce, CRM…"
                            value={newName} onChange={e => setNewName(e.target.value)} required />
                        <button type="submit" className="btn btn-teal" disabled={creating}>
                            {creating ? <><span className="spinner" /> Creating…</> : '+ Create'}
                        </button>
                    </div>
                    {createError && <div className="alert alert-error">{createError}</div>}
                </form>

                <div className="proj-section-row">
                    <p className="proj-section-label">Your projects ({projects.length})</p>
                </div>

                <div className="proj-list">
                    {loading && <p className="dash-empty">Loading…</p>}
                    {loadError && <div className="alert alert-error">{loadError}</div>}
                    {!loading && !loadError && projects.length === 0 && (
                        <p className="dash-empty">No projects yet — create your first one above.</p>
                    )}
                    {projects.map(p => (
                        <ProjectCard key={p.id} project={p}
                            onNavigate={id => navigate(`/app/${id}`)}
                            onDelete={deleteProject} />
                    ))}
                </div>

                <DocPanel />
            </div>
        </>
    )
}
