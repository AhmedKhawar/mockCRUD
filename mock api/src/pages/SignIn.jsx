import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './AuthForm.css'

const API = 'http://localhost:8000'

export default function SignIn() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const submit = async e => {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            const res = await fetch(`${API}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Login failed')
            const token = data.token || data.data?.token
            if (!token) throw new Error('No token received')
            login(token, { email: form.email })
            navigate('/app')
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    return (
        <>
            <Navbar />
            <div className="auth-page">
                <div className="auth-box">
                    <h1>Sign in</h1>
                    <p className="auth-sub">Welcome back to MockCRUD</p>

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
                        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        No account? <Link to="/signup">Sign up free</Link>
                    </p>
                </div>
            </div>
        </>
    )
}
