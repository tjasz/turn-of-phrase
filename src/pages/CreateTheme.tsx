import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "react-use";
import LocalStorageKeys from "../localStorageKeys";
import ThemeCreatorStepper from "../ThemeCreation/ThemeCreatorStepper";

function CreateTheme() {
  const navigate = useNavigate();
  const [_, setThemeIds] = useLocalStorage<string[]>(LocalStorageKeys.THEME_SELECTION, []);

  return <ThemeCreatorStepper
    onCreateTheme={(theme) => {
      setThemeIds(prev => [...(prev ?? []), theme.Title]);
      navigate(-1);
    }}
    onCancel={() => {
      navigate(-1);
    }}
  />;
}

export default CreateTheme;