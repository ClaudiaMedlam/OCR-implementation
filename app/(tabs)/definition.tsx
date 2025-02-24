import { Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';


export default function DefinitionScreen() {
  const { word } = useLocalSearchParams(); // Get the passed word
    const [isToolTipVisible, setIsToolTipVisible] = useState(false);

    return (
        <View style={styles.container}>

            <View style={styles.container}> 
                <View style={styles.wordContainer}>
                    <Text style={styles.word}>{word}</Text>
                </View>
            </View>

            <View style={styles.container}> 
                <View style={styles.proContainer}>
                    <Text style={styles.pronunciationText}>fig-urd</Text>
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
            

            <View style={styles.fullDefContainer}>
                <View style={styles.defContainer}>
                    <Text style={styles.defText}>"Figured" means you thought about something and found an answer or understood it.</Text>
                </View>

                <View style={styles.defContainer}>
                    <Text style={styles.defText}>For example: </Text>
                    <Text style={styles.defText}>   "I figured out how to do the puzzle!"</Text>
                    <Text style={styles.defText}>   "She figured it was time to go home."</Text>
                </View>

                <View style={styles.defContainer}>
                    <Text style={styles.defText}>It's like when your brain works hard and says, "Aha, I got it!"</Text>
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
        fontFamily: 'ComicNeue-Bold',
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
        fontSize: 18,
        color: '#E0F2F1',
        fontFamily: "ComicNeue-Regular",
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
        backgroundColor: '#26969A',
        borderRadius: 15,
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 10,
        minHeight: 100,
      },



})