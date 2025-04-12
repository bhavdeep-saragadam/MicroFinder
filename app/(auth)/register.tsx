import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form validation
  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = () => password.length >= 6;
  const doPasswordsMatch = () => password === confirmPassword;
  const isFormValid = () => 
    isEmailValid() && 
    isPasswordValid() && 
    doPasswordsMatch() && 
    fullName.trim() !== '' && 
    username.trim() !== '';

  async function handleRegister() {
    if (!isFormValid()) {
      setError('Please correct the form errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create a new user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
          },
        },
      });

      if (authError) throw authError;
      
      if (authData.user) {
        // Create a profile record in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;
        
        // Registration successful, redirect to home
        router.replace('/(tabs)/home');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text variant="displayMedium" style={styles.title}>Create Account</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Join Microfinder to explore the microscopic world
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

        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          error={password !== '' && !isPasswordValid()}
        />
        {password !== '' && !isPasswordValid() && (
          <HelperText type="error">Password must be at least 6 characters</HelperText>
        )}

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          error={confirmPassword !== '' && !doPasswordsMatch()}
        />
        {confirmPassword !== '' && !doPasswordsMatch() && (
          <HelperText type="error">Passwords don't match</HelperText>
        )}

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading || !isFormValid()}
          style={styles.button}
        >
          Create Account
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/(auth)/login')}
          style={styles.link}
        >
          Already have an account? Sign in
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
  },
  link: {
    marginTop: 16,
  },
}); 