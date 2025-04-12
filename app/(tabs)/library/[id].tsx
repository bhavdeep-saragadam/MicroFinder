import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ActivityIndicator, Card, Text, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDiscoveryById, type Discovery } from '../../../services/discoveries';

interface DiscoveryDetailScreenProps {}

const DiscoveryDetailScreen: React.FC<DiscoveryDetailScreenProps> = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDiscovery() {
      try {
        const data = await getDiscoveryById(id);
        setDiscovery(data);
      } catch (err) {
        setError('Failed to load discovery');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDiscovery();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !discovery) {
    return (
      <View style={styles.centered}>
        <Text variant="titleLarge">{error || 'Discovery not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: discovery.microbe_name,
        }}
      />
      
      <Card style={styles.imageCard}>
        <Card.Cover source={{ uri: discovery.image_url }} />
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="bacteria" size={24} color="#666" />
            <Text variant="titleMedium" style={styles.infoText}>
              {discovery.classification}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={24} color="#666" />
            <Text variant="titleMedium" style={styles.infoText}>
              {new Date(discovery.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Analysis Results" />
        <Card.Content>
          <Text variant="bodyLarge">{discovery.analysis_results}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Key Characteristics" />
        <Card.Content>
          <List.Section>
            {discovery.characteristics.map((characteristic: string, index: number) => (
              <List.Item
                key={index}
                title={characteristic}
                left={() => <List.Icon icon="circle-small" />}
              />
            ))}
          </List.Section>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCard: {
    margin: 16,
    elevation: 4,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    marginLeft: 12,
    textTransform: 'capitalize',
  },
});

export default DiscoveryDetailScreen; 