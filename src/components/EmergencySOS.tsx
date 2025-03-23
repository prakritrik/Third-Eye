import React, { useState } from 'react';
import { Box, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmsIcon from '@mui/icons-material/Sms';

interface Location {
  latitude: number;
  longitude: number;
}

const EmergencySOS: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error('Error getting location: ' + error.message));
        }
      );
    });
  };

  const handleEmergency = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      setOpenDialog(true);
      setError(null);
    } catch (err) {
      setError('Failed to get location. Please enable location services.');
      console.error('Location error:', err);
    }
  };

  const sendEmergencyMessage = (method: 'whatsapp' | 'sms') => {
    if (!location || !emergencyContact) return;

    const message = `EMERGENCY: I need help! My current location is: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    
    if (method === 'whatsapp') {
      const whatsappUrl = `https://wa.me/${emergencyContact}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      if ('sms' in navigator && navigator.sms) {
        navigator.sms.send({
          number: emergencyContact,
          body: message,
        }).catch((err: Error) => {
          console.error('SMS error:', err);
          setError('Failed to send SMS. Please try WhatsApp instead.');
        });
      } else {
        setError('SMS is not supported on this device. Please try WhatsApp instead.');
      }
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Emergency SOS
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<WarningIcon />}
          onClick={handleEmergency}
          sx={{ py: 2 }}
        >
          EMERGENCY SOS
        </Button>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Send Emergency Alert</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Emergency Contact Number"
            type="tel"
            fullWidth
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Enter phone number with country code"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => sendEmergencyMessage('whatsapp')}
            startIcon={<WhatsAppIcon />}
            color="success"
          >
            Send via WhatsApp
          </Button>
          <Button
            onClick={() => sendEmergencyMessage('sms')}
            startIcon={<SmsIcon />}
            color="primary"
          >
            Send via SMS
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EmergencySOS; 