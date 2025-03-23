import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

interface LocationMapProps {
  apiKey: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ apiKey }) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          if (map) {
            map.panTo(newLocation);
          }
          setError(null);
        },
        (err) => {
          setError('Unable to access location. Please enable location services.');
          console.error('Location error:', err);
        }
      );

      // Watch for position changes
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          if (map) {
            map.panTo(newLocation);
          }
          setError(null);
        },
        (err) => {
          setError('Unable to access location. Please enable location services.');
          console.error('Location error:', err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, [map]);

  const mapContainerStyle = {
    width: '100%',
    height: '200px',
    borderRadius: '16px'
  };

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const markerIcon = useMemo(() => {
    if (!window.google?.maps) return undefined;
    
    return {
      url: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" fill="#4285f4" stroke="white" stroke-width="2"/>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(24, 24)
    };
  }, []);

  return (
    <Paper 
      elevation={0}
      sx={{
        mt: 3,
        p: 3,
        bgcolor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#fff',
          fontWeight: 600,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <LocationOn sx={{ color: 'primary.main' }} />
        Current Location
      </Typography>

      {error ? (
        <Box 
          sx={{ 
            p: 3,
            textAlign: 'center',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '16px',
            bgcolor: 'rgba(239, 68, 68, 0.05)',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'error.light',
              opacity: 0.8
            }}
          >
            {error}
          </Typography>
        </Box>
      ) : !currentLocation ? (
        <Box 
          sx={{ 
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            bgcolor: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : (
        <LoadScript 
          googleMapsApiKey={apiKey}
          onLoad={() => setIsLoaded(true)}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={17}
            center={currentLocation}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: [
                {
                  featureType: 'all',
                  elementType: 'all',
                  stylers: [{ hue: '#4285f4' }]
                },
                {
                  featureType: 'poi',
                  elementType: 'all',
                  stylers: [{ visibility: 'off' }]
                },
                {
                  featureType: 'transit',
                  elementType: 'all',
                  stylers: [{ visibility: 'off' }]
                }
              ],
              disableDefaultUI: true,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: false
            }}
          >
            {isLoaded && currentLocation && markerIcon && (
              <Marker
                position={currentLocation}
                icon={markerIcon}
              />
            )}
          </GoogleMap>
        </LoadScript>
      )}
    </Paper>
  );
};

export default LocationMap; 