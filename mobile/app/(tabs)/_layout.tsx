import { Tabs } from 'expo-router';
import { Home, Search, MessageCircle, User } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#09090b',
                    borderTopWidth: 1,
                    borderTopColor: '#27272a',
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#8b5cf6',
                tabBarInactiveTintColor: '#71717a',
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color }) => <Home size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    tabBarIcon: ({ color }) => <Search size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    tabBarIcon: ({ color }) => <MessageCircle size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color }) => <User size={28} color={color} />,
                }}
            />
        </Tabs>
    );
}
