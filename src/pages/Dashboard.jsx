import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './Dashboard.css'

const API = 'https://mock-crud-backend.vercel.app'

const ICONS = ['📦', '🗄️', '🧩', '⚡', '🌐', '🔧', '📐', '🎯', '🚀', '🛠️']
const projectIcon = name => ICONS[(name.charCodeAt(0) || 0) % ICONS.length]

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
)

function ProjectCard({ project, onNavigate, onDelete }) {
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(project.id)
        setDeleting(false)
        setConfirming(false)
    }

    return (
        <div className="proj-card">
            <div className="proj-card-strip" />
            <div className="proj-card-body" onClick={() => !confirming && onNavigate(project.id)}>
                <div className="proj-card-icon">{projectIcon(project.name)}</div>
                <div className="proj-card-info">
                    <span className="proj-name">{project.name}</span>
                    <code className="proj-slug">{project.slug}</code>
                </div>
            </div>

            <div className="proj-card-actions">
                {confirming ? (
                    <div className="proj-confirm">
                        <span className="proj-confirm-msg">Delete?</span>
                        <button className="btn btn-sm confirm-cancel" onClick={() => setConfirming(false)}>No</button>
                        <button className="btn btn-sm confirm-delete" onClick={handleDelete} disabled={deleting}>
                            {deleting ? <span className="spinner" /> : 'Yes'}
                        </button>
                    </div>
                ) : (
                    <>
                        <button className="bin-btn" onClick={e => { e.stopPropagation(); setConfirming(true) }} title="Delete project">
                            <TrashIcon />
                        </button>
                        <span className="proj-card-arrow">→</span>
                    </>
                )}
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { token } = useAuth()
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
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to load projects')
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newName.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create project')
            setNewName('')
            navigate(`/app/${data.project.id}`)
        } catch (err) { setCreateError(err.message) }
        finally { setCreating(false) }
    }

    const deleteProject = async (projectId) => {
        const res = await fetch(`${API}/api/project/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to delete project')
        setProjects(prev => prev.filter(p => p.id !== projectId))
    }

    return (
        <>
            <Navbar />
            <div className="container dashboard">
                <div className="dash-header"><h1>Projects</h1></div>

                <form onSubmit={createProject} className="create-form card">
                    <h2>New project</h2>
                    <div className="create-row">
                        <input className="form-input" placeholder="Project name e.g. Blog API"
                            value={newName} onChange={e => setNewName(e.target.value)} required />
                        <button type="submit" className="btn btn-teal" disabled={creating}>
                            {creating ? <><span className="spinner" /> Creating…</> : '+ Create'}
                        </button>
                    </div>
                    {createError && <div className="alert alert-error">{createError}</div>}
                </form>

                <p className="proj-section-label">Your projects</p>
                <div className="proj-list">
                    {loading && <p className="dash-empty">Loading…</p>}
                    {loadError && <div className="alert alert-error">{loadError}</div>}
                    {!loading && !loadError && projects.length === 0 && (
                        <p className="dash-empty">No projects yet — create your first one above.</p>
                    )}
                    {projects.map(p => (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            onNavigate={id => navigate(`/app/${id}`)}
                            onDelete={deleteProject}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
