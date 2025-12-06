import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as Linking from 'expo-linking';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            // Get the full URL that opened this page
            const url = await Linking.getInitialURL();
            console.log('Auth callback URL:', url);

            if (url) {
                // Parse tokens from URL fragment
                const fragmentIndex = url.indexOf('#');
                if (fragmentIndex !== -1) {
                    const fragment = url.substring(fragmentIndex + 1);
                    const params = new URLSearchParams(fragment);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    console.log('Found tokens:', !!accessToken, !!refreshToken);

                    if (accessToken && refreshToken) {
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (error) {
                            console.error('Error setting session:', error);
                        } else {
                            console.log('Session set successfully');
                        }
                    }
                }
            }

            // Navigate to home
            router.replace('/');
        } catch (error) {
            console.error('Auth callback error:', error);
            router.replace('/');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090b' }}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={{ color: '#fafafa', marginTop: 16, fontSize: 16 }}>Signing you in...</Text>
        </View>
    );
}
