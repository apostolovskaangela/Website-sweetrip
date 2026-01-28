import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function Welcome({ navigation }: Props) {
  return (
    <LinearGradient
      colors={["hsl(217, 91%, 35%)", "hsl(200, 94%, 55%)", "hsl(25, 95%, 53%)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>Fleet Management</Text>
      <Text style={styles.subtitle}>Made Simple</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Start Free Trial</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
