import { Link, useNavigate } from "react-router-dom";
import { useLocalStorage } from "react-use";
import ThemeSelector from "../ThemeSelector";
import LocalStorageKeys from "../localStorageKeys";

function Themes() {
  const navigate = useNavigate();
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>(LocalStorageKeys.GAME_SETTINGS);

  if (!gameSettings) {
    return <p>Game settings are not defined. Go to <Link to="/settings">Settings</Link> to define them.</p>
  }

  return <ThemeSelector onSelectChallenges={(challenges) => {
    setGameSettings({ ...gameSettings, theme: { Title: "Composite Theme", Description: "", Challenges: challenges } });
    navigate("/settings");
  }} />;
}

export default Themes;