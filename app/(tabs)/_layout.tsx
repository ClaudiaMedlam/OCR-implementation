import { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Tabs, useSegments, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from "expo-splash-screen";
import * as Speech from 'expo-speech';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import { loadFonts } from "@/app/fonts"; 
import { triggerTTS } from '@/utils/TTSHelper';
import DefinitionScreen from '@/app/(tabs)/definition';
import MorphemeScreen from '@/app/(tabs)/morpheme';
import { TTSProvider, useTTS } from '@/utils/TTSContext';

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


  return (
   <TTSProvider>
        <TabLayoutContent />
   </TTSProvider>
  );
}

function TabLayoutContent() {
    const { ttsText } = useTTS();
    const { word, word_id } = useLocalSearchParams();  // Get params from initial navigation
    const segments = useSegments(); // to see which part of the navigation tree is active
    const activeTab = segments[segments.length - 1] || ""; // Get the last segment - i.e. current route

    const [isTTSPlaying, setIsTTSPlaying] = useState(false); // for TTS
    const [lastTTSPress, setLastTTSPress] = useState<number | null>(null); // So can register if button pressed more than once
    const [showAlert, setShowAlert] = useState(false); // To show warning if TTS button is pressed quickly - in case device is on mute
    const [ alertMessage, setAlertMessage] = useState(""); // ditto


    const hideTabBar = !['definition', 'morpheme'].includes(activeTab); // So that tab bar can be hidden on required pages

    const handleTTS = () => {
        const now = Date.now();

        if (lastTTSPress && now - lastTTSPress < 3000) { // If button hit twice within 3 secs
            setAlertMessage("Can't hear anything? \u{1F442}\nYour device may be on silent.")
            if(!isTTSPlaying) { // If word has finished playing...
                setIsTTSPlaying(true);  // .. play again
                triggerTTS(activeTab, ttsText);
            } else {
                setIsTTSPlaying(false); // If word is playing, stop
            }
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2500); // Hide alert after 2.5 secs

        } else {
            console.log("TTS Button Pressed");
            setIsTTSPlaying(true);
            triggerTTS(activeTab, ttsText);
        }
        
        setLastTTSPress(now);
    }

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
                        <TouchableOpacity onPress={() => console.log("Profile Pressed")}>
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
                        handleTTS(); // Calls a funciton inside the component
                        
                        
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
                initialParams={{ word, word_id }}
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
                                name={focused ? 'help-circle' : 'help-circle-outline'} 
                                color={color}
                                size={48} 
                            />
                        </View>
                    ), 
                }} 
                initialParams={{ word, word_id }}
            />

        </Tabs>

        {showAlert && (
            <View style={styles.alertContainer}>
                <Text style={styles.alertText}>{alertMessage}</Text>
            </View>
        )}


    </View>
  );

}
const styles = StyleSheet.create({
    alertContainer: {
        position: "absolute",
        bottom: 150, // Adjust as needed
        alignSelf: "center",
        backgroundColor: "red",
        padding: 10,
        zIndex: 1000,
        left: 10,
        borderRadius: 10,
    },

    alertText: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
    },
});
