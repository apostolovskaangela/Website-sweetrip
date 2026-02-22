import { API_CONFIG } from "@/src/config/api";
import { handleApiError } from "@/src/utils/errorHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system/legacy";
import { Image as ExpoImage } from "expo-image";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  TouchableOpacity,
  View,
} from "react-native";
import { TripStatus, TripStatusLabel } from "../types";
import { useTripDetailsLogic } from "./logic";
import { makeThemedStyles, styles } from "./styles";
import { Screen } from "@/src/components/ui/Screen";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { Text, useTheme } from "react-native-paper";

export default function TripDetailsScreen({ route, navigation }: any) {
  const { trip, canEdit, canDriverUpdate, updateStatus } = useTripDetailsLogic(
    route.params.id
  );
  const theme = useTheme();
  const themedStyles = useMemo(() => makeThemedStyles(theme), [theme]);

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
    <Screen scroll accessibilityLabel="Trip details">
      <FadeIn fromY={10}>
        <Text style={themedStyles.title}>Trip {trip.trip_number}</Text>
        <Text style={themedStyles.subtitle}>{trip.destination_from} → {trip.destination_to}</Text>
      </FadeIn>

      <FadeIn fromY={12} durationMs={260} style={themedStyles.contentFade}>
        {canEdit && (
          <PrimaryButton
            onPress={() => navigation.navigate("TripEdit", { id: trip.id })}
            accessibilityLabel="Edit trip"
            style={themedStyles.buttonMarginBottom}
          >
            Edit
          </PrimaryButton>
        )}

        <View style={themedStyles.detailsCard}>
          <Text style={themedStyles.detailsHeader}>Details</Text>
          <Text style={themedStyles.detailsLine}>Status: {TripStatusLabel[trip.status as TripStatus]}</Text>
          <Text style={themedStyles.detailsLine}>Vehicle: {trip.vehicle?.registration_number ?? "-"}</Text>
          <Text style={themedStyles.detailsLine}>Driver: {trip.driver?.name ?? "-"}</Text>
          <Text style={themedStyles.detailsLine}>Date: {trip.trip_date}</Text>
          <Text style={themedStyles.detailsLine}>Mileage: {trip.mileage ? `${trip.mileage} km` : "-"}</Text>
        </View>

        {trip.stops?.length > 0 && (
          <>
            <Text style={themedStyles.sectionTitle}>Stops</Text>
            {trip.stops.map((s: any) => (
              <View key={s.id} style={themedStyles.stopCard}>
                <Text style={themedStyles.stopText}>{s.stop_order}. {s.destination}</Text>
              </View>
            ))}
          </>
        )}

        {cmrUrl && (
          <>
            <Text style={themedStyles.cmrTitle}>CMR Document</Text>
            <TouchableOpacity onPress={() => setImageModalVisible(true)} accessibilityRole="button" accessibilityLabel="Open CMR preview">
              <ExpoImage
                source={{ uri: cmrUrl }}
                style={styles.cmrImage}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
                placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
              />
            </TouchableOpacity>
            <View style={themedStyles.cmrActionsRow}>
              <PrimaryButton
                onPress={() => setImageModalVisible(true)}
                accessibilityLabel="View CMR full size"
                style={themedStyles.cmrActionLeft}
              >
                View
              </PrimaryButton>
              <PrimaryButton
                onPress={handleDownloadCMR}
                disabled={downloading}
                loading={downloading}
                accessibilityLabel="Download CMR"
                style={themedStyles.cmrActionRight}
              >
                {downloading ? "Downloading..." : "Download"}
              </PrimaryButton>
            </View>
          </>
        )}

        <Modal visible={imageModalVisible} transparent>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setImageModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close CMR preview"
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
            <Text style={themedStyles.sectionTitle}>Update Trip Status</Text>
            <View style={themedStyles.statusPickerContainer}>
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

            <PrimaryButton
              onPress={handleUpdateStatus}
              disabled={isUpdating}
              loading={isUpdating}
              accessibilityLabel="Update trip status"
              style={themedStyles.buttonMarginTop}
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </PrimaryButton>
          </>
        )}
      </FadeIn>
    </Screen>
  );
}
