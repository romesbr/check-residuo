import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{flex:1,backgroundColor:'#000',justifyContent:'center',alignItems:'center'}}>
      <Text style={{color:'#FFD700',fontSize:24,fontWeight:'bold'}}>Corn Detector</Text>
      <StatusBar style="light" />
    </View>
  );
}
