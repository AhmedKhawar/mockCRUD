import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './Dashboard.css'

const API = 'http://localhost:8000'

export default function Dashboard() {
    const { token } = useAuth()
    const navigate = useNavigate()

    const [projects, setProjects] = useState([])
    const [loadingProjects, setLoadingProjects] = useState(true)
    const [projError, setProjError] = useState('')

    const [newName, setNewName] = useState('')
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('')

    useEffect(() => {
        if (!token) { navigate('/signin'); return }
        fetchProjects()
    }, [token])

    const fetchProjects = async () => {
        setLoadingProjects(true); setProjError('')
        try {
            const res = await fetch(`${API}/api/project`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to load projects')
            setProjects(data.projects || [])
        } catch (err) { setProjError(err.message) }
        finally { setLoadingProjects(false) }
    }

    const createProject = async e => {
        e.preventDefault()
        if (!newName.trim()) return
        setCreateError(''); setCreating(true)
        try {
            const res = await fetch(`${API}/api/project`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newName.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create project')
            setNewName('')
            // Navigate directly into the new project
            navigate(`/app/${data.project.id}`)
        } catch (err) { setCreateError(err.message) }
        finally { setCreating(false) }
    }

    return (
        <>
            <Navbar />
            <div className="container dashboard">
                <div className="dash-header">
                    <h1>Projects</h1>
                </div>

                {/* Create project form */}
                <form onSubmit={createProject} className="create-form card">
                    <h2>New project</h2>
                    <div className="create-row">
                        <input
                            className="form-input"
                            placeholder="Project name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={creating}>
                            {creating ? <><span className="spinner" /> Creating…</> : 'Create'}
                        </button>
                    </div>
                    {createError && <div className="alert alert-error">{createError}</div>}
                </form>

                {/* Project list */}
                <div className="proj-list">
                    {loadingProjects && <p className="dash-empty">Loading…</p>}
                    {projError && <div className="alert alert-error">{projError}</div>}

                    {!loadingProjects && !projError && projects.length === 0 && (
                        <p className="dash-empty">No projects yet. Create one above.</p>
                    )}

                    {projects.map(p => (
                        <button
                            key={p.id}
                            className="proj-card card"
                            onClick={() => navigate(`/app/${p.id}`)}
                        >
                            <div className="proj-card-left">
                                <span className="proj-name">{p.name}</span>
                                <code className="mono proj-slug">{p.slug}</code>
                            </div>
                            <span className="proj-arrow">→</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}
