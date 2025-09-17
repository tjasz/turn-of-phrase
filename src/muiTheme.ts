
import { createTheme } from '@mui/material';

export const muiTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#26c',
          light: '#48e',
          dark: '#04a',
          contrastText: '#def'
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#26c',
          light: '#48e',
          dark: '#04a',
          contrastText: '#def'
        },
      },
    },
  },
});

export default muiTheme;