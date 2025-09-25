import { Box, Button, IconButton, TextField } from "@mui/material";
import { Delete } from "@mui/icons-material";

interface IAddMainPhrasesProps {
  title: string;
  description: string;
  subThemes: string[];
  mainPhrases: string[];
  setMainPhrases: (mainPhrases: string[]) => void;
}

const AddMainPhrases: React.FC<IAddMainPhrasesProps> = ({ mainPhrases, setMainPhrases }) => {

  return (
    <Box>
      {mainPhrases.map((mainPhrase, i) => (
        <Box key={i}>
          <TextField
            label={`Main Phrase ${i + 1}`}
            value={mainPhrase}
            onChange={(e) => setMainPhrases(mainPhrases.map((mp, idx) => idx === i ? e.target.value : mp))}
            fullWidth
            variant="outlined"
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <>
                    <IconButton title="Delete" onClick={() => setMainPhrases(mainPhrases.filter((_, idx) => i !== idx))}>
                      <Delete />
                    </IconButton>
                  </>
                )
              }
            }}
          />
        </Box>
      ))}
      <Button onClick={() => setMainPhrases([...mainPhrases, ""])} title="Add Main Phrase">
        Add
      </Button>
    </Box>
  );
}

export default AddMainPhrases;