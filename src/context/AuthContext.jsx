import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const API = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://mock-crud-backend.vercel.app';

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
    })

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setToken(newToken)
        setUser(userData)
    }

    const loginWithGoogle = async (credential) => {
        const url = `${API}/api/auth/google`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Google Login failed');
        login(data.token, data.token_data);
    }


    const logout = async () => {
        try {
            await fetch(`${API}/api/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            })
        } catch (_) { }
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loginWithGoogle }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() { return useContext(AuthContext) }
