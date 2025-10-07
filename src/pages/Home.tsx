import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "react-use";

function Home() {
  const navigate = useNavigate();
  const [gameState, _, removeGameState] = useLocalStorage<GameState>(
    'turn-of-phrase/play'
  );

  return <div>
    <Button variant="contained" color="primary" onClick={() => {
      removeGameState();
      navigate("/play");
    }}>
      New Game
    </Button>
    <br />
    <Button variant="contained" color="primary" disabled={!gameState} onClick={() => {
      navigate("/play");
    }}>
      Resume Game
    </Button>
    <br />
    <Button variant="contained" color="primary" onClick={() => {
      navigate("/guide");
    }}>
      How to Play
    </Button>
    <br />
    <Button variant="contained" color="primary" onClick={() => {
      navigate("/settings");
    }}>
      Settings
    </Button>
  </div>
}

export default Home;