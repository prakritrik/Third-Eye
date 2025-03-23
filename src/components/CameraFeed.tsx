import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Button, Paper, Typography, Grid, Alert, CircularProgress } from '@mui/material';
import { VideoCameraFront, CameraAlt } from '@mui/icons-material';
import ObjectDetection from './ObjectDetection';

interface CameraFeedProps {
  warningDistance: number;
  voiceRate: number;
  voicePitch: number;
  filteredObjects: string[];
  voiceEnabled: boolean;
  onImageData: (imageData: ImageData) => void;
  googleMapsApiKey: string;
}

const CameraFeed: React.FC<CameraFeedProps> = ({
  warningDistance,
  voiceRate,
  voicePitch,
  filteredObjects,
  voiceEnabled,
  onImageData,
  googleMapsApiKey,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const frameRef = useRef<number>();
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentImageData, setCurrentImageData] = useState<ImageData | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const centerWidth = Math.min(canvas.width, 640);
      const centerHeight = Math.min(canvas.height, 480);
      const x = (canvas.width - centerWidth) / 2;
      const y = (canvas.height - centerHeight) / 2;
      
      const imageData = context.getImageData(x, y, centerWidth, centerHeight);
      setCurrentImageData(imageData);
      onImageData(imageData);
    } catch (err) {
      console.error('Frame capture error:', err);
      setError('Failed to capture video frame');
    }

    frameRef.current = requestAnimationFrame(captureFrame);
  }, [stream, onImageData]);

  const checkPermissions = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
      
      result.addEventListener('change', () => {
        setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
      });
    } catch (err) {
      console.warn('Permission API not supported, falling back to getUserMedia');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError(null);

      await checkPermissions();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      });

      setStream(mediaStream);
      setPermissionStatus('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        captureFrame();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please grant camera permissions and try again.');
          setPermissionStatus('denied');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please ensure your device has a working camera.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is in use by another application. Please close other apps using the camera.');
        } else {
          setError('Failed to access camera. Please check your camera settings and try again.');
        }
      } else {
        setError('An unexpected error occurred while accessing the camera.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [checkPermissions, captureFrame]);

  useEffect(() => {
    checkPermissions();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [checkPermissions, stream]);

  useEffect(() => {
    let mounted = true;

    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => {
        if (mounted) {
          captureFrame();
        }
      }).catch(err => {
        console.error('Video playback error:', err);
        setError('Failed to start video playback');
      });
    }

    return () => {
      mounted = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [stream, captureFrame]);

  const getPermissionMessage = () => {
    switch (permissionStatus) {
      case 'denied':
        return 'Camera access is blocked. Please update your browser settings to allow camera access.';
      case 'prompt':
        return 'Camera permission is required for object detection.';
      default:
        return '';
    }
  };

  return (
    <Grid 
      container 
      spacing={3} 
      sx={{ 
        minHeight: '100vh',
        p: { xs: 2, sm: 3 },
        alignItems: 'flex-start',
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)',
      }}
    >
      <Grid item xs={12} lg={8}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          <Box sx={{ 
            position: 'relative',
            zIndex: 1,
            mb: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h5" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              color: '#fff',
              fontWeight: 700,
            }}>
              <VideoCameraFront sx={{ 
                fontSize: 28,
                color: stream ? 'primary.main' : 'text.secondary',
              }} />
              Live Camera Feed
            </Typography>
            <Button
              variant="contained"
              color={stream ? "error" : "primary"}
              onClick={() => {
                if (stream) {
                  stream.getTracks().forEach(track => track.stop());
                  setStream(null);
                  setError(null);
                } else {
                  startCamera();
                }
              }}
              disabled={isInitializing}
              sx={{ 
                height: 40,
                px: 3,
                background: stream 
                  ? 'linear-gradient(45deg, #ef4444, #f43f5e)'
                  : 'linear-gradient(45deg, #4f46e5, #818cf8)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                },
              }}
            >
              {isInitializing ? (
                <>
                  <CircularProgress 
                    size={20} 
                    sx={{ mr: 1 }} 
                  />
                  Initializing...
                </>
              ) : (
                stream ? 'Stop Camera' : 'Start Camera'
              )}
            </Button>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
              action={
                permissionStatus === 'denied' && (
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => window.location.reload()}
                    sx={{
                      fontWeight: 600,
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.2)'
                      }
                    }}
                  >
                    Retry
                  </Button>
                )
              }
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {error}
                </Typography>
                {getPermissionMessage() && (
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {getPermissionMessage()}
                  </Typography>
                )}
              </Box>
            </Alert>
          )}

          <Box sx={{ 
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
          }}>
            {!stream && !isInitializing && (
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '320px',
                p: 3
              }}>
                <CameraAlt sx={{ 
                  fontSize: 48,
                  mb: 2,
                  color: 'text.secondary',
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  {permissionStatus === 'denied' 
                    ? 'Camera access is blocked'
                    : 'Camera is inactive'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
                  {permissionStatus === 'denied'
                    ? 'Please update your browser settings to allow camera access'
                    : 'Click the Start Camera button to begin object detection'}
                </Typography>
              </Box>
            )}
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
              }}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            {stream && (
              <Box sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                px: 2,
                py: 0.75,
              }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
                }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#10b981',
                    fontWeight: 600,
                    letterSpacing: '0.025em',
                    fontSize: '0.75rem',
                  }}
                >
                  Live
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={4} sx={{ position: 'sticky', top: 16 }}>
        <ObjectDetection 
          imageData={currentImageData}
          warningDistance={warningDistance}
          voiceRate={voiceRate}
          voicePitch={voicePitch}
          filteredObjects={filteredObjects}
          voiceEnabled={voiceEnabled}
          googleMapsApiKey={googleMapsApiKey}
        />
      </Grid>
    </Grid>
  );
};

export default CameraFeed; 