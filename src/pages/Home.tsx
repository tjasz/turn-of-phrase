import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "react-use";
import LocalStorageKeys from "../localStorageKeys";

function Home() {
  const navigate = useNavigate();
  const [gameState, _, removeGameState] = useLocalStorage<GameState>(
    LocalStorageKeys.GAME_STATE
  );

  return <div id="home">
    <Button variant="contained" color="primary" onClick={() => {
      removeGameState();
      navigate("/play");
    }}>
      New Game
    </Button>
    <Button variant="contained" color="primary" disabled={!gameState} onClick={() => {
      navigate("/play");
    }}>
      Resume Game
    </Button>
    <Button variant="contained" color="primary" onClick={() => {
      navigate("/guide");
    }}>
      How to Play
    </Button>
    <Button variant="contained" color="primary" onClick={() => {
      navigate("/settings");
    }}>
      Settings
    </Button>
  </div>
}

export default Home;