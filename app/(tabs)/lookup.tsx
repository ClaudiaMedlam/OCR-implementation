import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Lookup() {
  const { word } = useLocalSearchParams(); // get the passed word
  const router = useRouter();

  console.log("We got to this page!")
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Looking up:</Text>
      <Text style={styles.word}>{word}</Text>
      {/* Placeholder for definition */}
      <Text style={styles.definition}>Definition loading...</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Choose another word</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2F1',
    padding: 20,
  },
  header: {
    fontSize: 18,
    color: '#004D40',
    marginBottom: 10,
  },
  word: {
    fontSize: 32,
    color: '#FFB300',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  definition: {
    fontSize: 16,
    color: '#004D40',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFB300',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#004D40',
    fontSize: 16,
  },
});
