import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Snackbar, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        showMessage('Failed to load profile');
        return;
      }

      if (data) {
        setUsername(data.username || '');
        setFullName(data.full_name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showMessage('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!username.trim() || !fullName.trim()) {
      showMessage('Username and full name are required');
      return;
    }

    try {
      setIsProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          full_name: fullName.trim(),
          email: user.email,
          updated_at: new Date()
        });
      
      if (error) {
        console.error('Error updating profile:', error);
        showMessage('Failed to update profile');
        return;
      }

      showMessage('Profile updated successfully');
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('Failed to update profile');
    } finally {
      setIsProcessing(false);
    }
  }

  function showMessage(message: string) {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back'
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.label}>Username</Text>
          <TextInput
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            style={styles.input}
            disabled={isLoading}
          />

          <Text variant="titleMedium" style={styles.label}>Full Name</Text>
          <TextInput
            mode="outlined"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            style={styles.input}
            disabled={isLoading}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={isProcessing}
              disabled={isLoading || isProcessing}
              style={styles.saveButton}
              contentStyle={styles.buttonContent}
            >
              Save Changes
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              disabled={isLoading || isProcessing}
              style={styles.cancelButton}
              contentStyle={styles.buttonContent}
            >
              Cancel
            </Button>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    marginTop: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    borderRadius: 8,
  },
  cancelButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  snackbar: {
    margin: 16,
  }
}); 