import { View, Text, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, Modal, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Send, Paperclip, Mic, Trash2, Play, Pause, Sparkles } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#27272a', backgroundColor: '#0f0f0f' },
    headerUserContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#27272a' },
    onlineBadge: { position: 'absolute', bottom: 0, right: 10, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#0f0f0f' },
    onlineBadgeOnline: { backgroundColor: '#22c55e' },
    onlineBadgeOffline: { backgroundColor: '#71717a' },
    username: { fontWeight: 'bold', fontSize: 16, color: '#fafafa' },
    statusText: { fontSize: 12, color: '#a1a1aa' },
    typingText: { fontSize: 12, color: '#8b5cf6', fontWeight: '500' },
    messageList: { flex: 1, backgroundColor: '#09090b' },
    typingIndicator: { paddingHorizontal: 16, paddingVertical: 8 },
    typingBubble: { backgroundColor: '#18181b', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#27272a' },
    typingDots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6' },
    inputContainer: { padding: 12, borderTopWidth: 1, borderTopColor: '#27272a', flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#0f0f0f', gap: 8 },
    attachButton: { padding: 10, borderRadius: 20, backgroundColor: '#27272a' },
    textInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 },
    textInput: { flex: 1, fontSize: 16, color: '#fafafa', maxHeight: 100, paddingVertical: 10 },
    sendButton: { backgroundColor: '#8b5cf6', padding: 12, borderRadius: 22, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    micButton: { backgroundColor: '#27272a', padding: 12, borderRadius: 22 },
    micButtonRecording: { backgroundColor: '#ef4444', padding: 12, borderRadius: 22 },
    messageBubbleMine: { marginBottom: 12, maxWidth: '80%', alignSelf: 'flex-end' },
    messageBubbleOther: { marginBottom: 12, maxWidth: '80%', alignSelf: 'flex-start' },
    bubbleMine: { padding: 12, borderRadius: 20, backgroundColor: '#8b5cf6', borderBottomRightRadius: 4 },
    bubbleOther: { padding: 12, borderRadius: 20, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderBottomLeftRadius: 4 },
    messageTextMine: { fontSize: 15, color: '#ffffff', lineHeight: 22 },
    messageTextOther: { fontSize: 15, color: '#fafafa', lineHeight: 22 },
    deletedText: { fontStyle: 'italic', color: '#71717a' },
    timestamp: { fontSize: 10, marginTop: 4, color: '#71717a' },
    timestampMine: { textAlign: 'right' },
    timestampOther: { textAlign: 'left' },
    imageMessage: { width: 200, height: 200, borderRadius: 12 },
    audioContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    audioText: { fontSize: 14 },
    fileContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    fileText: { fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#18181b', width: '85%', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#27272a' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fafafa', marginBottom: 16 },
    deleteButton: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12 },
    deleteText: { color: '#ef4444', fontWeight: '600', marginLeft: 12, fontSize: 15 },
    // Vibe suggestions
    suggestionsContainer: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0f0f0f' },
    suggestionsScroll: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    vibeLabel: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
    vibeLabelText: { fontSize: 11, color: '#8b5cf6', fontWeight: '600', marginLeft: 4 },
    suggestionPill: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#18181b', borderRadius: 20, borderWidth: 1, borderColor: '#27272a' },
    suggestionText: { fontSize: 13, color: '#e4e4e7' },
});

const VIBE_SUGGESTIONS = [
    "No cap 🧢", "Bet! 🔥", "Slay 💅", "Vibe check ✨", "For real? 💀",
    "W 🚀", "L + Ratio 📉", "Main character energy ✨", "Sounds good! 👍",
    "On my way! 🏃", "Lowkey 👀", "Highkey 🔥", "It's giving... 💁", "Periodt 💅",
    "Sheesh 🥶", "Bussin 😋", "Ong fr fr 💯", "Say less 🤝"
];

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState<any>(null);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Get 4 random vibe suggestions
    const vibeSuggestions = useMemo(() => {
        return [...VIBE_SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 4);
    }, []);

    useEffect(() => {
        if (user && id) {
            fetchConversationDetails();
            fetchMessages();

            const channel = supabase
                .channel(`conversation:${id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${id}`
                }, (payload) => {
                    setMessages((prev) => [payload.new, ...prev]);
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${id}`
                }, (payload) => {
                    setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
                })
                .on('broadcast', { event: 'typing' }, (payload) => {
                    if (payload.payload.userId !== user.id) {
                        setOtherUserTyping(true);
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setOtherUserTyping(false), 3000);
                    }
                })
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    const onlineUserIds = Object.values(state).flat().map((p: any) => p.user_id);
                    setIsOnline(onlineUserIds.some((uid: string) => uid !== user.id));
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
                    }
                });

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, id]);

    const handleTyping = async () => {
        if (!isTyping) {
            setIsTyping(true);
            await supabase.channel(`conversation:${id}`).send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: user?.id },
            });
            setTimeout(() => setIsTyping(false), 3000);
        }
    };

    const fetchConversationDetails = async () => {
        const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', id)
            .single();

        if (conversation) {
            const { data: participants } = await supabase
                .from('conversation_participants')
                .select('user:profiles(*)')
                .eq('conversation_id', id);

            const other = participants?.find((p: any) => p.user.id !== user?.id);
            setOtherUser(other?.user);
        }
    };

    const fetchMessages = async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: false });

        setMessages(data || []);
    };

    const sendMessage = async (content: string, attachments?: { type: string; url: string; name: string }[]) => {
        if (!user || !otherUser) return;
        if (!content.trim() && (!attachments || attachments.length === 0)) return;

        try {
            const { error } = await supabase.from('messages').insert({
                conversation_id: id,
                sender_id: user.id,
                receiver_id: otherUser.id,
                content: content || '',
                attachments: attachments || [],
            });

            if (error) throw error;
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);

        if (uri) {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            uploadFile(base64, 'm4a', 'audio', 'voice-message.m4a');
        }
    };

    const playSound = async (uri: string, messageId: string) => {
        if (sound) {
            await sound.unloadAsync();
            setSound(null);
            setIsPlaying(null);
        }

        if (isPlaying === messageId) return;

        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        setIsPlaying(messageId);
        await newSound.playAsync();
        newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(null);
            }
        });
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
        const type = asset.mimeType?.startsWith('image/') ? 'image' : 'file';
        uploadFile(base64, asset.name.split('.').pop() || 'file', type, asset.name);
    };

    const uploadFile = async (base64: string, ext: string, type: 'image' | 'audio' | 'file', name: string) => {
        const fileName = `${id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('chat-attachments').upload(fileName, decode(base64));

        if (error) {
            Alert.alert('Upload failed');
            return;
        }

        const { data } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
        const attachment = { type, url: data.publicUrl, name };
        sendMessage('', [attachment]);
    };

    const deleteMessage = async () => {
        if (!selectedMessage) return;

        const { error } = await supabase
            .from('messages')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', selectedMessage.id);

        if (error) Alert.alert('Error deleting message');
        setSelectedMessage(null);
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.sender_id === user?.id;
        const isDeleted = !!item.deleted_at;
        // Handle attachments as string or array
        let attachments: any[] = [];
        if (item.attachments) {
            if (typeof item.attachments === 'string') {
                try {
                    attachments = JSON.parse(item.attachments);
                } catch { attachments = []; }
            } else if (Array.isArray(item.attachments)) {
                attachments = item.attachments;
            }
        }
        const hasAttachments = attachments.length > 0;

        return (
            <TouchableOpacity
                onLongPress={() => isMe && !isDeleted && setSelectedMessage(item)}
                delayLongPress={500}
                style={isMe ? styles.messageBubbleMine : styles.messageBubbleOther}
            >
                <View style={isMe ? styles.bubbleMine : styles.bubbleOther}>
                    {isDeleted ? (
                        <Text style={styles.deletedText}>Message deleted</Text>
                    ) : (
                        <>
                            {/* Show attachments */}
                            {hasAttachments && attachments.map((att: any, idx: number) => (
                                att.type === 'image' ? (
                                    <Image
                                        key={idx}
                                        source={{ uri: att.url }}
                                        style={styles.imageMessage}
                                        resizeMode="cover"
                                    />
                                ) : att.type === 'audio' ? (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => playSound(att.url, item.id)}
                                        style={styles.audioContainer}
                                    >
                                        {isPlaying === item.id ? (
                                            <Pause size={24} color={isMe ? 'white' : '#8b5cf6'} />
                                        ) : (
                                            <Play size={24} color={isMe ? 'white' : '#8b5cf6'} />
                                        )}
                                        <Text style={[styles.audioText, { color: isMe ? 'white' : '#fafafa' }]}>Voice Message</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View key={idx} style={styles.fileContainer}>
                                        <Paperclip size={20} color={isMe ? 'white' : 'gray'} />
                                        <Text style={[styles.fileText, { color: isMe ? 'white' : '#fafafa' }]}>{att.name}</Text>
                                    </View>
                                )
                            ))}
                            {/* Show text content */}
                            {item.content ? (
                                <Text style={isMe ? styles.messageTextMine : styles.messageTextOther}>
                                    {item.content}
                                </Text>
                            ) : null}
                        </>
                    )}
                </View>
                <Text style={[styles.timestamp, isMe ? styles.timestampMine : styles.timestampOther]}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                        <ArrowLeft size={24} color="#fafafa" />
                    </TouchableOpacity>

                    {otherUser && (
                        <View style={styles.headerUserContainer}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: otherUser.avatar_url || 'https://via.placeholder.com/150' }}
                                    style={styles.avatar}
                                />
                                <View style={[styles.onlineBadge, isOnline ? styles.onlineBadgeOnline : styles.onlineBadgeOffline]} />
                            </View>
                            <View>
                                <Text style={styles.username}>{otherUser.username}</Text>
                                {otherUserTyping ? (
                                    <Text style={styles.typingText}>Typing...</Text>
                                ) : (
                                    <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    inverted
                    contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                    style={styles.messageList}
                    ListHeaderComponent={
                        otherUserTyping ? (
                            <View style={styles.typingIndicator}>
                                <View style={styles.typingBubble}>
                                    <View style={styles.typingDots}>
                                        <View style={[styles.typingDot, { opacity: 0.4 }]} />
                                        <View style={[styles.typingDot, { opacity: 0.7 }]} />
                                        <View style={styles.typingDot} />
                                    </View>
                                </View>
                            </View>
                        ) : null
                    }
                />

                {/* Vibe Suggestions */}
                <View style={styles.suggestionsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
                        <View style={styles.vibeLabel}>
                            <Sparkles size={12} color="#8b5cf6" />
                            <Text style={styles.vibeLabelText}>Vibe</Text>
                        </View>
                        {vibeSuggestions.map((text) => (
                            <TouchableOpacity
                                key={text}
                                style={styles.suggestionPill}
                                onPress={() => setNewMessage(text)}
                            >
                                <Text style={styles.suggestionText}>{text}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={pickDocument} style={styles.attachButton}>
                        <Paperclip size={20} color="#a1a1aa" />
                    </TouchableOpacity>

                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Message..."
                            placeholderTextColor="#52525b"
                            value={newMessage}
                            onChangeText={(text) => {
                                setNewMessage(text);
                                handleTyping();
                            }}
                            multiline
                        />
                    </View>

                    {newMessage.trim() ? (
                        <TouchableOpacity
                            onPress={() => sendMessage(newMessage)}
                            style={styles.sendButton}
                        >
                            <Send size={20} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={isRecording ? stopRecording : startRecording}
                            style={isRecording ? styles.micButtonRecording : styles.micButton}
                        >
                            <Mic size={20} color={isRecording ? 'white' : '#8b5cf6'} />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Delete Modal */}
            <Modal
                visible={!!selectedMessage}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedMessage(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedMessage(null)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Message Options</Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={deleteMessage}
                        >
                            <Trash2 size={20} color="#ef4444" />
                            <Text style={styles.deleteText}>Delete Message</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}
