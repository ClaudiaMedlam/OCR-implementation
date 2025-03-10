// Component to store ttsText globally
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TTSContextType {
    ttsText: string;
    setTTStext: (text: string) => void;
}

const TTSContext = createContext<TTSContextType | null>(null);

export const TTSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ttsText, setTTStext] = useState("");

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