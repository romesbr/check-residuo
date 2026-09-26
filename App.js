import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [detections, setDetections] = useState([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Acesso à câmera negado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} />
      <View style={styles.infoBox}>
        <Text style={styles.title}>Corn Detector</Text>
        <Text style={styles.info}>Detecções: {detections.length}</Text>
        <Text style={styles.status}>● Aguardando câmera...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    paddingBottom: 20,
  },
  title: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    color: '#FFA500',
    fontSize: 12,
    marginBottom: 4,
  },
  status: {
    color: '#00FF00',
    fontSize: 11,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
