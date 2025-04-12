import { Redirect } from 'expo-router';

export default function Home() {
  // Direct users straight to the home tab
  return <Redirect href="/(tabs)" />;
} 