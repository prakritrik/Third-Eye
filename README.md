# Third Eye - AI Vision Assistant

An innovative AI-powered vision assistant designed to help visually impaired individuals navigate their surroundings safely and independently. Using advanced object detection and voice feedback, Third Eye acts as a reliable companion that describes the environment, identifies potential obstacles, and provides real-time spatial awareness.

## Key Features

- **Real-time Object Detection**: Utilizes TensorFlow.js and COCO-SSD model to instantly identify objects in the user's surroundings
- **Intelligent Voice Feedback**: Provides clear, adjustable voice announcements about detected objects and their distances
- **Live Location Tracking**: Integrates Google Maps for precise location awareness and navigation assistance
- **Customizable Settings**:
  - Adjustable warning distance for obstacle alerts
  - Configurable voice rate and pitch for optimal comprehension
  - Customizable object filters to focus on relevant items
  - Emergency contact setup for added safety
- **Accessibility First**:
  - Mobile-optimized Progressive Web App (PWA)
  - Works offline for reliable usage
  - Dark mode UI with high contrast
  - Screen reader compatible
- **Privacy Focused**:
  - All processing happens on-device
  - No data storage or cloud processing
  - Complete user privacy protection

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Material-UI
- **AI/ML**: TensorFlow.js with COCO-SSD model
- **Location Services**: Google Maps API
- **Accessibility**: Web Speech API
- **PWA Features**: Service Workers for offline functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/third-eye.git
cd third-eye
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Google Maps API key:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

## Usage

1. Allow camera and location permissions when prompted
2. Point your device's camera at your surroundings
3. The app will detect objects and provide voice feedback
4. Use the settings panel to customize:
   - Warning distance
   - Voice rate and pitch
   - Object filters
   - Emergency contact

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- TensorFlow.js team for the COCO-SSD model
- Material-UI team for the component library
- Google Maps Platform for location services 