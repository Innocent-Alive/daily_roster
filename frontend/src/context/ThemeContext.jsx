import React, { createContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext({ mode: 'light' });

export const CustomThemeProvider = ({ children }) => {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#1565C0',
            light: '#42A5F5',
            dark: '#0D47A1',
          },
          secondary: {
            main: '#42A5F5',
          },
          success: {
            main: '#2E7D32',
          },
          background: {
            default: '#F5F7FA',
            paper: '#FFFFFF',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 800 },
          h2: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 800 },
          h3: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 800 },
          h4: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700 },
          h5: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700 },
          h6: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700 },
          subtitle1: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 600 },
          button: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            textTransform: 'none',
            fontWeight: 700,
            letterSpacing: '0.2px',
          },
        },
        shape: {
          borderRadius: 8, // Enforced uniform 8px border radius across all components
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '8px !important',
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E0E0E0',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '8px !important',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '8px !important',
                padding: '7px 18px',
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: '8px !important',
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                borderRadius: '8px !important',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderRadius: 0, // Drawers fill height against edge
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: '8px !important',
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                borderRadius: '8px !important',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: '6px !important',
              },
            },
          },
        },
      }),
    []
  );

  return (
    <ColorModeContext.Provider value={{ mode: 'light' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
