import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}

const ErrorFallback = ({ error }) => {
    const navigate = useNavigate();

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
            >
                <div className="bg-[#0D0D0D] rounded-[3rem] border border-red-500/20 p-12 text-center space-y-6">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="flex justify-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                            System Error
                        </h1>
                        <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">
                            Something went wrong
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-black/50 rounded-2xl p-4 border border-red-500/10">
                            <p className="text-red-400 text-sm font-mono">
                                {error.toString()}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 justify-center pt-4">
                        <button
                            onClick={handleRefresh}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-all flex items-center gap-2 hover:scale-105"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-all flex items-center gap-2 hover:scale-105"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ErrorBoundary;
