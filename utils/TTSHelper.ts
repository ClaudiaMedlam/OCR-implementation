// Helper function to handle the speech element

import * as Speech from 'expo-speech';

let isPaused = false;
let isStopped = false;
let currentSection = 0;
let sections: string[] = [];
let updateUI = () => {}; // Placeholder for function to update UI on playback buttons

export function getCurrentSection() {
    return currentSection;
}

export function setUpdateUI(callback: () => void) {
    updateUI = callback; // Assigns function to update UI state
}

export function triggerTTS(activePage: string, textSections: string[], updateUIFn: () => void) { // Default to empty string

    if (!textSections || textSections.length === 0) {
        Speech.speak("Uh oh, something has gone wrong and I can't read this. Please look up the word again.");
        console.log("TTS: No text provided");
        return;
    }

    isPaused = false;
    isStopped = false;
    currentSection = 0;
    sections = textSections;
    updateUI = updateUIFn; // Store update function

    Speech.stop(); // Stop any currently playing speech before speaking again
    playNextSection();

}

// Function to play next secion when Play is pressed
export function playNextSection() {

    if (currentSection >= sections.length) {
        console.log("TTS finished all sections.");
        updateUI(); // Update rewind button
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
            updateUI(); // Pause button changes to play
        },
        onStopped: () => {
            console.log("TTS Stopped");
        },
    });

    currentSection++; // Move onto next section
    updateUI();

};

// Function to resume speech manually
export function resumeTTS() {
    if (isPaused) {
        console.log("Resuming TTS...");
        isPaused = false;

        if (currentSection < sections.length) {
            playNextSection();
        } else {
            currentSection = 0;
            playNextSection();
        }
        updateUI();
    }
}

// Funciton to rewind to the previous section
export function skipBackTTS() {
    if (currentSection > 1) {
        currentSection -= 2; // Go back one section
        console.log("rewinding");
        Speech.stop();
        playNextSection();
    } else {
        console.log("Already at first section.");
        Speech.stop();
        playNextSection();
    }
    updateUI();
}

// Funciton to skip forward to the previous section
export function skipForwardTTS() {
    if (currentSection < sections.length) {
        console.log("Skipping to next section");
        Speech.stop();
        playNextSection();
    } else {
        console.log("Already at last section.");
        Speech.stop();
    }
    updateUI();
}

// Funciton to pause speech manually
export function pauseTTS() {
    if (!isPaused) {
        isPaused = true;
        isStopped = false;
        Speech.stop();
        console.log("TTS paused");
        updateUI();
    } 
}

// Function to stop speech manually
export function stopTTS() {
    console.log("TTS Stoppedn");
    Speech.stop();
    isStopped = true;
    currentSection = 0;
    updateUI();
}