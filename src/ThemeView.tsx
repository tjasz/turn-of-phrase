import { Card, CardContent, CardHeader, Checkbox, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface IThemeViewProps {
  theme: ThemeMetadata;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
}

const ThemeView: React.FC<IThemeViewProps> = ({ theme, selected, onSelectedChange }) => {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
      <Card style={{ height: '100%', backgroundColor: 'var(--secondary)' }}>
        <CardHeader title={theme.Title} subheader={`${theme.ChallengesCount} Challenges`} />
        <CardContent>
          <Checkbox checked={selected} onChange={() => onSelectedChange(!selected)} />
          <Typography variant="body2">{theme.Description}</Typography>
          <Link to={`/settings/themes${theme.Editing ? '/$create' : ''}/${theme.Id}`}>View Details</Link>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ThemeView;