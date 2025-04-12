import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getDiscoveries, type Discovery } from '../../services/discoveries';

interface QuickActionProps {
  icon: any;
  title: string;
  description: string;
  onPress: () => void;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [recentDiscoveries, setRecentDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentDiscoveries();
  }, []);

  async function loadRecentDiscoveries() {
    try {
      const discoveries = await getDiscoveries();
      setRecentDiscoveries(discoveries.slice(0, 3)); // Show only 3 most recent
    } catch (error) {
      console.error('Error loading discoveries:', error);
    } finally {
      setLoading(false);
    }
  }

  const QuickAction = ({ icon, title, description, onPress }: QuickActionProps) => (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <MaterialCommunityIcons
          name={icon}
          size={32}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{title}</Text>
          <Text variant="bodyMedium" style={styles.description}>
            {description}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall">Welcome to Microfinder</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Explore the microscopic world around you
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <QuickAction
          icon="microscope"
          title="Identify Microbe"
          description="Use your microscope to identify microorganisms"
          onPress={() => router.push('/(tabs)/camera')}
        />

        <QuickAction
          icon="book-open-variant"
          title="My Library"
          description="View your saved discoveries and notes"
          onPress={() => router.push('/(tabs)/library')}
        />

        <QuickAction
          icon="cards"
          title="Flashcards"
          description="Review and learn about microorganisms"
          onPress={() => router.push('/(tabs)/library/flashcards')}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Discoveries
        </Text>

        {loading ? (
          <Text>Loading recent discoveries...</Text>
        ) : recentDiscoveries.length > 0 ? (
          recentDiscoveries.map((discovery: Discovery) => (
            <Card
              key={discovery.id}
              style={styles.discoveryCard}
              onPress={() => router.push({
                pathname: '/(tabs)/library/[id]',
                params: { id: discovery.id }
              })}
            >
              <Card.Cover source={{ uri: discovery.image_url }} />
              <Card.Content>
                <Text variant="titleMedium">{discovery.microbe_name}</Text>
                <Text variant="bodyMedium">{discovery.classification}</Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text>No discoveries yet. Start by identifying a microbe!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  description: {
    opacity: 0.7,
    marginTop: 4,
  },
  discoveryCard: {
    marginBottom: 16,
  },
}); 