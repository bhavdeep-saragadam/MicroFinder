import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import type { CameraType, FlashMode } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CaptureScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      let cameraGranted = permission?.granted;
      if (!cameraGranted) {
        const result = await requestPermission();
        cameraGranted = result.granted;
      }
      setHasPermission(cameraGranted && mediaStatus === 'granted');
    })();
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsTakingPicture(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      
      // Resize image to reduce file size
      const manipResult = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      
      setImageUri(manipResult.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setIsTakingPicture(false);
    }
  };

  const toggleCameraType = () => {
    setType(
      type === 'back'
        ? 'front'
        : 'back'
    );
  };

  const toggleFlash = () => {
    setFlash(
      flash === 'off'
        ? 'on'
        : 'off'
    );
  };

  const retakePicture = () => {
    setImageUri(null);
  };

  const analyzeImage = () => {
    if (imageUri) {
      router.push({
        pathname: '/(tabs)/camera/analysis',
        params: { imageUri }
      });
    }
  };

  const goBack = () => {
    router.back();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#B00020" />
        <Text variant="headlineSmall" style={styles.permissionText}>
          No access to camera
        </Text>
        <Text style={styles.permissionDetails}>
          Please grant camera permissions to use this feature.
        </Text>
        <Button 
          mode="contained" 
          onPress={goBack}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }

  if (imageUri) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined"
            icon="camera"
            onPress={retakePicture}
            style={styles.button}
          >
            Retake
          </Button>
          <Button 
            mode="contained"
            icon="microscope"
            onPress={analyzeImage}
            style={styles.button}
          >
            Analyze
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={type}
        flash={flash}
        ref={cameraRef}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={flash === 'on' ? "flash" : "flash-off"}
                size={28}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
          disabled={isTakingPicture}
        >
          {isTakingPicture ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionText: {
    marginTop: 16,
  },
  permissionDetails: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    top: 16,
    right: 20,
    flexDirection: 'column',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
  imagePreview: {
    flex: 1,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 