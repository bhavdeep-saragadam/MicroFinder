import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Text, Card, Button, useTheme, Surface, IconButton, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getDiscoveries, type Discovery } from '../../services/discoveries';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

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
      setRecentDiscoveries(discoveries.slice(0, 3));
    } catch (error) {
      console.error('Error loading discoveries:', error);
    } finally {
      setLoading(false);
    }
  }

  const QuickAction = ({ icon, title, description, onPress }: QuickActionProps) => (
    <Surface style={styles.quickActionCard} elevation={2}>
      <View style={[styles.quickActionContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <Card.Content style={styles.quickActionContent}>
          <View style={styles.quickActionIconContainer}>
            <MaterialCommunityIcons
              name={icon}
              size={28}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.quickActionText}>
            <Text variant="titleMedium" style={styles.quickActionTitle}>{title}</Text>
            <Text variant="bodyMedium" style={styles.quickActionDescription}>
              {description}
            </Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor={theme.colors.primary}
            style={styles.quickActionArrow}
          />
        </Card.Content>
      </View>
    </Surface>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.headerTitle}>
            Welcome to Microfinder
          </Text>
          <Text variant="bodyLarge" style={styles.headerSubtitle}>
            Explore the microscopic world around you
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <Text variant="bodyMedium" style={styles.sectionSubtitle}>
              Start your exploration
            </Text>
          </View>

          <View style={styles.quickActionsContainer}>
            <QuickAction
              icon="microscope"
              title="Identify Microbe"
              description="Use your microscope to identify microorganisms"
              onPress={() => router.push('/(tabs)/camera')}
            />

            <QuickAction
              icon="compass"
              title="Library"
              description="Browse your microorganism discoveries"
              onPress={() => router.push('/(tabs)/library')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Discoveries
            </Text>
            <Text variant="bodyMedium" style={styles.sectionSubtitle}>
              Your latest findings
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading recent discoveries...</Text>
            </View>
          ) : recentDiscoveries.length > 0 ? (
            recentDiscoveries.map((discovery: Discovery) => (
              <Surface key={discovery.id} style={styles.discoveryCard} elevation={2}>
                <Image 
                  source={{ uri: discovery.image_url }} 
                  style={styles.discoveryImage}
                />
                <View style={styles.discoveryContent}>
                  <View style={styles.discoveryHeader}>
                    <Text variant="titleMedium" style={styles.discoveryTitle}>
                      {discovery.microbe_name}
                    </Text>
                    <Chip
                      mode="outlined"
                      style={styles.discoveryChip}
                      textStyle={styles.discoveryChipText}
                    >
                      {discovery.classification}
                    </Chip>
                  </View>
                  <Text variant="bodyMedium" style={styles.discoveryDate}>
                    {new Date(discovery.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </Surface>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="microscope" 
                size={48} 
                color={theme.colors.primary} 
              />
              <Text variant="bodyLarge" style={styles.emptyStateText}>
                No discoveries yet. Start by identifying a microbe!
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/(tabs)/camera')}
                style={styles.emptyStateButton}
              >
                Start Exploring
              </Button>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  quickActionsContainer: {
    gap: 16,
  },
  quickActionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionContainer: {
    padding: 16,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontWeight: 'bold',
  },
  quickActionDescription: {
    opacity: 0.7,
    marginTop: 4,
  },
  quickActionArrow: {
    marginLeft: 8,
  },
  discoveryCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  discoveryImage: {
    width: '100%',
    height: 200,
  },
  discoveryContent: {
    padding: 16,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  discoveryTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  discoveryChip: {
    marginLeft: 8,
  },
  discoveryChipText: {
    fontSize: 12,
  },
  discoveryDate: {
    opacity: 0.7,
    fontSize: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    minHeight: 200,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyStateButton: {
    marginTop: 24,
  },
}); 