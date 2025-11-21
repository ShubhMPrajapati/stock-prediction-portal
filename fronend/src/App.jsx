import { useState } from 'react'
// import './App.css'
import './assets/css/style.css'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Main } from './components/Main'
import { Register } from './components/Register'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Login } from './components/Login'
import { AuthProvider } from './AuthProvider'
import { Dashboard } from './components/dashboard/Dashboard'
import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'
function App() {

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path='/' element={<Main />} />
            <Route path='/register' element={<PublicRoute> <Register/></PublicRoute>} />
            <Route path='/login' element={<PublicRoute><Login/></PublicRoute>} />
            <Route path='/Dashboard' element={<PrivateRoute> <Dashboard /></PrivateRoute>} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </>

  )
}

export default App
