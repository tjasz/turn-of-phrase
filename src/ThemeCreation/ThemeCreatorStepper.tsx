import { Box, Button, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import DefineTheme from "./DefineTheme";
import SetSubThemes from "./SetSubThemes";

interface IThemeCreatorStepperProps {
  onCreateTheme: (theme: Theme) => void;
}

type ThemeRequest = {
  Title: string;
  Description?: string;
  SubThemes: string[];
  MainPhrases: string[];
  Challenges: Challenge[];
  OperationId: string;
}

const ThemeCreatorStepper: React.FC<IThemeCreatorStepperProps> = ({ onCreateTheme }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [subThemes, setSubThemes] = useState<string[]>([]);
  const [mainPhrases, setMainPhrases] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const [loadingTheme, setLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const stepLabels = ['Define Theme', 'Add Sub-Themes', 'Add Challenges', 'Review & Save'];

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  }

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, stepLabels.length - 1));
  }

  // Helper to determine endpoint
  const getThemeEndpoint = () => {
    if (window.location.hostname === "localhost") {
      return "http://localhost:7071/api/getTheme";
    } else {
      return "https://top-func.azurewebsites.net/api/getTheme";
    }
  };
  const getThemeStatusEndpoint = (instanceId: string) => {
    if (window.location.hostname === "localhost") {
      return `http://localhost:7071/api/getTheme/status/${instanceId}`;
    } else {
      return `https://top-func.azurewebsites.net/api/getTheme/status/${instanceId}`;
    }
  };

  const handleComplete = async () => {
    setLoadingTheme(true);
    setThemeError(null);
    setStatusMessage(null);

    try {
      const endpoint = getThemeEndpoint();
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Title: title, Description: description })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error ${response.status}`);
      }
      const { instanceId } = await response.json();
      if (!instanceId) throw new Error("No instanceId returned from API");

      localStorage.setItem(`turn-of-phrase/themeRequest:${title}`, JSON.stringify({
        Title: title,
        Description: description,
        SubThemes: subThemes,
        MainPhrases: mainPhrases,
        Challenges: challenges,
        OperationId: instanceId,
      }));

      // Poll for status
      const pollStatus = async () => {
        const statusEndpoint = getThemeStatusEndpoint(instanceId);
        let done = false;
        while (!done) {
          const statusResp = await fetch(statusEndpoint, { method: "GET", mode: "cors" });
          if (!statusResp.ok) {
            const errorText = await statusResp.text();
            throw new Error(errorText || `Status HTTP error ${statusResp.status}`);
          }
          const statusData = await statusResp.json();
          if (statusData.runtimeStatus === "Running") {
            setStatusMessage(statusData.customStatus?.message || "Generating theme...");
            await new Promise(res => setTimeout(res, 1500));
          } else if (statusData.runtimeStatus === "Completed") {
            setStatusMessage(null);
            const themeObj = statusData.output;
            localStorage.setItem(`turn-of-phrase/theme:${title}`, JSON.stringify(themeObj));
            onCreateTheme(themeObj);
            done = true;
          } else if (statusData.runtimeStatus === "Failed") {
            throw new Error(statusData.output.split(".", 1) || "Theme generation failed.");
          } else {
            setStatusMessage(`Status: ${statusData.runtimeStatus}`);
            await new Promise(res => setTimeout(res, 1500));
          }
        }
        setLoadingTheme(false);
      };
      await pollStatus();
    } catch (err: any) {
      setThemeError(err.message);
      setLoadingTheme(false);
      setStatusMessage(null);
    }
  }

  return (
    <div>
      <h2>Create a New Theme</h2>
      <p>Follow the steps below to create your theme.</p>
      {statusMessage && <Typography color="info">{statusMessage}</Typography>}
      {themeError && <Typography color="error">{themeError}</Typography>}
      <Stepper activeStep={activeStep} nonLinear>
        {stepLabels.map((label, index) => (
          <Step
            key={label}
            active={activeStep === index}
            disabled={activeStep === 0 && index !== 0 && !title}
            onClick={() => title && setActiveStep(index)}
            style={{ cursor: 'pointer' }}
          >
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === 0 && (
        <DefineTheme
          title={title}
          description={description}
          subThemes={subThemes}
          setTitle={setTitle}
          setDescription={setDescription}
        />
      )}
      {activeStep === 1 && (
        <SetSubThemes
          title={title}
          description={description}
          subThemes={subThemes}
          setSubThemes={setSubThemes}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </button>
        <Box sx={{ flex: '1 1 auto' }} />
        <button
          onClick={handleNext}
          disabled={activeStep === stepLabels.length - 1 || activeStep === 0 && !title}
        >
          Next
        </button>
        <button
          onClick={handleComplete}
          disabled={!title}
        >
          Complete
        </button>
      </Box>
    </div>
  );
};

export default ThemeCreatorStepper;
