
import React from 'react';

interface CardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon, children }) => {
    return (
        <div className="w-full p-4 sm:p-8 bg-white/95 rounded-2xl shadow-2xl backdrop-blur-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-white text-center p-4 sm:p-5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg mb-6 sm:mb-8 flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl">{icon}</span>
                <span>{title}</span>
            </h1>
            {children}
        </div>
    );
};
