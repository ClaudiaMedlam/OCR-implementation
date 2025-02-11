import { Text, View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Link } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';

import Button from '@/components/Button'; 
import ImageViewer from '@/components/ImageViewer';

const PlaceholderImage = require("@/assets/images/Slime-snapshot.jpeg");

const GOOGLE_VISION_API_KEY = "AIzaSyC78EQJEDEwiCWaV_cwYU9vjOTvvlSFWX0"; // ADDED FOR OCR

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // ADDED FOR OCR STEP 2 CROPPING

  const [extractedText, setExtractedText] = useState<string | null>(null); // ADDED FOR OCR
  const [loading, setLoading] = useState(false); // ADDED FOR OCR



  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // ADDED FOR OCR
      allowsEditing: true, 
      quality: 1,
      // base64: true, // ADDED FOR OCR
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      
      await cropImage(result.assets[0].uri); // ADDED FOR OCR STEP 2 CROPPING
      // ADDED FOR OCR
      // if (result.assets[0].base64) {
      //   processImage(result.assets[0].base64);
      // } else {
      //   console.error("Image conversion to base64 failed");
      // }
    } else {
      alert('You did not select any image.');
    }
  };

  // ADDED FOR OCR STEP 2 CROPPING
  const cropImage = async (uri: string) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX: 50, originY: 50, width: 300, height: 200 } }], // Adjust as nec
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
      console.log("API Response: ", JSON.stringify(result, null, 2));

      if(result.responses && result.responses[0]) {
        if( result.responses[0].fullTextAnnotation) {
          setExtractedText(result.responses[0].fullTextAnnotation.text);
          console.log("✅ Extracted Text:", result.responses[0].fullTextAnnotation.text);
          console.log("This worked")
        
        } else if (result.responses[0].textAnnotations && result.responses[0].textAnnotations.length > 0) {
          setExtractedText(result.responses[0].textAnnotations[0].description);
          console.log("✅ Extracted Text (Alternative):", result.responses[0].textAnnotations[0].description);
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
    <View style={styles.container}>
      <View style={styles.imageContainer}>
      <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      </View>

      <View style={styles.footerContainer}>
        <Button theme="primary" label="Choose a photo" onPress={pickImageAsync}/>
        <Button label="Use this photo" />
      </View>

      {loading && <ActivityIndicator size="large" color="#fff" />}

      {extractedText && (
        <ScrollView style={styles.textContainer}>
          <Text style={styles.text}>{extractedText}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 28,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },

  text: {
    fontSize: 16,
    color: '#000',
  },
});
