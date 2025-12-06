import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Camera, LogOut, Save, Sparkles } from 'lucide-react-native';
import { decode } from 'base64-arraybuffer';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [status, setStatus] = useState('');
    const [vibe, setVibe] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (user) getProfile();
    }, [user]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!user) throw new Error('No user on the session!');

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, full_name, avatar_url, status, vibe`)
                .eq('id', user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username || '');
                setFullName(data.full_name || '');
                setAvatarUrl(data.avatar_url || '');
                setStatus(data.status || '');
                setVibe(data.vibe || '');
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        try {
            setSaving(true);
            if (!user) throw new Error('No user on the session!');

            const updates = {
                id: user.id,
                username,
                full_name: fullName,
                status,
                vibe,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }

            Alert.alert('Success', 'Profile updated!');
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message);
            }
        } finally {
            setSaving(false);
        }
    }

    async function pickImage() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                uploadAvatar(result.assets[0].base64, result.assets[0].uri.split('.').pop() || 'jpg');
            }
        } catch (error) {
            Alert.alert('Error picking image');
        }
    }

    async function uploadAvatar(base64: string, fileExt: string) {
        try {
            setSaving(true);
            if (!user) return;

            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(base64), {
                    contentType: `image/${fileExt}`,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error) {
            Alert.alert('Error uploading avatar');
            console.log(error);
        } finally {
            setSaving(false);
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView className="flex-1 px-6">
                <View className="flex-row justify-between items-center py-4 mb-6 border-b border-border">
                    <Text className="text-2xl font-bold text-foreground">Edit Profile</Text>
                    <TouchableOpacity onPress={signOut} className="flex-row items-center bg-destructive/10 px-3 py-2 rounded-full">
                        <LogOut size={16} color="#ef4444" />
                        <Text className="text-destructive font-medium ml-2 text-sm">Sign Out</Text>
                    </TouchableOpacity>
                </View>

                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <Image
                            source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                            className="w-32 h-32 rounded-full bg-muted border-4 border-card"
                        />
                        <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-4 border-background">
                            <Camera size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="mt-3 text-muted-foreground text-sm">Tap to change avatar</Text>
                </View>

                <Animated.View entering={FadeInDown.duration(600)} className="space-y-4 pb-10">
                    <View>
                        <Text className="text-muted-foreground font-medium mb-2 ml-1">Full Name</Text>
                        <TextInput
                            className="w-full border border-border rounded-xl p-4 text-base bg-card text-foreground"
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Your Name"
                            placeholderTextColor="#52525b"
                        />
                    </View>

                    <View>
                        <Text className="text-muted-foreground font-medium mb-2 ml-1">Username</Text>
                        <TextInput
                            className="w-full border border-border rounded-xl p-4 text-base bg-card text-foreground"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="@username"
                            autoCapitalize="none"
                            placeholderTextColor="#52525b"
                        />
                    </View>

                    <View>
                        <Text className="text-muted-foreground font-medium mb-2 ml-1">Current Vibe</Text>
                        <View className="relative">
                            <TextInput
                                className="w-full border border-border rounded-xl p-4 text-base bg-card text-foreground pl-12"
                                value={vibe}
                                onChangeText={setVibe}
                                placeholder="e.g. Chilling, Working, Gaming"
                                placeholderTextColor="#52525b"
                            />
                            <Sparkles size={20} color="#8b5cf6" className="absolute left-4 top-4" />
                        </View>
                    </View>

                    <View>
                        <Text className="text-muted-foreground font-medium mb-2 ml-1">Bio</Text>
                        <TextInput
                            className="w-full border border-border rounded-xl p-4 text-base bg-card text-foreground min-h-[100px]"
                            value={status}
                            onChangeText={setStatus}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor="#52525b"
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        className={`w-full bg-primary p-4 rounded-xl flex-row justify-center items-center mt-4 shadow-lg shadow-primary/20 ${saving ? 'opacity-70' : ''}`}
                        onPress={updateProfile}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Save size={20} color="white" className="mr-2" />
                                <Text className="text-primary-foreground font-bold text-lg">Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
