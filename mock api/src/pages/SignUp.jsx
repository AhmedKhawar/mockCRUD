import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './AuthForm.css'

const API = 'http://localhost:8000'

export default function SignUp() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const submit = async e => {
        e.preventDefault()
        setError(''); setSuccess(''); setLoading(true)
        try {
            const res = await fetch(`${API}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Sign up failed')
            setSuccess('Account created! Redirecting…')
            setTimeout(() => navigate('/signin'), 1400)
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    return (
        <>
            <Navbar />
            <div className="auth-page">
                <div className="auth-box">
                    <h1>Create account</h1>
                    <p className="auth-sub">Get started with MockCRUD for free</p>

                    <form onSubmit={submit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input name="email" type="email" className="form-input"
                                placeholder="you@example.com" value={form.email} onChange={change} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input name="password" type="password" className="form-input"
                                placeholder="••••••••" value={form.password} onChange={change} required />
                        </div>
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                            {loading ? <><span className="spinner" /> Creating…</> : 'Sign Up'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/signin">Sign in</Link>
                    </p>
                </div>
            </div>
        </>
    )
}
