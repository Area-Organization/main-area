import {Image} from "expo-image";
import {Platform, StyleSheet, Button} from "react-native";
import {useEffect, useState} from "react";

import {HelloWave} from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import {ThemedText} from "@/components/themed-text";
import {ThemedView} from "@/components/themed-view";
import {useSession} from "@/ctx";

export default function HomeScreen() {
    const {client, signOut} = useSession();
    const [data, setData] = useState<string>("Loading...");

    useEffect(() => {
        const fetchData = async () => {
            if (!client) return;

            try {
                const {data, error} = await client.get();

                if (error) {
                    setData(`Error: ${error.status}`);
                } else if (data) {
                    setData(`Backend says: "${typeof data === "string" ? data : JSON.stringify(data)}"`);
                }
            } catch (err) {
                setData("Failed to connect to backend");
            }
        };

        fetchData();
    }, [client]);

    return (
        <ParallaxScrollView
            headerBackgroundColor={{light: "#A1CEDC", dark: "#1D3D47"}}
            headerImage={<Image source={require("@/assets/images/partial-react-logo.png")} style={styles.reactLogo} />}
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Welcome!</ThemedText>
                <HelloWave />
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Backend Connection:</ThemedText>
                <ThemedText>{data}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
                <Button title="Sign Out" onPress={signOut} color="#ff5555" />
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Step 1: Try it</ThemedText>
                <ThemedText>
                    Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes. Press{" "}
                    <ThemedText type="defaultSemiBold">
                        {Platform.select({
                            ios: "cmd + d",
                            android: "cmd + m",
                            web: "F12"
                        })}
                    </ThemedText>{" "}
                    to open developer tools.
                </ThemedText>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute"
    }
});
