import React, { useState } from "react";
import { getAiTheme } from "./openai";

interface ThemeCreatorProps {
  onCreateTheme: (theme: Theme) => void;
}

const ThemeCreator: React.FC<ThemeCreatorProps> = ({ onCreateTheme }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  // Load theme when selectedThemeFile changes
  const createTheme = () => {
    setLoadingTheme(true);
    setThemeError(null);
    getAiTheme(title, description, apiKey)
      .then(data => {
        // Save theme to localStorage before calling onCreateTheme
        const themeObj = {
          Title: title,
          Description: description,
          Challenges: data
        };
        localStorage.setItem(`turn-of-phrase/theme:${title}`, JSON.stringify(themeObj));
        onCreateTheme(themeObj);
        setLoadingTheme(false);
      })
      .catch(err => {
        setThemeError(err.message);
        setLoadingTheme(false);
      });
  }

  return (
    <div id="themeCreator">
      <h2>Create a Theme</h2>
      <input type="text" placeholder="Theme Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input type="text" placeholder="Theme Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="text" placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
      <button onClick={createTheme} disabled={loadingTheme}>
        {loadingTheme ? "Creating..." : "Create Theme"}
      </button>
      {themeError && <p>Error creating theme: {themeError}</p>}
    </div >
  );
};

export default ThemeCreator;