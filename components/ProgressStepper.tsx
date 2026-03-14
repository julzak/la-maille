"use client";

import { useTranslation } from "@/lib/i18n";

interface ProgressStepperProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { key: "step.photo" as const, number: 1 },
  { key: "step.size" as const, number: 2 },
  { key: "step.pattern" as const, number: 3 },
];

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step.number < currentStep
                  ? "bg-primary text-primary-foreground"
                  : step.number === currentStep
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.number < currentStep ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step.number <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {t(step.key)}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-px ${
                step.number < currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
