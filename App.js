import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export default function CornDetectorApp() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [model, setModel] = useState(null);
  const [detections, setDetections] = useState([]);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [frameCount, setFrameCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [fps, setFps] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.4);

  const lastTimeRef = useRef(Date.now());
  const frameCountRef = useRef(0);

  // Carrega modelo TensorFlow Lite
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();

        // Carrega modelo COCO SSD
        const model = await tflite.loadTFLiteModel(
          'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/model.json'
        );

        setModel(model);
        setIsReady(true);
      } catch (error) {
        console.error('Erro ao carregar modelo:', error);
        Alert.alert('Erro', 'Falha ao carregar modelo de detecção');
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // Verifica se cor é amarelo-dourado (milho)
  const isCornColor = (r, g, b) => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === rn) h = (((gn - bn) / delta) % 6) * 60;
      else if (max === gn) h = (((bn - rn) / delta) + 2) * 60;
      else h = (((rn - gn) / delta) + 4) * 60;
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    // Milho: amarelo-dourado (20-60°), saturação mínima, brilho mínimo
    return (
      ((h >= 15 && h <= 65) || (h >= 350 && h <= 360)) &&
      s >= 0.15 &&
      v >= 0.25
    );
  };

  // Filtra detecções que são potencialmente milho
  const filterCornDetections = (predictions) => {
    const potentialClasses = [
      'apple',
      'banana',
      'broccoli',
      'carrot',
      'corn',
      'hot dog',
      'orange',
      'potato',
    ];

    return predictions
      .filter(pred => {
        const className = pred.class.toLowerCase();
        return potentialClasses.some(c => className.includes(c));
      })
      .filter(pred => pred.score > sensitivity)
      .map(pred => ({
        x: Math.round(pred.bbox[0]),
        y: Math.round(pred.bbox[1]),
        width: Math.round(pred.bbox[2]),
        height: Math.round(pred.bbox[3]),
        score: (pred.score * 100).toFixed(1),
        class: pred.class,
        timestamp: new Date().toLocaleTimeString(),
      }));
  };

  // Processa frame da câmera
  const processFrame = async () => {
    if (!cameraRef.current || !model || !isReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
        skipProcessing: true,
      });

      const response = await fetch(photo.uri);
      const blob = await response.blob();

      let tensor = await tf.browser.fromPixels(
        await createImageBitmap(blob)
      );

      tensor = tf.image.resizeBilinear(tensor, [300, 300]);
      tensor = tensor.expandDims(0);
      tensor = tf.cast(tensor, 'int32');

      const predictions = await model.predict(tensor);

      const cornDetections = filterCornDetections(predictions);
      setDetections(cornDetections);

      // Adiciona ao histórico se houver detecções
      if (cornDetections.length > 0) {
        setDetectionHistory(prev => [
          ...prev,
          {
            count: cornDetections.length,
            timestamp: new Date().toLocaleTimeString(),
            detections: cornDetections,
          },
        ].slice(-20)); // Mantém últimos 20
      }

      frameCountRef.current++;
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      setFrameCount(prev => prev + 1);

      tensor.dispose();
    } catch (error) {
      console.error('Erro no processamento:', error);
    }
  };

  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      processFrame();
    }, 500);

    return () => clearInterval(interval);
  }, [model, isReady, sensitivity]);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permissão de câmera necessária</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.text}>Carregando modelo de IA...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!showHistory ? (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back">
            {/* Overlay SVG */}
            <Svg height="100%" width="100%" style={styles.svg} pointerEvents="none">
              {detections.map((box, idx) => (
                <React.Fragment key={idx}>
                  <Rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    stroke="#00ff00"
                    strokeWidth="2"
                    fill="none"
                  />
                  <SvgText
                    x={box.x + 5}
                    y={box.y + 15}
                    fontSize="11"
                    fill="#00ff00"
                    fontWeight="bold"
                  >
                    {box.class} ({box.score}%)
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>

            {/* Info overlay */}
            <View style={styles.infoBox}>
              <Text style={styles.title}>🌾 CORN DETECTOR</Text>
              <Text style={styles.infoText}>Detectadas: {detections.length}</Text>
              <Text style={styles.infoText}>Total frames: {frameCount}</Text>
              <Text style={styles.infoText}>FPS: {fps}</Text>
              <Text style={styles.infoText}>Histórico: {detectionHistory.length}</Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonRow}>
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
          <Text style={styles.historyTitle}>📊 Histórico de Detecções</Text>

          {detectionHistory.length === 0 ? (
            <Text style={styles.noDataText}>Nenhuma detecção registrada</Text>
          ) : (
            detectionHistory.map((entry, idx) => (
              <View key={idx} style={styles.historyEntry}>
                <Text style={styles.historyTime}>{entry.timestamp}</Text>
                <Text style={styles.historyCount}>
                  {entry.count} detecção{entry.count > 1 ? 's' : ''}
                </Text>
                {entry.detections.map((det, didx) => (
                  <Text key={didx} style={styles.historyDetail}>
                    • {det.class} ({det.score}%)
                  </Text>
                ))}
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
    bottom: 100,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#00ff00',
  },
  title: {
    color: '#00ff00',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: '500',
    marginVertical: 2,
    fontFamily: 'monospace',
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
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
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
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyCount: {
    color: '#0f0',
    fontSize: 12,
    marginTop: 5,
  },
  historyDetail: {
    color: '#888',
    fontSize: 11,
    marginTop: 3,
    marginLeft: 10,
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
