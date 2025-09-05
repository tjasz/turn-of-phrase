import React, { useEffect, useState } from "react";
import ThemeCreator from "./ThemeCreator";

interface ThemeSelectorProps {
  onSelectTheme: (theme: Theme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onSelectTheme }) => {

  // Get built-in theme files
  const themeModules = import.meta.glob('/public/themes/*.json');
  const themeFiles = Object.keys(themeModules).map(path => path.split('/').pop()!);

  // Get localStorage themes
  function getLocalThemes(): { key: string; theme: Theme }[] {
    const themes: { key: string; theme: Theme }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('theme:')) {
        try {
          const theme = JSON.parse(localStorage.getItem(key)!);
          if (theme && theme.Title) {
            themes.push({ key, theme });
          }
        } catch { }
      }
    }
    return themes;
  }

  // Store all selectable themes: built-in and local
  const [allThemes, setAllThemes] = useState<Array<{ type: 'public' | 'local'; name: string; key?: string; file?: string; theme?: Theme }>>([]);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);

  // On mount, populate allThemes
  useEffect(() => {
    const localThemes = getLocalThemes();
    const combined: Array<{ type: 'public' | 'local'; name: string; key?: string; file?: string; theme?: Theme }> = [
      ...themeFiles.map(file => ({ type: 'public' as const, name: file.replace('.json', ''), file })),
      ...localThemes.map(({ key, theme }) => ({ type: 'local' as const, name: theme.Title, key, theme }))
    ];
    setAllThemes(combined);
  }, []);

  // Load theme when selectedThemeIndex changes
  useEffect(() => {
    if (allThemes.length === 0) return;
    setLoadingTheme(true);
    setTheme(null);
    setThemeError(null);
    const selected = allThemes[selectedThemeIndex];
    if (selected.type === 'public') {
      fetch(`${import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL}/themes/${selected.file}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load theme');
          return res.json();
        })
        .then((data: Theme) => {
          setTheme(data);
          onSelectTheme(data);
          setLoadingTheme(false);
        })
        .catch(err => {
          setThemeError(err.message);
          setLoadingTheme(false);
        });
    } else if (selected.type === 'local') {
      setTheme(selected.theme!);
      onSelectTheme(selected.theme!);
      setLoadingTheme(false);
    }
  }, [selectedThemeIndex, allThemes]);

  return (
    <div id="themeSelector">
      <h2>Select a Theme</h2>
      <div className="themeDescriptionContainer">
        <button onClick={() => setSelectedThemeIndex(i => (i - 1 + allThemes.length) % allThemes.length)}>
          &lt;
        </button>
        <div className="themeDescription">
          {loadingTheme && <p>Loading theme...</p>}
          {themeError && <p>Error loading theme: {themeError}</p>}
          {theme && (
            <>
              <h3>{theme.Title}</h3>
              <p>{theme.Description}</p>
              {allThemes[selectedThemeIndex]?.type === 'local' && <span style={{ fontStyle: 'italic', fontSize: '0.9em' }}>(Saved theme)</span>}
            </>
          )}
        </div>
        <button onClick={() => setSelectedThemeIndex(i => (i + 1) % allThemes.length)}>
          &gt;
        </button>
      </div>
      <ThemeCreator onCreateTheme={theme => {
        setTheme(theme);
        onSelectTheme(theme);
      }} />
    </div >
  );
};

export default ThemeSelector;