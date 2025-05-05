import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BACKEND_URL } from "@/constants/config";

export default function Lookup() {
  const { word } = useLocalSearchParams(); // get the passed word
  const router = useRouter();
  const [showFallback, setShowFallback] = useState<boolean>(false);
  const [showError, setShowError] = useState(false); // Error message state
  const timeoutRef = useRef<number | null>(null); // Store timeout ID so that it can clear if return to homepage

  const fetchWordDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/data/${word}`);

      const data = await response.json();

      if ( response.ok && data) {
        // Word found, navigate to definition page
        // But with pause first to allow change of word
        timeoutRef.current = setTimeout(() => {
          router.push({
            pathname: '/definition',
            params: { word: word, word_id: data.word_id },
          });
        }, 2000); // 3 second pause
      } else {
        // Word not found in the database
        setTimeout(() => setShowError(true), 1500); // half-second delay to appear thoughtful!
      }
    } catch (err) {
      console.error("Fetch request failed: ", err);
      setTimeout(() => setShowError(true), 1500);
    }
  };

  useEffect(() => {
    // Fetch word from the database
    if(!word) {
      console.log("BAH: word is apparently undefined so fetch request is not executed");
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
    <View style={{ flex: 1, backgroundColor: '#E0F2F1' }}>
      {/* Custom header at top */}
      <View style={styles.lookupHeader}>
        <Text style={styles.lookupHeaderText}>ReadEasy</Text>
      </View>

      {/* Main content area */}
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

          {showError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Hmm… That word isn’t in our library. It might be a name or a made-up word. 
                If you think we should add it, tap the 'Submit word’ button below. 
              </Text>

              <TouchableOpacity
                style={styles.suggestButton}
                onPress={() =>
                  Alert.alert(
                    "Coming soon!",
                    "When clicked, this will send the word to our suggestion email account."
                  )
                }
              >
                <Text style={styles.suggestButtonText}>Submit word</Text>
              </TouchableOpacity>
            </View>
          )}

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Choose a different word</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 60,
  },

  lookupHeader: {
    height: 120,
    backgroundColor: '#80CBC4',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingLeft: 15,
    width: '100%',
  },
  
  lookupHeaderText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'ComicNeue-Bold',
    color: '#004D40',
  },

  textContainer: {
    marginTop: 10,
  },

  text: {
    fontSize: 20,
    color: '#004D40',
    fontFamily: "ComicNeue-Regular",
  },

  button: {
    backgroundColor: '#80CBC4',
    paddingLeft: 30,
    paddingRight: 30,
    width: 'auto',
    height: 100,
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
    color: '#000',
    fontFamily: 'ComicNeue-Regular',
  },

  wordContainer: {
    backgroundColor: '#FFB300',
    width: 'auto',
    maxWidth: '90%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: 20,
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
  },

  errorContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  
  errorText: {
    fontSize: 18,
    color: '#B00020',
    textAlign: 'center',
    fontFamily: 'ComicNeue-Bold',
    marginBottom: 10,
  },
  
  suggestButton: {
    backgroundColor: '#FFB300',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  
  suggestButtonText: {
    color: '#004D40',
    fontSize: 20,
    fontFamily: 'ComicNeue-Bold',
  },

});
