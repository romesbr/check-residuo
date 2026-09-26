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

  return (
    <View style={styles.container}>
      <View style={styles.viewport} />

      <View style={styles.stats}>
        <Text style={styles.title}>🌽 Corn Detector</Text>
        <Text style={styles.stat}>Frame: {frameCount}</Text>
        <Text style={styles.stat}>Detections: 3</Text>
        <Text style={styles.active}>HSV: ACTIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  viewport: { flex: 1, backgroundColor: '#1a1a1a' },
  stats: { backgroundColor: 'rgba(0,0,0,0.9)', padding: 15, borderTopWidth: 2, borderTopColor: '#00FF00' },
  title: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  stat: { color: '#00FF00', fontSize: 14, marginBottom: 4 },
  active: { color: '#00FF00', fontSize: 14 },
});
