import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function MessagesScreen() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchConversations = useCallback(async () => {
        if (!user) return;

        try {
            const { data: participations, error } = await supabase
                .from('conversation_participants')
                .select('conversation_id, last_read_at')
                .eq('user_id', user.id);

            if (error) throw error;

            if (!participations || participations.length === 0) {
                setConversations([]);
                return;
            }

            const conversationsWithDetails = await Promise.all(participations.map(async (item: any) => {
                const { data: conversation } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('id', item.conversation_id)
                    .single();

                if (!conversation) return null;

                const { data: participants } = await supabase
                    .from('conversation_participants')
                    .select(`
            user:profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
                    .eq('conversation_id', conversation.id);

                // Get unread count
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conversation.id)
                    .gt('created_at', item.last_read_at);

                return {
                    id: conversation.id,
                    last_message: conversation.last_message,
                    last_message_at: conversation.last_message_at,
                    is_group: conversation.is_group,
                    participants: participants?.map((p: any) => p.user) || [],
                    unread_count: count || 0
                };
            }));

            const sortedConversations = conversationsWithDetails
                .filter(Boolean)
                .sort((a: any, b: any) =>
                    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                );

            setConversations(sortedConversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchConversations();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('public:conversations')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchConversations)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchConversations]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchConversations();
    }, [fetchConversations]);

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const otherParticipant = item.participants.find((p: any) => p?.id !== user?.id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
                <TouchableOpacity
                    className="flex-row items-center p-4 border-b border-border bg-background active:bg-card/50"
                    onPress={() => router.push(`/chat/${item.id}`)}
                >
                    <View className="relative">
                        <Image
                            source={{ uri: otherParticipant?.avatar_url || 'https://via.placeholder.com/150' }}
                            className="w-12 h-12 rounded-full bg-muted"
                        />
                    </View>

                    <View className="flex-1 ml-4">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="font-semibold text-base text-foreground">
                                {otherParticipant?.username || 'Unknown'}
                            </Text>
                            {item.last_message_at && (
                                <Text className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(item.last_message_at), { addSuffix: false })}
                                </Text>
                            )}
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className={`text-sm truncate w-64 ${item.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`} numberOfLines={1}>
                                {item.last_message || 'Started a conversation'}
                            </Text>
                            {item.unread_count > 0 && (
                                <View className="bg-primary rounded-full w-5 h-5 items-center justify-center ml-2">
                                    <Text className="text-primary-foreground text-xs font-bold">{item.unread_count}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-4 py-3 border-b border-border flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-foreground">Messages</Text>
                <TouchableOpacity className="bg-card border border-border p-2 rounded-full">
                    <Plus size={24} color="#fafafa" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <Text className="text-muted-foreground text-lg">No messages yet</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}
