import React from 'react';
import {
  Paper,
  Typography,
  Slider,
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Button,
} from '@mui/material';
import { Settings as SettingsIcon, VolumeUp, Speed, FilterList } from '@mui/icons-material';

interface SettingsProps {
  warningDistance: number;
  setWarningDistance: (distance: number) => void;
  voiceRate: number;
  setVoiceRate: (rate: number) => void;
  voicePitch: number;
  setVoicePitch: (pitch: number) => void;
  emergencyContact: string;
  setEmergencyContact: (contact: string) => void;
  filteredObjects: string[];
  setFilteredObjects: (objects: string[]) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

const availableObjects = [
  'person',
  'car',
  'truck',
  'motorcycle',
  'bicycle',
  'bus',
  'chair',
  'bench',
  'pole',
  'fire hydrant',
  'stop sign'
];

const Settings: React.FC<SettingsProps> = ({
  warningDistance,
  setWarningDistance,
  voiceRate,
  setVoiceRate,
  voicePitch,
  setVoicePitch,
  emergencyContact,
  setEmergencyContact,
  filteredObjects,
  setFilteredObjects,
  voiceEnabled,
  setVoiceEnabled,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        background: 'rgba(30, 30, 30, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon /> Settings
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Speed /> Distance Settings
        </Typography>
        <Typography variant="body2" gutterBottom>
          Warning Distance (meters)
        </Typography>
        <Slider
          value={warningDistance}
          onChange={(_, value) => setWarningDistance(value as number)}
          min={1}
          max={10}
          step={0.5}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeUp /> Voice Settings
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
              />
            }
            label="Enable Voice Guidance"
          />
        </FormGroup>
        {voiceEnabled && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Speech Rate
            </Typography>
            <Slider
              value={voiceRate}
              onChange={(_, value) => setVoiceRate(value as number)}
              min={0.5}
              max={2}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
            <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
              Voice Pitch
            </Typography>
            <Slider
              value={voicePitch}
              onChange={(_, value) => setVoicePitch(value as number)}
              min={0.5}
              max={2}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList /> Object Filters
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Objects to Detect</InputLabel>
          <Select
            multiple
            value={filteredObjects}
            onChange={(e) => setFilteredObjects(e.target.value as string[])}
            renderValue={(selected) => selected.join(', ')}
          >
            {availableObjects.map((object) => (
              <MenuItem key={object} value={object}>
                {object.charAt(0).toUpperCase() + object.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Emergency Contact</Typography>
        <TextField
          fullWidth
          label="Phone Number"
          value={emergencyContact}
          onChange={(e) => setEmergencyContact(e.target.value)}
          placeholder="Enter emergency contact number"
          variant="outlined"
        />
        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => {
            if (emergencyContact) {
              window.location.href = `tel:${emergencyContact}`;
            }
          }}
        >
          Emergency SOS
        </Button>
      </Box>
    </Paper>
  );
};

export default Settings; 