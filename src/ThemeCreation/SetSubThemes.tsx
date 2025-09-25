import { Box, Button, IconButton, TextField } from "@mui/material";
import { Delete, AutoAwesome } from "@mui/icons-material";
import { useState } from "react";

interface ISetSubThemesProps {
  title: string;
  description: string;
  subThemes: string[];
  setSubThemes: (subThemes: string[]) => void;
}

const getSubThemesApiUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:7071/api/getSubThemes";
  } else {
    return "https://top-func.azurewebsites.net/api/getSubThemes";
  }
};

const getSplitSubThemeApiUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:7071/api/splitSubTheme";
  } else {
    return "https://top-func.azurewebsites.net/api/splitSubTheme";
  }
};

const SetSubThemes: React.FC<ISetSubThemesProps> = ({ title, description, subThemes, setSubThemes }) => {
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

  const handleSplitSubThemes = async (index: number) => {
    setLoading(true);
    try {
      const response = await fetch(getSplitSubThemeApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Title: title,
          Description: description,
          SubThemes: subThemes,
          ToSplit: subThemes[index],
        })
      });
      if (!response.ok) throw new Error("Failed to split sub-theme");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const newSubThemes = [...subThemes];
        newSubThemes.splice(index, 1, ...data);
        setSubThemes(Array.from(new Set(newSubThemes)));
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
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
                    <IconButton disabled={loading || !title} title="Split with AI" onClick={() => handleSplitSubThemes(i)}>
                      <AutoAwesome />
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
      <Button onClick={handleFetchSubThemes} disabled={loading || !title} title="Generate Sub-themes">
        Generate
      </Button>
      <Button onClick={() => setSubThemes([...subThemes, ""])} title="Add Sub-Theme">
        Add
      </Button>
    </Box>
  );
}

export default SetSubThemes;