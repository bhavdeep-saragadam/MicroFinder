import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, List, Divider, Button, useTheme } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';

export default function PrivacyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [showEmail, setShowEmail] = useState(false);
  const [shareDiscoveries, setShareDiscoveries] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(true);

  const handleDeleteAccount = async () => {
    // This would normally show a confirmation dialog
    try {
      const { error } = await supabase.auth.admin.deleteUser('');
      if (error) {
        console.error('Error deleting account:', error);
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'Privacy & Security',
          headerBackTitle: 'Back'
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <List.Section>
          <List.Subheader>Privacy Settings</List.Subheader>
          
          <List.Item
            title="Show Email Address"
            description="Allow other users to see your email address"
            left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={showEmail}
                onValueChange={setShowEmail}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Share Discoveries"
            description="Allow your discoveries to be shared with community"
            left={props => <List.Icon {...props} icon="share-variant" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={shareDiscoveries}
                onValueChange={setShareDiscoveries}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Allow Analytics"
            description="Help us improve by sharing usage data"
            left={props => <List.Icon {...props} icon="chart-bar" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={allowAnalytics}
                onValueChange={setAllowAnalytics}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Security</List.Subheader>
          
          <List.Item
            title="Change Password"
            description="Update your account password"
            left={props => <List.Icon {...props} icon="lock-reset" color={theme.colors.primary} />}
            onPress={() => router.push('/(auth)/reset-password')}
          />
        </List.Section>
        
        <View style={styles.dangerSection}>
          <Text variant="titleMedium" style={styles.dangerTitle}>
            Danger Zone
          </Text>
          <Text variant="bodySmall" style={styles.dangerText}>
            The following actions are irreversible. Please proceed with caution.
          </Text>
          <Button
            mode="outlined"
            icon="delete-forever"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
            textColor={theme.colors.error}
          >
            Delete Account
          </Button>
        </View>
      </ScrollView>
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
  dangerSection: {
    padding: 16,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dangerTitle: {
    color: 'red',
    marginBottom: 8,
  },
  dangerText: {
    opacity: 0.7,
    marginBottom: 16,
  },
  deleteButton: {
    borderColor: 'red',
    marginTop: 8,
  }
}); 