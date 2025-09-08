import React, { useState } from "react";

interface ThemeCreatorProps {
  onCreateTheme: (theme: Theme) => void;
}

const ThemeCreator: React.FC<ThemeCreatorProps> = ({ onCreateTheme }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  // Helper to determine endpoint
  const getThemeEndpoint = () => {
    // Use window.location.hostname to determine environment
    if (window.location.hostname === "localhost") {
      return "http://localhost:7071/api/getTheme";
    } else {
      return "https://top-func.azurewebsites.net/api/getTheme";
    }
  };

  // Load theme from API endpoint
  const createTheme = async () => {
    setLoadingTheme(true);
    setThemeError(null);
    try {
      const endpoint = getThemeEndpoint();
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Title: title, Description: description })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      const themeObj = {
        Title: title,
        Description: description,
        Challenges: data
      };
      localStorage.setItem(`turn-of-phrase/theme:${title}`, JSON.stringify(themeObj));
      onCreateTheme(themeObj);
      setLoadingTheme(false);
    } catch (err: any) {
      setThemeError(err.message);
      setLoadingTheme(false);
    }
  };

  return (
    <div id="themeCreator">
      <h2>Create a Theme</h2>
      <input type="text" placeholder="Theme Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input type="text" placeholder="Theme Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button onClick={createTheme} disabled={loadingTheme}>
        {loadingTheme ? "Creating..." : "Create Theme"}
      </button>
      {themeError && <p>Error creating theme: {themeError}</p>}
    </div >
  );
};

export default ThemeCreator;