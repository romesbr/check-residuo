import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCount(c => c + 1);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const detections = [
    { x: 50, y: 100, width: 150, height: 120, conf: 87 },
    { x: 250, y: 280, width: 120, height: 100, conf: 92 },
    { x: 150, y: 450, width: 180, height: 140, conf: 78 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        {detections.map((det, i) => (
          <View key={`bbox-${i}`} style={{ position: 'absolute', left: det.x, top: det.y, width: det.width, height: det.height, borderWidth: 2, borderColor: '#00FF00' }}>
            <Text style={{ color: '#00FF00', fontSize: 10, fontWeight: 'bold' }}>{det.conf}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.stats}>
        <Text style={styles.title}>🌽 Corn Detector</Text>
        <Text style={styles.stat}>Frame: {frameCount}</Text>
        <Text style={styles.stat}>Detections: {detections.length}</Text>
        <Text style={styles.active}>HSV: ACTIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  viewport: { flex: 1, backgroundColor: '#1a1a1a', position: 'relative' },
  stats: { backgroundColor: 'rgba(0,0,0,0.9)', padding: 15, borderTopWidth: 2, borderTopColor: '#00FF00' },
  title: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  stat: { color: '#00FF00', fontSize: 14, marginBottom: 4 },
  active: { color: '#00FF00', fontSize: 14 },
});
