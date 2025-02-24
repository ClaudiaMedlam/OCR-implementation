import { useState, useEffect } from 'react';
import { Text, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Tabs, useSegments } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from "expo-splash-screen";


import { loadFonts } from "@/app/fonts"; 

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


export default function TabLayout() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const segments = useSegments(); // to see which part of the navigation tree is active
    const activeTab = segments[segments.length - 1]; // Get the last segment - i.e. current route
    const hideTabBar = !['definition', 'morpheme'].includes(activeTab); // So that tab bar can be hidden on other pages

    // Show either definition or morpheme page (whichever is not active)
    const dynamicTab = activeTab === 'definition' ? 'morpheme' : 'definition';

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
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#26969A',
            tabBarStyle: hideTabBar ? { display: 'none' } : {
                backgroundColor: '#E0F2F1',
                // height: 120, // to fit in icons
                // paddingBottom: 20, // etra space for better touchability
            },
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
                
            )

        }}
    >
        <Tabs.Screen 
          name="tts"
          options={{ 
              tabBarLabel: '',
              tabBarAccessibilityLabel: "Hear description out loud",
              tabBarIcon: ({ color, focused }) => (
                  <Ionicons 
                    name={focused ? 'megaphone-sharp' : 'megaphone-outline'} 
                    color={color} 
                    // size={48}
                />
              ), 
          }} 
        />

      <Tabs.Screen 
            name="index" 
            options={{ 
                tabBarLabel: '',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons 
                        name={ focused ? 'search-sharp' : 'search-outline'} 
                        color={color}
                        // size={48} 
                    />
                ), 
            }} 
      />

      <Tabs.Screen 
          name="look up"
          options={{ 
            tabBarLabel: "",
            tabBarAccessibilityLabel: "Looking up the word",
            tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                    name={ focused ? 'search-sharp' : 'search-outline'} 
                    color={color}
                    // size={48}  
                />
            ), 
          }} 
      />
  
      <Tabs.Screen 
          name={dynamicTab}
          options={{ 
              tabBarLabel: "", // Removes text label
              tabBarAccessibilityLabel: dynamicTab === 'definition' ? 'What the word means' : 'Why the word means that',
              tabBarIcon: ({ color, focused }) => (
                  <Ionicons 
                    name={dynamicTab === 'definition' 
                        ? (focused ? 'book' : 'book-outline') 
                        : (focused ? 'skull' : 'skull-outline')} 
                    color={color}
                    // size={48} 
                    />
              ), 
          }} 
      />

    </Tabs>
  );
}
