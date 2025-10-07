import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import { ThemeProvider } from '@mui/material';
import { Home, Play, Guide, Settings } from './pages'
import muiTheme from './muiTheme';

function App() {
  return <BrowserRouter>
    <ThemeProvider theme={muiTheme}>
      <header>
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="Turn of Phrase Logo"
        />
        <h1>Turn of Phrase</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/guide">Guide</Link>
          <Link to="/play">Play</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/settings" element={<Settings />}>
            <Route path="themes" element={<div>Select Themes (not implemented)</div>}>
              <Route path="$create" element={<div>Create Theme (not implemented)</div>} />
              <Route path=":themeId" element={<div>Theme Details (not implemented)</div>} />
            </Route>
          </Route>
        </Routes>
      </main>
      <footer>
        <p>&copy; 2025 Tyler Jaszkowiak | <a href="https://github.com/tjasz/turn-of-phrase" target="_blank">GitHub</a></p>
      </footer>
    </ThemeProvider>
  </BrowserRouter>;
}

export default App;