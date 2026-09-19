import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import './AuthForm.css'
import { GoogleLogin } from '@react-oauth/google'

const API = 'https://mock-crud-backend.vercel.app'

export default function SignUp() {
    const navigate = useNavigate()
    const { loginWithGoogle } = useAuth()
    const { show } = useToast()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
        return () => observer.disconnect()
    }, [])

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true)
            await loginWithGoogle(credentialResponse.credential)
            show('Successfully signed up and logged in with Google!', 'success')
            navigate('/app')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

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

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google sign up failed')}
                            theme={isDark ? 'filled_black' : 'outline'}
                            shape="rectangular"
                            text="signup_with"
                            logo_alignment="left"
                            width="300"
                        />
                    </div>

                    <div className="auth-divider">
                        <span>or continue with email</span>
                    </div>

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
