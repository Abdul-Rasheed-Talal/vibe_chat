import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, Lock, Chrome } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert('Error', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'vibeapp://auth/callback',
                },
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else if (data?.user?.identities?.length === 0) {
                // User already exists
                Alert.alert('Error', 'An account with this email already exists. Please sign in.');
            } else {
                Alert.alert('Success', 'Check your inbox for email verification!');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    async function signInWithGoogle() {
        try {
            setLoading(true);
            const redirectTo = makeRedirectUri({
                scheme: 'vibeapp',
                path: 'auth/callback',
            });

            console.log('OAuth redirect URI:', redirectTo);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            console.log('Opening auth session with URL:', data.url);
            const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
            console.log('Auth session result:', res.type);

            if (res.type === 'success') {
                const { url } = res;
                console.log('Success URL:', url);
                // Supabase returns tokens in the URL fragment
                const params = new URLSearchParams(url.split('#')[1]);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (error) throw error;
                } else {
                    console.log('No tokens found in URL');
                }
            } else if (res.type === 'cancel') {
                console.log('User cancelled auth');
            } else {
                console.log('Auth dismissed or failed');
            }
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            Alert.alert('Google Sign-In Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-background justify-center px-8">
            <Animated.View entering={FadeInUp.delay(200).duration(1000)} className="items-center mb-12">
                <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4 ring-4 ring-primary/10">
                    <View className="w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary">
                        <Text className="text-4xl">✨</Text>
                    </View>
                </View>
                <Text className="text-4xl font-bold text-foreground tracking-tight">Vibe Check</Text>
                <Text className="text-muted-foreground mt-2 text-lg">Find your tribe.</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(1000)} className="space-y-4">
                <View>
                    <Text className="text-muted-foreground mb-2 ml-1 font-medium">Email</Text>
                    <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3">
                        <Mail size={20} color="#a1a1aa" className="mr-3" />
                        <TextInput
                            className="flex-1 text-foreground text-base"
                            placeholder="hello@example.com"
                            placeholderTextColor="#52525b"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View>
                    <Text className="text-muted-foreground mb-2 ml-1 font-medium">Password</Text>
                    <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3">
                        <Lock size={20} color="#a1a1aa" className="mr-3" />
                        <TextInput
                            className="flex-1 text-foreground text-base"
                            placeholder="••••••••"
                            placeholderTextColor="#52525b"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/20 mt-4"
                    onPress={signInWithEmail}
                    disabled={loading}
                >
                    <Text className="text-primary-foreground font-bold text-lg">
                        {loading ? 'Vibing...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row items-center my-4">
                    <View className="flex-1 h-[1px] bg-border" />
                    <Text className="mx-4 text-muted-foreground">or</Text>
                    <View className="flex-1 h-[1px] bg-border" />
                </View>

                <TouchableOpacity
                    className="bg-card border border-border py-4 rounded-2xl items-center flex-row justify-center space-x-3"
                    onPress={signInWithGoogle}
                    disabled={loading}
                >
                    <Chrome size={20} color="white" className="mr-2" />
                    <Text className="text-foreground font-semibold text-base">Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="py-4 items-center"
                    onPress={signUpWithEmail}
                    disabled={loading}
                >
                    <Text className="text-muted-foreground">
                        Don't have an account? <Text className="text-primary font-bold">Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
