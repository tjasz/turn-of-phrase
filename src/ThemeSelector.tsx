
import React, { useEffect, useState } from "react";
import defaultTheme from "./defaultTheme";
import ThemeCreatorStepper from "./ThemeCreation/ThemeCreatorStepper";
import ThemeView from "./ThemeView";
import { Button, Card, CardHeader, Grid } from "@mui/material";

interface ThemeSelectorProps {
  onSelectChallenges: (challenges: Challenge[]) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onSelectChallenges }) => {
  // Get localStorage themes
  function getLocalThemes(): Promise<Theme[]> {
    const results: Theme[] = [];
    return new Promise((resolve) => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('turn-of-phrase/theme:')) {
          try {
            const theme = JSON.parse(localStorage.getItem(key)!);
            if (theme && theme.Title) {
              results.push(theme);
            }
          } catch { }
        }
      }
      resolve(results);
    });
  }

  // Get built-in themes
  async function getBuiltInThemes(): Promise<Theme[]> {
    const themeModules = import.meta.glob('/public/themes/*.json');
    const themeFiles = Object.keys(themeModules).map(path => path.split('/').pop()!);
    return Promise.all(themeFiles.map(async file => {
      try {
        const theme = await fetch(`${import.meta.env.BASE_URL}themes/${file}`)
          .then(async res => {
            if (!res.ok) throw new Error('Failed to load theme');
            return await res.json() as Theme;
          })
        return theme;
      } catch {
        return null;
      }
    }).filter(p => p !== null)) as Promise<Theme[]>;
  }

  // Store all selectable themes: built-in and local
  const [creatingTheme, setCreatingTheme] = useState(false);
  const [selectedThemeIndices, setSelectedThemeIndices] = useState<Set<number>>(new Set([0]));
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [themes, setThemes] = useState<Theme[]>([defaultTheme]);

  // On mount, populate allThemes
  useEffect(() => {
    const promises = [getLocalThemes(), getBuiltInThemes()];
    Promise.all(promises).then(([localThemes, builtInThemes]) => {
      const combinedThemes = [defaultTheme, ...builtInThemes, ...localThemes];
      setThemes(combinedThemes);
      setLoadingThemes(false);
    });
  }, [creatingTheme]);

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
          {themes.map((theme, idx) => (
            <ThemeView
              key={idx}
              theme={theme}
              selected={selectedThemeIndices.has(idx)}
              onSelectedChange={() => handleCheckboxChange(idx)}
            />
          ))}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
            <Card onClick={() => setCreatingTheme(true)} style={{ cursor: 'pointer', height: '100%', color: 'var(--accent)' }}>
              <CardHeader title="Create New Theme" />
            </Card>
          </Grid>
        </Grid>
        {themes.length === 0 && <p>No themes available.</p>}
        {loadingThemes && <p>Loading themes...</p>}
      </div>
      <Button onClick={() => onSelectChallenges(themes.filter((_, idx) => selectedThemeIndices.has(idx)).flatMap(t => t.Challenges))} disabled={themes.length === 0 || loadingThemes}>
        Confirm
      </Button>
    </div>
  );
};

export default ThemeSelector;