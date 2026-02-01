import { API_CONFIG } from "@/src/config/api";
import { handleApiError } from "@/src/utils/errorHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system/legacy";
import { Image as ExpoImage } from "expo-image";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TripStatus, TripStatusLabel } from "../types";
import { useTripDetailsLogic } from "./logic";
import { styles } from "./styles";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function TripDetailsScreen({ route, navigation }: any) {
  const { trip, canEdit, canDriverUpdate, updateStatus } = useTripDetailsLogic(
    route.params.id
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TripStatus>(TripStatus.NOT_STARTED);

  useEffect(() => {
    if (trip?.status) setSelectedStatus(trip.status as TripStatus);
  }, [trip?.status]);

  if (!trip) return null;

  const getCMRUrl = () => {
    const raw = trip.cmr_url || trip.cmr;
    if (!raw) return null;

    // Local SQLite mode stores a file URI (file://...) in `cmr`.
    if (
      raw.startsWith("http://") ||
      raw.startsWith("https://") ||
      raw.startsWith("file://") ||
      raw.startsWith("content://")
    ) {
      return raw;
    }

    // Seeded placeholder (no real file to download)
    if (raw.startsWith("seeded://")) return null;

    // If we're running without a backend, there's nowhere to download from.
    if (API_CONFIG.BASE_URL.startsWith("local://")) return null;

    // Legacy backend relative URL support (when using real API base URL)
    const base = API_CONFIG.BASE_URL.replace(/\/api\/?$/, "");
    return `${base}${raw.startsWith("/") ? raw : "/" + raw}`;
  };

  const cmrUrl = getCMRUrl();

  const handleDownloadCMR = async () => {
    if (!cmrUrl) {
      Alert.alert("Error", "CMR image URL is not available");
      return;
    }

    setDownloading(true);
    try {
      // If the CMR is already a local file, just share/open it directly.
      if (cmrUrl.startsWith("file://") || cmrUrl.startsWith("content://")) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(cmrUrl, {
            dialogTitle: `CMR - ${trip.trip_number}`,
          });
          Alert.alert("Success", "CMR ready to share/save.");
        } else {
          Alert.alert("Info", "Sharing is not available on this device.");
        }
        return;
      }

      // Otherwise, it's a remote URL (http/https): download then share.
      const token = await AsyncStorage.getItem("AUTH_TOKEN");
      const fileExtension = cmrUrl.split(".").pop()?.split("?")[0] || "jpg";
      const fileName = `CMR_${trip.trip_number}_${Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadOptions: any = {};
      if (token) downloadOptions.headers = { Authorization: `Bearer ${token}` };

      const result = await FileSystem.downloadAsync(cmrUrl, fileUri, downloadOptions);

      if (result.status === 200 && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(result.uri, {
          mimeType: `image/${fileExtension}`,
          dialogTitle: `Download CMR - ${trip.trip_number}`,
        });
        Alert.alert("Success", "CMR image downloaded successfully!");
      } else {
        Alert.alert("Info", "Sharing not available or download failed");
      }
    } catch (error: any) {
      console.error("Error downloading CMR:", error);
      Alert.alert("Error", "Failed to download CMR image");
    } finally {
      setDownloading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return Alert.alert("Error", "Please select a status");

    setIsUpdating(true);
    try {
      await updateStatus(selectedStatus);
      Alert.alert("Success", `Trip status updated to '${TripStatusLabel[selectedStatus]}'`);
    } catch (error: any) {
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
      <Text>Status: {TripStatusLabel[trip.status as TripStatus]}</Text>
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

      {cmrUrl && (
        <>
          <Text style={styles.sectionTitle}>CMR Document</Text>
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <ExpoImage
              source={{ uri: cmrUrl }}
              style={styles.cmrImage}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
              placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
            />
          </TouchableOpacity>
          <View style={styles.cmrActions}>
            <TouchableOpacity style={styles.viewBtn} onPress={() => setImageModalVisible(true)}>
              <Text style={styles.viewBtnText}>View Full Size</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
              onPress={handleDownloadCMR}
              disabled={downloading}
            >
              {downloading ? <ActivityIndicator color="#fff" /> : <Text style={styles.downloadBtnText}>Download</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal visible={imageModalVisible} transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          <ExpoImage
            source={{ uri: cmrUrl || "" }}
            style={styles.modalImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          />
        </View>
      </Modal>

      {canDriverUpdate && (
        <>
          <Text style={styles.sectionTitle}>Update Trip Status</Text>
          <View style={styles.statusPickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(val) => setSelectedStatus(val as TripStatus)}
              style={styles.statusPicker}
            >
              {Object.values(TripStatus).map((status) => (
                <Picker.Item key={status} label={TripStatusLabel[status]} value={status} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.updateBtn, isUpdating && styles.updateBtnDisabled]}
            onPress={handleUpdateStatus}
            disabled={isUpdating}
          >
            {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Status</Text>}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
