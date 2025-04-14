import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, List, Divider, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const theme = useTheme();
  const [discoveryNotifications, setDiscoveryNotifications] = useState(true);
  const [updateNotifications, setUpdateNotifications] = useState(true);
  const [tipsNotifications, setTipsNotifications] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerBackTitle: 'Back'
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <List.Section>
          <List.Subheader>Notification Settings</List.Subheader>
          
          <List.Item
            title="Discovery Results"
            description="Get notified when your discoveries are analyzed"
            left={props => <List.Icon {...props} icon="microscope" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={discoveryNotifications}
                onValueChange={setDiscoveryNotifications}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="App Updates"
            description="Get notified about new features and improvements"
            left={props => <List.Icon {...props} icon="update" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={updateNotifications}
                onValueChange={setUpdateNotifications}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Tips & Tutorials"
            description="Get helpful tips for using the app"
            left={props => <List.Icon {...props} icon="lightbulb-outline" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={tipsNotifications}
                onValueChange={setTipsNotifications}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>
        
        <View style={styles.infoContainer}>
          <Text variant="bodySmall" style={styles.infoText}>
            Notification preferences will be saved to your account and synced across devices.
          </Text>
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
  infoContainer: {
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    opacity: 0.6,
    textAlign: 'center',
  }
}); 