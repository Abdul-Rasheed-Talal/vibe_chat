import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, UserPlus, MessageCircle } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const searchUsers = async (text: string) => {
        if (!text || text.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`username.ilike.%${text}%,full_name.ilike.%${text}%`)
                .neq('id', user?.id)
                .limit(20);

            if (error) throw error;
            setResults(data || []);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setQuery(text);
        if (text.length >= 2) {
            searchUsers(text);
        } else {
            setResults([]);
        }
    };

    const startChat = async (otherUserId: string) => {
        if (!user) return;

        try {
            // Check if conversation exists
            const { data: myConversations } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', user.id);

            if (myConversations && myConversations.length > 0) {
                const conversationIds = myConversations.map(c => c.conversation_id);

                const { data: commonConversations } = await supabase
                    .from('conversation_participants')
                    .select('conversation_id')
                    .eq('user_id', otherUserId)
                    .in('conversation_id', conversationIds);

                if (commonConversations && commonConversations.length > 0) {
                    router.push(`/chat/${commonConversations[0].conversation_id}`);
                    return;
                }
            }

            // Create new conversation
            const { data: newConversationId, error } = await supabase
                .rpc('create_new_conversation', { other_user_id: otherUserId });

            if (error) throw error;

            router.push(`/chat/${newConversationId}`);
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="p-4 border-b border-border">
                <Text className="text-2xl font-bold mb-4 text-foreground">Search</Text>
                <View className="flex-row items-center bg-card border border-border rounded-xl p-3">
                    <Search size={20} color="#a1a1aa" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-foreground"
                        placeholder="Search users..."
                        placeholderTextColor="#52525b"
                        value={query}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                    />
                    {loading && <ActivityIndicator size="small" color="#8b5cf6" />}
                </View>
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
                        <TouchableOpacity
                            className="flex-row items-center p-4 border-b border-border active:bg-card/50"
                            onPress={() => startChat(item.id)}
                        >
                            <Image
                                source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }}
                                className="w-12 h-12 rounded-full bg-muted"
                            />
                            <View className="flex-1 ml-3">
                                <Text className="font-semibold text-base text-foreground">{item.username}</Text>
                                <Text className="text-muted-foreground text-sm">{item.full_name}</Text>
                            </View>
                            <MessageCircle size={24} color="#8b5cf6" />
                        </TouchableOpacity>
                    </Animated.View>
                )}
                ListEmptyComponent={
                    query.length >= 2 && !loading ? (
                        <View className="p-8 items-center">
                            <Text className="text-muted-foreground">No users found</Text>
                        </View>
                    ) : (
                        <View className="p-8 items-center">
                            <Text className="text-muted-foreground text-center">
                                Search for people by username or name to start chatting
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}
