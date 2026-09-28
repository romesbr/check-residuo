import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { detectFromBase64 } from './detect';

const INTERVAL_MS = 1500;

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [ready, setReady] = useState(false);
  const [pictureSize, setPictureSize] = useState(undefined);
  const [view, setView] = useState({ w: 0, h: 0 });
  const [boxes, setBoxes] = useState([]);
  const [dbg, setDbg] = useState({ res: '-', ms: 0, pct: 0, n: 0, err: '' });
  const [running, setRunning] = useState(true);
  const cameraRef = useRef(null);
  const busy = useRef(false);

  // Permissão (igual Build 30 — sem isso a câmera fica preta)
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Escolhe a menor resolução de foto disponível (acelera a análise)
  const onCameraReady = async () => {
    try {
      const sizes = await cameraRef.current.getAvailablePictureSizesAsync('4:3');
      const parsed = (sizes || [])
        .map(s => { const [w, h] = s.split('x').map(Number); return { s, a: w * h, w, h }; })
        .filter(p => p.a > 0 && Math.min(p.w, p.h) >= 240)
        .sort((a, b) => a.a - b.a);
      if (parsed.length) setPictureSize(parsed[0].s);
    } catch (e) {
      setDbg(d => ({ ...d, err: 'sizes: ' + e.message }));
    }
    setReady(true);
  };

  // Loop de detecção
  useEffect(() => {
    if (!ready || !running) return;
    const id = setInterval(async () => {
      if (busy.current || !cameraRef.current) return;
      busy.current = true;
      const t0 = Date.now();
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5, exif: false });
        const r = detectFromBase64(photo.base64);
        setBoxes(r.boxes);
        setDbg(d => ({ ...d, res: r.width + 'x' + r.height, ms: Date.now() - t0, pct: r.cornPct, n: d.n + 1, err: '' }));
      } catch (e) {
        setDbg(d => ({ ...d, err: String(e && e.message ? e.message : e) }));
      } finally {
        busy.current = false;
      }
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [ready, running]);

  if (hasPermission === null) return <View style={styles.center}><Text style={styles.text}>Solicitando permissão...</Text></View>;
  if (hasPermission === false) return <View style={styles.center}><Text style={styles.text}>Sem permissão de câmera. Libere nas configurações do Android.</Text></View>;

  return (
    <View style={styles.container} onLayout={e => setView({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ratio="4:3"
        pictureSize={pictureSize}
        onCameraReady={onCameraReady}
        onMountError={e => setDbg(d => ({ ...d, err: 'mount: ' + (e && e.message) }))}
      />

      <View style={styles.overlay} pointerEvents="none">
        {boxes.map((b, i) => (
          <View key={i} style={[styles.bbox, { left: b.x * view.w, top: b.y * view.h, width: b.w * view.w, height: b.h * view.h }]}>
            <Text style={styles.label}>MILHO {b.conf}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.stats}>
        <Text style={styles.title}>🌽 Corn Detector</Text>
        <Text style={styles.stat}>Detecções: {boxes.length}  |  Amarelo: {dbg.pct.toFixed(1)}%</Text>
        <Text style={styles.dbg}>Análises: {dbg.n}  |  Foto: {dbg.res}  |  {dbg.ms} ms</Text>
        <Text style={styles.dbg}>Resolução pedida: {pictureSize || 'padrão'}  |  Câmera: {ready ? 'pronta' : 'iniciando'}</Text>
        {dbg.err ? <Text style={styles.err}>Erro: {dbg.err}</Text> : null}
        <TouchableOpacity style={styles.btn} onPress={() => setRunning(r => !r)}>
          <Text style={styles.btnText}>{running ? '⏸ Pausar' : '▶ Retomar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 },
  camera: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bbox: { position: 'absolute', borderWidth: 3, borderColor: '#00FF00' },
  label: { color: '#000', fontSize: 11, fontWeight: 'bold', backgroundColor: '#00FF00', paddingHorizontal: 3, alignSelf: 'flex-start' },
  stats: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', padding: 12, borderTopWidth: 2, borderTopColor: '#00FF00' },
  title: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  stat: { color: '#00FF00', fontSize: 14, marginBottom: 2 },
  dbg: { color: '#AAA', fontSize: 11 },
  err: { color: '#FF5555', fontSize: 12, marginTop: 4 },
  text: { color: '#FFD700', fontSize: 16, textAlign: 'center' },
  btn: { marginTop: 8, backgroundColor: '#222', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 14 },
});
