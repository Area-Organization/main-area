import { StyleSheet, Button, View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/ctx";
import { IconSymbol } from "@/components/ui/icon-symbol";

// based on the backend model
type Service = {
    name: string;
    description: string;
    actions: { name: string; description: string }[];
    reactions: { name: string; description: string }[];
};

export default function HomeScreen() {
    const { client, signOut } = useSession();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchServices = async () => {
        if (!client) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const { data, error } = await client["about.json"].get();

            if (error) {
                setErrorMsg(`Error: ${error.status}`);
                console.error("Fetch error:", error);
            } else if (data && data.server) {
                setServices(data.server.services as Service[]);
            }
        } catch (err) {
            setErrorMsg("Failed to connect to backend");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [client]);

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#808080"
                    name="house.fill"
                    style={styles.headerImage}
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Dashboard</ThemedText>
                <Button title="Refresh" onPress={fetchServices} disabled={loading} />
            </ThemedView>

            {errorMsg && (
                <ThemedView style={styles.card}>
                    <ThemedText style={{ color: "red" }}>{errorMsg}</ThemedText>
                </ThemedView>
            )}

            <ThemedView style={styles.sectionContainer}>
                <ThemedText type="subtitle">Available Services</ThemedText>
                {loading && <ActivityIndicator size="small" style={{ marginTop: 10 }} />}

                {!loading && services.length === 0 && !errorMsg && (
                    <ThemedText style={{ marginTop: 10, fontStyle: "italic" }}>
                        No services found. Check backend registry.
                    </ThemedText>
                )}

                {services.map((service, index) => (
                    <ThemedView key={index} style={styles.serviceCard}>
                        <ThemedText type="defaultSemiBold">{service.name}</ThemedText>
                        <ThemedText>{service.description}</ThemedText>
                        <View style={styles.badgeContainer}>
                            <ThemedText style={styles.badge}>
                                {service.actions?.length || 0} Actions
                            </ThemedText>
                            <ThemedText style={styles.badge}>
                                {service.reactions?.length || 0} Reactions
                            </ThemedText>
                        </View>
                    </ThemedView>
                ))}
            </ThemedView>

            <Button title="Sign Out" onPress={signOut} color="#ff5555" />
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: "#808080",
        bottom: -90,
        left: -35,
        position: "absolute"
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8
    },
    sectionContainer: {
        gap: 8,
        marginBottom: 8
    },
    card: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: "rgba(150, 150, 150, 0.1)",
        marginBottom: 10
    },
    serviceCard: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 10,
        gap: 5
    },
    badgeContainer: {
        flexDirection: "row",
        gap: 10,
        marginTop: 5
    },
    badge: {
        fontSize: 12,
        backgroundColor: "#0a7ea4",
        color: "white",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        overflow: "hidden"
    }
});
