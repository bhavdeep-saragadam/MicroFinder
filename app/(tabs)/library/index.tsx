import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ImageBackground, FlatList } from 'react-native';
import { Text, Card, Searchbar, Chip, useTheme, Button, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDiscoveries, type Discovery } from '../../../services/discoveries';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'all' | 'bacteria' | 'virus' | 'fungi' | 'protozoa';

export default function LibraryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadDiscoveries();
  }, []);

  async function loadDiscoveries() {
    try {
      const data = await getDiscoveries();
      setDiscoveries(data);
    } catch (error) {
      console.error('Error loading discoveries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadDiscoveries();
    setRefreshing(false);
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const filteredDiscoveries = discoveries
    .filter(discovery => {
      if (activeFilter === 'all') return true;
      return discovery.classification.toLowerCase().includes(activeFilter);
    })
    .filter(discovery =>
      discovery.microbe_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discovery.classification.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const renderGridItem = ({ item }: { item: Discovery }) => (
    <Card
      style={styles.gridCard}
      onPress={() => router.push({
        pathname: '/(tabs)/library/[id]',
        params: { id: item.id }
      })}
    >
      <Card.Cover 
        source={{ uri: item.image_url }} 
        style={styles.cardImage}
      />
      <Card.Content style={styles.cardContent}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>
          {item.microbe_name}
        </Text>
        <View style={styles.cardDetails}>
          <Chip 
            style={styles.classificationChip} 
            textStyle={styles.chipText}
            icon={() => renderClassificationIcon(item.classification)}
          >
            {item.classification}
          </Chip>
          <Text variant="bodySmall" style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderListItem = ({ item }: { item: Discovery }) => (
    <Card
      style={styles.listCard}
      onPress={() => router.push({
        pathname: '/(tabs)/library/[id]',
        params: { id: item.id }
      })}
    >
      <Card.Title
        title={item.microbe_name}
        subtitle={item.classification}
        left={(props) => renderClassificationIcon(item.classification, 36)}
        right={(props) => (
          <Text variant="bodySmall" style={styles.listDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        )}
      />
    </Card>
  );

  const renderClassificationIcon = (classification: string, size: number = 24) => {
    let iconName = 'bacteria';
    
    switch (classification.toLowerCase()) {
      case 'bacteria':
        iconName = 'bacteria';
        break;
      case 'virus':
        iconName = 'virus';
        break;
      case 'fungi':
        iconName = 'mushroom';
        break;
      case 'protozoa':
        iconName = 'bug';
        break;
    }
    
    return (
      <MaterialCommunityIcons 
        name={iconName as any} 
        size={size} 
        color={theme.colors.primary} 
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="flask-empty-outline"
        size={80}
        color={theme.colors.primary}
        style={styles.emptyIcon}
      />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No discoveries found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Try adjusting your search or filter.
      </Text>
      <Button 
        mode="contained" 
        onPress={() => {
          setSearchQuery('');
          setActiveFilter('all');
        }}
        style={styles.clearButton}
      >
        Clear Filters
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="headlineMedium" style={styles.title}>My Library</Text>
          <IconButton
            icon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            mode="contained"
            onPress={toggleViewMode}
            style={styles.viewModeButton}
          />
        </View>
        <Searchbar
          placeholder="Search microorganisms"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <Chip
            selected={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
            style={styles.filterChip}
            mode="outlined"
          >
            All
          </Chip>
          <Chip
            selected={activeFilter === 'bacteria'}
            onPress={() => setActiveFilter('bacteria')}
            style={styles.filterChip}
            mode="outlined"
            icon="bacteria"
          >
            Bacteria
          </Chip>
          <Chip
            selected={activeFilter === 'virus'}
            onPress={() => setActiveFilter('virus')}
            style={styles.filterChip}
            mode="outlined"
            icon="virus"
          >
            Viruses
          </Chip>
          <Chip
            selected={activeFilter === 'fungi'}
            onPress={() => setActiveFilter('fungi')}
            style={styles.filterChip}
            mode="outlined"
            icon="mushroom"
          >
            Fungi
          </Chip>
          <Chip
            selected={activeFilter === 'protozoa'}
            onPress={() => setActiveFilter('protozoa')}
            style={styles.filterChip}
            mode="outlined"
            icon="bug"
          >
            Protozoa
          </Chip>
        </ScrollView>
      </View>

      <Divider />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading discoveries...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDiscoveries}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
  },
  viewModeButton: {
    margin: 0,
  },
  searchBar: {
    marginTop: 12,
    marginBottom: 12,
    elevation: 0,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterContainer: {
    paddingRight: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  gridContent: {
    padding: 8,
    paddingBottom: 80, // Extra space for FAB
  },
  listContent: {
    padding: 8,
    paddingBottom: 80, // Extra space for FAB
  },
  gridCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  listCard: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
  },
  cardImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classificationChip: {
    height: 28,
    paddingHorizontal: 2,
  },
  chipText: {
    fontSize: 12,
  },
  date: {
    opacity: 0.6,
    fontSize: 12,
  },
  listDate: {
    opacity: 0.6,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  clearButton: {
    borderRadius: 8,
  },
}); 