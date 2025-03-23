"use client";

import { Stepper, Step } from "@/components/ui/stepper";
import { InstructionStep } from "../../lib/platform-instructions";

interface ExportInstructionsProps {
  steps: InstructionStep[];
}

export function ExportInstructions({ steps }: ExportInstructionsProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-2 sm:space-y-4 border p-4 pb-1 bg-gray-50 rounded-md">
      <h3 className="text-sm font-medium text-gray-700">
        How to Export Your Chat
      </h3>
      <Stepper
        initialStep={-1} // No active step
        steps={steps}
        orientation="vertical"
        expandVerticalSteps={true}
      >
        {steps.map((step, index) => (
          <Step
            key={index}
            label={step.label}
            description={step.description}
          >
            <div className="py-2"></div>
          </Step>
        ))}
      </Stepper>
    </div>
  );
} 