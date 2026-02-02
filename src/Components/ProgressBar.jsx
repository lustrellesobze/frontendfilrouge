import React from 'react';

export default function ProgressBar({ currentStep, totalSteps, steps = [] }) {
    const percentage = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progression</span>
                <span className="text-sm font-medium text-gray-700">{currentStep} / {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {steps.length > 0 && (
                <div className="flex justify-between mt-2">
                    {steps.map((step, index) => (
                        <span
                            key={index}
                            className={`text-xs ${
                                index + 1 <= currentStep
                                    ? 'text-indigo-600 font-semibold'
                                    : 'text-gray-500'
                            }`}
                        >
                            {step}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

