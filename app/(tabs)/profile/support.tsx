import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, List, Divider, Button, Card, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupportScreen() {
  const theme = useTheme();

  const handleEmail = () => {
    Linking.openURL('mailto:support@microfinder.io');
  };

  const handleWebsite = () => {
    Linking.openURL('https://microfinder.io/support');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'Help & Support',
          headerBackTitle: 'Back'
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Need Help with MicroFinder?
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
              We're here to help you with any questions or issues you may encounter.
            </Text>
          </Card.Content>
        </Card>

        <List.Section>
          <List.Subheader>Common Issues</List.Subheader>
          
          <List.Item
            title="Camera Not Working"
            description="Troubleshoot camera access problems"
            left={props => <List.Icon {...props} icon="camera-off" color={theme.colors.primary} />}
            onPress={() => {}}
          />
          <Divider />
          
          <List.Item
            title="Poor Analysis Results"
            description="Tips for getting better identification results"
            left={props => <List.Icon {...props} icon="magnify-expand" color={theme.colors.primary} />}
            onPress={() => {}}
          />
          <Divider />
          
          <List.Item
            title="Account Problems"
            description="Login, signup, and account management issues"
            left={props => <List.Icon {...props} icon="account-alert" color={theme.colors.primary} />}
            onPress={() => {}}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Resources</List.Subheader>
          
          <List.Item
            title="User Guide"
            description="Detailed instructions on using MicroFinder"
            left={props => <List.Icon {...props} icon="book-open-variant" color={theme.colors.primary} />}
            onPress={() => {}}
          />
          <Divider />
          
          <List.Item
            title="Video Tutorials"
            description="Watch how-to videos for app features"
            left={props => <List.Icon {...props} icon="video" color={theme.colors.primary} />}
            onPress={() => {}}
          />
          <Divider />
          
          <List.Item
            title="FAQs"
            description="Frequently asked questions and answers"
            left={props => <List.Icon {...props} icon="frequently-asked-questions" color={theme.colors.primary} />}
            onPress={() => {}}
          />
        </List.Section>
        
        <View style={styles.contactSection}>
          <Text variant="titleMedium" style={styles.contactTitle}>
            Contact Us
          </Text>
          <Text variant="bodyMedium" style={styles.contactDescription}>
            Still need help? Reach out to our support team.
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              icon="email"
              onPress={handleEmail}
              style={styles.button}
            >
              Email Support
            </Button>
            
            <Button
              mode="outlined"
              icon="web"
              onPress={handleWebsite}
              style={styles.button}
            >
              Visit Support Website
            </Button>
          </View>
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
  card: {
    margin: 16,
    marginBottom: 24,
    borderRadius: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    opacity: 0.8,
  },
  contactSection: {
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  contactTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactDescription: {
    marginBottom: 16,
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
}); 