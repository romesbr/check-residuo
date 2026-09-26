import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Rect, Circle } from 'react-native-svg';

export default function CornDetectorApp() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [detections, setDetections] = useState([]);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [frameCount, setFrameCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });

      // Simulação: detecta amarelo (milho)
      const hasCorn = Math.random() > 0.4;

      if (hasCorn) {
        const detection = {
          x: Math.random() * 200 + 50,
          y: Math.random() * 300 + 100,
          width: 80,
          height: 80,
          confidence: (Math.random() * 30 + 70).toFixed(1),
        };

        setDetections([detection]);

        setDetectionHistory(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            corn_found: true,
            detection,
          },
        ].slice(-10));
      }

      setFrameCount(c => c + 1);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      captureAndAnalyze();
    }, 800);

    return () => clearInterval(interval);
  }, [isScanning]);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permissão de câmera necessária</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!showHistory ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          >
            {/* Overlay com detecções */}
            <Svg height="100%" width="100%" style={styles.svg} pointerEvents="none">
              {detections.map((det, idx) => (
                <React.Fragment key={idx}>
                  <Rect
                    x={det.x}
                    y={det.y}
                    width={det.width}
                    height={det.height}
                    stroke="#00ff00"
                    strokeWidth="3"
                    fill="none"
                  />
                  <Circle
                    cx={det.x + det.width / 2}
                    cy={det.y - 15}
                    r="20"
                    fill="#00ff00"
                  />
                  <Text
                    x={det.x + det.width / 2 - 10}
                    y={det.y - 10}
                    fontSize="12"
                    fill="#000"
                    fontWeight="bold"
                  >
                    {det.confidence}%
                  </Text>
                </React.Fragment>
              ))}
            </Svg>

            {/* Info box */}
            <View style={styles.infoBox}>
              <Text style={styles.title}>🌾 MILHO DETECTOR</Text>
              <Text style={styles.infoText}>Detectadas: {detections.length}</Text>
              <Text style={styles.infoText}>Frames: {frameCount}</Text>
              <Text style={styles.infoText}>Histórico: {detectionHistory.length}</Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, !isScanning && styles.buttonDisabled]}
                onPress={() => setIsScanning(!isScanning)}
              >
                <Text style={styles.buttonText}>
                  {isScanning ? '⏸ Parar' : '▶ Iniciar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowHistory(true)}
              >
                <Text style={styles.buttonText}>📋 Histórico</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </>
      ) : (
        <ScrollView style={styles.historyContainer}>
          <Text style={styles.historyTitle}>📊 Histórico</Text>

          {detectionHistory.length === 0 ? (
            <Text style={styles.noDataText}>Sem detecções</Text>
          ) : (
            detectionHistory.map((entry, idx) => (
              <View key={idx} style={styles.historyEntry}>
                <Text style={styles.historyTime}>{entry.timestamp}</Text>
                <Text style={styles.historyStatus}>
                  {entry.corn_found ? '✓ Milho detectado' : '✗ Sem detecção'}
                </Text>
                {entry.detection && (
                  <Text style={styles.historyDetail}>
                    Confiança: {entry.detection.confidence}%
                  </Text>
                )}
              </View>
            ))
          )}

          <TouchableOpacity
            style={styles.buttonClose}
            onPress={() => setShowHistory(false)}
          >
            <Text style={styles.buttonText}>← Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  infoBox: {
    position: 'absolute',
    bottom: 120,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#00ff00',
  },
  title: {
    color: '#00ff00',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    color: '#00ff00',
    fontSize: 11,
    fontWeight: '500',
    marginVertical: 2,
  },
  buttonRow: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonClose: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#111',
    padding: 15,
  },
  historyTitle: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyEntry: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00ff00',
  },
  historyTime: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyStatus: {
    color: '#0f0',
    fontSize: 11,
    marginTop: 5,
    fontWeight: 'bold',
  },
  historyDetail: {
    color: '#888',
    fontSize: 10,
    marginTop: 3,
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
