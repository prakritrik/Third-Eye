import React, { useState } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box,
  AppBar, 
  Toolbar, 
  Typography, 
  Grid, 
  IconButton, 
  Drawer, 
  Fab 
} from '@mui/material';
import { Settings as SettingsIcon, Radar, WifiProtectedSetup } from '@mui/icons-material';
import { Analytics } from '@vercel/analytics/react';
import CameraFeed from './components/CameraFeed';
import Settings from './components/Settings';
import LocationMap from './components/LocationMap';

// Create a custom theme with enhanced visual elements
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4285f4',
    },
    background: {
      default: '#111827',
      paper: 'rgba(17, 24, 39, 0.95)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        'html, body': {
          margin: 0,
          padding: 0,
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
          height: '100%',
          width: '100%',
          overflowX: 'hidden',
        },
        body: {
          backgroundColor: '#111827',
          color: '#fff',
        },
        '#root': {
          minHeight: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  // Settings state
  const [warningDistance, setWarningDistance] = useState(3);
  const [voiceRate, setVoiceRate] = useState(1.2);
  const [voicePitch, setVoicePitch] = useState(1);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [filteredObjects, setFilteredObjects] = useState(['person', 'car', 'truck', 'motorcycle', 'bicycle']);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Add Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  // Animation for radar effect
  const startScanAnimation = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
          bgcolor: 'background.default',
          '@media (display-mode: standalone)': {
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          },
        }}
      >
        {/* Animated background elements */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: 0.4,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)
          `,
          animation: 'pulse 8s ease-in-out infinite',
        }} />

        <AppBar 
          position="sticky" 
          elevation={0} 
          sx={{ 
            background: 'rgba(17, 24, 39, 0.8)', 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            zIndex: 2,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Radar 
                sx={{ 
                  fontSize: 32,
                  animation: isScanning ? 'spin 2s linear infinite' : 'none',
                }} 
              />
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #4f46e5, #ec4899)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}>
                Third Eye Assistant
              </Typography>
            </Box>
            <IconButton 
              color="primary" 
              onClick={() => setShowSettings(!showSettings)}
              sx={{ 
                background: 'rgba(79, 70, 229, 0.1)',
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  background: 'rgba(79, 70, 229, 0.2)',
                  transform: 'rotate(90deg) scale(1.1)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            position: 'relative',
            zIndex: 1,
            p: { xs: 2, sm: 3 },
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CameraFeed
                warningDistance={warningDistance}
                voiceRate={voiceRate}
                voicePitch={voicePitch}
                filteredObjects={filteredObjects}
                voiceEnabled={voiceEnabled}
                onImageData={(imageData) => {
                  // Handle image data from camera feed
                }}
                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Floating Action Button for quick scan */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            background: 'linear-gradient(45deg, #4f46e5, #ec4899)',
            zIndex: 3,
          }}
          onClick={startScanAnimation}
        >
          <WifiProtectedSetup />
        </Fab>

        <Drawer
          anchor="right"
          open={showSettings}
          onClose={() => setShowSettings(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 360 },
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(16px)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
              overflowY: 'auto',
            }
          }}
        >
          <Settings
            warningDistance={warningDistance}
            setWarningDistance={setWarningDistance}
            voiceRate={voiceRate}
            setVoiceRate={setVoiceRate}
            voicePitch={voicePitch}
            setVoicePitch={setVoicePitch}
            emergencyContact={emergencyContact}
            setEmergencyContact={setEmergencyContact}
            filteredObjects={filteredObjects}
            setFilteredObjects={setFilteredObjects}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
          />
        </Drawer>

        <Analytics />
      </Box>
    </ThemeProvider>
  );
}

export default App; 