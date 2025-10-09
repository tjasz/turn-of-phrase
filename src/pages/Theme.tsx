import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTheme } from "../themeRepository";
import { Typography } from "@mui/material";

function Theme() {
  let { themeId } = useParams();

  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    getTheme(themeId!).then(setTheme);
  }, [themeId]);

  if (!theme) {
    return <div>Theme {themeId} not found.</div>;
  }

  return <div>
    <h2>{theme.Title}</h2>
    <p>{theme.Description}</p>
    {theme.Challenges.map((challenge, i) => (
      <div key={i}>
        <p>
          <strong>{i + 1}. {challenge.Main}</strong>
          <br />
          {challenge.Related.filter(r => r.trim() !== "").join(", ")}
        </p>
      </div>
    ))}
  </div>;
}

export default Theme;