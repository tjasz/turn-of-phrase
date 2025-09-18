import { Box, TextField } from "@mui/material";

interface IStepOneProps {
  title: string;
  description: string;
  subThemes: string[];
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSubThemes: (subThemes: string[]) => void;
}

const StepOne: React.FC<IStepOneProps> = ({ title, description, subThemes, setTitle, setDescription, setSubThemes }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        variant="outlined"
        margin="normal"
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        variant="outlined"
        margin="normal"
        multiline
        rows={4}
      />
      <TextField
        label="Sub-themes"
        value={subThemes.join(", ")}
        onChange={(e) => setSubThemes(e.target.value.split(", "))}
        fullWidth
        variant="outlined"
        margin="normal"
      />
    </Box>
  );
}

export default StepOne;