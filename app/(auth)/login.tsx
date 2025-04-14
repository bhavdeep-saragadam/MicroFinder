import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession } from '../../context/SessionContext';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithOAuth, loading: sessionLoading } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Get app scheme from the config
  const appScheme = (Constants.expoConfig?.scheme as string) || 'acme';
  const redirectUrl = `${appScheme}://login`;

  async function handleLogin() {
    try {
      setError(null);
      
      const { error } = await signIn(email, password);

      if (error) throw error;
      
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError(null);
      setOauthLoading(true);
      
      console.log('Starting Google sign-in with redirect URL:', redirectUrl);
      
      // Use the new SessionContext method
      const { error } = await signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
      
      console.log('OAuth process initiated successfully');
      // No need to navigate here as the auth state listener will handle this
    } catch (e) {
      console.error('Google sign-in error:', e);
      setError(e instanceof Error ? e.message : 'An error occurred with Google sign in');
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Authentication Error',
          'There was a problem signing in with Google. Please try again or use email login.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text variant="displayLarge" style={styles.title}>Microfinder</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Discover the microscopic world
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={sessionLoading}
          disabled={sessionLoading}
          style={styles.button}
        >
          Log In
        </Button>

        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <Divider style={styles.divider} />
        </View>

        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={sessionLoading || oauthLoading}
        >
          <MaterialCommunityIcons name="google" size={24} color="#4285F4" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>
            {oauthLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        <Button
          mode="text"
          onPress={() => router.push('register')}
          style={styles.link}
        >
          Don't have an account? Sign up
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('forgot-password')}
          style={styles.link}
        >
          Forgot Password?
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('reset-password-manual')}
          style={styles.link}
        >
          Manual Password Reset
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 36,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
    paddingVertical: 6,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
}); 