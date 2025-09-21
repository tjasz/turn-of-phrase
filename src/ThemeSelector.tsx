
import React, { useEffect, useState } from "react";
import ThemeCreator from "./ThemeCreator";
import defaultTheme from "./defaultTheme";
import ThemeCreatorStepper from "./ThemeCreation/ThemeCreatorStepper";
import ThemeView from "./ThemeView";
import { Card, CardHeader, Grid } from "@mui/material";

interface ThemeSelectorProps {
  onSelectChallenges: (challenges: Challenge[]) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onSelectChallenges }) => {
  // Get built-in theme files
  const themeModules = import.meta.glob('/public/themes/*.json');
  const themeFiles = Object.keys(themeModules).map(path => path.split('/').pop()!);

  // Get localStorage themes
  function getLocalThemes(): { key: string; theme: Theme }[] {
    const themes: { key: string; theme: Theme }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('turn-of-phrase/theme:')) {
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
  const [creatingTheme, setCreatingTheme] = useState(false);
  const [allThemes, setAllThemes] = useState<Array<{ type: 'default' | 'public' | 'local'; name: string; key?: string; file?: string; theme?: Theme }>>([]);
  const [selectedThemeIndices, setSelectedThemeIndices] = useState<Set<number>>(new Set([0]));
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [themeErrors, setThemeErrors] = useState<string[]>([]);
  const [themes, setThemes] = useState<Theme[]>([defaultTheme]);

  // On mount, populate allThemes
  useEffect(() => {
    const localThemes = getLocalThemes();
    const combined: Array<{ type: 'default' | 'public' | 'local'; name: string; key?: string; file?: string; theme?: Theme }> = [
      { type: 'default', name: 'Default', theme: defaultTheme },
      ...themeFiles.map(file => ({ type: 'public' as const, name: file.replace('.json', ''), file })),
      ...localThemes.map(({ key, theme }) => ({ type: 'local' as const, name: theme.Title, key, theme }))
    ];
    setAllThemes(combined);
  }, []);

  // Load selected themes when selection changes
  useEffect(() => {
    if (allThemes.length === 0) return;
    setLoadingThemes(true);
    setThemes([]);
    setThemeErrors([]);
    const indices = Array.from(selectedThemeIndices);
    const themePromises = indices.map(idx => {
      const selected = allThemes[idx];
      if (selected.type === 'public') {
        return fetch(`${import.meta.env.BASE_URL}themes/${selected.file}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to load theme');
            return res.json();
          })
          .catch(err => ({ error: err.message }));
      } else {
        return Promise.resolve(selected.theme!);
      }
    });
    Promise.all(themePromises).then(results => {
      const loadedThemes: Theme[] = [];
      const errors: string[] = [];
      results.forEach((result, i) => {
        if (result && !result.error) {
          loadedThemes.push(result as Theme);
        } else {
          errors.push(`Error loading theme: ${result.error}`);
        }
      });
      setThemes(loadedThemes);
      setThemeErrors(errors);
      setLoadingThemes(false);
    });
  }, [selectedThemeIndices, allThemes]);

  const handleCheckboxChange = (idx: number) => {
    setSelectedThemeIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  if (creatingTheme) {
    return <ThemeCreatorStepper
      onCreateTheme={theme => {
        setThemes(prev => [...prev, theme]);
        // Add new theme to allThemes and select it
        setAllThemes(prev => [...prev, { type: 'local', name: theme.Title, theme }]);
        setSelectedThemeIndices(prev => new Set([...prev, prev.size]));
        setCreatingTheme(false);
      }}
      onCancel={() => setCreatingTheme(false)}
    />;
  }

  return (
    <div id="themeSelector">
      <h2>Select Themes</h2>
      <div className="themeListContainer">
        <Grid container spacing={1}>
          {allThemes.map((theme, idx) => (
            <ThemeView
              key={idx}
              theme={theme.theme || { Title: theme.name, Description: '', Challenges: [] }}
              selected={selectedThemeIndices.has(idx)}
              onSelectedChange={() => handleCheckboxChange(idx)}
            />
          ))}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
            <Card onClick={() => setCreatingTheme(true)} style={{ cursor: 'pointer', height: '100%', backgroundColor: 'var(--secondary)', color: 'var(--accent)' }}>
              <CardHeader title="Create New Theme" />
            </Card>
          </Grid>
        </Grid>
        {allThemes.length === 0 && <p>No themes available.</p>}
        {loadingThemes && <p>Loading themes...</p>}
        {themeErrors.length > 0 && themeErrors.map((err, i) => <p key={i} style={{ color: 'red' }}>{err}</p>)}
      </div>
      <button onClick={() => onSelectChallenges(themes.flatMap(t => t.Challenges))} disabled={themes.length === 0 || loadingThemes}>
        Confirm
      </button>
    </div>
  );
};

export default ThemeSelector;