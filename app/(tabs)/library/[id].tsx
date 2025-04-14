import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Card, Text, List, Button, IconButton, Dialog, Portal, TextInput, Chip, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDiscoveryById, updateDiscovery, deleteDiscovery, type Discovery } from '../../../services/discoveries';
import { SafeAreaView } from 'react-native-safe-area-context';

type Classification = 'bacteria' | 'virus' | 'fungi' | 'protozoa';

interface DiscoveryDetailScreenProps {}

const DiscoveryDetailScreen: React.FC<DiscoveryDetailScreenProps> = () => {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const router = useRouter();
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit');
  const [editedName, setEditedName] = useState<string>('');
  const [editedClassification, setEditedClassification] = useState<Classification>('bacteria');
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  useEffect(() => {
    loadDiscovery();
  }, [id]);

  useEffect(() => {
    // Enter edit mode when mode parameter is 'edit'
    if (mode === 'edit') {
      setIsEditing(true);
    }
  }, [mode]);

  async function loadDiscovery() {
    setLoading(true);
    try {
      const data = await getDiscoveryById(id);
      setDiscovery(data);
      // Initialize edit form values
      setEditedName(data.microbe_name || '');
      setEditedClassification(data.classification);
      setEditedDescription(data.analysis_results || '');
    } catch (err) {
      setError('Failed to load discovery');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveChanges = async () => {
    if (!discovery) return;
    
    setIsProcessing(true);
    try {
      const updatedDiscovery = await updateDiscovery(discovery.id, {
        microbe_name: editedName,
        classification: editedClassification,
        analysis_results: editedDescription
      });
      
      setDiscovery(updatedDiscovery);
      setIsEditing(false);
      showMessage('Changes saved successfully');
    } catch (err) {
      console.error('Error updating discovery:', err);
      showMessage('Failed to save changes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!discovery) return;
    
    setIsProcessing(true);
    try {
      await deleteDiscovery(discovery.id);
      showMessage('Discovery deleted successfully');
      
      // Navigate back to library after short delay
      setTimeout(() => {
        router.replace('/(tabs)/library');
      }, 1000);
    } catch (err) {
      console.error('Error deleting discovery:', err);
      showMessage('Failed to delete discovery');
      setShowDeleteDialog(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  const classificationOptions = [
    { label: 'Bacteria', value: 'bacteria' },
    { label: 'Virus', value: 'virus' },
    { label: 'Fungi', value: 'fungi' },
    { label: 'Protozoa', value: 'protozoa' }
  ];

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: discovery.microbe_name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              {isEditing ? (
                <>
                  <IconButton 
                    icon="close" 
                    onPress={() => {
                      setIsEditing(false);
                      // Reset form values
                      setEditedName(discovery.microbe_name || '');
                      setEditedClassification(discovery.classification);
                      setEditedDescription(discovery.analysis_results || '');
                    }} 
                  />
                </>
              ) : (
                <>
                  <IconButton 
                    icon="pencil" 
                    onPress={() => setIsEditing(true)} 
                  />
                  <IconButton 
                    icon="delete" 
                    onPress={() => setShowDeleteDialog(true)} 
                  />
                </>
              )}
            </View>
          ),
        }}
      />
      
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView}>
          <Card style={styles.imageCard}>
            <Card.Cover source={{ uri: discovery.image_url }} />
          </Card>

          {isEditing ? (
            // Edit mode
            <>
              <Card style={styles.card}>
                <Card.Title title="Basic Information" />
                <Card.Content>
                  <TextInput
                    label="Microbe Name"
                    value={editedName}
                    onChangeText={setEditedName}
                    mode="outlined"
                    style={styles.input}
                  />
                  
                  <Text variant="titleMedium" style={styles.label}>Classification</Text>
                  <View style={styles.chipContainer}>
                    {classificationOptions.map(option => (
                      <Chip
                        key={option.value}
                        selected={editedClassification === option.value}
                        onPress={() => setEditedClassification(option.value as Classification)}
                        style={styles.chip}
                        mode={editedClassification === option.value ? "flat" : "outlined"}
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </View>
                  
                  <TextInput
                    label="Description"
                    value={editedDescription}
                    onChangeText={setEditedDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={5}
                    style={[styles.input, styles.textArea]}
                  />
                </Card.Content>
              </Card>
            </>
          ) : (
            // View mode
            <>
              <Card style={styles.infoCard}>
                <Card.Content>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons 
                      name={
                        discovery.classification === 'bacteria' ? 'bacteria' :
                        discovery.classification === 'virus' ? 'virus' :
                        discovery.classification === 'fungi' ? 'mushroom' : 'bug'
                      } 
                      size={24} 
                      color="#666" 
                    />
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
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="percent" size={24} color="#666" />
                    <Text variant="titleMedium" style={styles.infoText}>
                      {Math.round(discovery.confidence_score * 100)}% confidence
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
            </>
          )}
        </ScrollView>

        {isEditing && (
          <View style={styles.bottomBar}>
            <Button
              mode="contained"
              onPress={handleSaveChanges}
              loading={isProcessing}
              disabled={isProcessing}
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}
            >
              Save Changes
            </Button>
          </View>
        )}
      </View>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete Discovery</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this discovery? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onPress={handleDelete} loading={isProcessing}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setShowSnackbar(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
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
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    borderRadius: 8,
  },
  cancelButton: {
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonContent: {
    height: 48,
  },
});

export default DiscoveryDetailScreen; 