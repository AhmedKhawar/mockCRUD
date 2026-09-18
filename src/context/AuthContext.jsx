import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

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
        const url = window.location.hostname === "localhost"
            ? "http://localhost:8000/api/auth/google"
            : "https://mock-crud-backend.vercel.app/api/auth/google";

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
            await fetch('https://mock-crud-backend.vercel.app/api/logout', {
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
