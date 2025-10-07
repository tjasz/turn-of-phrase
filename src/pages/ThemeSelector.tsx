
import React, { useEffect, useState } from "react";
import defaultTheme from "../defaultTheme";
import ThemeView from "../ThemeView";
import { Button, Card, CardHeader, Grid } from "@mui/material";
import LocalStorageKeys from "../localStorageKeys";
import { useNavigate } from "react-router-dom";
import { listThemeMetadata } from "../themeRepository";
import { useLocalStorage } from "react-use";

interface ThemeSelectorProps {
}

const ThemeSelector: React.FC<ThemeSelectorProps> = () => {
  const navigate = useNavigate();

  const [storedThemeIds, setStoredThemeIds] = useLocalStorage<string[]>(
    LocalStorageKeys.THEME_SELECTION,
    []
  );

  // Store all selectable themes: built-in and local
  const [themeIds, setThemeIds] = useState<Set<string>>(new Set(storedThemeIds ?? []));
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [themes, setThemes] = useState<ThemeMetadata[]>([]);

  // On mount, populate allThemes
  useEffect(() => {
    listThemeMetadata().then((themes: ThemeMetadata[]) => {
      setThemes(themes);
      setLoadingThemes(false);
    });
  }, []);

  const handleCheckboxChange = (id: string) => {
    setThemeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div id="themeSelector">
      <h2>Select Themes</h2>
      <div className="themeListContainer">
        <Grid container spacing={1}>
          {themes.map((theme, idx) => (
            <ThemeView
              key={idx}
              theme={theme}
              selected={themeIds.has(theme.Id)}
              onSelectedChange={() => handleCheckboxChange(theme.Id)}
            />
          ))}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
            <Card
              onClick={() => {
                setStoredThemeIds(Array.from(themeIds));
                navigate("/settings/themes/$create");
              }}
              style={{ cursor: 'pointer', height: '100%', color: 'var(--accent)' }}
            >
              <CardHeader title="Create New Theme" />
            </Card>
          </Grid>
        </Grid>
        {themes.length === 0 && <p>No themes available.</p>}
        {loadingThemes && <p>Loading themes...</p>}
      </div>
      <Button
        onClick={() => {
          setStoredThemeIds(Array.from(themeIds));
          navigate("/settings");
        }}
        disabled={themes.length === 0 || loadingThemes}
      >
        Confirm
      </Button>
    </div >
  );
};

export default ThemeSelector;