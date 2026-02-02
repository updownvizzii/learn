import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-brand-primary selection:text-white transition-colors">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <h2 className="mt-6 text-center text-4xl font-black text-brand-text italic tracking-tighter uppercase underline decoration-brand-primary decoration-8 underline-offset-8 transition-colors">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-8 text-center text-[10px] font-black text-brand-muted uppercase tracking-[0.4em]">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-brand-surface py-12 px-8 shadow-premium dark:shadow-premium-dark sm:rounded-[3rem] sm:px-12 border border-brand-border glimmer transition-all">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
