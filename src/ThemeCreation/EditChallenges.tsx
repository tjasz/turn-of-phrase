import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, TextField } from "@mui/material";
import { Delete, ExpandMore, UploadFile } from "@mui/icons-material";
import React, { useRef } from "react";

interface IEditChallengesProps {
  challenges: Challenge[];
  setChallenges: (challenges: Challenge[]) => void;
}

const EditChallenges: React.FC<IEditChallengesProps> = ({ challenges, setChallenges }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV file and update challenges
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      // Split by line, trim, ignore empty lines
      const rows = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      const parsed = rows.map(row => {
        const parts = row.split(",").map(s => s.trim());
        return {
          Main: parts[0] || "",
          Related: [parts[1] || "", parts[2] || "", parts[3] || "", parts[4] || ""]
        };
      });
      setChallenges(parsed);
    };
    reader.readAsText(file);
    // Reset input so same file can be uploaded again if needed
    e.target.value = "";
  };

  return (
    <Box>
      <Box mb={2} gap={1}>
        <Button
          variant="outlined"
          startIcon={<UploadFile />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload CSV
        </Button>
        <input
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleCSVUpload}
        />
      </Box>
      {challenges.map((challenge, i) => (
        <Accordion key={i} slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            {i + 1}.&nbsp;
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
      <Button onClick={() => setChallenges([...challenges, { Main: "", Related: ["", "", "", ""] }])} title="Add Challenge">
        Add
      </Button>
    </Box>
  );
}

export default EditChallenges;
