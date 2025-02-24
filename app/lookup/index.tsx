import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Lookup() {
  const { word } = useLocalSearchParams(); // get the passed word
  const router = useRouter();
  const [showFallback, setShowFallback] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Store timeout ID so that it can clear if return to homepage

  useEffect(() => {
    // Simulate a "database lookup" and then naviagte automatically for the time being to definition page
    const timeout = setTimeout(() => {
      router.push({
        pathname: '/definition',
        params: { word },
      });
    }, 2000); // temporary 5-second delay

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout when component unmounts or re-renders
      }
    };
  }, [word]);

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
