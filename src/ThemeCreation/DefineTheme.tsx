import { Box, TextField } from "@mui/material";
import TextFieldWithAction from "./TextFieldWithAction";

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
  const handleGenerateDescription = async () => {
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
      <TextFieldWithAction
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        variant="outlined"
        actionTitle="Generate description with AI"
        onActionClick={handleGenerateDescription}
        margin="normal"
        multiline
        rows={4}
        disabled={!title.trim()}
      />
    </Box>
  );
}

export default DefineTheme;