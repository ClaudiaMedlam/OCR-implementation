import { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Tabs, useSegments } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from "expo-splash-screen";
import * as Speech from 'expo-speech';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import { loadFonts } from "@/app/fonts"; 
import { triggerTTS } from '@/utils/TTSHelper';

SplashScreen.preventAutoHideAsync(); // Prevent splash screen from hiding automatically

const CustomHeaderTitle = () => (
    <Text style={{ 
        fontSize: 24, 
        fontWeight: "bold", 
        color: "#004D40", 
        fontFamily: "ComicNeue-Bold",
        marginLeft: 15, 
         }}>
            ReadEasy
    </Text>
);

const Tab = createBottomTabNavigator();

export default function TabLayout() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const segments = useSegments(); // to see which part of the navigation tree is active
    const activeTab = segments[segments.length - 1] || ""; // Get the last segment - i.e. current route
    const [isTTSPlaying, setIsTTSPlaying] = useState(false); // for TTS

    const hideTabBar = !['definition', 'morpheme'].includes(activeTab); // So that tab bar can be hidden on required pages

    // Load fonts before rendering tabs
    useEffect(() => {
        async function fetchFonts() {
            await loadFonts();
            setFontsLoaded(true);
            await SplashScreen.hideAsync(); // Hide splashscreen once fonts are ready
        }
        fetchFonts();
    }, []);

    if (!fontsLoaded) {
        return <View />; // Keep a blank screen while the splash screen is active
    }


    const stopTTS = () => {
        Speech.stop();
        setIsTTSPlaying(false);
    };

  return (
    <View style={{ flex: 1 }}>
        {/* Tab Bar */}
        <Tabs
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: '#26969A',
                tabBarStyle: hideTabBar 
                    ? { display: 'none' } 
                    : {
                        backgroundColor: '#E0F2F1',
                        height: 120, // to fit in icons
                        paddingBottom: 50, // extra space for better touchability
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                tabBarIconStyle: {height: 75},
                headerTitle: () => null,
                headerStyle: {
                    backgroundColor: '#80CBC4',
                    height: 120,
                },
                headerShadowVisible: false,
                headerTintColor: '#004D40',
                headerLeft: CustomHeaderTitle,
                headerRight: () => (
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={() => console.log("Settings Pressed")}>
                            <Ionicons name="person-outline" size={32} color="004D40" style={{ marginRight: 15}} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => console.log("Settings Pressed")}>
                            <Ionicons name="settings-outline" size={32} color="004D40" style={{ marginRight: 15}} />
                        </TouchableOpacity>
                    </View>
                    
                ),



            })}
        >

            <Tabs.Screen 
                name="tts"
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault(); // Stop navigation
                        console.log("TTS Button Pressed");
                        triggerTTS(activeTab); // Call TTS function instead
                    },
                })}
                options={{ 
                    tabBarLabel: '', // "" Removes text label
                    tabBarAccessibilityLabel: "Hear description out loud",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: 75, 
                            width: 75 
                        }}>
                            <Ionicons 
                                name={focused ? 'megaphone-sharp' : 'megaphone-outline'} 
                                color={color} 
                                size={48}
                            />
                        </View>
                        
                    ), 
                }} 
            />

            <Tabs.Screen 
                name="index" 
                options={{ 
                    tabBarLabel: '', // "" Removes text label
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: 75, 
                            width: 75 
                        }}>
                            <Ionicons 
                                name={ focused ? 'search-sharp' : 'search-outline'} 
                                color={color}
                                size={48} 
                            />
                         </View>
                    ), 
                }} 
            />
            

            {/* Dynamic Tab: Show Either "definition' or 'morpheme' (whichever isn't active*/}
            <Tabs.Screen 
                name="definition"
                options={{ 
                    tabBarLabel: "", // "" Removes text label
                    tabBarAccessibilityLabel: 'What the word means',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: 75, 
                            width: 75 
                        }}>
                            <Ionicons 
                                name={focused ? 'book' : 'book-outline'} 
                                color={color}
                                size={48} 
                            />
                        </View>
                    ), 
                }} 
            />
            
            <Tabs.Screen 
                name="morpheme"
                options={{ 
                    tabBarLabel: "", // "" Removes text label
                    tabBarAccessibilityLabel: 'Why the word means that',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: 75, 
                            width: 75 
                        }}>
                            <Ionicons 
                                name={focused ? 'skull' : 'skull-outline'} 
                                color={color}
                                size={48} 
                            />
                        </View>
                    ), 
                }} 
            />

        </Tabs>

        {/* Floating TTS Control */}
        {isTTSPlaying && (
            <View style={styles.ttsOverlay}>
                <TouchableOpacity onPress={stopTTS} style={styles.ttsButton}>
                    <Ionicons name='pause' size={32} color='white' />
                    <Text style={styles.ttsButtonText}>Stop</Text>
                </TouchableOpacity>
            </View>
        )}

    </View>

  );
}

const styles = StyleSheet.create ({
    ttsOverlay: {
        position: "absolute",
        bottom: 120, 
        right: 20,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 10,
        borderRadius: 10,
    },
    ttsButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    ttsButtonText: {
        color: "white",
        marginLeft: 10,
    }
});
