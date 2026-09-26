import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [detections, setDetections] = useState([]);
  const cameraRef = useRef(null);
  const frameCount = useRef(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const processCameraFrame = () => {
    frameCount.current += 1;
    if (frameCount.current % 10 === 0) {
      setDetections([
        { id: 1, x: 50, y: 100, confidence: 0.87 },
        { id: 2, x: 200, y: 150, confidence: 0.92 }
      ]);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Solicitando câmera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text style={styles.text}>Acesso negado</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera 
        ref={cameraRef} 
        style={styles.camera}
        onCameraReady={processCameraFrame}
      />
      <View style={styles.overlay}>
        {detections.map(d => (
          <View 
            key={d.id}
            style={[
              styles.bbox,
              { left: d.x, top: d.y }
            ]}
          >
            <Text style={styles.bboxLabel}>{Math.round(d.confidence * 100)}%</Text>
          </View>
        ))}
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>Corn Detector</Text>
        <Text style={styles.stat}>Detecções: {detections.length}</Text>
        <Text style={styles.stat}>Frames: {frameCount.current}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 60,
    pointerEvents: 'none' 
  },
  bbox: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#00FF00',
  },
  bboxLabel: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
  stat: { color: '#FFA500', fontSize: 11, marginTop: 2 },
});
