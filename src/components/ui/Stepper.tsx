import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number;
}

export function Stepper({ steps, currentStepIndex }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-6">
      <ol className="flex items-center w-full">
        {steps.map((step, idx) => {
          const isComplete = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <li
              key={step.id}
              className={`flex items-center ${
                idx !== steps.length - 1 ? "w-full" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border ${
                    isComplete
                      ? "bg-primary text-white border-primary"
                      : isCurrent
                      ? "bg-surface text-primary border-primary ring-2 ring-primary/20"
                      : "bg-surface text-text-muted border-border"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCurrent
                      ? "text-primary font-semibold"
                      : isComplete
                      ? "text-text"
                      : "text-text-muted"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {idx !== steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 ${
                    isComplete ? "bg-primary" : "bg-border"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
