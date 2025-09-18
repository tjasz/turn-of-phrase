import { Box, TextField, Button, InputAdornment } from "@mui/material";
import { useState } from "react";

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
      <TextField
        label="Sub-themes"
        value={subThemes.join(", ")}
        onChange={(e) => setSubThemes(e.target.value.split(", "))}
        fullWidth
        variant="outlined"
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button onClick={handleFetchSubThemes} disabled={loading || !title} size="small" variant="outlined">
                {loading ? "Loading..." : "Get Sub-themes"}
              </Button>
            </InputAdornment>
          )
        }}
      />
    </Box>
  );
}

export default StepOne;