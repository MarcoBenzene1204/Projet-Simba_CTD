import { Check, Circle } from "lucide-react";

interface WorkflowStep {
  label: string;
  state: string;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentState: string;
}

export function WorkflowStepper({ steps, currentState }: WorkflowStepperProps) {
  const currentIndex = steps.findIndex((step) => step.state === currentState);

  return (
    <ol className="grid gap-3 sm:grid-cols-4" aria-label="Progression du workflow">
      {steps.map((step, index) => {
        const complete = currentIndex >= 0 && index < currentIndex;
        const current = step.state === currentState;
        return (
          <li key={step.state} className="flex items-start gap-2">
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${complete || current ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"}`}>
              {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Circle className="h-2.5 w-2.5" aria-hidden="true" />}
            </span>
            <span className={current ? "text-sm font-semibold text-foreground" : "text-sm text-muted-foreground"}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}