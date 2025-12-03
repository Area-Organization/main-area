import {useState} from "react";
import {StyleSheet, TextInput, Button, Alert, View} from "react-native";
import {ThemedText} from "@/components/themed-text";
import {ThemedView} from "@/components/themed-view";
import {Link, useRouter} from "expo-router";

export default function RegisterScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        // TODO: Call backend registration endpoint
        Alert.alert("Success", "Account created! Please login.", [{text: "OK", onPress: () => router.back()}]);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    Create Account
                </ThemedText>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <View style={styles.buttonContainer}>
                    <Button title="Sign Up" onPress={handleRegister} />
                </View>

                <Link href="/login" style={styles.link}>
                    <ThemedText type="link">Already have an account? Log In</ThemedText>
                </Link>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        gap: 15
    },
    title: {
        marginBottom: 20,
        textAlign: "center"
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        color: "#000"
    },
    buttonContainer: {
        marginTop: 10
    },
    link: {
        marginTop: 15,
        alignSelf: "center"
    }
});
