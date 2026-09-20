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

                    {/* ── How it works ── */}
                    <div className="flow-how-section">
                        <p className="flow-how-label">HOW IT WORKS</p>
                        <div className="flow-how-steps">

                            <div className="flow-how-step">
                                <div className="flow-how-num">1</div>
                                <div className="flow-how-content">
                                    <h3>Define your models</h3>
                                    <p>
                                        Use the <strong>Manual Builder</strong> to hand-craft specific resources exactly to your spec, or simply provide an overarching system name like <em>"Inventory App"</em> and allow the AI engine to infer everything for you.
                                    </p>
                                    <div className="flow-how-modes">
                                        <span className="flow-how-mode-chip">✏️ Manual Builder</span>
                                        <span className="flow-how-mode-chip">⚡ AI Inference</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flow-how-connector" />

                            <div className="flow-how-step">
                                <div className="flow-how-num">2</div>
                                <div className="flow-how-content">
                                    <h3>AI detects relationships</h3>
                                    <p>
                                        The AI automatically identifies missing structural dependencies between your entities. It implicitly maps Foreign Keys (e.g., providing <code>studentId</code> to an enrollments table) and constructs a fully connected CRUD REST API!
                                    </p>
                                    <div className="flow-how-ep-row-mini">
                                        {['GET', 'POST', 'PUT', 'DELETE'].map(m => (
                                            <span key={m} className={`flow-how-badge flow-how-badge-${m}`}>{m}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flow-how-connector" />

                            <div className="flow-how-step">
                                <div className="flow-how-num">3</div>
                                <div className="flow-how-content">
                                    <h3>Live endpoints, instantly</h3>
                                    <p>
                                        Every resource gets a permanent mock URL. Hit it with Postman, curl, or
                                        your frontend — no server config, no waiting.
                                    </p>
                                    <code className="flow-how-url">
                                        /m/<span className="hl">slug</span>/users
                                    </code>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="landing-demo-box">
                        <p className="landing-demo-label">Example mock URL</p>
                        <div className="landing-demo-url">
                            <span className="badge badge-GET">GET</span>
                            <code className="mono landing-url-text">https://mock-crud-backend.vercel.app/m/<span className="hl">slug</span>/users</code>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
