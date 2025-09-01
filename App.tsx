
import React, { useState, useEffect, useCallback } from 'react';
import { StampFormComponent } from './components/StampForm';
import { ImageConverterComponent } from './components/ImageConverter';
import { Toast } from './components/ui/Toast';
import type { ToastState } from './types';

const App: React.FC = () => {
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type, id: Date.now() });
    }, []);

    return (
        <div className="min-h-screen w-full font-sans text-gray-800 p-2 sm:p-5">
            <main className="max-w-4xl mx-auto space-y-8">
                <StampFormComponent showToast={showToast} />
                <ImageConverterComponent showToast={showToast} />
            </main>
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default App;
