import * as Speech from 'expo-speech';

export function triggerTTS(activePage: string) { // Default to empty string

    let textToRead = "";
    
    if (activePage === "definition") {
        textToRead = "Fig-urd. It means you thought about something and found an answer or understood it. For example: I figured out how to do the puzzle!";
    } else if (activePage === "morpheme") {
        textToRead = "Figured is made up of figure: to think or calculate. from the Latin figura, meaning shape, form or outline. And -ed: a word ending that shows that the action happened in the past ";
    } else {
        console.log("TTS: no valid page detected")
        return; // If on another page, do nothing
    }

    console.log(`TTS speaking: ${textToRead}`);

    Speech.speak(textToRead, {
        language: "en-UK",
        pitch: 1.0,
        rate: 0.9,
        onDone: () => console.log("TTS FINISHED"),
        onStopped: () => console.log("TTS Stopped"),
    });
};