// Helper function to handle the speech element

import * as Speech from 'expo-speech';

export function triggerTTS(activePage: string, text: string) { // Default to empty string
    let textToRead = "";

    if (!text) {
        textToRead = "Uh oh, something has gone wrong and I can't read this. Please look up the word again.";
        console.log("TTS: No text provided");
        return;
    }

    else {
        textToRead = text;
    }


    console.log(`TTS speaking: ${textToRead}`);

    // Stop any currently playing speech before speaking again
    Speech.stop();

    setTimeout(() => {
        Speech.speak(textToRead, {
            language: "en-UK",
            pitch: 1.0,
            rate: 0.9,
            onDone: () => console.log("TTS FINISHED"),
            onStopped: () => console.log("TTS Stopped"),
        },);
    }, 100); //Small delay to ensure `stop()` fully processes
};

// Function to stop speech manually
export function stopTTS() {
    console.log("TTS Stopped due to navigation");
    Speech.stop();
}