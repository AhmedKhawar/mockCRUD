import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import ProjectView from './pages/ProjectView'

function Guard({ children }) {
    const { token } = useAuth()
    return token ? children : <Navigate to="/signin" replace />
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/app" element={<Guard><Dashboard /></Guard>} />
            <Route path="/app/:projectId" element={<Guard><ProjectView /></Guard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
