import { useState, useCallback } from 'react';
import { TextLayoutEventData, NativeSyntheticEvent } from 'react-native';

export function useTextOverflow(collapsedLines: number) {
  const [showToggle, setShowToggle] = useState(false);

  const handleTextLayout = useCallback((e: NativeSyntheticEvent<TextLayoutEventData>) => {
        const lines = e.nativeEvent?.lines || [];
        setShowToggle(lines.length > collapsedLines);
        }, 
        [collapsedLines]
    );

  return { showToggle, handleTextLayout };
}
