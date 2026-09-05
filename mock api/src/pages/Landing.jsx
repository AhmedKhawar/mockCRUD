import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Landing.css'

export default function Landing() {
    return (
        <>
            <Navbar />
            <div className="landing">
                <div className="container">
                    <div className="landing-hero">
                        <p className="landing-label">Mock REST APIs · No setup</p>
                        <h1 className="landing-title">MockCRUD</h1>
                        <p className="landing-tagline">already hosted</p>
                        <p className="landing-desc">
                            Describe your data in plain English. We generate a full CRUD API spec
                            and host it instantly. No servers, no config — just copy the URL and start calling.
                        </p>
                        <div className="landing-actions">
                            <Link to="/signup" className="btn btn-primary">Get started free</Link>
                            <Link to="/signin" className="btn btn-outline">Sign in</Link>
                        </div>
                    </div>

                    <div className="landing-features">
                        <div className="landing-feature">
                            <span className="feat-icon">📝</span>
                            <h3>Describe, don't configure</h3>
                            <p>Type a prompt like "a blog with posts and comments" and get real endpoints back.</p>
                        </div>
                        <div className="landing-feature">
                            <span className="feat-icon">🔗</span>
                            <h3>Live URLs instantly</h3>
                            <p>Every resource gets a permanent mock URL you can hit right away from any client.</p>
                        </div>
                        <div className="landing-feature">
                            <span className="feat-icon">📁</span>
                            <h3>Projects &amp; resources</h3>
                            <p>Group related APIs into projects. Add as many resources as you need per project.</p>
                        </div>
                    </div>

                    <div className="landing-demo">
                        <code className="mono">GET localhost:8000/m/<span className="hl">your-slug</span>/users</code>
                    </div>
                </div>
            </div>
        </>
    )
}
