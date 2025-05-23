import React, {useState} from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import { useTextOverflow } from '@/utils/UseTextOverflow';

export default function ExpandableText({ 
    text,
    collapsedLines = 3,
    textStyle,
    containerStyle,
    expandedStyle
}: { 
    text: string;
    collapsedLines?: number;
    textStyle?: object;
    containerStyle?: object;
    expandedStyle?: object;
}) {
    const [expanded, setExpanded] = useState(false);
    
    const needsToggle = text.length > 85;

    return (
        <>
            <TouchableOpacity
            onPress={() => setExpanded((prev) => !prev)}
            activeOpacity={0.8}
            style={[
                styles.container,
                containerStyle,
                expanded && [styles.expandedContainer, expandedStyle],
            ]}
            >
                <Text
                    style={ textStyle }
                    numberOfLines={expanded ? undefined : collapsedLines}
                >
                    {formatItalics(text)}

                </Text>

                {!expanded && needsToggle && (
                    <Text style={[styles.expandHint, textStyle]}>
                        <Text style={{ fontFamily: "ComicNeue-Italic", fontSize: 16, textAlign: 'right' }}>Find out more...</Text>
                    </Text>
                )}

        </TouchableOpacity>
    </>
    );
}

function formatItalics(text: string) {
  const parts = text.split(/(\*.*?\*)/);

  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <Text key={index} style={{ fontFamily: 'ComicNeue-Italic'}}>
          {part.slice(1, -1)} 
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
}


const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  expandedContainer: {
    backgroundColor: 'red',
  },
 
  expandHint: {
    fontFamily: "ComicNeue-Italic",
    fontSize: 14,

  },
});