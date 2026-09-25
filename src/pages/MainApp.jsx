import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import CreationMode from './CreationMode'
import './MainApp.css'

const API = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://mock-crud-backend.vercel.app'

const SparkleIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
)

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
                    {endpoint.properties.map((p) => {
                        const isAi = p.aiAdded === true || endpoint.aiAddedFields?.includes(p.fieldName);
                        return (
                            <span key={p.fieldName} className={`field-pill ${isAi ? 'field-pill-ai' : ''}`} title={isAi ? "Field intelligently injected by AI as Foreign Key" : ""}>
                                {isAi && <span className="ai-spark"><SparkleIcon /></span>}
                                <span className="field-name">{p.fieldName}</span>
                                <span className="field-type">{p.fieldType}</span>
                            </span>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function MainApp() {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [project, setProject] = useState(null)
    const [lastPayload, setLastPayload] = useState(null)

    if (!token) return <Navigate to="/signin" replace />

    const handleSubmit = async (payload) => {
        setError('')
        setProject(null)
        setLastPayload(payload)
        setLoading(true)

        try {
            const res = await fetch(`${API}/api/resources/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create resources')
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
                {/* Header */}
                <section className="prompt-section">
                    <div className="prompt-header">
                        <h1>Generate a Mock API</h1>
                        <p>Configure your resources manually, or let the AI infer everything from a system name.</p>
                    </div>

                    <CreationMode onSubmit={handleSubmit} loading={loading} />

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
