// Component to store ttsText globally
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TTSContextType {
    ttsText: string[]; // Array so speech sections can be split up
    setTTStext: (text: string[]) => void;
}

const TTSContext = createContext<TTSContextType | null>(null);

export const TTSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ttsText, setTTStext] = useState<string[]>([]); // Default is an empty array of strings

    return (
        <TTSContext.Provider value={{ ttsText, setTTStext }}>
            {children}
        </TTSContext.Provider>
    );
};

export const useTTS = () => {
    const context = useContext(TTSContext);

    if(!context) {
        throw new Error("useTTS must be used within a TTSProvider");
    }
    return context;
};