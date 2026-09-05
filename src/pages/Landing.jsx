import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './Landing.css'

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
                            <code className="mono landing-url-text">https://your-api.vercel.app/m/<span className="hl">slug</span>/users</code>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
