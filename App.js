import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Corn Detector</Text>
      <Text style={styles.status}>● App iniciado</Text>
      <Text style={styles.info}>Versão: 1.0.0</Text>
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
  title: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    color: '#00FF00',
    fontSize: 14,
    marginBottom: 10,
  },
  info: {
    color: '#FFA500',
    fontSize: 12,
  },
});
