import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import './AuthForm.css'

const API = 'https://mock-crud-backend.vercel.app'

export default function SignUp() {
    const navigate = useNavigate()
    const { show } = useToast()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const submit = async e => {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            const res = await fetch(`${API}/api/signup`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Sign up failed')
            show('Account created! Please sign in.', 'success')
            setTimeout(() => navigate('/signin'), 800)
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
                        <button type="submit" className="btn btn-teal auth-submit" disabled={loading}>
                            {loading ? <><span className="spinner" /> Creating account…</> : 'Create account'}
                        </button>
                    </form>
                    <p className="auth-footer">Already have an account? <Link to="/signin">Sign in</Link></p>
                </div>
            </div>
        </>
    )
}
