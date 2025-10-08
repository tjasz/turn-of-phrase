import { useLocalStorage } from "react-use";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, InputLabel, MenuItem, Select, Slider, Typography } from "@mui/material";
import { defaultGameSettings } from "../defaultGameSettings";
import LocalStorageKeys from "../localStorageKeys";
import { defaultThemeMetadata } from "../defaultTheme";

function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useLocalStorage<GameSettings>(
    LocalStorageKeys.GAME_SETTINGS,
    defaultGameSettings
  );
  const [themeSelection] = useLocalStorage<ThemeMetadata[]>(
    LocalStorageKeys.THEME_SELECTION,
    [defaultThemeMetadata]
  );

  const [numberOfTeams, setNumberOfTeams] = useState(settings!.numberOfTeams);
  const [numberOfPlayersByTeam, setNumberOfPlayersByTeam] = useState(settings!.numberOfPlayersByTeam);
  const [turnTimeSeconds, setTurnTimeSeconds] = useState(settings!.turnTimeSeconds);
  const [pointsToWin, setPointsToWin] = useState(settings!.pointsToWin);
  const [skipPenalty, setSkipPenalty] = useState(settings!.skipPenalty);

  const challengesCount = themeSelection?.reduce((acc, theme) => acc + theme.ChallengesCount, 0) ?? 0;

  return <div>
    <div>
      <p>Playing with {challengesCount} challenges.</p>
      <p><Link to="/settings/themes">Select Themes</Link></p>
    </div>
    <div>
      <Typography id="number-of-teams-slider" gutterBottom>
        Number of Teams:
      </Typography>
      <Slider
        value={numberOfTeams}
        onChange={(_, newValue) => {
          if (newValue === numberOfTeams) return;
          if (newValue as number < numberOfPlayersByTeam.length) {
            setNumberOfTeams(newValue as number);
            setNumberOfPlayersByTeam(prev => prev.slice(0, (newValue as number)));
          }
          else {
            setNumberOfTeams(newValue as number);
            setNumberOfPlayersByTeam(prev => [...prev, ...Array((newValue as number) - prev.length).fill(2)]);
          }
        }}
        aria-labelledby="number-of-teams-slider"
        valueLabelDisplay="auto"
        step={1}
        marks={[2, 3, 4, 5].map(v => ({ value: v, label: v.toString() }))}
        min={2}
        max={5}
      />
    </div>
    <div>
      <Typography id="turn-time-slider" gutterBottom>
        Turn Time (seconds):
      </Typography>
      <Slider
        value={turnTimeSeconds}
        onChange={(_, newValue) => setTurnTimeSeconds(newValue as number)}
        aria-labelledby="turn-time-slider"
        valueLabelDisplay="auto"
        step={null}
        marks={[10, 20, 30, 40, 50, 60].map(v => ({ value: v, label: v.toString() }))}
        min={10}
        max={60}
      />
    </div>
    <div>
      <Typography id="points-to-win-slider" gutterBottom>
        Points to Win:
      </Typography>
      <Slider
        value={pointsToWin}
        onChange={(_, newValue) => setPointsToWin(newValue as number)}
        aria-labelledby="points-to-win-slider"
        valueLabelDisplay="auto"
        step={null}
        marks={[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(v => ({ value: v, label: v.toString() }))}
        min={5}
        max={50}
      />
    </div>
    <div>
      <InputLabel id="skip-penalty-label">
        Skip Penalty:
      </InputLabel>
      <Select
        labelId="skip-penalty-label"
        value={skipPenalty}
        label="Skip Penalty"
        onChange={e => setSkipPenalty(Number(e.target.value))}
      >
        {[0, -0.25, -0.5, -1, -2].map(v => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </Select>
    </div>
    <Button onClick={_ => {
      setSettings({
        numberOfTeams,
        numberOfPlayersByTeam,
        turnTimeSeconds,
        pointsToWin,
        skipPenalty,
      });
      navigate(-1);
    }}>
      Confirm
    </Button>
  </div >
}

export default Settings;
