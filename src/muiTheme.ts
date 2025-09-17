
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
        secondary: {
          main: '#86c',
          light: '#a8e',
          dark: '#64a',
          contrastText: '#def'
        },
        error: {
          main: '#800',
          light: '#a22',
          dark: '#600',
          contrastText: '#123',
        },
        warning: {
          main: '#a60',
          light: '#c82',
          dark: '#840',
          contrastText: '#123',
        },
        info: {
          main: '#26c',
          light: '#48e',
          dark: '#04a',
          contrastText: '#def'
        },
        success: {
          main: '#080',
          light: '#2a2',
          dark: '#060',
          contrastText: '#123'
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
        secondary: {
          main: '#86c',
          light: '#a8e',
          dark: '#64a',
          contrastText: '#def'
        },
        error: {
          main: '#c44',
          light: '#e66',
          dark: '#a22',
          contrastText: '#123',
        },
        warning: {
          main: '#cc4',
          light: '#ee6',
          dark: '#aa2',
          contrastText: '#123',
        },
        info: {
          main: '#26c',
          light: '#48e',
          dark: '#04a',
          contrastText: '#def'
        },
        success: {
          main: '#4c4',
          light: '#6e6',
          dark: '#2a2',
          contrastText: '#123'
        },
      },
    },
  },
});

export default muiTheme;