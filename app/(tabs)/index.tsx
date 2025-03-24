import { Text, View, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';

import Button from '@/components/Button'; 
import ImageViewer from '@/components/ImageViewer';
import { funWords, properNouns } from "@/constants/wordLists";

const PlaceholderImage = require("@/assets/images/Slime-snapshot.jpeg");

const GOOGLE_VISION_API_KEY = "AIzaSyC78EQJEDEwiCWaV_cwYU9vjOTvvlSFWX0"; // ADDED FOR OCR

export default function Index() {
  const router = useRouter(); // reroutes to next page
  const [permission, requestCameraPermission] = useCameraPermissions(); // To gain user permission to use camera
  const cameraRef = useRef<CameraView | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // ADDED FOR OCR STEP 2 CROPPING
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  const [extractedText, setExtractedText] = useState<string | null>(null); // ADDED FOR OCR
  const [warningText, setWarningText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // ADDED FOR OCR

  useFocusEffect(
    React.useCallback(() => {
      setLoading(false); // Reset loading state when user returns to page
    }, [])
  );

  if( !permission) {
    //Camera permissions are still loading
    return <View />
  }

  if ( !permission.granted) {
    //Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <Button theme={'primary'} onPress={requestCameraPermission} label="Allow camera use" />
      </View>
    )
  }

  // Handle tap in box to select word image (in "freeze frame")
  const handleFocusBoxTap = async () => {
    if (!cameraRef.current) {
      console.error("Camera reference is not available.");
      return;
    }

    try {
      //Capture a photo
      const photo = await cameraRef.current.takePictureAsync();

      // Ensure the photo exists before processing
      if (!photo || !photo.uri) {
        console.error("Failed to capture image of word.");
        return;
      }

      logImageSize(photo.uri);

      await cropImage(photo.uri);

      setShowAppOptions(true);
      

    } catch (error) {
      console.error("Error capturing image:", error);
    }

  };

  const logImageSize = (uri: string) => {
    Image.getSize(
      uri,
      (width, height) => {
       console.log(`Image Dimernsions: Width = ${width}, Height = ${height}`);
      }
    );
  };

  // ADDED FOR OCR STEP 2 CROPPING
  const cropImage = async (uri: string) => {
    try {
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{resize: {width: 500 }}],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG}
      );

      console.log(`Resized image: ${resizedImage.width} x ${resizedImage.height}`);

      const manipResult = await ImageManipulator.manipulateAsync(
        resizedImage.uri,
        [{ crop: { height: 60, originX: 150, originY: 343, width: 200 } }], // Adjust as nec
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true}
      );

      setCroppedImage(manipResult.uri);

      if(manipResult.base64) {
        processImage(manipResult.base64);
      }
    } catch (error) {
      console.error("Error cropping image: ", error);
    }
  };

  // ADDED FOR OCR
  const processImage = async (base64: string | undefined) => {
    if (!base64) return;
    setLoading(true);
    console.log("Sending image to Google Vision API...")

    try {
      const body = {
        requests: [
          {
            image: {content: base64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();


      if(result.responses && result.responses[0]) {
        if( result.responses[0].fullTextAnnotation) {
          const extractedWord = result.responses[0].fullTextAnnotation.text.trim();

          // Following process to ensure only one word chosen:
          // Split text into words
          let words = extractedWord
          .split(/\s+/) // Split by space or new line
          .filter((word: string) => /^[a-zA-Z]+$/.test(word));

          // Error if numbers
          if (words.length === 0) {
            setWarningText("I can't read numbers! \u{1F916}\nTry scanning a word instead.")
            console.warn("⚠️ Only numbers detected.")
            setLoading(false);
            return;
          }

          // Find the midpoint character
          const midpoint = Math.floor(extractedWord.length/2);

          // Find the word that covers the midpoint character
          let charCount = 0;
          let selectedWord = words[0];

          for (let word of words) {
            charCount += word.length + 1; // +1 accounts for spaces
            if (charCount >= midpoint) {
              selectedWord = word;
              break;
            }
          }

          console.log('Selected word = ', selectedWord);

          router.push({ pathname: "/lookup", params: { word: selectedWord } });
          return;
        
        } 
        // Handle case where fullTextAnnotation is missing but textAnnotation exists - e.g. partial or missing or nonsense words
        else if (result.responses[0].textAnnotations && result.responses[0].textAnnotations.length > 1) {

            // Pick the first detected word
            const fallbackWord = result.responses[0].textAnnotations[1].description;
            console.warn("⚠️ OCR detected but full text missing. Possible word:", fallbackWord);

            // Validate the word before using it
            const isValidWord = /^[a-zA-Z]+$/.test(fallbackWord) && fallbackWord.length > 2;

            if (isValidWord) {
              router.push({ pathname: "/lookup", params: { word: fallbackWord } });
              return;
            } else {
              setWarningText("Hmm, I couldn't recognize that word. \u{1F914} \nPlease try again.");
              console.warn("⚠️ Detected word is invalid:", fallbackWord);
            }
        } else {
          setWarningText("Oh no! No word detected! \u{1F575} \nPlease try again.");
          console.warn("⚠️ Google Vision API did not detect any text.");
        } 
      } else {
        setWarningText("Hmmm, there was a problem reading your word. \u{1F633} \nPlease try again.");
        console.warn("⚠️ API response structure is invalid.");

      }
    } catch (error) {
      console.error("❌ Error processing image:", error);

      // Reset state so child can try again
      setCroppedImage(null);
      setWarningText("Oops something went wrong \u{1FAE3} \nLet's try again...");
    }

    setLoading(false);
  };

  const clearWarning = () => {
    setWarningText(null);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* <SafeAreaView> */}
        <View style={styles.textContainer}> 
          <Text style={styles.text}>Move the yellow box over a word and</Text>
          <Text style={styles.textEmphasis}>Tap the screen to look it up</Text>
        </View>

        <View style={styles.imageContainer}>
        {Platform.OS === 'web' ? (
                // Mirrors the camera if front facing on a computer
                <CameraView 
                  ref={cameraRef}
                  style={styles.webCamera} 
                  facing='front'
                />
              ) : (
                // Restricts device view to back campera
                <CameraView 
                ref={cameraRef}
                style={styles.camera} 
                facing='back'
                />
              )
          }

          {warningText && (
            <TouchableOpacity style={styles.warningContainer} onPress={clearWarning}>
              <Text style={styles.warningText}>{warningText}</Text>
            </TouchableOpacity>
          )}

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#004D40" /> 
            </View>
          )}

        <TouchableOpacity style={styles.focusBox} onPress={handleFocusBoxTap} activeOpacity={1}>
          {/* Crosshairs */}
          <View style={styles.crosshairVertical} />
          <View style={styles.crosshairHorizontal} />
        </TouchableOpacity>

        </View>

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 120,
  },

  imageContainer: {
    flex: 2,
    width: '90%',
    maxWidth: 500,
    // height: 440,
    backgroundColor: '#80CBC4',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFB300',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, 
    padding: 'auto',
    overflow: 'hidden',
  },

  // Yellow Focus Box that adjusts based on tap
  focusBox: {
    position: 'absolute',
    width: 200, // Approximate word width
    height: 60, // Approximate word height
    borderWidth: 2,
    borderColor: '#FFB300',
    backgroundColor: '#FFB30040',
    borderRadius: 5,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -30 }], // Center the box
  },

  crosshairVertical: {
    position: 'absolute',
    width: 2,
    height: '50%',
    backgroundColor: '#FFB300',
    top: '25%',
    left: '50%',
    transform: [{ translateX: -1 }],
    opacity: 0.5,
  },
  
  crosshairHorizontal: {
    position: 'absolute',
    height: 2,
    width: '15%',
    backgroundColor: '#FFB300',
    top: '50%',
    left: '42.5%',
    transform: [{ translateY: -1 }],
    opacity: 0.5,
  },

  camera: {
    flex: 1,
    width: '100%',
    height: '100%',

  },

  webCamera: {
    flex: 1,
    width: '100%',
    transform: [{ scaleX: -1 }],
    borderRadius: 15,
  },

  footerContainer: {
    flex: 1 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    paddingTop: 50,
    paddingBottom:20,
  },

  text: {
    fontSize: 22,
    color: '#004D40',
    fontFamily: "ComicNeue-Regular",
    textAlign: 'center',
    marginBottom: 10,
  },

  textEmphasis: {
    fontSize: 24,
    color: '#004D40',
    fontFamily: "ComicNeue-Bold",
    textAlign: 'center',
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
    paddingLeft: 75,
    paddingRight: 75,
    zIndex: 10,
  },

  imagePreviewContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFB300",
  },
  
  croppedImage: {
    width: 100,  // Matches cropped area
    height: 100,  // Matches cropped area
    resizeMode: "contain",
  },
  
  warningContainer: {
    position: "absolute",
    top: "20%",
    width: "80%",
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#00000080',
    borderRadius: 20,
  },

  warningText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#FFB300",
    textAlign: 'center',
  },

  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25}, {translateY: -25}], // Adjust so centred
    zIndex: 10,
    padding: 10,
  },

});
