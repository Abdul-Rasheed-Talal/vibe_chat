import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useEffect(() => {
        if (loading || !fontsLoaded) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!session && !inAuthGroup) {
            // Redirect to the sign-in page.
            router.replace("/(auth)/login");
        } else if (session && inAuthGroup) {
            // Redirect away from the sign-in page.
            router.replace("/");
        }
    }, [session, loading, segments, fontsLoaded]);

    if (!fontsLoaded) return null;

    return <Slot />;
}

export default function Layout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}
