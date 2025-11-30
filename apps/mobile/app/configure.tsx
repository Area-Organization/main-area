import {useState} from "react";
import {StyleSheet, TextInput, Button, KeyboardAvoidingView, Platform} from "react-native";
import {ThemedText} from "@/components/themed-text";
import {ThemedView} from "@/components/themed-view";
import {useSession} from "@/ctx";

export default function ConfigureScreen() {
    const {setServerUrl, apiUrl} = useSession();
    // Default to Android Emulator localhost, fallback to localhost
    const [url, setUrl] = useState(apiUrl || "http://10.0.2.2:8080");

    const handleSave = () => {
        if (url.length > 0) {
            setServerUrl(url);
            // Navigation is handled automatically by _layout.tsx based on state change
        }
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
                <ThemedText type="title" style={styles.title}>
                    Setup Connection
                </ThemedText>
                <ThemedText style={styles.subtitle}>Enter the IP address and port of your Area backend.</ThemedText>

                <TextInput
                    style={styles.input}
                    placeholder="http://192.168.1.x:8080"
                    placeholderTextColor="#888"
                    value={url}
                    onChangeText={setUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                />

                <Button title="Connect" onPress={handleSave} />
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    inner: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        gap: 20
    },
    title: {
        marginBottom: 10
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 20
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        color: "#000"
    }
});
