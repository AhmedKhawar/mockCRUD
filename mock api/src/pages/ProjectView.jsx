import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './ProjectView.css'

const API = 'http://localhost:8000'

function MethodBadge({ method }) {
    return <span className={`badge badge-${method}`}>{method}</span>
}

function ResourceCard({ resource }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="resource-card card">
            <div className="resource-header" onClick={() => setOpen(o => !o)}>
                <div className="resource-header-left">
                    <span className="resource-name">{resource.name}</span>
                    <a
                        href={resource.mockUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mono resource-url"
                        onClick={e => e.stopPropagation()}
                    >
                        {resource.mockUrl}
                    </a>
                </div>
                <span className="resource-toggle">{open ? '▲' : '▼'}</span>
            </div>

            {open && (
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
                                <p className="endpoint-required">
                                    Required: {ep.requiredFields.join(', ')}
                                </p>
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ projectId, description: prompt }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to generate resource')
            setPrompt('')
            // Append new resource to the list (build mockUrl locally)
            const r = data.resource
            const mockUrl = `http://localhost:8000/m/${project?.slug || ''}/${r.name}`
            setResources(prev => [{ id: r.id, name: r.name, mockUrl, endpoints: r.spec?.endpoints || [] }, ...prev])
        } catch (err) { setGenError(err.message) }
        finally { setGenerating(false) }
    }

    return (
        <>
            <Navbar />
            <div className="container proj-view">
                {/* Back + title */}
                <div className="proj-view-header">
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/app')}>
                        ← Back
                    </button>
                    <div>
                        <h1>{project?.name || '…'}</h1>
                        {project?.slug && (
                            <code className="mono proj-view-slug">slug: {project.slug}</code>
                        )}
                    </div>
                </div>

                {/* Add resource */}
                <form onSubmit={generateResource} className="gen-form card">
                    <h2>Add a resource</h2>
                    <textarea
                        className="form-textarea"
                        placeholder="Describe the resource, e.g. 'a users table with name, age, email and address'"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        disabled={generating}
                        rows={3}
                    />
                    {genError && <div className="alert alert-error">{genError}</div>}
                    <div className="gen-form-footer">
                        <button type="submit" className="btn btn-primary" disabled={generating || !prompt.trim()}>
                            {generating ? <><span className="spinner" /> Generating…</> : 'Generate resource'}
                        </button>
                    </div>
                </form>

                {/* Resource list */}
                <div className="resources-section">
                    <h2 className="resources-label">
                        Resources {!loading && `(${resources.length})`}
                    </h2>

                    {loading && <p className="dash-empty">Loading…</p>}
                    {loadError && <div className="alert alert-error">{loadError}</div>}
                    {!loading && !loadError && resources.length === 0 && (
                        <p className="dash-empty">No resources yet. Describe one above to get started.</p>
                    )}

                    <div className="resources-list">
                        {resources.map(r => (
                            <ResourceCard key={r.id} resource={r} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
