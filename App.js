import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';

export default function App() {
  const [permission, setPermission] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [frameCount, setFrameCount] = useState(0);
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === 'granted');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao requisitar câmera: ' + error.message);
      setCameraError(error.message);
    }
  };

  if (cameraError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro: {cameraError}</Text>
        <Text style={styles.infoText}>Reinicie o app</Text>
      </View>
    );
  }

  if (permission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Solicitando permissão...</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Câmera não autorizada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} />
      <View style={styles.info}>
        <Text style={styles.title}>Corn Detector</Text>
        <Text style={styles.stat}>Status: Pronto</Text>
        <Text style={styles.stat}>Detecções: {detections.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  info: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  title: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  stat: {
    color: '#FFA500',
    fontSize: 12,
    marginVertical: 2,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    color: '#aaa',
    fontSize: 12,
  },
});
