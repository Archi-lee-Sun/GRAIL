import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import Lesson from './Lesson.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App
