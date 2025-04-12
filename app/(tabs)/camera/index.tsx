import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Button, Card, List, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalyzeIntroScreen() {
  const router = useRouter();
  const theme = useTheme();

  const handleOpenCamera = () => {
    router.push('/(tabs)/camera/capture');
  };

  const features = [
    {
      title: 'Identify Microorganisms',
      description: 'Take a photo of a sample to identify bacteria, viruses, fungi, and protozoa',
      icon: 'microscope',
    },
    {
      title: 'Get Detailed Information',
      description: 'Learn about classification, characteristics, and potential health implications',
      icon: 'information-outline',
    },
    {
      title: 'Save to Your Library',
      description: 'Store your discoveries for future reference and research',
      icon: 'bookmark-outline',
    },
    {
      title: 'High Accuracy Results',
      description: 'Our AI model is trained on thousands of microbiology samples',
      icon: 'check-circle-outline',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="microscope" 
            size={80} 
            color={theme.colors.primary}
            style={styles.headerIcon}
          />
          <Text variant="headlineMedium" style={styles.title}>
            Analyze Samples
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Identify microorganisms with our AI-powered technology
          </Text>
        </View>

        <Card style={styles.featureCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.featureTitle}>
              How It Works
            </Text>
            
            {features.map((feature, index) => (
              <List.Item
                key={index}
                title={feature.title}
                description={feature.description}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={feature.icon}
                    color={theme.colors.primary}
                  />
                )}
                style={styles.featureItem}
              />
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.tipsTitle}>
              Tips for Best Results
            </Text>
            <List.Item
              title="Use proper lighting"
              description="Ensure your sample is well-lit for accurate identification"
              left={props => <List.Icon {...props} icon="lightbulb-on-outline" color={theme.colors.primary} />}
            />
            <List.Item
              title="Hold steady"
              description="Keep your device steady to avoid blurry images"
              left={props => <List.Icon {...props} icon="hand" color={theme.colors.primary} />}
            />
            <List.Item
              title="Capture clearly"
              description="Make sure your target is in focus before capturing"
              left={props => <List.Icon {...props} icon="image-filter-center-focus" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          icon="camera"
          onPress={handleOpenCamera}
          style={styles.cameraButton}
          contentStyle={styles.cameraButtonContent}
        >
          Open Camera
        </Button>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  featureTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    paddingVertical: 8,
  },
  tipsCard: {
    marginBottom: 24,
    borderRadius: 12,
    elevation: 2,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cameraButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  cameraButtonContent: {
    paddingVertical: 8,
    height: 56,
  },
}); 