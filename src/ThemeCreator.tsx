import React, { useState } from "react";

interface ThemeCreatorProps {
  onCreateTheme: (theme: Theme) => void;
}

const ThemeCreator: React.FC<ThemeCreatorProps> = ({ onCreateTheme }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Helper to determine endpoint
  const getThemeEndpoint = () => {
    if (window.location.hostname === "localhost") {
      return "http://localhost:7071/api/getTheme";
    } else {
      return "https://top-func.azurewebsites.net/api/getTheme";
    }
  };
  const getThemeStatusEndpoint = (instanceId: string) => {
    if (window.location.hostname === "localhost") {
      return `http://localhost:7071/api/getTheme/status/${instanceId}`;
    } else {
      return `https://top-func.azurewebsites.net/api/getTheme/status/${instanceId}`;
    }
  };

  // Load theme from API endpoint using async polling
  const createTheme = async () => {
    setLoadingTheme(true);
    setThemeError(null);
    setStatusMessage(null);
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
      const { instanceId } = await response.json();
      if (!instanceId) throw new Error("No instanceId returned from API");

      // Poll for status
      const pollStatus = async () => {
        const statusEndpoint = getThemeStatusEndpoint(instanceId);
        let done = false;
        while (!done) {
          const statusResp = await fetch(statusEndpoint, { method: "GET", mode: "cors" });
          if (!statusResp.ok) {
            const errorText = await statusResp.text();
            throw new Error(errorText || `Status HTTP error ${statusResp.status}`);
          }
          const statusData = await statusResp.json();
          if (statusData.runtimeStatus === "Running") {
            setStatusMessage(statusData.customStatus?.message || "Generating theme...");
            await new Promise(res => setTimeout(res, 1500));
          } else if (statusData.runtimeStatus === "Completed") {
            setStatusMessage(null);
            const themeObj = statusData.output;
            localStorage.setItem(`turn-of-phrase/theme:${title}`, JSON.stringify(themeObj));
            onCreateTheme(themeObj);
            done = true;
          } else if (statusData.runtimeStatus === "Failed") {
            throw new Error(statusData.customStatus?.message || "Theme generation failed.");
          } else {
            setStatusMessage(`Status: ${statusData.runtimeStatus}`);
            await new Promise(res => setTimeout(res, 1500));
          }
        }
        setLoadingTheme(false);
      };
      await pollStatus();
    } catch (err: any) {
      setThemeError(err.message);
      setLoadingTheme(false);
      setStatusMessage(null);
    }
  };

  return (
    <div id="themeCreator">
      <h2>Create a Theme</h2>
      <input type="text" placeholder="Theme Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Theme Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button onClick={createTheme} disabled={loadingTheme}>
        {loadingTheme ? "Creating..." : "Create Theme"}
      </button>
      {statusMessage && <p>{statusMessage}</p>}
      {themeError && <p>Error creating theme: {themeError}</p>}
    </div>
  );
};

export default ThemeCreator;