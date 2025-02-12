import * as Font from "expo-font";

export async function loadFonts() {
  await Font.loadAsync({
    "ComicNeue-Bold": require("../assets/fonts/ComicNeue-Bold.ttf"),
    "ComicNeue-Regular": require("../assets/fonts/ComicNeue-Regular.ttf"),
    "ComicNeue-BoldItalic": require("../assets/fonts/ComicNeue-BoldItalic.ttf"),
    "ComicNeue-Italic": require("../assets/fonts/ComicNeue-Italic.ttf"),

  });
}