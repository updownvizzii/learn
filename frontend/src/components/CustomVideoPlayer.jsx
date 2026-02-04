import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    RotateCcw,
    RotateCw,
    SkipBack,
    SkipForward,
    Shield,
    Activity,
    Cpu,
    MessageSquare
} from 'lucide-react';

const CustomVideoPlayer = ({ src, title, transcript, onComplete }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showCaptions, setShowCaptions] = useState(true);
    const [currentTime, setCurrentTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');
    const [playbackRate, setPlaybackRate] = useState(1);
    const controlsTimeoutRef = useRef(null);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        setProgress((current / total) * 100);
        setCurrentTime(formatTime(current));

        if (total > 0 && current === total && onComplete) {
            onComplete();
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e) => {
        const newTime = (e.target.value / 100) * videoRef.current.duration;
        videoRef.current.currentTime = newTime;
        setProgress(e.target.value);
    };

    const toggleMute = () => {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const skip = (amount) => {
        videoRef.current.currentTime += amount;
    };

    const changePlaybackRate = () => {
        const rates = [1, 1.25, 1.5, 2];
        const currentIndex = rates.indexOf(playbackRate);
        const nextRate = rates[(currentIndex + 1) % rates.length];
        videoRef.current.playbackRate = nextRate;
        setPlaybackRate(nextRate);
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'KeyM') {
                toggleMute();
            } else if (e.code === 'ArrowRight') {
                skip(10);
            } else if (e.code === 'ArrowLeft') {
                skip(-10);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying, isMuted]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
                setDuration(formatTime(videoRef.current.duration));
            };
        }
    }, [src]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group overflow-hidden rounded-[2rem] border border-brand-border shadow-premium"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* The Video Element */}
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                autoPlay
            />

            {/* Tactical Overlay Grids */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute inset-0 border-[0.5px] border-brand-primary/20 bg-[linear-gradient(rgba(13,148,136,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Top Bar Status */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-primary/20 backdrop-blur-md rounded-xl border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">Secure Intel Stream</h4>
                                <h3 className="text-sm font-black text-white uppercase tracking-tight italic">{title}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-lg border border-white/10">
                                <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Signal: Stable</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-lg border border-white/10">
                                <Cpu className="w-3 h-3 text-brand-primary" />
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Enc: AES-256</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Center Play/Pause Indicator (On Click) */}
            <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${!isPlaying ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="w-24 h-24 bg-brand-primary/10 backdrop-blur-xl border border-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary">
                    <Play className="w-10 h-10 fill-current ml-2" />
                </div>
            </div>

            {/* Captions Overlay - Standard "Bottom-Middle" Alignment (YouTube-Style) */}
            <AnimatePresence>
                {showCaptions && transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-28 left-1/2 -translate-x-1/2 w-fit max-w-[85%] z-20 pointer-events-none"
                    >
                        <div className="px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-center shadow-lg">
                            <p className="text-white text-sm font-bold leading-relaxed tracking-tight">
                                {transcript}
                            </p>
                            <div className="mt-1.5 flex items-center justify-center gap-1.5 opacity-60">
                                <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                                <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">Neural Uplink</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"
                    >
                        {/* Progress Bar Container */}
                        <div className="group/progress relative mb-8 flex items-center gap-4">
                            <span className="text-[10px] font-black text-brand-muted min-w-[40px] text-center">{currentTime}</span>
                            <div className="relative flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-brand-primary shadow-[0_0_15px_var(--color-primary)]"
                                    style={{ width: `${progress}%` }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={handleProgressChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                            <span className="text-[10px] font-black text-brand-muted min-w-[40px] text-center">{duration}</span>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={togglePlay}
                                    className="text-white hover:text-brand-primary transition-all transform hover:scale-110"
                                >
                                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                </button>

                                <div className="flex items-center gap-4">
                                    <button onClick={() => skip(-10)} className="text-zinc-500 hover:text-white transition-colors">
                                        <RotateCcw className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => skip(10)} className="text-zinc-500 hover:text-white transition-colors">
                                        <RotateCw className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 group/volume">
                                    <button onClick={toggleMute} className="text-zinc-500 hover:text-white transition-colors">
                                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                    <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-full accent-brand-primary h-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <button
                                    onClick={changePlaybackRate}
                                    className="px-3 py-1 bg-zinc-800/80 rounded-lg border border-white/10 text-[10px] font-black text-zinc-400 hover:border-brand-primary hover:text-brand-primary transition-all uppercase tracking-widest"
                                >
                                    {playbackRate}x Speed
                                </button>

                                <button
                                    onClick={() => setShowCaptions(!showCaptions)}
                                    className={`p-2 rounded-lg transition-all ${showCaptions && transcript ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'text-zinc-500 hover:text-white'}`}
                                    title="Toggle Neural Captions"
                                    disabled={!transcript}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                </button>

                                <button className="text-zinc-500 hover:text-white transition-colors">
                                    <Settings className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={toggleFullscreen}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                >
                                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Range Input Styles */}
            <style jsx>{`
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: var(--color-primary);
                    box-shadow: 0 0 10px var(--color-primary);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default CustomVideoPlayer;
