import React from 'react';
import { Paper, Typography, Switch, FormControlLabel, Slider, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ContrastIcon from '@mui/icons-material/Contrast';

interface AccessibilitySettingsProps {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  highContrast,
  setHighContrast,
}) => {
  const [fontSize, setFontSize] = React.useState(14);
  const [voiceFeedback, setVoiceFeedback] = React.useState(true);

  const handleFontSizeChange = (event: Event, newValue: number | number[]) => {
    setFontSize(newValue as number);
    document.documentElement.style.fontSize = `${newValue}px`;
  };

  const handleVoiceFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceFeedback(event.target.checked);
    // You can implement voice feedback settings here
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VisibilityIcon /> Accessibility Settings
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ContrastIcon /> High Contrast Mode
            </Box>
          }
        />

        <Box>
          <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VolumeUpIcon /> Voice Feedback
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={voiceFeedback}
                onChange={handleVoiceFeedbackChange}
                color="primary"
              />
            }
            label="Enable voice feedback for detected objects"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Font Size</Typography>
          <Slider
            value={fontSize}
            onChange={handleFontSizeChange}
            min={12}
            max={24}
            step={1}
            marks
            valueLabelDisplay="auto"
            aria-label="font size"
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default AccessibilitySettings; 