import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { MessageCircle, User } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const COLUMN_count = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_count; // 48 = padding (16*2) + gap (16)

export default function HomeScreen() {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchUsers = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .neq('id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUsers();
    }, [fetchUsers]);

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

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            className="bg-card rounded-2xl border border-border overflow-hidden mb-4 shadow-sm shadow-black/50"
            style={{ width: ITEM_WIDTH }}
        >
            <View className="items-center p-4">
                <View className="relative">
                    <Image
                        source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }}
                        className="w-20 h-20 rounded-full bg-muted mb-3 border-2 border-primary/20"
                    />
                    {item.vibe && (
                        <View className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
                            <Text className="text-lg">✨</Text>
                        </View>
                    )}
                </View>

                <Text className="font-bold text-base text-center mb-1 text-foreground" numberOfLines={1}>
                    {item.full_name || item.username}
                </Text>
                <Text className="text-xs text-muted-foreground mb-2 text-center" numberOfLines={1}>
                    @{item.username}
                </Text>

                {item.vibe ? (
                    <View className="bg-primary/10 px-3 py-1 rounded-full mb-3 border border-primary/20">
                        <Text className="text-xs text-primary font-bold" numberOfLines={1}>
                            {item.vibe}
                        </Text>
                    </View>
                ) : (
                    <View className="bg-muted px-3 py-1 rounded-full mb-3">
                        <Text className="text-xs text-muted-foreground font-medium">No vibe set</Text>
                    </View>
                )}

                <Text className="text-xs text-muted-foreground text-center italic mb-4 h-8" numberOfLines={2}>
                    {item.status || "No bio"}
                </Text>

                <TouchableOpacity
                    className="w-full bg-primary py-2 rounded-xl flex-row justify-center items-center shadow-lg shadow-primary/20"
                    onPress={() => startChat(item.id)}
                >
                    <MessageCircle size={14} color="white" className="mr-1" />
                    <Text className="text-primary-foreground text-xs font-bold">Chat</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-6 pt-4 pb-2">
                <Text className="text-3xl font-bold tracking-tight text-foreground">Discover Vibes</Text>
                <Text className="text-muted-foreground text-sm">Connect with people who share your vibe.</Text>
            </View>

            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
                contentContainerStyle={{ paddingVertical: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <Text className="text-muted-foreground">No users found</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}
