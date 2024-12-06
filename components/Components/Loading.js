import React from 'react';
import { Loader2 } from "lucide-react";

const Loading = ({ message = "Loading...", className = "" }) => {
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 ${className}`}>
            <div className="bg-white/80 rounded-lg p-6 flex flex-col items-center gap-3 shadow-lg backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
        </div>
    );
};

export default Loading;