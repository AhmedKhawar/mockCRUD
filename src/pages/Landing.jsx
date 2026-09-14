import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './Landing.css'

const FLOW_ENDPOINTS = [
    { method: 'GET', label: 'List all records', path: '/m/{slug}/users', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    { method: 'GET', label: 'Get record by ID', path: '/m/{slug}/users/:id', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    { method: 'POST', label: 'Create a new record', path: '/m/{slug}/users', color: '#93c5fd', bg: 'rgba(147,197,253,0.12)' },
    { method: 'PUT', label: 'Update record by ID', path: '/m/{slug}/users/:id', color: '#fde68a', bg: 'rgba(253,230,138,0.12)' },
    { method: 'DELETE', label: 'Delete record by ID', path: '/m/{slug}/users/:id', color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
]

export default function Landing() {
    const { token } = useAuth()

    return (
        <>
            <Navbar />
            <div className="landing">
                <div className="container">
                    <div className="landing-hero">
                        <p className="landing-label">AI-powered · No setup · Always live</p>
                        <h1 className="landing-title">MockCRUD</h1>
                        <p className="landing-tagline">Turn a prompt into a live REST API.</p>
                        <p className="landing-desc">
                            Describe your data in plain English — names, fields, relationships.
                            We generate a full CRUD spec and host it instantly.
                            No servers, no config, no waiting.
                        </p>
                        <div className="landing-actions">
                            {token ? (
                                <Link to="/app" className="btn btn-teal landing-cta">Open Dashboard →</Link>
                            ) : (
                                <>
                                    <Link to="/signup" className="btn btn-teal landing-cta">Get started — it's free</Link>
                                    <Link to="/signin" className="btn btn-outline">Sign in</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Dark Flow Hero ── */}
                    <div className="flow-hero-card">
                        {/* Left: Prompt */}
                        <div className="flow-hero-left">
                            <p className="flow-hero-section-label">PROMPT &amp; ENDPOINTS</p>

                            <div className="flow-hero-prompt-wrap">
                                <div className="flow-hero-prompt-inner">
                                    <div className="flow-hero-prompt-line">
                                        <span className="flow-hero-prompt-cursor">▌</span>
                                        <span className="flow-hero-create">Create&nbsp;</span>
                                        <span className="flow-hero-prompt-text">a user management system</span>
                                    </div>
                                    <div className="flow-hero-prompt-hint">with name, email, role, and createdAt</div>
                                </div>
                                <div className="flow-hero-ai-badge">⚡ AI</div>
                            </div>

                            <div className="flow-hero-arrows">
                                <span className="flow-hero-arrow-char">›</span>
                                <span className="flow-hero-arrow-char">›</span>
                                <span className="flow-hero-arrow-char">›</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="flow-hero-divider" />

                        {/* Right: Endpoints */}
                        <div className="flow-hero-right">
                            <p className="flow-hero-section-label">5 LIVE ENDPOINTS</p>
                            <div className="flow-hero-ep-list">
                                {FLOW_ENDPOINTS.map((ep, i) => (
                                    <div
                                        key={i}
                                        className="flow-hero-ep-row"
                                        style={{ '--ep-color': ep.color, '--ep-bg': ep.bg }}
                                    >
                                        <span className="flow-hero-ep-badge">{ep.method}</span>
                                        <div className="flow-hero-ep-info">
                                            <span className="flow-hero-ep-label">{ep.label}</span>
                                            <code className="flow-hero-ep-path">{ep.path}</code>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="landing-features">
                        <div className="landing-feature">
                            <span className="feat-icon">📝</span>
                            <h3>Describe, don't configure</h3>
                            <p>Type "a blog with posts and comments" — get real endpoints back.</p>
                        </div>
                        <div className="landing-feature">
                            <span className="feat-icon">🔗</span>
                            <h3>Live URLs instantly</h3>
                            <p>Every resource gets a permanent mock URL you can <code className="mono">curl</code> right away.</p>
                        </div>
                        <div className="landing-feature">
                            <span className="feat-icon">📁</span>
                            <h3>Projects &amp; resources</h3>
                            <p>Group related APIs into projects. Add as many resources as you need.</p>
                        </div>
                    </div>

                    <div className="landing-demo-box">
                        <p className="landing-demo-label">Example mock URL</p>
                        <div className="landing-demo-url">
                            <span className="badge badge-GET">GET</span>
                            <code className="mono landing-url-text">https://mock-crud-blond.vercel.app/m/<span className="hl">slug</span>/users</code>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
