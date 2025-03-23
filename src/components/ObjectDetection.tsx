import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem,
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Person,
  DirectionsCar,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import LocationMap from './LocationMap';

interface ObjectDetectionProps {
  imageData: ImageData | null;
  warningDistance: number;
  voiceRate: number;
  voicePitch: number;
  filteredObjects: string[];
  voiceEnabled: boolean;
  googleMapsApiKey: string;
}

interface Detection {
  bbox: number[];
  class: string;
  score: number;
  distance?: number;
}

const ObjectDetection: React.FC<ObjectDetectionProps> = ({ 
  imageData,
  warningDistance,
  voiceRate,
  voicePitch,
  filteredObjects,
  voiceEnabled,
  googleMapsApiKey,
}) => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const lastAnnouncementTimeRef = useRef<number>(0);
  const processingLock = useRef<boolean>(false);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    const now = Date.now();
    if (now - lastAnnouncementTimeRef.current < 2000) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;
    window.speechSynthesis.speak(utterance);
    lastAnnouncementTimeRef.current = now;
  }, [voiceEnabled, voiceRate, voicePitch]);

  const getDirectionalGuidance = useCallback((bbox: number[]): string => {
    const [x, , width] = bbox;
    const centerX = x + width / 2;
    if (centerX < 0.3) return "on your left";
    if (centerX > 0.7) return "on your right";
    return "directly ahead";
  }, []);

  const estimateDistance = useCallback((bbox: number[]): number => {
    const [, , width, height] = bbox;
    const area = width * height;
    const distance = Math.sqrt(1000000 / area);
    return Math.round(distance * 10) / 10;
  }, []);

  const getPriorityLevel = useCallback((detection: Detection): number => {
    const dangerousObjects = ['person', 'car', 'truck', 'motorcycle', 'bicycle', 'bus'];
    const obstacles = ['chair', 'bench', 'pole', 'fire hydrant', 'stop sign'];
    const distance = detection.distance || 0;
    
    if (dangerousObjects.includes(detection.class)) {
      if (distance < warningDistance * 0.5) return 1;
      if (distance < warningDistance) return 2;
      return 3;
    }
    if (obstacles.includes(detection.class)) {
      if (distance < warningDistance * 0.4) return 2;
      return 4;
    }
    return 5;
  }, [warningDistance]);

  const announceDetections = useCallback((detections: Detection[]) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    const now = Date.now();
    if (now - lastAnnouncementTimeRef.current < 2000) return;

    if (detections.length === 0) {
      speak("Path is clear ahead");
      return;
    }

    const filteredDetections = detections.filter(d => filteredObjects.includes(d.class));
    
    if (filteredDetections.length === 0) {
      return;
    }

    const sortedDetections = [...filteredDetections].sort((a, b) => {
      const priorityDiff = getPriorityLevel(a) - getPriorityLevel(b);
      if (priorityDiff !== 0) return priorityDiff;
      return (a.distance || 0) - (b.distance || 0);
    });

    const mostImportant = sortedDetections[0];
    const distance = mostImportant.distance || 0;
    const direction = getDirectionalGuidance(mostImportant.bbox);

    let message = `${mostImportant.class} detected ${direction}, ${distance.toFixed(1)} meters away`;
    if (distance < warningDistance * 0.5) {
      message = `Warning! ${message}`;
    }

    speak(message);
  }, [speak, warningDistance, filteredObjects, getPriorityLevel, getDirectionalGuidance, voiceEnabled]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setLoading(false);
        speak("Object detection system is ready. I will help you navigate safely.");
      } catch (err) {
        setError('Failed to load the object detection model');
        console.error('Model loading error:', err);
        setLoading(false);
      }
    };

    loadModel();
  }, [speak]);

  useEffect(() => {
    if (!imageData || !model || processingLock.current) return;

    const processFrame = async () => {
      processingLock.current = true;
      try {
        const tensor = tf.browser.fromPixels(imageData);
        const predictions = await model.detect(tensor);
        
        const processedDetections = predictions.map(pred => ({
          ...pred,
          distance: estimateDistance(pred.bbox)
        }));

        setDetections(processedDetections);
        announceDetections(processedDetections);
        tensor.dispose();
      } catch (err) {
        console.error('Frame processing error:', err);
        setError('Failed to process image');
      } finally {
        processingLock.current = false;
      }
    };

    processFrame();
  }, [imageData, model, announceDetections, estimateDistance]);

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{
          bgcolor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          p: 3,
          height: '100%',
          maxHeight: { xs: '60vh', lg: 'calc(100vh - 48px - 280px)' },
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
          },
          animation: 'fadeIn 0.5s ease-out',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.2) transparent',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            '&:hover': {
              background: 'rgba(255,255,255,0.3)',
            }
          }
        }}
      >
        {loading ? (
          <Box 
            display="flex" 
            flexDirection="column"
            alignItems="center" 
            justifyContent="center" 
            minHeight="400px"
            sx={{ animation: 'fadeIn 0.5s ease-out' }}
          >
            <CircularProgress 
              size={56} 
              thickness={4}
              sx={{ 
                mb: 3,
                color: 'primary.main',
                '@keyframes glow': {
                  '0%, 100%': { filter: 'drop-shadow(0 0 2px rgba(99, 102, 241, 0.2))' },
                  '50%': { filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.6))' }
                },
                animation: 'glow 2s ease-in-out infinite'
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'primary.light',
                textAlign: 'center',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                mb: 2
              }}
            >
              Loading Detection Model
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ textAlign: 'center' }}
            >
              This may take a few moments
            </Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              p: 3,
              animation: 'fadeIn 0.5s ease-out',
              '& .MuiAlert-icon': {
                color: 'error.main',
                animation: 'pulse 2s infinite'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {error}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Please try refreshing the page or check your connection.
            </Typography>
          </Alert>
        ) : (
          <>
            <Box 
              sx={{ 
                mb: 3,
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                Detection Results
                {detections.length > 0 && (
                  <Box
                    sx={{
                      ml: 1,
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: '#fff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {detections.length}
                  </Box>
                )}
              </Typography>
            </Box>

            {detections.length === 0 ? (
              <Box 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  bgcolor: 'rgba(16, 185, 129, 0.05)',
                }}
              >
                <CheckCircle 
                  sx={{ 
                    fontSize: 48, 
                    color: 'success.main',
                    mb: 2,
                    opacity: 0.9,
                  }} 
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'success.light',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Path is Clear
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'success.light',
                    opacity: 0.8,
                  }}
                >
                  No objects detected in your surroundings
                </Typography>
              </Box>
            ) : (
              <List sx={{ mx: -1.5 }}>
                {detections.map((detection, index) => {
                  const priority = getPriorityLevel(detection);
                  const isHighPriority = priority === 1;
                  
                  return (
                    <ListItem 
                      key={index}
                      sx={{
                        mb: 1,
                        bgcolor: isHighPriority ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        border: `1px solid ${isHighPriority ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)'}`,
                        transition: 'all 0.2s ease',
                        p: 2,
                        '&:hover': {
                          transform: 'translateX(4px)',
                          bgcolor: isHighPriority ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.08)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                        <Box 
                          sx={{ 
                            color: isHighPriority ? 'error.light' : 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {detection.class === 'person' ? (
                            <Person sx={{ fontSize: 28 }} />
                          ) : detection.class === 'car' ? (
                            <DirectionsCar sx={{ fontSize: 28 }} />
                          ) : (
                            <Warning sx={{ fontSize: 28 }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            sx={{ 
                              color: isHighPriority ? 'error.light' : 'primary.light',
                              fontWeight: 600,
                              fontSize: '1rem',
                              mb: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {detection.class.charAt(0).toUpperCase() + detection.class.slice(1)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip 
                              label={`${detection.distance?.toFixed(1)}m`}
                              size="small"
                              color={isHighPriority ? "error" : "primary"}
                              sx={{ 
                                fontWeight: 500,
                                height: 24,
                                '& .MuiChip-label': {
                                  px: 1,
                                }
                              }}
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: isHighPriority ? 'error.light' : 'text.secondary',
                                opacity: 0.7,
                              }}
                            >
                              {Math.round(detection.score * 100)}% confidence
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </>
        )}
      </Paper>
      <LocationMap apiKey={googleMapsApiKey} />
    </>
  );
};

export default ObjectDetection; 