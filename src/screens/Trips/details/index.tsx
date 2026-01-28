// import { API_CONFIG } from "@/src/config/api";
// import { handleApiError } from "@/src/utils/errorHandler";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Picker } from "@react-native-picker/picker";
// import * as FileSystem from "expo-file-system";
// import * as LegacyFS from "expo-file-system/legacy";
// import * as ImageManipulator from "expo-image-manipulator";
// import { Image as ExpoImage } from "expo-image";
// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Modal,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useTripDetailsLogic } from "./logic";
// import { styles } from "./styles";

// const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// export default function TripDetailsScreen({ route, navigation }: any) {
//   const { trip, canEdit, canDriverUpdate, updateStatus } =
//     useTripDetailsLogic(route.params.id);

//   const [isUpdating, setIsUpdating] = useState(false);
//   const [imageModalVisible, setImageModalVisible] = useState(false);
//   const [downloading, setDownloading] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState<string>("not_started");

//   useEffect(() => {
//     if (trip?.status) setSelectedStatus(trip.status);
//   }, [trip?.status]);

//   if (!trip) return null;

//   const getCMRUrl = () => {
//     if (!trip.cmr_url) return null;
//     if (trip.cmr_url.startsWith("http")) return trip.cmr_url;
//     const base = API_CONFIG.BASE_URL.replace("/api", "");
//     return `${base}${trip.cmr_url.startsWith("/") ? trip.cmr_url : "/" + trip.cmr_url}`;
//   };

//   const cmrUrl = getCMRUrl();


// const downloadAsPDF = async () => {
//   if (!cmrUrl) {
//     Alert.alert("Error", "CMR image URL is not available");
//     return;
//   }

//   setDownloading(true);

//   try {
//     const token = await AsyncStorage.getItem("AUTH_TOKEN");

//     const originalImageUri = `${LegacyFS.cacheDirectory}cmr_raw_${Date.now()}.jpg`;

//     console.log("STEP 1: About to download image");

//     const downloadOptions: any = {};
//     if (token) downloadOptions.headers = { Authorization: `Bearer ${token}` };

//     // ✅ Use LegacyFS for download
//     const downloadResult = await LegacyFS.downloadAsync(cmrUrl, originalImageUri, downloadOptions);

//     console.log("STEP 2: Image downloaded to", downloadResult.uri);

//     // Resize + compress
//     const manipulated = await ImageManipulator.manipulateAsync(
//       downloadResult.uri,
//       [{ resize: { width: 1000 } }],
//       { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
//     );
//     console.log("STEP 3: Image resized, optimized URI =", manipulated.uri);

//     // Convert to base64 using LegacyFS
//     const base64 = await LegacyFS.readAsStringAsync(manipulated.uri, { encoding: LegacyFS.EncodingType.Base64 });
//     console.log("STEP 4: Base64 conversion done, length =", base64.length);

//     // Generate PDF
//     const html = `
//       <html>
//         <head>
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <style>body { margin:0; padding:0; } img { width:100%; height:auto; }</style>
//         </head>
//         <body>
//           <img src="data:image/jpeg;base64,${base64}" />
//         </body>
//       </html>
//     `;

//     console.log("STEP 5: Before print");
//     const pdf = await Print.printToFileAsync({ html });
//     console.log("STEP 6: After print, pdf URI =", pdf.uri);

//     await Sharing.shareAsync(pdf.uri, {
//       mimeType: "application/pdf",
//       dialogTitle: `CMR_${trip.trip_number}.pdf`,
//     });

//     console.log("STEP 7: Share completed");

//   } catch (error) {
//     console.error("PDF generation error:", error);
//     Alert.alert("Error", "Failed to generate PDF");
//   } finally {
//     setDownloading(false);
//   }
// };

  
  

//   const handleDownload = () => {
//     Alert.alert(
//       "Download CMR",
//       "Choose file format",
//       [
//         { text: "PDF", onPress: downloadAsPDF },
//         { text: "Cancel", style: "cancel" },
//       ],
//       { cancelable: true }
//     );
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Trip: {trip.trip_number}</Text>

//       <Text style={styles.sectionTitle}>
//         {trip.destination_from} → {trip.destination_to}
//       </Text>

//       {cmrUrl && (
//         <>
//           <Text style={styles.sectionTitle}>CMR Document</Text>

//           <TouchableOpacity onPress={() => setImageModalVisible(true)}>
//             <ExpoImage
//               source={{ uri: cmrUrl }}
//               style={styles.cmrImage}
//               contentFit="contain"
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
//             onPress={handleDownload}
//             disabled={downloading}
//           >
//             {downloading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.downloadBtnText}>Download PDF</Text>
//             )}
//           </TouchableOpacity>
//         </>
//       )}

//       <Modal visible={imageModalVisible} transparent>
//         <View style={styles.modalContainer}>
//           <TouchableOpacity
//             style={styles.modalCloseButton}
//             onPress={() => setImageModalVisible(false)}
//           >
//             <Text style={styles.modalCloseText}>✕ Close</Text>
//           </TouchableOpacity>

//           <ExpoImage
//             source={{ uri: cmrUrl || "" }}
//             style={styles.modalImage}
//             contentFit="contain"
//           />
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }

import { API_CONFIG } from "@/src/config/api";
import { handleApiError } from "@/src/utils/errorHandler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from 'expo-file-system/legacy';
import { Image as ExpoImage } from 'expo-image';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTripDetailsLogic } from "./logic";
import { styles } from "./styles";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TripDetailsScreen({ route, navigation }: any) {
  const { trip, canEdit, canDriverUpdate, updateStatus } = useTripDetailsLogic(
    route.params.id
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("not_started");

  // Update selected status when trip loads - must be before early return
  useEffect(() => {
    if (trip?.status) {
      setSelectedStatus(trip.status);
    }
  }, [trip?.status]);

  if (!trip) return null;

  // Get full CMR URL (handle both relative and absolute URLs)
  const getCMRUrl = () => {
    if (!trip.cmr_url) return null;
    
    // If URL is already absolute, return as-is
    if (trip.cmr_url.startsWith('http://') || trip.cmr_url.startsWith('https://')) {
      if (__DEV__) {
        console.log('📷 CMR URL (absolute):', trip.cmr_url);
      }
      return trip.cmr_url;
    }
    
    // If relative, prepend base URL (remove /api from base URL and add the relative path)
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const relativePath = trip.cmr_url.startsWith('/') ? trip.cmr_url : `/${trip.cmr_url}`;
    const fullUrl = `${baseUrl}${relativePath}`;
    
    if (__DEV__) {
      console.log('📷 CMR URL (constructed):', {
        original: trip.cmr_url,
        baseUrl: baseUrl,
        fullUrl: fullUrl,
      });
    }
    
    return fullUrl;
  };

  const cmrUrl = getCMRUrl();

  const handleDownloadCMR = async () => {
    if (!cmrUrl) {
      Alert.alert('Error', 'CMR image URL is not available');
      return;
    }

    setDownloading(true);
    try {
      // Get auth token for authenticated downloads
      const token = await AsyncStorage.getItem('AUTH_TOKEN');
      
      // Get the file extension from URL
      const fileExtension = cmrUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `CMR_${trip.trip_number}_${Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download the file with authentication headers if needed
      const downloadOptions: any = {};
      if (token) {
        downloadOptions.headers = {
          'Authorization': `Bearer ${token}`,
        };
      }

      const downloadResult = await FileSystem.downloadAsync(cmrUrl, fileUri, downloadOptions);
      
      if (downloadResult.status === 200) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: `image/${fileExtension}`,
            dialogTitle: `Download CMR - ${trip.trip_number}`,
          });
          Alert.alert('Success', 'CMR image downloaded successfully!');
        } else {
          Alert.alert('Info', 'Sharing is not available on this device');
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (error: any) {
      console.error('Error downloading CMR:', error);
      Alert.alert('Error', 'Failed to download CMR image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      Alert.alert("Error", "Please select a status");
      return;
    }

    setIsUpdating(true);
    try {
      await updateStatus(selectedStatus as "not_started" | "in_process" | "started" | "completed");
      
      const statusMessages: Record<string, string> = {
        not_started: "Trip status updated to 'Not Started'",
        in_process: "Trip status updated to 'In Process'",
        started: "Trip status updated to 'Started'",
        completed: "Trip status updated to 'Completed' and CMR uploaded successfully!",
      };
      
      Alert.alert("Success", statusMessages[selectedStatus] || "Trip status updated successfully!");
    } catch (error: any) {
      // Use the error handler utility for consistent error display
      handleApiError(error, true);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trip: {trip.trip_number}</Text>

      {canEdit && (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("TripEdit", { id: trip.id })}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>
        {trip.destination_from} → {trip.destination_to}
      </Text>
      <Text>Status: {trip.status.replace("_", " ")}</Text>
      <Text>Vehicle: {trip.vehicle?.registration_number ?? "-"}</Text>
      <Text>Driver: {trip.driver?.name ?? "-"}</Text>
      <Text>Date: {trip.trip_date}</Text>
      <Text>Mileage: {trip.mileage ? `${trip.mileage} km` : "-"}</Text>

      {trip.stops?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Stops</Text>
          {trip.stops.map((s: any) => (
            <Text key={s.id}>
              {s.stop_order}. {s.destination}
            </Text>
          ))}
        </>
      )}

      {/* CMR Image Preview */}
      {cmrUrl && (
        <>
          <Text style={styles.sectionTitle}>CMR Document</Text>
          <TouchableOpacity
            onPress={() => setImageModalVisible(true)}
            activeOpacity={0.8}
          >
            <ExpoImage
              source={{ uri: cmrUrl }}
              style={styles.cmrImage}
              contentFit="contain"
              transition={200}
            />
          </TouchableOpacity>
          <View style={styles.cmrActions}>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => setImageModalVisible(true)}
            >
              <Text style={styles.viewBtnText}>View Full Size</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
              onPress={handleDownloadCMR}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.downloadBtnText}>Download</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Full Screen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            contentContainerStyle={styles.modalImageContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <ExpoImage
              source={{ uri: cmrUrl || '' }}
              style={styles.modalImage}
              contentFit="contain"
              transition={200}
              placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            />
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalDownloadBtn}
              onPress={handleDownloadCMR}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalDownloadBtnText}>Download CMR</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {canDriverUpdate && (
        <>
          <Text style={styles.sectionTitle}>Update Trip Status</Text>
          <View style={styles.statusPickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue) => setSelectedStatus(itemValue)}
              style={styles.statusPicker}
            >
              <Picker.Item label="Not Started" value="not_started" />
              <Picker.Item label="In Process" value="in_process" />
              <Picker.Item label="Started" value="started" />
              <Picker.Item label="Completed" value="completed" />
            </Picker>
          </View>
          
          <TouchableOpacity
            style={[styles.updateBtn, isUpdating && styles.updateBtnDisabled]}
            onPress={handleUpdateStatus}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.btnText}>
                  {selectedStatus === "completed" ? "Uploading CMR..." : "Updating Status..."}
                </Text>
              </View>
            ) : (
              <Text style={styles.btnText}>
                {selectedStatus === "completed" ? "Update Status (CMR Required)" : "Update Status"}
              </Text>
            )}
          </TouchableOpacity>
          
          {selectedStatus === "completed" && (
            <Text style={styles.helperText}>
              Note: You must upload a CMR image to mark the trip as completed
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}
