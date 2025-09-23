import { AutoAwesome } from "@mui/icons-material";
import { CircularProgress, IconButton, TextField, type TextFieldProps, type TextFieldVariants } from "@mui/material";
import { useState } from "react";

interface ITextFieldWithActionProps extends Omit<TextFieldProps, 'variant'> {
  variant?: TextFieldVariants;
  actionTitle: string;
  onActionClick: () => Promise<void>;
  children?: React.ReactNode;
}

const TextFieldWithAction: React.FC<ITextFieldWithActionProps> = (props) => {
  const [loading, setLoading] = useState(false);

  const { actionTitle, onActionClick, children, ...textFieldProps } = props;
  const disabled = loading || textFieldProps.disabled;

  const handleActionClick = async () => {
    setLoading(true);
    try {
      await onActionClick();
    } catch (error) {
      console.error("Error occurred during action click:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TextField {...textFieldProps}
      disabled={disabled}
      slotProps={{
        input: {
          endAdornment: (
            loading
              ? <CircularProgress />
              : <IconButton title={actionTitle} onClick={handleActionClick} disabled={disabled}>
                {children ?? <AutoAwesome />}
              </IconButton>
          )
        }
      }}
    />
  );
}

export default TextFieldWithAction;