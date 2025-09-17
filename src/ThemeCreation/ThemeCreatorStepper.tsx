import { Box, Button, Step, StepLabel, Stepper } from "@mui/material";
import { useState } from "react";

interface IThemeCreatorStepperProps {
  onCreateTheme: (theme: Theme) => void;
}

const ThemeCreatorStepper: React.FC<IThemeCreatorStepperProps> = ({ onCreateTheme }) => {
  const [activeStep, setActiveStep] = useState(0);

  const stepLabels = ['Define Theme', 'Add Challenges', 'Review & Save'];

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  }

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, stepLabels.length - 1));
  }

  return (
    <div>
      <h2>Create a New Theme</h2>
      <p>Follow the steps below to create your theme.</p>
      <Stepper activeStep={activeStep} nonLinear>
        {stepLabels.map((label, index) => (
          <Step key={label} active={activeStep === index} onClick={() => setActiveStep(index)} style={{ cursor: 'pointer' }}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
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
          disabled={activeStep === stepLabels.length - 1}
        >
          Next
        </button>
      </Box>
    </div>
  );
};

export default ThemeCreatorStepper;
