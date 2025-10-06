import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Play, Guide } from './pages'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <header>
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="Turn of Phrase Logo"
        />
        <h1>Turn of Phrase</h1>
      </header>
      <Routes>
        <Route path="/" element={<Play />} />
        <Route path="/guide" element={<Guide />} />
      </Routes>
      <footer>
        <p>&copy; 2025 Tyler Jaszkowiak | <a href="https://github.com/tjasz/turn-of-phrase" target="_blank">GitHub</a></p>
      </footer>
    </BrowserRouter>
  </StrictMode>,
)
