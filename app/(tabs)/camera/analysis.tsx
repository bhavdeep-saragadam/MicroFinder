import { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { analyzeMicroscopeImage, type MicrobeAnalysis } from '../../../services/gemini';
import { saveDiscovery, type Discovery } from '../../../services/discoveries';

export default function AnalysisScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discovery, setDiscovery] = useState<Discovery | null>(null);

  useEffect(() => {
    console.log('Analysis Screen mounted, imageUri:', imageUri);
    analyzeImage();
  }, [imageUri]);

  async function analyzeImage() {
    console.log('Starting analysis...');
    if (!imageUri) {
      console.log('No imageUri provided');
      setError('No image provided');
      setIsAnalyzing(false);
      return;
    }

    try {
      console.log('Fetching image from:', imageUri);
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log('Got blob:', blob.size, 'bytes');

      // Convert blob to base64 using a Promise
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(',')[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error('Failed to convert image to base64'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(blob);
      });

      console.log('Calling OpenAI API...');
      // Analyze image with GPT-4 Vision
      const analysis = await analyzeMicroscopeImage(base64Data);
      console.log('Got analysis:', analysis);
      
      // Save discovery to database
      console.log('Saving discovery to database...');
      const savedDiscovery = await saveDiscovery(imageUri, analysis);
      console.log('Discovery saved:', savedDiscovery);
      setDiscovery(savedDiscovery);
    } catch (err) {
      console.error('Error in analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const goBack = () => {
    router.push('/(tabs)/camera');
  };

  if (error) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert" size={64} color="#B00020" />
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.errorDetails}>
          This could be due to network issues or the image being too complex to analyze.
        </Text>
        <Button 
          mode="contained" 
          onPress={goBack}
          style={styles.button}
        >
          Try Again
        </Button>
      </View>
    );
  }

  if (isAnalyzing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.analyzing}>Analyzing microscope image...</Text>
        <Text style={styles.subtitle}>This may take up to 60 seconds</Text>
      </View>
    );
  }

  if (!discovery) {
    return (
      <View style={styles.container}>
        <Text>No results available</Text>
      </View>
    );
  }

  const analysis = discovery.gpt_analysis || {
    microbeName: discovery.microbe_name || "Unknown",
    classification: discovery.classification || "Unknown",
    confidence: discovery.confidence_score || 0.5,
    characteristics: discovery.characteristics || [],
    description: discovery.analysis_results || "No description available"
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {analysis.microbeName}
          </Text>
          <Text variant="bodyMedium" style={styles.classification}>
            {analysis.classification}
          </Text>
          <Text variant="bodyMedium" style={styles.confidence}>
            Confidence: {Math.round((analysis.confidence || 0.5) * 100)}%
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Key Characteristics
          </Text>
          {(analysis.characteristics || []).map((char: string, index: number) => (
            <Text key={index} style={styles.characteristic}>
              • {char}
            </Text>
          ))}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Description
          </Text>
          <Text variant="bodyMedium">{analysis.description || ""}</Text>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => router.push({
            pathname: '/(tabs)/library/flashcards/create',
            params: { discoveryId: discovery.id }
          })}
          style={styles.button}
        >
          Create Flashcard
        </Button>

        <Button
          mode="outlined"
          onPress={goBack}
          style={styles.button}
        >
          Take Another Photo
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 16,
    borderRadius: 8,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  classification: {
    opacity: 0.7,
    marginBottom: 8,
  },
  confidence: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  characteristic: {
    marginLeft: 8,
    marginBottom: 4,
  },
  actions: {
    marginTop: 16,
    gap: 8,
  },
  button: {
    marginBottom: 8,
  },
  analyzing: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    color: '#B00020',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  errorDetails: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  subtitle: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
}); 