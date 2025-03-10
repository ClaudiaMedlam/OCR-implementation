// Helper function to handle the speech element

import * as Speech from 'expo-speech';

let isPaused = false;
let currentSection = 0;
let sections: string[] = [];

export function triggerTTS(activePage: string, textSections: string[]) { // Default to empty string

    if (!textSections || textSections.length === 0) {
        Speech.speak("Uh oh, something has gone wrong and I can't read this. Please look up the word again.");
        console.log("TTS: No text provided");
        return;
    }

    isPaused = false;
    currentSection = 0;
    sections = textSections;

    Speech.stop(); // Stop any currently playing speech before speaking again

    playNextSection();
}

// Function to play next secion when Play is pressed
export function playNextSection() {

    if (currentSection >= sections.length) {
        console.log("TTS finished all sections.");
        return;
    }

    const textToRead = sections[currentSection];
    console.log(`TTS Speaking Section ${currentSection + 1}: ${textToRead}`);


    Speech.speak(textToRead, {
        language: "en-UK",
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
            console.log("TTS Section Finisihed");
            isPaused = true;
        },
        onStopped: () => {
            console.log("TTS Stopped");
        },
    });

    currentSection++; // Move onto next section

};

// Funciton to resume speech manually
export function resumeTTS() {
    if (!isPaused && currentSection < sections.length) {
        console.log("Resuming TTS...");
        isPaused = false;
        playNextSection();
    } 
}


// Funciton to pause speech manually
export function pauseTTS() {
    if (!isPaused) {
        Speech.stop();
        console.log("TTS paused");
        isPaused = true;
    } 
}

// Function to stop speech manually
export function stopTTS() {
    console.log("TTS Stopped due to navigation or user action");
    Speech.stop();
    currentSection = 0;
}