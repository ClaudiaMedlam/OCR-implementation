import { Text, View, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Platform, Image, Dimensions, Animated, Easing } from 'react-native';
import React, { useState, useRef, useEffect, createFactory } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';

import Button from '@/components/Button'; 
import { BACKEND_URL } from "@/constants/config";

// For defining the word type to be sent for OCR
type OCRAnnotation = {
  description: string;
  boundingPoly?: {
    vertices: { y?: number, x?: number }[];
  };
};


export default function Index() {
  const router = useRouter(); // reroutes to next page
  const [permission, requestCameraPermission] = useCameraPermissions(); // To gain user permission to use camera
  const cameraRef = useRef<CameraView | null>(null);

  // Layout and Flow
  const [cameraLayoutHeight, setCameraLayoutHeight] = useState<number | null>(null);
  const [cameraLayoutWidth, setCameraLayoutWidth] = useState<number | null>(null);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [buttonLayout, setButtonLayout] = useState<'single' | 'double'>('single'); // default to one button, bottom middle

  // Image and OCR
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // ADDED FOR OCR STEP 2 CROPPING
  const [loading, setLoading] = useState(false); // ADDED FOR OCR
  const [warningText, setWarningText] = useState<string | null>(null);

  // Layout Dimensions
  const insets = useSafeAreaInsets(); // To use device dimensions as opposed to allow for flexible use (insets.top -> height of safe area at top for notch/status bar)
  const screenHeight = Dimensions.get('window').height; // gives total height of the device screen
  const HEADER_HEIGHT = 120; // This should match the header height defined in (tabs)/_layout (currently 120)
  const cameraAreaHeight = screenHeight - insets.top - HEADER_HEIGHT; // This is the visible camera area below the header
  
  // N.B. Following styles added dynamically (not in stylesheet):
  const cameraContainerStyle = {
    ...styles.imageContainer,
    height: cameraAreaHeight,
  }
  const focusBoxTop = cameraLayoutHeight ? (cameraLayoutHeight / 2 - 30) : 0; // focus box for the word capture is 60px tall so this vertical offset centres the box (or defaults to 0)

  // Effects
  useFocusEffect(
    React.useCallback(() => {
      setLoading(false); // Reset loading state when user returns to page
    }, [])
  );

  // Animation for buttons

  const gleamAnim = useRef(new Animated.Value(-100)).current; // tracks the position of the gleam across the button


  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(gleamAnim, {
          toValue: 100,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.delay(5000), // Wait 5 seconds before next shimmer
        Animated.timing(gleamAnim, {
          toValue: -50,
          duration: 0, // Instantly reset to start
          useNativeDriver: true,
        }),
      ])
    );
  
    loop.start();
  
    return () => loop.stop(); // Clean up on unmount
  }, []);
  
  // Permissions
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

  // Handlers (Event + Image Processing)
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
        console.log(`Original image: ${width}x${height}`);
      },
      (error) => console.error("❌ Failed to get image size:", error)
    );
  };

  // ADDED FOR OCR STEP 2 CROPPING
  const cropImage = async (uri: string) => {
    try {

      const targetWidth = cameraLayoutWidth ?? 351; // Use measured width or fallback to 351 (imageContainer size on iPhone 11)
      const targetHeight = cameraAreaHeight ?? 460; // Use measured height or fallback to 460 (imageContainer size on iPhone 11)

      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{resize: {width: targetWidth, height: targetHeight }}],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG}
      );

      console.log(`Resized image: ${resizedImage.width} x ${resizedImage.height}`);

      const cropHeight = 60; // as per focusbox height
      const cropWidth = 200; // as per focusbox width
      const originX = (targetWidth - cropWidth) / 2;
      const originY = (targetHeight - cropHeight) / 2;

      const manipResult = await ImageManipulator.manipulateAsync(
        resizedImage.uri,
        [{ crop: { 
            originX, // 
            originY, 
            height: cropHeight,
            width: cropWidth } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true}
      );

      const imageMidY = manipResult.height / 2; // For finding the centered word
      const imageMidX = manipResult.width / 2; // For finding the centered word
      setCroppedImage(manipResult.uri);

      if(manipResult.base64) {
        processImage(manipResult.base64, imageMidY, imageMidX);
      }
    } catch (error) {
      console.error("Error cropping image: ", error);
    }
  };

  // ADDED FOR OCR
  const processImage = async (base64: string | undefined, imageMidY: number, imageMidX: number) => {
    if (!base64) return;
    setLoading(true);
    console.log("Sending image to Google Vision API...")

    try {

      const body = {
        imageBase64: base64,
      };

      const response = await fetch(`${BACKEND_URL}/ocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log("✅ Full OCR response from backend:", result); // ADD THIS


      if (result.responses && result.responses[0]) {
        if( result.responses[0].fullTextAnnotation) {
          const annotations = result.responses[0].textAnnotations?.slice(1) || []; // textAnnotations = array returned by Google Vision API ; slice(1) gives the individual words in the box or an empty array
        
          let middleWord = null; // This is the word we're targetting, that is in the centre of the focusBox
          let smallestVertDiff = Infinity; // Keeps track of the closest vertical distance from the image's centre
          let smallestHorDiff = Infinity; // Keeps track of the closest horizontal distance from the image's centre

          annotations.forEach((annotation: OCRAnnotation) => {
            const vertices = annotation.boundingPoly?.vertices; // retrieves the list of 4 corner points of the 'box' around each word

            if(vertices && vertices.length >=4) { // assuming it has 4 vertices...
              const centerY = getVerticalCenter(vertices); // ...calculates the vertical centre of the word...
              const centerX = getHorizontalCenter(vertices); //
              const vertDiff = Math.abs(centerY - imageMidY); //...and measures distance from image vertical midpoint
              const horiDiff = Math.abs(centerX - imageMidX); //...and measures distance from image vertical midpoint

              if(vertDiff < smallestVertDiff) { // update closestWord if this is closer to the centre than any previous ones
                smallestVertDiff = vertDiff;
                if(horiDiff < smallestHorDiff) {
                  smallestHorDiff = horiDiff;
                  middleWord = annotation.description;
                }
              }
              
            }
          });

          if(middleWord) {
            console.log("Closest word to centre of box:", middleWord);
            router.push({pathname:"/lookup", params:{word: middleWord}});
            return;
          }


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

  // OCR Helper function to get vertical centre of bounding box
  const getVerticalCenter = (vertices: {y?: number}[]): number => {
    const topY = vertices[0]?.y ?? 0;
    const bottomY = vertices[2]?.y ?? 0;
    return (topY + bottomY) /2;
  }

  // Helper function to get horiztonal centre of bounding box
  const getHorizontalCenter = (vertices: {x?: number}[]): number => {
    const leftX = vertices[0]?.x ?? 0;
    const rightX = vertices[2]?.x ?? 0;
    return (leftX + rightX) /2;
  }
  
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* <SafeAreaView> */}
        <View style={styles.textContainer}> 
          <Text style={styles.text}>Line up a word in the yellow box and</Text>
          <Text style={styles.textEmphasis}>Tap a button to look it up</Text>
        </View>

        <View 
          style={cameraContainerStyle}
          // When camera container is rendered, this captures its actual height & width (for image resizing dynamically across different screen sizes/types):
          onLayout={(event) => {
            const { height, width } = event.nativeEvent.layout;
            setCameraLayoutHeight(height);
            setCameraLayoutWidth(width);
          }}
        >
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

        <TouchableOpacity 
            style={[
              styles.focusBox, // this contains static styles
              { top: focusBoxTop } // dynamic placement
            ]} 
            onPress={handleFocusBoxTap} 
            activeOpacity={1}>
          {/* Crosshairs */}
          <View style={styles.crosshairVertical} />
          <View style={styles.crosshairHorizontal} />
        </TouchableOpacity>

        </View>

        <View style={{ paddingVertical: 10 }}>
          <TouchableOpacity
            onPress={() =>
              setButtonLayout((prev) => (prev === 'single' ? 'double' : 'single'))
            }
            style={{
              backgroundColor: '#E0F2F1',
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#80CBC4',
              left: -150,
              bottom: -50,

            }}
          >
            <Text style={{ color: '#004D40', fontFamily: 'ComicNeue-Bold' }}>
              {buttonLayout === 'single' ? 'X' : 'X'}
            </Text>
          </TouchableOpacity>
        </View>

        {buttonLayout === 'single' ? (
          <TouchableOpacity 
            style={[
              styles.thumbButtonWrapper, // this contains static styles
              { bottom: '10%' } // centre, bottom of screen
            ]} 
            onPress={handleFocusBoxTap} 
            activeOpacity={1}>
              <View style={styles.thumbButtonInner}>
                <Animated.View style={styles.gleamWrapper}>
                  <Animated.View style={[
                    styles.gleamStripe,
                    {transform: [{ translateX: gleamAnim }, { rotate: '20deg' }] },
                  ]}
                  />
                </Animated.View>
              </View>
          </TouchableOpacity>

        ) : (
          <>
            <TouchableOpacity 
              style={[
                styles.thumbButtonWrapper, // this contains static styles
                { bottom: '25%', left: 0 } // left, 3/4 way down screen
              ]} 
              onPress={handleFocusBoxTap} 
              activeOpacity={0.8}>
              <View style={styles.thumbButtonInner}>
                <Animated.View style={styles.gleamWrapper}>
                  <Animated.View style={[
                    styles.gleamStripe,
                    {transform: [{ translateX: gleamAnim }, { rotate: '20deg' }] },
                  ]}
                  />
                </Animated.View>
              </View>
             </TouchableOpacity>


            <TouchableOpacity 
              style={[
                styles.thumbButtonWrapper, // this contains static styles
                { bottom: '25%', right: 0 } // right, 3/4 way down screen
              ]} 
              onPress={handleFocusBoxTap} 
              activeOpacity={1}>
              <View style={styles.thumbButtonInner}>
                <Animated.View style={styles.gleamWrapper}>
                  <Animated.View style={[
                    styles.gleamStripe,
                    {transform: [{ translateX: gleamAnim }, { rotate: '20deg' }] },
                  ]}
                  />
                </Animated.View>
              </View>
            </TouchableOpacity>
          </>
        )}






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
    // height: 460,
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
    left: '50%',
    transform: [{ translateX: -100 }], // Center the box
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

  thumbButtonWrapper: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFB300',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: '#FFB30040',
    overflow: 'hidden',
    // zIndex: 10,
  },
  
  thumbButtonInner: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#FFD269',
    borderColor: '#FFB300',
    borderWidth: 2,
    position: 'relative',
  },


  gleamWrapper: {
    position: 'absolute',
    top: -30,
    left: 0,
    height: 120,
    width: '100%',
    overflow: 'hidden',
  },

  gleamStripe: {
    position: 'absolute',
    top: 0,
    left: 0, // stay fixed, movement is via translateX
    height: 500,
    width: 20,
    backgroundColor: '#E0F2F14D',
    transform: [{ rotate: '20deg' }],   
  }


});
