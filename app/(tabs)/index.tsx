import { Text, View, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, CameraView, CameraType, useCameraPermissions } from 'expo-camera';

import Button from '@/components/Button'; 
import ImageViewer from '@/components/ImageViewer';

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
  const [loading, setLoading] = useState(false); // ADDED FOR OCR

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
          router.push({ pathname: "/lookup", params: { word: extractedWord } });

          console.log("This worked")
        
        } else if (result.responses[0].textAnnotations && result.responses[0].textAnnotations.length > 0) {

        } else {
          setExtractedText("No text detected");
          console.warn("⚠️ Google Vision API did not detect any text.");
        } 
      } else {
        setExtractedText("Error: No valid response from API.");
        console.warn("⚠️ API response structure is invalid.");
      }
    } catch (error) {
      console.error("❌ Error processing image:", error);
      setExtractedText("Error processing image.");
    }

    setLoading(false);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* <SafeAreaView> */}
        <View style={styles.textContainer}> 
          <Text style={styles.text}>Tap the word you want to look up:</Text>
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

        <TouchableOpacity style={styles.focusBox} onPress={handleFocusBoxTap} activeOpacity={1} />
        </View>

        {loading && <ActivityIndicator size="large" color="#fff" />}

                {/* {croppedImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Text style={styles.debugText}>Cropped Image Preview:</Text>
                    <Image source={{ uri: croppedImage }} style={styles.croppedImage} />
                  </View>
                )}

                {extractedText && (
                  <View style={styles.wordContainer}>
                    <Text style={styles.word}>{extractedText}</Text>
                  </View>
                )} */}


    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  imageContainer: {
    flex: 2,
    width: '90%',
    maxWidth: 500,
    height: 440,
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

  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },

  webCamera: {
    flex: 1,
    width: '100%',
    transform: [{ scaleX: -1 }]
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
    fontSize: 20,
    color: '#004D40',
    fontFamily: "ComicNeue-Regular",
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
  
  debugText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004D40",
    marginBottom: 5,
  },

});
