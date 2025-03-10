import { Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';

import { triggerTTS, stopTTS } from '@/utils/TTSHelper';
import { TTSProvider, useTTS } from '@/utils/TTSContext';


// Define the interface
interface MorphemeData {
  [key: string]: string | undefined; // Allow dynamic key access
  morph_part1: string;
  morph_part2?: string;
  morph_part3?: string;
  morph_part4?: string;
  morph_part5?: string;
  part1_expl?: string;
  part2_expl?: string;
  part3_expl?: string;
  part4_expl?: string;
  part5_expl?: string;
  summary?: string;
}

export default function MorphemeScreen() {
    const { word, word_id } = useLocalSearchParams(); // Get the passed word
    const { setTTStext } = useTTS(); // Use context to store text
    const [breakdown, setBreakdown] = useState<string>("");
    const [morpheme, setMorpheme ] = useState<MorphemeData | null>(null);
    const [isToolTipVisible, setIsToolTipVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function generateBreakdown(data: MorphemeData): string {
      return [data.morph_part1, data.morph_part2, data.morph_part3, data.morph_part4, data.morph_part5]
        .filter(Boolean) // Remove undefined/null values
        .map((part) => (part ?? "").replace(/[-~]/g, "")) // Remove "-" and "~" from each part
        .join("-");
    }

    useEffect(() => {
        console.log(`Fetching morpheme for word_id: ${word_id}`);

        const fetchMorpheme = async () => {
          try {
            const response = await fetch(`http://192.168.1.150:5050/explanation/${word_id}`); // at home
            // const response = await fetch(`https://6be2-158-223-122-234.ngrok-free.app/explanation/${word_id}`); // at uni
            const data = await response.json();
      
            if (response.ok && data) {
              setMorpheme(data); // Store entire object for easy access
              const breakdownString = generateBreakdown(data);
              setBreakdown(breakdownString);

      
              const textSections = [
                  `${word}:`, //Section 1
                  // Section 2 - part by part
                 `${data.morph_part1 ?? ""} ${data.part1_expl ?? ""}.
                  ${data.morph_part2 ?? ""} ${data.part2_expl ?? ""}.
                  ${data.morph_part3 ?? ""} ${data.part3_expl ?? ""}.
                  ${data.morph_part4 ?? ""} ${data.part4_expl ?? ""}.
                  ${data.morph_part5 ?? ""} ${data.part5_expl ?? ""}`,

                  `In summary: ${data.summary ?? ""}` // Section 3
              ].filter(section => section.trim() !== "");
      
              setTTStext(textSections); // Store in context
            } else {
              setError("explanation is not found");
            }
          } catch (err) {
            console.error("Error fetching morphenological explanation: ", err);
            setError("There was an error fetching the morphenological explanation");
          }
        };
        fetchMorpheme();
      }, [word_id]);

      // Stop TTS when navigating away
      useFocusEffect(
        useCallback(() => {
            return () => {
                stopTTS(); // Stop speech when leaving page
            };
        }, [])
      );

    return (
        <View style={styles.container}>

            <View style={styles.container}> 
                <View style={styles.wordContainer}>
                    <Text style={styles.word}>{word}</Text>
                </View>
            </View>

            <View style={styles.container}> 
                <View style={styles.proContainer}>
                    <Text style={styles.pronunciationText}>{breakdown}</Text>
                    <TouchableOpacity onPress={() => setIsToolTipVisible(!isToolTipVisible)}>
                        <Ionicons name='help-circle' color='#F5F5F5' size={40} />
                    </TouchableOpacity>
                </View>
            

                {/* Inline pop-up modal with explanation */}
                {isToolTipVisible && (
                   <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>These are the different parts that make up the word</Text>
                  </View>
                )}
                    
            </View>
            

            <View style={styles.fullDefContainer}>
              {[1, 2, 3, 4, 5].map((num) => {
                const part = morpheme?.[`morph_part${num}`];
                const expl = morpheme?.[`part${num}_expl`]?.replace(/\/\//g, "\n");

                if (!part && !expl) return null; // Don't show box if both are missing

                return (
                  <View key={num} style={styles.defContainer}>
                      <View style={styles.columnLeft}>
                        <Text style={styles.defText}>{part}:</Text>
                      </View>

                      <View style={styles.columnRight}>
                          <Text style={styles.defText}>
                              {expl}
                          </Text>
                      </View>
                                  
                  </View>
                )
              })}

            <View style={styles.defContainer}>
              <Text style={styles.defText}>{morpheme?.summary}</Text>
            </View>
            
            </View>
            
        </View>
    )
  }

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#E0F2F1',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 10,
        paddingTop: 20,
      },
    
      word: {
        fontSize: 32,
        color: '#F5F5F5',
        fontFamily: 'ComicNeue-Bold',
      },
    
      wordContainer: {
        flex: 1,
        backgroundColor: '#FFB300',
        minWidth: '90%',
        height: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        paddingLeft: 75,
        paddingRight: 75,
      },

      pronunciationText: {
        fontSize: 32,
        color: '#F5F5F5',
        fontFamily: 'ComicNeue-Bold',
      },

      proContainer: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#303F9F',
        width: '100%',
        height: 100,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 15,
        paddingLeft: 20,
        paddingRight: 20,
      },

      tooltip: {
        position: "absolute",
        top: "-140%",  // Adjust this to position it below the question mark
        left: "30%",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        borderStyle: 'solid',
        borderWidth: 5,
        borderColor: '#303F9F',
        backgroundColor: '#F5F5F5',
        width: 152,
        height: 142,
        zIndex: 10,
      },

      tooltipText: {
        position: "absolute",
        textAlign: "center",
        fontSize: 18,
        color: "#303F9F",
        fontFamily: 'ComicNeue-Regular',
        top: "35%", // Position text inside the chatbox
        zIndex: 20,
      },

      closeButton: {
        color:'red',
        fontSize: 16,
        marginTop: 10,
      },

      chatboxContainer: { 
        position: "relative", 
        alignItems: "center", 
        justifyContent: "center"
      },

      defText: {
        fontSize: 18,
        color: '#E0F2F1',
        fontFamily: "ComicNeue-Regular",
      },

      columnLeft: {
        flex: 1, // Takes left hand side of the row
        paddingRight: 10, // Adds spacing between the columns
      },

      columnRight: {
        flex: 5, // Takes right hand side of the row

      },

      fullDefContainer: {
        width: '100%',
        flex: 6,
        backgroundColor: '#E0F2F1',
        padding: 10,
      },

      defContainer: {
        width: '100%',
        height: 'auto',
        backgroundColor: '#303F9F',
        borderRadius: 15,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 10,
        minHeight: 100,
        flexDirection: 'row',
      },



})