import { createTheme, alpha, getContrastRatio } from '@mui/material/styles';

const themeBase = '#7e1a30';
const themeMain = alpha(themeBase, 0.7);

export const theme = createTheme({
  palette: {
    primary: {
      main: themeMain,
      light: alpha(themeBase, 0.5),
      dark: alpha(themeBase, 0.9),
      contrastText: getContrastRatio(themeMain, '#fff') > 4.5 ? '#fff' : '#111',
    },
  },
});
