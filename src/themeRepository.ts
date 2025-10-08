import defaultTheme, { defaultThemeMetadata } from "./defaultTheme";
import LocalStorageKeys from "./localStorageKeys";

function getLocalTheme(themeId: string): Theme | null {
  const themeJson = localStorage.getItem(`${LocalStorageKeys.THEME_PREFIX}${themeId}`);
  return !!themeJson ? JSON.parse(themeJson) : null;
}

async function getBuiltInTheme(themeId: string): Promise<Theme | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}themes/${themeId}.json`);
    if (!response.ok) throw new Error('Failed to load theme');
    return await response.json() as Theme;
  } catch {
    return null;
  }
}

export async function getTheme(themeId: string): Promise<Theme | null> {
  if (themeId === defaultThemeMetadata.Id) {
    return defaultTheme;
  }
  return getLocalTheme(themeId) ?? await getBuiltInTheme(themeId);
}

function getLocalThemes(): Promise<Theme[]> {
  const results: Theme[] = [];
  return new Promise((resolve) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LocalStorageKeys.THEME_PREFIX)) {
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

export async function listThemeMetadata(): Promise<ThemeMetadata[]> {
  const themes = [...await getBuiltInThemes(), ...await getLocalThemes()];
  return [defaultThemeMetadata, ...themes.map(theme => ({
    Id: theme.Id,
    Title: theme.Title,
    Description: theme.Description,
    ChallengesCount: theme.Challenges.length,
  }))];
}