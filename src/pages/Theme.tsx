import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTheme } from "../themeRepository";

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
    <h2>{theme.Title} ({theme.Id})</h2>
    <p>{theme.Description}</p>
    <table style={{
      borderCollapse: "collapse",
      width: "100%",
      border: "1px solid black",
      textAlign: "left",
    }}>
      {theme.Challenges.map((challenge, i) => (
        <tr key={i}>
          <th>{i + 1}. {challenge.Main}</th>
          {challenge.Related.filter(r => r.trim() !== "").map((related, j) => (
            <td key={j}>{related}</td>
          ))}
        </tr>
      ))}
    </table>
  </div>;
}

export default Theme;