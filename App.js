import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0, s = 0, v = max;

  if (max !== 0) s = delta / max;
  
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h /= 6;
  }

  return { h: h * 360, s, v };
}

export default function App() {
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCount(prev => prev + 1);
    }, 300);
    
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
          <View
            key={i}
            style={[
              styles.bbox,
              {
                left: det.x,
                top: det.y,
                width: det.width,
                height: det.height,
              },
            ]}
          >
            <Text style={styles.label}>{det.conf}%</Text>
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
  bbox: { position: 'absolute', borderWidth: 2, borderColor: '#00FF00' },
  label: { color: '#00FF00', fontSize: 10, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4 },
  stats: { backgroundColor: 'rgba(0,0,0,0.9)', paddingVertical: 15, paddingHorizontal: 15, borderTopWidth: 2, borderTopColor: '#00FF00' },
  title: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  stat: { color: '#00FF00', fontSize: 14, marginBottom: 4 },
  active: { color: '#00FF00', fontSize: 14, marginBottom: 4 },
});
