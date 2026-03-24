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
        // Generate random particles
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 5 + Math.random() * 10,
            size: 2 + Math.random() * 4,
        }));
        setParticles(newParticles);

        // Show content after animation starts
        const timer1 = setTimeout(() => setShowContent(true), 300);
        const timer2 = setTimeout(() => setShowButton(true), 1500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const handleGetStarted = () => {
        localStorage.setItem('cashcompass_intro_seen', 'true');
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

            {/* Central Glow Effects */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Outer glow ring */}
                <div
                    className="absolute w-80 h-80 rounded-full animate-pulse"
                    style={{
                        background: `radial-gradient(circle, ${styles.primaryGlow} 0%, transparent 70%)`,
                        animation: 'pulse-glow 3s ease-in-out infinite',
                    }}
                />
                {/* Inner glow ring */}
                <div
                    className="absolute w-48 h-48 rounded-full animate-float"
                    style={{
                        background: `radial-gradient(circle, ${styles.secondaryGlow} 0%, transparent 70%)`,
                    }}
                />
            </div>

            {/* Orbiting Elements */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Orbit 1 */}
                <div className="relative w-80 h-80">
                    <div
                        className="absolute w-4 h-4 rounded-full bg-white/30 animate-orbit"
                        style={{
                            boxShadow: `0 0 20px ${styles.primaryGlow}`,
                        }}
                    />
                </div>
                {/* Orbit 2 */}
                <div className="absolute w-64 h-64">
                    <div
                        className="absolute w-3 h-3 rounded-full bg-white/20 animate-orbit-reverse"
                        style={{
                            boxShadow: `0 0 15px ${styles.secondaryGlow}`,
                        }}
                    />
                </div>
            </div>

            {/* Ripple Effects */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-40 h-40 rounded-full border border-white/10 animate-ripple"
                    style={{ animationDelay: '0s' }}
                />
                <div
                    className="absolute w-40 h-40 rounded-full border border-white/10 animate-ripple"
                    style={{ animationDelay: '0.5s' }}
                />
                <div
                    className="absolute w-40 h-40 rounded-full border border-white/10 animate-ripple"
                    style={{ animationDelay: '1s' }}
                />
            </div>

            {/* Logo and Title */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                {/* Logo Icon */}
                <div
                    className={`relative mb-8 opacity-0 ${showContent ? 'animate-slide-in-up' : ''}`}
                    style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
                >
                    {/* Background glow */}
                    <div
                        className="absolute inset-0 blur-3xl opacity-50"
                        style={{
                            background: `radial-gradient(circle, ${styles.primaryGlow} 0%, transparent 70%)`,
                        }}
                    />
                    {/* Icon container */}
                    <div className="relative w-24 h-24 rounded-3xl glass-card flex items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-14 h-14"
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
                    style={{
                        animation: showContent ? 'slide-in-up 0.8s ease-out forwards' : 'none',
                        animationDelay: '0.5s',
                        animationFillMode: 'forwards',
                    }}
                >
                    CashCompass
                </h1>

                {/* Tagline */}
                <p
                    className="text-lg text-muted-foreground opacity-0"
                    style={{
                        animation: showContent ? 'slide-in-up 0.8s ease-out forwards' : 'none',
                        animationDelay: '0.7s',
                        animationFillMode: 'forwards',
                    }}
                >
                    Navigate Your Finances
                </p>

                {/* Futuristic accent line */}
                <div
                    className="mt-6 w-24 h-1 rounded-full opacity-0"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${styles.primaryGlow}, transparent)`,
                        animation: showContent ? 'slide-in-up 0.8s ease-out forwards' : 'none',
                        animationDelay: '0.9s',
                        animationFillMode: 'forwards',
                    }}
                />

                {/* Get Started Button */}
                <button
                    onClick={handleGetStarted}
                    className={`mt-12 px-10 py-4 rounded-full font-bold text-lg text-black transition-all duration-300 opacity-0 ${showButton ? 'animate-slide-in-up' : ''
                        }`}
                    style={{
                        backgroundColor: 'hsl(var(--primary))',
                        animationDelay: '1.2s',
                        animationFillMode: 'forwards',
                        boxShadow: `0 0 30px ${styles.primaryGlow}`,
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

                {/* Version indicator */}
                <p
                    className="mt-8 text-xs text-muted-foreground/50 opacity-0"
                    style={{
                        animation: showContent ? 'fade-in-scale 0.6s ease-out forwards' : 'none',
                        animationDelay: '1.5s',
                        animationFillMode: 'forwards',
                    }}
                >
                    v1.0 • Powered by AI
                </p>
            </div>
        </div>
    );
}
