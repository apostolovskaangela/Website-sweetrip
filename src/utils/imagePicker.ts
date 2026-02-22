import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  file?: any;
}

/**
 * Request camera and media library permissions
 */
export async function requestImagePermissions(): Promise<boolean> {
  try {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    // Request media library permissions
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
      Alert.alert(
        'Permissions Required',
        'We need camera and photo library permissions to upload CMR images.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}

/**
 * Pick an image from the library
 */
export async function pickImageFromLibrary(): Promise<ImagePickerResult | null> {
  try {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    
    // Create file object for FormData
    const uri = asset.uri;
    // Generate a proper filename with timestamp
    const timestamp = Date.now();
    const filename = `cmr_${timestamp}.jpg`;
    const type = 'image/jpeg';

    // For React Native FormData, we need to keep the full URI
    // The uri should include file:// prefix if present
    const file = {
      uri: uri, // Keep the original URI as-is
      type: type,
      name: filename,
    };

    return {
      uri,
      type,
      name: filename,
      file,
    };
  } catch (error) {
    console.error('Error picking image from library:', error);
    Alert.alert('Error', 'Failed to pick image from library');
    return null;
  }
}

/**
 * Take a photo with the camera
 */
export async function takePhoto(): Promise<ImagePickerResult | null> {
  try {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    
    // Create file object for FormData
    const uri = asset.uri;
    // Generate a proper filename with timestamp
    const timestamp = Date.now();
    const filename = `cmr_${timestamp}.jpg`;
    const type = 'image/jpeg';

    // For React Native FormData, we need to keep the full URI
    // The uri should include file:// prefix if present
    const file = {
      uri: uri, // Keep the original URI as-is
      type: type,
      name: filename,
    };

    return {
      uri,
      type,
      name: filename,
      file,
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo');
    return null;
  }
}

/**
 * Show action sheet to choose between camera and library
 */
export async function pickCMRImage(): Promise<ImagePickerResult | null> {
  return new Promise((resolve) => {
    Alert.alert(
      'Upload CMR',
      'Choose how you want to add the CMR image',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await takePhoto();
            resolve(result);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const result = await pickImageFromLibrary();
            resolve(result);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
}
