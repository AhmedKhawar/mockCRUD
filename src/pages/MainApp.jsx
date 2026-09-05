import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './MainApp.css'

const API = 'https://mock-crud-backend.vercel.app'

function MethodBadge({ method }) {
    const colors = {
        GET: 'badge-get',
        POST: 'badge-post',
        PUT: 'badge-put',
        PATCH: 'badge-patch',
        DELETE: 'badge-delete',
    }
    return <span className={`method-badge ${colors[method] || 'badge-get'}`}>{method}</span>
}

function EndpointRow({ endpoint, baseUrl }) {
    const url = `${baseUrl}${endpoint.path}`
    return (
        <div className="endpoint-row">
            <div className="endpoint-top">
                <MethodBadge method={endpoint.method} />
                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="endpoint-url"
                >
                    {url}
                </a>
            </div>
            {endpoint.description && (
                <p className="endpoint-desc">{endpoint.description}</p>
            )}
            {endpoint.properties?.length > 0 && (
                <div className="endpoint-fields">
                    {endpoint.properties.map((p) => (
                        <span key={p.fieldName} className="field-pill">
                            <span className="field-name">{p.fieldName}</span>
                            <span className="field-type">{p.fieldType}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function MainApp() {
    const { token } = useAuth()
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [project, setProject] = useState(null)

    if (!token) return <Navigate to="/signin" replace />

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!prompt.trim()) return
        setError('')
        setProject(null)
        setLoading(true)

        try {
            const res = await fetch(`${API}/api/project`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ description: prompt }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create project')
            setProject(data.project)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const baseUrl = project
        ? `${API}/m/${project.slug}`
        : null

    return (
        <div className="main-page">
            <Navbar />

            <div className="main-content">
                {/* Prompt section */}
                <section className="prompt-section">
                    <div className="prompt-header">
                        <h1>Generate a Mock API</h1>
                        <p>Describe what data you need — the AI will design and deploy your API.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="prompt-form">
                        <div className="prompt-input-wrap">
                            <textarea
                                className="prompt-textarea"
                                rows={4}
                                placeholder="e.g. Create an API for a student management system with name, age, GPA, and email fields…"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary prompt-submit"
                            disabled={loading || !prompt.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Generating…
                                </>
                            ) : (
                                <>⚡ Generate API</>
                            )}
                        </button>
                    </form>

                    {error && <p className="error-msg" style={{ marginTop: '1rem' }}>{error}</p>}
                </section>

                {/* Result section */}
                {project && (
                    <section className="result-section">
                        <div className="result-header">
                            <div className="result-title-row">
                                <div>
                                    <h2 className="result-name">{project.name}</h2>
                                    <p className="result-resource">Resource: <strong>{project.spec?.resource}</strong></p>
                                </div>
                                <div className="result-meta">
                                    <span className="slug-badge">
                                        🔑 <span className="mono">{project.slug}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Base URL pill */}
                            <div className="base-url-box">
                                <span className="base-url-label">Base URL</span>
                                <a
                                    href={baseUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="base-url-value mono"
                                >
                                    {baseUrl}
                                </a>
                            </div>
                        </div>

                        <div className="endpoints-list">
                            <h3 className="endpoints-title">Endpoints</h3>
                            {project.spec?.endpoints?.map((ep, i) => (
                                <EndpointRow
                                    key={i}
                                    endpoint={ep}
                                    baseUrl={baseUrl}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {!project && !loading && (
                    <div className="empty-state">
                        <div className="empty-icon">🛠️</div>
                        <p>Your generated API will appear here</p>
                    </div>
                )}
            </div>
        </div>
    )
}
