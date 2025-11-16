import { useState } from 'react'
// import './App.css'
import './assets/css/style.css'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Main } from './components/Main'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  )
}

export default App
