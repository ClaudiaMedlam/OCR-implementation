// Helper function to handle the speech element

import * as Speech from 'expo-speech';

export function triggerTTS(activePage: string, text: string) { // Default to empty string
    let textToRead = '';

    if (!text) {
        textToRead = "Uh oh, something has gone wrong and I can't read this. Please look up the word again.";
        console.log("TTS: No text available to read aloud");
        return;
    }

    textToRead = text;
    Speech.stop(); // Stop any currently playing speech before speaking again

    Speech.speak(textToRead, {
        language: "en-UK",
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
            Speech.stop();
        },
        onStopped: () => {
            Speech.stop();
        },
    });
}

// Function to stop speech automatically
export function stopTTS() {
    console.log("TTS Stopped");
    Speech.stop();

}