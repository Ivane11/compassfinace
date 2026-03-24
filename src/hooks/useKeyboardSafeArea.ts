import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hook to handle iPhone keyboard visibility and scroll form into view
 * Specifically designed for iPhone 13 and iOS keyboard handling
 */
export function useKeyboardSafeArea() {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const activeInputRef = useRef<HTMLInputElement | null>(null);

    // Detect keyboard visibility on iOS
    useEffect(() => {
        const detectKeyboard = () => {
            const visualViewport = window.visualViewport;

            if (visualViewport) {
                const keyboardVisible = visualViewport.height < window.innerHeight;
                const keyboardH = window.innerHeight - visualViewport.height;

                setIsKeyboardVisible(keyboardVisible);
                setKeyboardHeight(keyboardVisible ? keyboardH : 0);

                // If keyboard is visible, scroll the active input into view
                if (keyboardVisible && activeInputRef.current) {
                    scrollInputIntoView(activeInputRef.current);
                }
            } else {
                // Fallback for browsers without visualViewport API
                const onResize = () => {
                    const keyboardVisible = window.innerHeight < window.outerHeight - 100;
                    setIsKeyboardVisible(keyboardVisible);
                    setKeyboardHeight(keyboardVisible ? window.innerHeight * 0.4 : 0);
                };
                window.addEventListener('resize', onResize);
                return () => window.removeEventListener('resize', onResize);
            }
        };

        // Use visualViewport API for better iOS support
        const visualViewport = window.visualViewport;
        if (visualViewport) {
            visualViewport.addEventListener('resize', detectKeyboard);
            visualViewport.addEventListener('scroll', detectKeyboard);

            return () => {
                visualViewport.removeEventListener('resize', detectKeyboard);
                visualViewport.removeEventListener('scroll', detectKeyboard);
            };
        }

        detectKeyboard();
    }, []);

    // Scroll the input element into view above the keyboard
    const scrollInputIntoView = useCallback((input: HTMLInputElement) => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const inputRect = input.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate how much to scroll
        const keyboardTop = window.visualViewport
            ? window.visualViewport.height - keyboardHeight
            : window.innerHeight - keyboardHeight;

        // If input is below keyboard, scroll it into view with padding
        const inputBottom = inputRect.bottom + 20; // 20px padding
        const scrollNeeded = inputBottom - keyboardTop;

        if (scrollNeeded > 0) {
            // Smooth scroll the container
            container.scrollTo({
                top: container.scrollTop + scrollNeeded,
                behavior: 'smooth'
            });
        }

        // Also ensure the input is at the top portion of visible area
        const targetY = inputRect.top - containerRect.top - 50; // 50px from top
        if (targetY < container.scrollTop) {
            container.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
    }, [keyboardHeight]);

    // Set ref for scroll container
    const setScrollContainer = useCallback((element: HTMLDivElement | null) => {
        scrollContainerRef.current = element;
    }, []);

    // Register an input as the active one
    const registerInput = useCallback((input: HTMLInputElement | null) => {
        activeInputRef.current = input;

        // If keyboard is already visible, scroll this new input into view
        if (input && isKeyboardVisible) {
            setTimeout(() => scrollInputIntoView(input), 100);
        }
    }, [isKeyboardVisible, scrollInputIntoView]);

    // Blur all inputs (dismiss keyboard)
    const dismissKeyboard = useCallback(() => {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            (document.activeElement as HTMLElement).blur();
        }
    }, []);

    return {
        isKeyboardVisible,
        keyboardHeight,
        setScrollContainer,
        registerInput,
        dismissKeyboard,
        scrollInputIntoView
    };
}

/**
 * Hook for managing form scroll behavior with keyboard
 * Use this in forms that need to scroll inputs above the keyboard
 */
export function useFormKeyboardScroll(formRef: React.RefObject<HTMLElement>) {
    const { isKeyboardVisible, keyboardHeight } = useKeyboardSafeArea();

    useEffect(() => {
        if (!formRef.current) return;

        if (isKeyboardVisible) {
            // Add padding at bottom when keyboard is visible
            formRef.current.style.paddingBottom = `${keyboardHeight + 20}px`;
        } else {
            formRef.current.style.paddingBottom = '0px';
        }
    }, [isKeyboardVisible, keyboardHeight, formRef]);

    return { isKeyboardVisible, keyboardHeight };
}
