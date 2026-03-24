import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'default' | 'nord' | 'crepuscule';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = 'cashcompass_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored === 'nord' || stored === 'crepuscule' || stored === 'default') {
                return stored;
            }
        }
        return 'default';
    });

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }, []);

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;

        // Remove any existing theme
        root.removeAttribute('data-theme');

        // Apply new theme
        if (theme !== 'default') {
            root.setAttribute('data-theme', theme);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
