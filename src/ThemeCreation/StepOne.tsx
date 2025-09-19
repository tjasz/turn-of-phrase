import { Box, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useState } from "react";
import { Delete } from "@mui/icons-material";

interface IStepOneProps {
  title: string;
  description: string;
  subThemes: string[];
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSubThemes: (subThemes: string[]) => void;
}


const getSubThemesApiUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:7071/api/getSubThemes";
  } else {
    return "https://top-func.azurewebsites.net/api/getSubThemes";
  }
};

const StepOne: React.FC<IStepOneProps> = ({ title, description, subThemes, setTitle, setDescription, setSubThemes }) => {
  const [loading, setLoading] = useState(false);

  const handleFetchSubThemes = async () => {
    setLoading(true);
    try {
      const response = await fetch(getSubThemesApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Title: title, Description: description })
      });
      if (!response.ok) throw new Error("Failed to fetch sub-themes");
      const data = await response.json();
      if (Array.isArray(data)) {
        setSubThemes(data);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

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
      <h3>Sub-Themes</h3>
      {subThemes.map((subTheme, i) => (
        <Box key={i}>
          <TextField
            label={`Sub-Theme ${i + 1}`}
            value={subTheme}
            onChange={(e) => setSubThemes(subThemes.map((st, idx) => idx === i ? e.target.value : st))}
            fullWidth
            variant="outlined"
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <>
                    <IconButton disabled={loading || !title} title="Split with AI">
                      <AutoAwesomeIcon />
                    </IconButton>
                    <IconButton title="Delete" onClick={() => setSubThemes(subThemes.filter((_, idx) => i !== idx))}>
                      <Delete />
                    </IconButton>
                  </>
                )
              }
            }}
          />
        </Box>
      ))}
      <button onClick={handleFetchSubThemes} disabled={loading || !title} title="Generate Sub-themes">
        Generate
      </button>
      <button onClick={() => setSubThemes([...subThemes, ""])} title="Add Sub-Theme">
        Add
      </button>
    </Box>
  );
}

export default StepOne;