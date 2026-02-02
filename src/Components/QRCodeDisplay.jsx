import React from 'react';

export default function QRCodeDisplay({ enrollment }) {
    // Si le QR code est déjà généré, on peut l'afficher
    const qrCodeUrl = enrollment?.qr_code_path 
        ? `/storage/${enrollment.qr_code_path}`
        : null;

    if (!qrCodeUrl) {
        return (
            <div className="bg-gray-200 w-48 h-48 flex items-center justify-center rounded-lg">
                <span className="text-gray-500 text-sm">QR Code en cours de génération...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div className="bg-white p-4 border-2 border-gray-300 rounded-lg">
                <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48"
                />
            </div>
            <p className="mt-2 text-sm text-gray-600 text-center max-w-xs">
                Scannez ce code pour vérifier les informations de votre enrôlement
            </p>
        </div>
    );
}

