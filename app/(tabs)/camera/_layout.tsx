import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function CameraLayout() {
  return (
    <View style={styles.container}>
      <Stack 
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="index"
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="capture" />
        <Stack.Screen name="analysis" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 