import { Box, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useState } from "react";
import { Delete } from "@mui/icons-material";

interface IDefineThemeProps {
  title: string;
  description: string;
  subThemes: string[];
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
}


const getSubThemesApiUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:7071/api/getSubThemes";
  } else {
    return "https://top-func.azurewebsites.net/api/getSubThemes";
  }
};

const DefineTheme: React.FC<IDefineThemeProps> = ({ title, description, subThemes, setTitle, setDescription }) => {
  const [loading, setLoading] = useState(false);

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
    </Box>
  );
}

export default DefineTheme;