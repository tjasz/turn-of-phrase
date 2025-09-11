import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <header>
      <img
        src={`${import.meta.env.BASE_URL}logo.svg`}
        alt="Turn of Phrase Logo"
      />
      <h1>Turn of Phrase</h1>
    </header>
    <App />
    <footer>
      <p>&copy; 2025 Tyler Jaszkowiak | <a href="https://github.com/tjasz/turn-of-phrase" target="_blank">GitHub</a></p>
    </footer>
  </StrictMode>,
)
