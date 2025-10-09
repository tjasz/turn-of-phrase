import { HashRouter, Route, Routes, Link } from "react-router-dom";
import { ThemeProvider } from '@mui/material';
import { Home, Play, Guide, Settings, CreateTheme, ThemeSelector, Theme } from './pages'
import muiTheme from './muiTheme';

function App() {
  return <HashRouter>
    <ThemeProvider theme={muiTheme}>
      <header>
        <Link to=".." relative="path">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Turn of Phrase Logo"
          />
        </Link>
        <h1>Turn of Phrase</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/themes" element={<ThemeSelector />} />
          <Route path="/settings/themes/:themeId" element={<Theme />} />
          <Route path="/settings/themes/$create" element={<CreateTheme />} />
          <Route path="/settings/themes/$create/:operationId" element={<CreateTheme />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer>
        <p>&copy; 2025 Tyler Jaszkowiak | <a href="https://github.com/tjasz/turn-of-phrase" target="_blank">GitHub</a></p>
      </footer>
    </ThemeProvider>
  </HashRouter>;
}

export default App;