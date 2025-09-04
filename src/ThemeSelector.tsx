import React, { useEffect, useState } from "react";

interface ThemeSelectorProps {
  onSelectTheme: (theme: Theme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onSelectTheme }) => {
  // Dynamically get built-in theme files using import.meta.glob
  const themeModules = import.meta.glob('/public/themes/*.json');
  const themeFiles = Object.keys(themeModules).map(path => path.split('/').pop()!);

  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);

  // Load theme when selectedThemeFile changes
  useEffect(() => {
    setLoadingTheme(true);
    setTheme(null);
    setThemeError(null);
    fetch(`${import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL}/themes/${themeFiles[selectedThemeIndex]}`)
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
  }, [selectedThemeIndex]);

  return (
    <div id="themeSelector">
      <h2>Select a Theme</h2>
      <div className="themeDescriptionContainer">
        <button onClick={() => setSelectedThemeIndex(i => (i - 1 + themeFiles.length) % themeFiles.length)}>
          &lt;
        </button>
        <div className="themeDescription">
          {loadingTheme && <p>Loading theme...</p>}
          {themeError && <p>Error loading theme: {themeError}</p>}
          {theme && (
            <>
              <h3>{theme.Title}</h3>
              <p>{theme.Description}</p>
            </>
          )}
        </div>
        <button onClick={() => setSelectedThemeIndex(i => (i + 1) % themeFiles.length)}>
          &gt;
        </button>
      </div>
    </div >
  );
};

export default ThemeSelector;