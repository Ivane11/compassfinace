import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface IntroPageProps {
    onComplete: () => void;
}

export default function IntroPage({ onComplete }: IntroPageProps) {
    const { theme } = useTheme();
    const [showContent, setShowContent] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);

    useEffect(() => {
        // Generate fewer particles for faster loading
        const newParticles = Array.from({ length: 5 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 3 + Math.random() * 4,
            size: 2 + Math.random() * 2,
        }));
        setParticles(newParticles);

        // Show content and button immediately
        setShowContent(true);
        setShowButton(true);

        return () => {};
    }, []);

    const handleGetStarted = () => {
        // Don't save to localStorage - show intro every time
        onComplete();
    };

    // Theme-specific colors
    const getThemeStyles = () => {
        switch (theme) {
            case 'nord':
                return {
                    primaryGlow: 'rgba(94, 185, 244, 0.6)',
                    secondaryGlow: 'rgba(166, 219, 220, 0.4)',
                    particleColor: 'rgba(94, 185, 244, 0.5)',
                    gradient1: 'from-sky-500/20',
                    gradient2: 'to-cyan-400/20',
                };
            case 'crepuscule':
                return {
                    primaryGlow: 'rgba(245, 166, 35, 0.6)',
                    secondaryGlow: 'rgba(255, 200, 100, 0.4)',
                    particleColor: 'rgba(245, 166, 35, 0.5)',
                    gradient1: 'from-amber-500/20',
                    gradient2: 'to-orange-400/20',
                };
            default:
                return {
                    primaryGlow: 'rgba(50, 215, 75, 0.6)',
                    secondaryGlow: 'rgba(100, 255, 150, 0.4)',
                    particleColor: 'rgba(50, 215, 75, 0.5)',
                    gradient1: 'from-emerald-500/20',
                    gradient2: 'to-green-400/20',
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient1} ${styles.gradient2} animate-gradient`} />

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full animate-data-stream"
                        style={{
                            left: `${p.left}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: styles.particleColor,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
            </div>

            {/* Central Glow Effect - Simplified */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Single glow ring */}
                <div
                    className="absolute w-64 h-64 rounded-full animate-pulse"
                    style={{
                        background: `radial-gradient(circle, ${styles.primaryGlow} 0%, transparent 70%)`,
                    }}
                />
            </div>

            {/* Logo and Title */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                {/* Logo Icon */}
                <div
                    className={`relative mb-6 opacity-0`}
                    style={
                        showContent 
                        ? { animation: 'slide-in-up 0.5s ease-out 0.1s forwards' }
                        : { opacity: 0 }
                    }
                >
                    {/* Background glow */}
                    <div
                        className="absolute inset-0 blur-3xl opacity-50"
                        style={{
                            background: `radial-gradient(circle, ${styles.primaryGlow} 0%, transparent 70%)`,
                        }}
                    />
                    {/* Icon container */}
                    <div className="relative w-20 h-20 rounded-3xl glass-card flex items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-12 h-12"
                            style={{
                                filter: `drop-shadow(0 0 10px ${styles.primaryGlow})`,
                            }}
                        >
                            <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                            />
                            <path
                                d="M2 17L12 22L22 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                            />
                            <path
                                d="M2 12L12 17L22 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                            />
                        </svg>
                    </div>
                </div>

                {/* App Name */}
                <h1
                    className="text-4xl font-black tracking-tight text-white mb-2 opacity-0"
                    style={
                        showContent 
                        ? { animation: 'slide-in-up 0.5s ease-out 0.2s forwards' }
                        : { opacity: 0 }
                    }
                >
                    CashCompass
                </h1>

                {/* Tagline */}
                <p
                    className="text-lg text-muted-foreground opacity-0"
                    style={
                        showContent 
                        ? { animation: 'slide-in-up 0.5s ease-out 0.3s forwards' }
                        : { opacity: 0 }
                    }
                >
                    Navigate Your Finances
                </p>

                {/* Futuristic accent line */}
                <div
                    className="mt-4 w-20 h-1 rounded-full opacity-0"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${styles.primaryGlow}, transparent)`,
                        ...(showContent ? { animation: 'slide-in-up 0.5s ease-out 0.35s forwards' } : { opacity: 0 })
                    }}
                />

                {/* Get Started Button */}
                <button
                    onClick={handleGetStarted}
                    className={`mt-10 px-10 py-4 rounded-full font-bold text-lg text-black transition-all duration-300 opacity-0`}
                    style={{
                        backgroundColor: 'hsl(var(--primary))',
                        boxShadow: `0 0 30px ${styles.primaryGlow}`,
                        ...(showButton ? { animation: 'slide-in-up 0.5s ease-out 0.4s forwards' } : { opacity: 0 })
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 0 50px ${styles.primaryGlow}`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = `0 0 30px ${styles.primaryGlow}`;
                    }}
                >
                    Commencer
                </button>
            </div>
        </div>
    );
}
