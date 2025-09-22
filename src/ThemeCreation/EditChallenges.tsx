import { Box, IconButton, TextField } from "@mui/material";
import { Delete } from "@mui/icons-material";

interface IEditChallengesProps {
  challenges: Challenge[];
  setChallenges: (challenges: Challenge[]) => void;
}

const EditChallenges: React.FC<IEditChallengesProps> = ({ challenges, setChallenges }) => {

  return (
    <Box>
      {challenges.map((challenge, i) => (
        <Box key={i}>
          <TextField
            label={`Challenge ${i + 1}`}
            value={JSON.stringify(challenge)}
            onChange={(e) => setChallenges(challenges.map((ch, idx) => idx === i ? JSON.parse(e.target.value) : ch))}
            fullWidth
            variant="outlined"
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <>
                    <IconButton title="Delete" onClick={() => setChallenges(challenges.filter((_, idx) => i !== idx))}>
                      <Delete />
                    </IconButton>
                  </>
                )
              }
            }}
          />
        </Box>
      ))}
      <button onClick={() => setChallenges([...challenges, { Main: "", Related: ["", "", "", ""] }])} title="Add Challenge">
        Add
      </button>
    </Box>
  );
}

export default EditChallenges;
