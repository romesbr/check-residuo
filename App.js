import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

export default function App() {
  const [frameCount, setFrameCount] = useState(0);
  const [detections, setDetections] = useState([]);
  const cameraRef = useRef(null);

  // Incrementa frameCount
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCount(c => c + 1);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // A cada 2s, simula detecção (50% chance)
  useEffect(() => {
    const detectionInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        setDetections([
          { x: 50 + Math.random() * 200, y: 100 + Math.random() * 200, w: 150, h: 120, conf: 80 + Math.random() * 15 },
          { x: 250 + Math.random() * 150, y: 250 + Math.random() * 200, w: 120, h: 100, conf: 75 + Math.random() * 20 },
        ]);
      } else {
        setDetections([]);
      }
    }, 2000);
    return () => clearInterval(detectionInterval);
  }, []);

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.back}>
        <View style={styles.overlay}>
          {detections.map((d, i) => (
            <View key={i} style={[styles.bbox, { left: d.x, top: d.y, width: d.w, height: d.h }]}>
              <Text style={styles.label}>{d.conf.toFixed(0)}%</Text>
            </View>
          ))}
        </View>
      </Camera>

      <View style={styles.stats}>
        <Text style={styles.title}>🌽 Corn Detector</Text>
        <Text style={styles.stat}>Frame: {frameCount}</Text>
        <Text style={styles.stat}>Detections: {detections.length}</Text>
        <Text style={styles.active}>HSV: ACTIVE (simulated)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, position: 'relative' },
  overlay: { flex: 1, position: 'relative' },
  bbox: { position: 'absolute', borderWidth: 2, borderColor: '#00FF00', justifyContent: 'flex-start', paddingTop: 2, paddingLeft: 2 },
  label: { color: '#00FF00', fontSize: 10, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 3 },
  stats: { backgroundColor: 'rgba(0,0,0,0.9)', padding: 15, borderTopWidth: 2, borderTopColor: '#00FF00' },
  title: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  stat: { color: '#00FF00', fontSize: 14, marginBottom: 4 },
  active: { color: '#00FF00', fontSize: 14 },
});
