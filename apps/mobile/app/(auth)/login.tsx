import {useState} from "react";
import {StyleSheet, TextInput, Button, Alert, View} from "react-native";
import {ThemedText} from "@/components/themed-text";
import {ThemedView} from "@/components/themed-view";
import {useSession} from "@/ctx";
import {Link} from "expo-router";

export default function LoginScreen() {
    const {signIn, client} = useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            // Check if client is initialized
            if (!client) {
                Alert.alert("Error", "Network configuration missing.");
                return;
            }

            // TODO: Replace with actual backend call once Authentication endpoints are ready
            // const { data, error } = await client.auth.login.post({ email, password });

            // Mocking successful login for now
            if (email && password) {
                signIn("mock-jwt-token");
            } else {
                Alert.alert("Error", "Please fill in all fields");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    Welcome Back
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

                <View style={styles.buttonContainer}>
                    <Button title={loading ? "Signing in..." : "Sign In"} onPress={handleLogin} disabled={loading} />
                </View>

                <Link href="/register" style={styles.link}>
                    <ThemedText type="link">Don&apos;t have an account? Sign up</ThemedText>
                </Link>

                <Link href="/configure" style={styles.link}>
                    <ThemedText type="default" style={{fontSize: 14, color: "#888"}}>
                        Change Server Configuration
                    </ThemedText>
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
