import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Card, Text, TextInput, Button, SegmentedButtons, Snackbar } from "react-native-paper";
import { styles } from "./styles";
import { useAuthLogic } from "./logic";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import { LinearGradient } from "expo-linear-gradient"; // <-- use Expo gradient
import { TruckIcon } from "@/src/components/TruckIcon";

interface AuthScreenProps {
  initialTab?: "login";
}

export default function AuthScreen({ initialTab = "login" }: AuthScreenProps) {
  const [tab, setTab] = useState<"login">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isLoading, snackbar, setSnackbar, handleLogin } = useAuthLogic(navigation);

  return (
    <LinearGradient
      colors={["hsl(217, 91%, 35%)", "hsl(200, 94%, 55%)", "hsl(25, 95%, 53%)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.contentContainerStyle}>
        <Card style={styles.card}>
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={styles.logoContainer}>
              <TruckIcon size={48} color="white" />
            </View>

            <Text style={styles.title}>Sweetrip</Text>
            <Text style={styles.description}>Fleet management made simple</Text>
          </View>


          <View style={{ width: "100%" }}>
            {tab === "login" && (
              <View>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  outlineColor="rgba(255,255,255,0.5)" // normal border color
                  activeOutlineColor="#FFA500" // orange when focused
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <br></br>
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  outlineColor="rgba(255,255,255,0.5)" // normal border color
                  activeOutlineColor="none" // orange when focused
                  secureTextEntry={!showPassword} // toggle
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                <Button
                  mode="contained"
                  onPress={() => handleLogin(email, password)}
                  loading={isLoading}
                  style={styles.button}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </View>
            )}
          </View>
        </Card>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3000}
        >
          {snackbar.message}
        </Snackbar>
      </ScrollView>
    </LinearGradient>
  );
}
