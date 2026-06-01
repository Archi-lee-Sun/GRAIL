import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import Lesson from './Lesson.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import VaultEntryPage from './VaultEntryPage.jsx'
import VaultPage from './VaultPage.jsx'

function LoginRoute() {
  return localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : <Login />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRoute />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lesson/:slug/:stage" element={<Lesson />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/vault/:slug" element={<VaultEntryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
