import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

export default function Lookup() {
  const navigation = useNavigation();
  const { word } = useLocalSearchParams(); // get the passed word
  const router = useRouter();
  const [showFallback, setShowFallback] = useState<boolean>(false);
  const [error, setError] = useState<string>(''); // Error message state
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Store timeout ID so that it can clear if return to homepage

  const fetchWordDetails = async () => {
    try {
      const response = await fetch(`http://192.168.1.150:5050/data/${word}`);

      const data = await response.json();

      console.log("Response from backend: ", data);

      if ( response.ok && data) {
        console.log("Word ID from backend: ", data.word_id);
        // Word found, navigate to definition page
        router.push({
          pathname: '/definition',
          params: { word: word, word_id: data.word_id },
        });
      } else {
        // Word not found in the database
        setError('Sorry, we do not currently have that word in our dictionary.');
      }
    } catch (err) {
      console.error("Fetch request failed: ", err);
      setError('There was an error fetching the word details. Please try again later.')
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#80CBC4',
        height: 120,
      },
      headerShadowVisible: false,
      headerTintColor: '#004D40',
      headerTitle: () => (
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#004D40',
            fontFamily: 'ComicNeue-Bold',
            marginLeft: 15,
          }}
        >
          ReadEasy
        </Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => console.log('Profile Pressed')}>
            <Ionicons
              name="person-outline"
              size={32}
              color="#004D40"
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log('Settings Pressed')}>
            <Ionicons
              name="settings-outline"
              size={32}
              color="#004D40"
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {

    console.log("useEffect triggered. Word is: ", word);
    // Fetch word from the database
    console.log("Fetching word details for: ", word);
    console.log(`Request URL: http://localhost:5050/data/${word}`);

    if(!word) {
      console.log("BAH: word is apparently undefinted so fetch request is not executed");
      return;
    }

    fetchWordDetails();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout when component unmounts or re-renders
      }
    };
  }, [word, router]);

  return (
    <View style={styles.container}>
        <View style={styles.textContainer}>
            <Text style={styles.text}>Ok, we're looking this word up for you:</Text>
        
      
            <View style={styles.wordContainer}>
                    <Text style={styles.word}>{word}</Text>
            </View>
        
        </View>

        <View style={styles.gifContainer}>
            <Image
                source={require("@/assets/gifs/Mental Health Quarantine GIF by Timothy Winchester.gif")}
                style={styles.gif}
                onError={() => setShowFallback(true)} // Show fallback text if Gif fails
            />
            {showFallback && <Text style={styles.gifFallbackText}>Loading...</Text>}
        </View>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Choose a different word</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2F1',
    padding: 20,
    paddingBottom: 120,
  },

  textContainer: {
    flex: 1,
    paddingTop: 50,

  },

  text: {
    fontSize: 20,
    color: '#004D40',
    fontFamily: "ComicNeue-Regular",
  },

  button: {
    flex: 1 / 2,
    backgroundColor: '#80CBC4',
    paddingLeft: 30,
    paddingRight: 30,
    width: 'auto',
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  buttonText: {
    color: '#004D40',
    fontSize: 24,
    fontFamily: 'ComicNeue-Bold',
  },

  word: {
    fontSize: 32,
    color: '#F5F5F5',
    fontFamily: 'ComicNeue-Bold',
  },

  wordContainer: {
    flex: 1,
    backgroundColor: '#FFB300',
    width: 'auto',
    maxWidth: '90%',
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: 50,
    marginBottom: 20,
    paddingLeft: 75,
    paddingRight: 75,
  },

  gifContainer: {
    flex: 2,
    alignItems: 'center',

  },

  gif: {
    marginTop: 20,
    width: 200,
    height: 200,
    borderRadius: 20,
    borderColor: '#FFB300',
    borderWidth: 5,

  },

  gifFallbackText: {
    position: "absolute",
    color: "#FFF",
    fontSize: 16,
   fontWeight: "bold",
   backgroundColor: "rgba(0, 0, 0, 0.5)", // Slight background for visibility
   padding: 5,
   borderRadius: 5,
  }
});
