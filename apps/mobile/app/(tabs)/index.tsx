import { StyleSheet, Button, View, ActivityIndicator } from "react-native";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/ctx";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useServices } from "@/hooks/use-services";

export default function HomeScreen() {
  const { signOut } = useSession();
  const { services, loading, error, refresh } = useServices();

  // Calculate total actions/reactions available
  const totalActions = services.reduce((acc, s) => acc + (s.actions?.length || 0), 0);
  const totalReactions = services.reduce((acc, s) => acc + (s.reactions?.length || 0), 0);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<IconSymbol size={310} color="#808080" name="house.fill" style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Dashboard</ThemedText>
        <Button title="Refresh" onPress={refresh} disabled={loading} />
      </ThemedView>

      {error && (
        <ThemedView style={styles.card}>
          <ThemedText style={{ color: "red" }}>{error}</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText type="title">{services.length}</ThemedText>
          <ThemedText>Services</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="title">{totalActions}</ThemedText>
          <ThemedText>Actions</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="title">{totalReactions}</ThemedText>
          <ThemedText>Reactions</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Active Services</ThemedText>
        {loading && <ActivityIndicator size="small" style={{ marginTop: 10 }} />}

        {!loading && services.length === 0 && !error && (
          <ThemedText style={{ marginTop: 10, fontStyle: "italic" }}>
            No services found. Check backend registry.
          </ThemedText>
        )}

        {services.map((service, index) => (
          <ThemedView key={index} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <ThemedText type="defaultSemiBold">{service.name}</ThemedText>
              {/* Mock connection status */}
              <ThemedText style={{ fontSize: 12, color: "green" }}>Connected</ThemedText>
            </View>
            <ThemedText>{service.description}</ThemedText>
            <View style={styles.badgeContainer}>
              <ThemedText style={styles.badge}>{service.actions?.length || 0} Actions</ThemedText>
              <ThemedText style={styles.badge}>{service.reactions?.length || 0} Reactions</ThemedText>
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    borderRadius: 10,
    marginBottom: 10
  },
  statItem: {
    alignItems: "center"
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
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
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
