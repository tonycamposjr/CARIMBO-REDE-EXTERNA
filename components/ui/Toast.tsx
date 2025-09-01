
import React, { useEffect } from 'react';
import type { ToastType } from '../../types';

interface ToastProps {
    message: string;
    type: ToastType;
    onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [onDismiss]);

    const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white font-semibold transition-opacity duration-300';
    const typeClasses = {
        success: 'bg-gradient-to-r from-green-500 to-emerald-600',
        error: 'bg-gradient-to-r from-red-500 to-rose-600',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            {message}
        </div>
    );
};
