import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ImageBackground, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip, useTheme, Button, ActivityIndicator, IconButton, Divider, Menu, Portal, Dialog, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDiscoveries, deleteDiscovery, type Discovery } from '../../../services/discoveries';
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
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadDiscoveries();
  }, []);

  async function loadDiscoveries() {
    try {
      const data = await getDiscoveries();
      setDiscoveries(data);
    } catch (error) {
      console.error('Error loading discoveries:', error);
      showMessage('Failed to load discoveries');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadDiscoveries();
    setRefreshing(false);
  }

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleEdit = (discovery: Discovery) => {
    setMenuVisible(null);
    router.push({
      pathname: '/(tabs)/library/[id]',
      params: { id: discovery.id, mode: 'edit' }
    });
  };

  const handleDelete = async () => {
    if (!selectedDiscovery) return;
    try {
      await deleteDiscovery(selectedDiscovery.id);
      setSnackbarMessage('Discovery deleted successfully');
      setSnackbarVisible(true);
      loadDiscoveries(); // Refresh the list
    } catch (error) {
      setSnackbarMessage('Failed to delete discovery');
      setSnackbarVisible(true);
    }
    setDeleteDialogVisible(false);
    setSelectedDiscovery(null);
  };

  const showDeleteDialog = (discovery: Discovery) => {
    setSelectedDiscovery(discovery);
    setMenuVisible(null);
    setDeleteDialogVisible(true);
  };

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
    <Card style={styles.gridCard}>
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/(tabs)/library/[id]',
          params: { id: item.id }
        })}
      >
        <Card.Cover 
          source={{ uri: item.image_url }} 
          style={styles.cardImage}
        />
      </TouchableOpacity>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>
            {item.microbe_name}
          </Text>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => handleEdit(item)}
              title="Edit"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => showDeleteDialog(item)}
              title="Delete"
              leadingIcon="delete"
            />
          </Menu>
        </View>
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
          <View style={styles.listItemRight}>
            <Text variant="bodySmall" style={styles.listDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            <Menu
              visible={menuVisible === item.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(item.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => handleEdit(item)}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => showDeleteDialog(item)}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          </View>
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

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Discovery</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this discovery? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete} loading={isProcessing}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>

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
          key={viewMode}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 