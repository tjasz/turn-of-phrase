import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, TextField } from "@mui/material";
import { Delete, ExpandMore } from "@mui/icons-material";

interface IEditChallengesProps {
  challenges: Challenge[];
  setChallenges: (challenges: Challenge[]) => void;
}

const EditChallenges: React.FC<IEditChallengesProps> = ({ challenges, setChallenges }) => {

  return (
    <Box>
      {challenges.map((challenge, i) => (
        <Accordion key={i}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            {challenge.Main
              ? `${challenge.Main}${challenge.Related.filter(r => r.trim() !== "").length ? ` - (${challenge.Related.filter(r => r.trim() !== "").join(", ")})` : ""}`
              : "New Challenge"}
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="Main Challenge"
              value={challenge.Main}
              onChange={(e) => setChallenges(challenges.map((ch, idx) => idx === i ? { ...ch, Main: e.target.value } : ch))}
              fullWidth
              variant="outlined"
              margin="normal"
            />
            {challenge.Related.map((related, j) => (
              <TextField
                key={j}
                label={`Related Phrase ${j + 1}`}
                value={related}
                onChange={(e) => setChallenges(challenges.map((ch, idx) => idx === i ? { ...ch, Related: ch.Related.map((r, rIdx) => rIdx === j ? e.target.value : r) } : ch))}
                fullWidth
                variant="outlined"
                margin="normal"
              />
            ))}
            <IconButton title="Delete" onClick={() => setChallenges(challenges.filter((_, idx) => i !== idx))}>
              <Delete />
            </IconButton>
          </AccordionDetails>
        </Accordion>
      ))}
      <button onClick={() => setChallenges([...challenges, { Main: "", Related: ["", "", "", ""] }])} title="Add Challenge">
        Add
      </button>
    </Box>
  );
}

export default EditChallenges;
