import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form validation
  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = () => isEmailValid();

  async function handleResetPassword() {
    if (!isFormValid()) {
      setMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'microfinder://reset-password',
      });

      if (error) throw error;
      
      setMessage({
        text: 'Password reset instructions have been sent to your email.',
        type: 'success'
      });
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : 'An error occurred while sending the reset link.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>Reset Password</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        style={styles.input}
        error={email !== '' && !isEmailValid()}
      />
      {email !== '' && !isEmailValid() && (
        <HelperText type="error">Please enter a valid email address</HelperText>
      )}

      {message && (
        <Text style={message.type === 'error' ? styles.error : styles.success}>
          {message.text}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleResetPassword}
        loading={loading}
        disabled={loading || !isFormValid()}
        style={styles.button}
      >
        Send Reset Instructions
      </Button>

      <Button
        mode="text"
        onPress={() => router.push('/(auth)/login')}
        style={styles.link}
      >
        Back to Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
  },
  success: {
    color: '#4CAF50',
    marginBottom: 16,
  },
  link: {
    marginTop: 16,
  },
}); 