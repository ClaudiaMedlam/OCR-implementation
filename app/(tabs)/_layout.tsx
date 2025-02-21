import { useState, useEffect } from 'react';
import { Text, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Tabs } from 'expo-router';
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
            tabBarStyle: {
                backgroundColor: '#E0F2F1',
                height: 90, // to fit in icons
                paddingBottom: 20, // etra space for better touchability
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
            name="index" 
            options={{ 
                title: 'Home',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={ focused ? 'search-sharp' : 'search-outline'} color={color} size={48} />
                ), 
            }} 
      />

      <Tabs.Screen 
          name="look up"
          options={{ 
            title: 'Look Up',
            tabBarIcon: ({ color, focused }) => (
                <Ionicons name={ focused ? 'search-sharp' : 'search-outline'} color={color} size={48} />
            ), 
          }} 
      />
  
      <Tabs.Screen 
          name="definition"
          options={{ 
              title: 'Definition',
              tabBarIcon: ({ color, focused }) => (
                  <Ionicons name={focused ? 'book' : 'book-outline'} color={color} size={48} />
              ), 
          }} 
      />
      <Tabs.Screen 
          name="morpheme"
          options={{ 
              title: 'Why is that it?',
              tabBarIcon: ({ color, focused }) => (
                  <Ionicons name={focused ? 'information' : 'information-outline'} color={color} size={48} />
              ), 
          }} 
      />

    </Tabs>
  );
}
