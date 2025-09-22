import { AutoAwesome } from "@mui/icons-material";
import { Box, CircularProgress, IconButton, TextField } from "@mui/material";
import { useState } from "react";

interface IDefineThemeProps {
  title: string;
  description: string;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
}

const getDescriptionApiUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:7071/api/getDescription";
  } else {
    return "https://top-func.azurewebsites.net/api/getDescription";
  }
};

const DefineTheme: React.FC<IDefineThemeProps> = ({ title, description, setTitle, setDescription }) => {
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
        disabled={loading}
        slotProps={{
          input: {
            endAdornment: (
              loading
                ? <CircularProgress />
                : <IconButton disabled={loading || !title} title="Generate description with AI" onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await fetch(getDescriptionApiUrl(), {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        Title: title,
                        Description: description,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to generate description");
                    }

                    const data = await response.json();
                    setDescription(data);
                  } catch (error) {
                    console.error("Error generating description:", error);
                  } finally {
                    setLoading(false);
                  }
                }}>
                  <AutoAwesome />
                </IconButton>
            )
          }
        }}
      />
    </Box>
  );
}

export default DefineTheme;