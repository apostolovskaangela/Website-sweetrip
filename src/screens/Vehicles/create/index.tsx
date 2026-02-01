// src/screens/Vehicles/create/index.tsx
import React from "react";
import { View, Text, TextInput, Switch, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCreateVehicle } from "./logic";
import { styles } from "./styles";

export default function CreateVehicle() {
  const nav = useNavigation();
  const {
    registrationNumber,
    setRegistrationNumber,
    notes,
    setNotes,
    isActive,
    setIsActive,
    submit,
    loading,
    error,
  } = useCreateVehicle();

  const handleSubmit = async () => {
    const vehicle = await submit();
    if (vehicle) nav.goBack();
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      <Text>Registration Number</Text>
      <TextInput
        style={styles.input}
        value={registrationNumber}
        onChangeText={setRegistrationNumber}
      />

      <Text>Notes</Text>
      <TextInput style={styles.input} value={notes} onChangeText={setNotes} />

      <View style={styles.row}>
        <Text>Active</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      <Button
        title={loading ? "Creating..." : "Create Vehicle"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
}
