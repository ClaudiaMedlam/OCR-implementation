import { Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

import { stopTTS } from '@/utils/TTSHelper';
import { useTTS } from '@/utils/TTSContext';



// Define the interface
interface DefinitionData {
  [key: string]: string | undefined; // Allow dynamic key access
  part1_def: string;
  part2_def: string;
  example1: string;
  example2?: string;
  example3?: string;
  example4?: string;
}


export default function DefinitionScreen() {
  const { word, word_id } = useLocalSearchParams(); // Get the passed word
  const { setTTStext } = useTTS(); // Use context to store text
  const [pronunciation, setPronunciation] = useState<JSX.Element[] | null>(null);
  const [definition, setDefinition ] = useState<DefinitionData | null>(null);
  const [isToolTipVisible, setIsToolTipVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function formatPronunciation(pronunciation: string) {
    if (!pronunciation) return null;

    // Remove all spaces from the string
    pronunciation = pronunciation.replace(/\s+/g, '');

    // Splits on "*" to identify bold sections
    const parts = pronunciation.split(/(\*.*?\*)/);


    return parts.map((part, index) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <Text key={index} style={{ fontFamily: 'ComicNeue-Bold'}}>
            {part.slice(1, -1)} {/* Remove surrounding "*" */}
          </Text>
        );
      }
      return <Text key={index}>{part.replace(/\*/g, "")}</Text>; // Removes the * characters
    });
  }

  useEffect(() => {
    console.log(`Fetching definition for word_id: ${word_id}`);
    const fetchDefinition = async () => {
      try {
        const response = await fetch(`http://192.168.1.150:5050/definition/${word_id}`); // at home
        // const response = await fetch(`[enter temporary ngkok link here]/definition/${word_id}`); // at uni
        const data = await response.json();
  
        if (response.ok && data) {
          setPronunciation(formatPronunciation(data.pronunciation));
          setDefinition(data); // Store entire object for easy access

          const text = `${word}`;
          setTTStext(text);

        } else {
          setError("definition is not found");
        }
      } catch (err) {
        console.error("Error fetching definition: ", err);
        setError("There was an error fetching the definition");
      }
    };
    fetchDefinition();
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
                    <Text style={styles.pronunciationText}>{pronunciation}</Text>
                    <TouchableOpacity onPress={() => setIsToolTipVisible(!isToolTipVisible)}>
                        <Ionicons name='help-circle' color='#F5F5F5' size={40} />
                    </TouchableOpacity>
                </View>
            

                {/* Inline pop-up modal with explanation */}
                {isToolTipVisible && (
                   <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>This is what the word sounds like when spoken</Text>
                  </View>
                )}
                    
            </View>
            
            {/* Scrollable Definition section */}
            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.fullDefContainer}>
                  <View style={styles.defContainer}>
                      <Text style={styles.defText}>{definition?.part1_def}</Text>
                  </View>

                  <View style={styles.defContainer}>
                    <Text style={styles.defText}>For example: </Text>
                    <View style={styles.exampleContainer}>
                      {[1, 2, 3, 4].map((num) => {
                          const example = definition?.[`example${num}`];

                          if (!example) return null; // Skip empty examples
                        
                          return (
                            <View key={num} style={styles.exampleRow}>
                                <View style={styles.columnLeft}>
                                  <Text style={styles.defText}>{'\u2022'}</Text>
                                </View>
          
                                <View style={styles.columnRight}>
                                    <Text style={styles.defText}>{example}</Text>
                                </View>
                                            
                            </View>
                          )
                        })}
                    </View>
                      
                  </View>

                  {definition?.part2_def && (
                    <View style={styles.defContainer}>
                      <Text style={styles.defText}>{definition?.part2_def}</Text>
                    </View>
                  )}
                  
              </View>
            </ScrollView>
            
            
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
        color: '#000',
        fontFamily: 'ComicNeue-Regular',
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
        fontFamily: 'ComicNeue-Regular',
      },

      proContainer: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#26969A',
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
        borderColor: '#004D40',
        backgroundColor: '#F5F5F5',
        width: 152,
        height: 142,
        zIndex: 10,
      },

      tooltipText: {
        position: "absolute",
        textAlign: "center",
        fontSize: 18,
        color: "#004D40",
        fontFamily: 'ComicNeue-Regular',
        top: "35%", // Position text inside the chatbox
        zIndex: 20,
      },

      defText: {
        fontSize: 20,
        color: '#E0F2F1',
        fontFamily: "ComicNeue-Regular",
      },

      fullDefContainer: {
        width: '100%',
        backgroundColor: '#E0F2F1',
        paddingLeft: 10,
        paddingRight: 10,
      },

      defContainer: {
        width: '100%',
        height: 'auto',
        backgroundColor: '#26969A',
        borderRadius: 15,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 10,
        minHeight: 100,
      },

      exampleContainer: {
        flexDirection: 'column',
        paddingBottom: 10,
      },

      exampleRow: {
        flexDirection: 'row',
      },

      columnLeft: {
        flex: 1, // Takes 1 part of the row
        paddingRight: 10, // Adds spacing between the columns
      },

      columnRight: {
        flex: 20, // Takes remaining part of the row

      },

      scrollView: {
        flexGrow: 1,
        marginTop: 10,
        maxHeight: '65%',
        minHeight: '65%',
      },

      scrollContent: {
        // paddingBottom: 20,
      },

})