# Check Resíduo - Corn Detector

App para inspeção de vagões detectando resíduos de milho em tempo real usando câmera.

## Features
- ✅ Detecção em tempo real via câmera
- ✅ Bounding boxes marcam presença de milho
- ✅ Histórico de detecções
- ✅ Funciona offline
- ✅ Performance: 2-3 FPS em Snapdragon 870+

## Como usar
1. Abrir app
2. Apontar câmera para o vagão
3. Milho detectado = bounding box verde
4. Ver histórico: botão "Histórico"

## Build
```bash
npx expo start --android  # Dev
eas build --platform android --profile preview  # APK para teste
```
