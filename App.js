import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCount(c => c + 1);
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  // Bboxes se movem com frameCount
  const detections = [
    { x: 50 + (frameCount * 2) % 100, y: 100 + Math.sin(frameCount * 0.1) * 30, w: 150, h: 120, conf: 87 },
    { x: 250 - (frameCount * 1.5) % 80, y: 280 + Math.cos(frameCount * 0.15) * 40, w: 120, h: 100, conf: 92 },
    { x: 150 + (frameCount * 0.8) % 60, y: 450 + Math.sin(frameCount * 0.08) * 25, w: 180, h: 140, conf: 78 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        {detections.map((d, i) => (
          <View key={i} style={[styles.bbox, { left: d.x, top: d.y, width: d.w, height: d.h }]}>
            <Text style={styles.label}>{d.conf}%</Text>
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
  bbox: { position: 'absolute', borderWidth: 2, borderColor: '#00FF00', justifyContent: 'flex-start', paddingTop: 2, paddingLeft: 2 },
  label: { color: '#00FF00', fontSize: 10, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 3 },
  stats: { backgroundColor: 'rgba(0,0,0,0.9)', padding: 15, borderTopWidth: 2, borderTopColor: '#00FF00' },
  title: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  stat: { color: '#00FF00', fontSize: 14, marginBottom: 4 },
  active: { color: '#00FF00', fontSize: 14 },
});
