"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { CheckIcon, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// <---------- CONTEXT ---------->

interface StepperContextValue extends StepperProps {
  clickable?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isVertical?: boolean;
  stepCount?: number;
  expandVerticalSteps?: boolean;
  activeStep: number;
  initialStep: number;
}

const StepperContext = React.createContext<
  StepperContextValue & {
    nextStep: () => void;
    prevStep: () => void;
    resetSteps: () => void;
    setStep: (step: number) => void;
  }
>({
  steps: [],
  activeStep: 0,
  initialStep: 0,
  nextStep: () => {},
  prevStep: () => {},
  resetSteps: () => {},
  setStep: () => {},
});

interface StepperContextProviderProps {
  value: Omit<StepperContextValue, "activeStep">;
  children: React.ReactNode;
}

function StepperProvider({ value, children }: StepperContextProviderProps) {
  const isError = value.state === "error";
  const isLoading = value.state === "loading";

  const [activeStep, setActiveStep] = React.useState(value.initialStep);

  const nextStep = () => {
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const resetSteps = () => {
    setActiveStep(value.initialStep);
  };

  const setStep = (step: number) => {
    setActiveStep(step);
  };

  return (
    <StepperContext.Provider
      value={{
        ...value,
        isError,
        isLoading,
        activeStep,
        nextStep,
        prevStep,
        resetSteps,
        setStep,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
}

// <---------- HOOKS ---------->

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function useStepper() {
  const context = React.useContext(StepperContext);

  if (context === undefined)
    throw new Error("useStepper must be used within a StepperProvider");

  // Destructure but don't use these values to avoid linter errors
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, className, ...rest } = context;

  const isLastStep = context.activeStep === context.steps.length - 1;
  const hasCompletedAllSteps = context.activeStep === context.steps.length;

  const previousActiveStep = usePrevious(context.activeStep);

  const currentStep = context.steps[context.activeStep];
  const isOptionalStep = !!currentStep?.optional;

  const isDisabledStep = context.activeStep === 0;

  return {
    ...rest,
    isLastStep,
    hasCompletedAllSteps,
    isOptionalStep,
    isDisabledStep,
    currentStep,
    previousActiveStep,
  };
}

function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}

// <---------- STEPS ---------->

interface StepItem {
  id?: string;
  label?: string;
  description?: string;
  icon?: IconType;
  optional?: boolean;
}

interface StepOptions {
  orientation?: "vertical" | "horizontal";
  state?: "loading" | "error";
  responsive?: boolean;
  checkIcon?: IconType;
  errorIcon?: IconType;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
  mobileBreakpoint?: string;
  variant?: "circle" | "circle-alt" | "line";
  expandVerticalSteps?: boolean;
  size?: "sm" | "md" | "lg";
  styles?: {
    /** Styles for the main container */
    "main-container"?: string;
    /** Styles for the horizontal step */
    "horizontal-step"?: string;
    /** Styles for the horizontal step container (button and labels) */
    "horizontal-step-container"?: string;
    /** Styles for the vertical step */
    "vertical-step"?: string;
    /** Styles for the vertical step container (button and labels) */
    "vertical-step-container"?: string;
    /** Styles for the vertical step content */
    "vertical-step-content"?: string;
    /** Styles for the step button container */
    "step-button-container"?: string;
    /** Styles for the label and description container */
    "step-label-container"?: string;
    /** Styles for the step label */
    "step-label"?: string;
    /** Styles for the step description */
    "step-description"?: string;
  };
  variables?: {
    "--step-icon-size"?: string;
    "--step-gap"?: string;
  };
  scrollTracking?: boolean;
}
interface StepperProps extends StepOptions {
  children?: React.ReactNode;
  className?: string;
  initialStep: number;
  steps: StepItem[];
}

const VARIABLE_SIZES = {
  sm: "36px",
  md: "40px",
  lg: "44px",
};

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (props, ref: React.Ref<HTMLDivElement>) => {
    const {
      className,
      children,
      orientation: orientationProp = "horizontal",
      state,
      responsive = true,
      checkIcon,
      errorIcon,
      onClickStep,
      mobileBreakpoint,
      expandVerticalSteps = false,
      initialStep = 0,
      size = "md",
      steps,
      variant,
      styles,
      variables,
      scrollTracking = false,
      ...rest
    } = props;

    const childArr = React.Children.toArray(children);

    const items = [] as React.ReactElement[];

    const footer = childArr.map((child) => {
      if (!React.isValidElement(child))
        throw new Error("Stepper children must be valid React elements.");

      if (child.type === Step) {
        items.push(child);
        return null;
      }

      return child;
    });

    const stepCount = items.length;

    const isMobile = useMediaQuery(
      `(max-width: ${mobileBreakpoint || "768px"})`
    );

    const clickable = !!onClickStep;

    const orientation = isMobile && responsive ? "vertical" : orientationProp;

    const isVertical = orientation === "vertical";

    return (
      <StepperProvider
        value={{
          initialStep,
          orientation,
          state,
          size,
          responsive,
          checkIcon,
          errorIcon,
          onClickStep,
          clickable,
          stepCount,
          isVertical,
          variant: variant || "circle",
          expandVerticalSteps,
          steps,
          scrollTracking,
          styles,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "stepper__main-container",
            "flex w-full flex-wrap",
            stepCount === 1 ? "justify-end" : "justify-between",
            orientation === "vertical" ? "flex-col" : "flex-row",
            variant === "line" && orientation === "horizontal" && "gap-4",
            className,
            styles?.["main-container"]
          )}
          style={
            {
              "--step-icon-size":
                variables?.["--step-icon-size"] ||
                `${VARIABLE_SIZES[size || "md"]}`,
              "--step-gap": variables?.["--step-gap"] || "8px",
            } as React.CSSProperties
          }
          {...rest}
        >
          <VerticalContent>{items}</VerticalContent>
        </div>
        {orientation === "horizontal" && (
          <HorizontalContent>{items}</HorizontalContent>
        )}
        {footer}
      </StepperProvider>
    );
  }
);
Stepper.displayName = "Stepper";

function VerticalContent({ children }: { children: React.ReactNode }) {
  const { activeStep } = useStepper();

  const childArr = React.Children.toArray(children);
  const stepCount = childArr.length;

  return (
    <>
      {React.Children.map(children, (child, i) => {
        const isCompletedStep =
          (React.isValidElement(child) &&
            ((child.props as Record<string, unknown>).isCompletedStep as boolean)) ??
          i < activeStep;
        const isLastStep = i === stepCount - 1;
        const isCurrentStep = i === activeStep;

        const stepProps = {
          index: i,
          isCompletedStep,
          isCurrentStep,
          isLastStep,
        };

        if (React.isValidElement(child))
          return React.cloneElement(child, stepProps);

        return null;
      })}
    </>
  );
}

function HorizontalContent({ children }: { children: React.ReactNode }) {
  const { activeStep } = useStepper();
  const childArr = React.Children.toArray(children);

  if (activeStep > childArr.length) return null;

  return (
    <>
      {React.Children.map(childArr[activeStep], (node) => {
        if (!React.isValidElement(node)) return null;

        return React.Children.map(
          React.isValidElement(node) ? (node.props as {children?: React.ReactNode}).children : null,
          (childNode) => childNode
        );
      })}
    </>
  );
}

// <---------- STEP ---------->

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string | React.ReactNode;
  description?: string;
  icon?: IconType;
  state?: "loading" | "error";
  checkIcon?: IconType;
  errorIcon?: IconType;
  isCompletedStep?: boolean;
  isKeepError?: boolean;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
}

interface StepSharedProps extends StepProps {
  isLastStep?: boolean;
  isCurrentStep?: boolean;
  index?: number;
  hasVisited: boolean | undefined;
  isError?: boolean;
  isLoading?: boolean;
}

// Props which shouldn't be passed to to the Step component from the user
interface StepInternalConfig {
  index: number;
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isLastStep?: boolean;
}

interface FullStepProps extends StepProps, StepInternalConfig {}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (props, ref: React.Ref<HTMLDivElement>) => {
    const {
      children,
      description,
      icon,
      state,
      checkIcon,
      errorIcon,
      index,
      isCompletedStep,
      isCurrentStep,
      isLastStep,
      isKeepError,
      label,
      onClickStep,
    } = props as FullStepProps;

    const { isVertical, isError, isLoading, clickable } = useStepper();

    const hasVisited = isCurrentStep || isCompletedStep;

    const sharedProps = {
      isLastStep,
      isCompletedStep,
      isCurrentStep,
      index,
      isError,
      isLoading,
      clickable,
      label,
      description,
      hasVisited,
      icon,
      isKeepError,
      checkIcon,
      state,
      errorIcon,
      onClickStep,
    };

    const renderStep = () => {
      switch (isVertical) {
        case true:
          return (
            <VerticalStep ref={ref} {...sharedProps}>
              {children}
            </VerticalStep>
          );
        default:
          return <HorizontalStep ref={ref} {...sharedProps} />;
      }
    };

    return renderStep();
  }
);
Step.displayName = "Step";

// <---------- VERTICAL STEP ---------->

type VerticalStepProps = StepSharedProps & {
  children?: React.ReactNode;
};

const verticalStepVariants = cva(
  [
    "flex flex-col relative transition-all duration-200",
    "data-[completed=true]:[&:not(:last-child)]:after:bg-primary",
    "data-[invalid=true]:[&:not(:last-child)]:after:bg-destructive",
  ],
  {
    variants: {
      variant: {
        circle: cn(
          "[&:not(:last-child)]:gap-[var(--step-gap)] [&:not(:last-child)]:pb-[var(--step-gap)]",
          "[&:not(:last-child)]:after:bg-border [&:not(:last-child)]:after:w-[2px] [&:not(:last-child)]:after:content-['']",
          "[&:not(:last-child)]:after:inset-x-[calc(var(--step-icon-size)/2)]",
          "[&:not(:last-child)]:after:absolute",
          "[&:not(:last-child)]:after:top-[calc(var(--step-icon-size)+var(--step-gap))]",
          "[&:not(:last-child)]:after:bottom-[var(--step-gap)]",
          "[&:not(:last-child)]:after:transition-all [&:not(:last-child)]:after:duration-200",
          ""
        ),
        line: "flex-1 border-t-0 mb-4",
      },
    },
  }
);

const VerticalStep = React.forwardRef<HTMLDivElement, VerticalStepProps>(
  (props, ref) => {
    const {
      children,
      index,
      label,
      description,
      icon,
      state,
      checkIcon: checkIconProp,
      errorIcon: errorIconProp,
    } = props;

    const {
      checkIcon: checkIconContext,
      errorIcon: errorIconContext,
      isError,
      isLoading,
      variant,
      styles,
      orientation,
      steps,
      isLastStep: isLastStepCurrentStep,
    } = useStepper();

    const opacity = 1;
    const localIsLoading = isLoading || state === "loading";
    const localIsError = isError || state === "error";

    const isLastStep = index === steps.length - 1;

    const checkIcon = checkIconProp || checkIconContext;
    const errorIcon = errorIconProp || errorIconContext;

    const renderChildren = () => {
      return children;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "stepper__vertical-step",
          verticalStepVariants({
            variant: variant?.includes("circle") ? "circle" : "line",
          }),
          isLastStepCurrentStep && "gap-[var(--step-gap)]",
          styles?.["vertical-step"]
        )}
        data-optional={steps[index || 0]?.optional}
        data-completed={false}
        data-active={false}
        data-clickable={false}
        data-invalid={localIsError}
      >
        <div
          data-vertical
          data-active={false}
          className={cn(
            "stepper__vertical-step-container",
            "flex items-center",
            variant === "line" &&
              "data-[active=true]:border-primary border-s-[3px] py-2 ps-3",
            styles?.["vertical-step-container"]
          )}
        >
          <StepButtonContainer
            {...{ isLoading: localIsLoading, isError: localIsError, ...props, isCurrentStep: false, isCompletedStep: false }}
          >
            <StepIcon
              {...{
                index,
                isError: localIsError,
                isLoading: localIsLoading,
                isCurrentStep: false,
                isCompletedStep: false,
              }}
              icon={icon}
              checkIcon={checkIcon}
              errorIcon={errorIcon}
            />
          </StepButtonContainer>
          <StepLabel
            label={label}
            description={description}
            {...{ isCurrentStep: false, opacity }}
          />
        </div>
        <div
          className={cn(
            "stepper__vertical-step-content",
            !isLastStep && "min-h-4",
            variant !== "line" && "ps-[--step-icon-size]",
            variant === "line" && orientation === "vertical" && "min-h-0",
            styles?.["vertical-step-content"]
          )}
        >
          {renderChildren()}
        </div>
      </div>
    );
  }
);
VerticalStep.displayName = "VerticalStep";

// <---------- HORIZONTAL STEP ---------->

const HorizontalStep = React.forwardRef<HTMLDivElement, StepSharedProps>(
  (props, ref) => {
    const {
      isError,
      isLoading,
      onClickStep,
      variant,
      clickable,
      checkIcon: checkIconContext,
      errorIcon: errorIconContext,
      styles,
      steps,
      setStep,
    } = useStepper();

    const {
      index,
      isCompletedStep,
      isCurrentStep,
      hasVisited,
      icon,
      label,
      description,
      isKeepError,
      state,
      checkIcon: checkIconProp,
      errorIcon: errorIconProp,
    } = props;

    const localIsLoading = isLoading || state === "loading";
    const localIsError = isError || state === "error";

    const opacity = hasVisited ? 1 : 0.8;

    const active =
      variant === "line" ? isCompletedStep || isCurrentStep : isCompletedStep;

    const checkIcon = checkIconProp || checkIconContext;
    const errorIcon = errorIconProp || errorIconContext;

    return (
      <div
        aria-disabled={!hasVisited}
        className={cn(
          "stepper__horizontal-step",
          "relative flex items-center transition-all duration-200",
          "[&:not(:last-child)]:flex-1",
          "[&:not(:last-child)]:after:transition-all [&:not(:last-child)]:after:duration-200",
          "[&:not(:last-child)]:after:bg-border [&:not(:last-child)]:after:h-[2px] [&:not(:last-child)]:after:content-['']",
          "data-[completed=true]:[&:not(:last-child)]:after:bg-primary",
          "data-[invalid=true]:[&:not(:last-child)]:after:bg-destructive",
          variant === "circle-alt" &&
            "flex-1 flex-col justify-start [&:not(:last-child)]:after:relative [&:not(:last-child)]:after:end-[50%] [&:not(:last-child)]:after:start-[50%] [&:not(:last-child)]:after:top-[calc(var(--step-icon-size)/2)] [&:not(:last-child)]:after:-order-1 [&:not(:last-child)]:after:w-[calc((100%-var(--step-icon-size))-(var(--step-gap)))]",
          variant === "circle" &&
            "[&:not(:last-child)]:after:me-[var(--step-gap)] [&:not(:last-child)]:after:ms-[var(--step-gap)] [&:not(:last-child)]:after:flex-1",
          variant === "line" &&
            "data-[active=true]:border-primary flex-1 flex-col border-t-[3px]",
          styles?.["horizontal-step"]
        )}
        data-optional={steps[index || 0]?.optional}
        data-completed={isCompletedStep}
        data-active={active}
        data-invalid={localIsError}
        data-clickable={clickable}
        onClick={() => onClickStep?.(index || 0, setStep)}
        ref={ref}
      >
        <div
          className={cn(
            "stepper__horizontal-step-container",
            "flex items-center",
            variant === "circle-alt" && "flex-col justify-center gap-1",
            variant === "line" && "w-full",
            styles?.["horizontal-step-container"]
          )}
        >
          <StepButtonContainer
            {...{ ...props, isError: localIsError, isLoading: localIsLoading }}
          >
            <StepIcon
              {...{
                index,
                isCompletedStep,
                isCurrentStep,
                isError: localIsError,
                isKeepError,
                isLoading: localIsLoading,
              }}
              icon={icon}
              checkIcon={checkIcon}
              errorIcon={errorIcon}
            />
          </StepButtonContainer>
          <StepLabel
            label={label}
            description={description}
            {...{ isCurrentStep, opacity }}
          />
        </div>
      </div>
    );
  }
);
HorizontalStep.displayName = "HorizontalStep";

// <---------- STEP BUTTON CONTAINER ---------->

type StepButtonContainerProps = StepSharedProps & {
  children?: React.ReactNode;
};

function StepButtonContainer({
  isCurrentStep,
  isCompletedStep,
  children,
  isLoading: isLoadingProp,
}: StepButtonContainerProps) {
  const {
    isLoading: isLoadingContext,
    variant,
    styles,
  } = useStepper();

  const isLoading = isLoadingProp || isLoadingContext;

  if (variant === "line") return null;

  return (
    <Button
      variant="ghost"
      tabIndex={-1}
      className={cn(
        "stepper__step-button-container",
        "pointer-events-none rounded-full p-0",
        "size-[var(--step-icon-size)]",
        "flex items-center justify-center rounded-full border-2",
        "border-neutral-300",
        "bg-transparent",
        "text-neutral-600",
        styles?.["step-button-container"]
      )}
      aria-current={false}
      data-current={false}
      data-invalid={false}
      data-active={false}
      data-clickable={false}
      data-loading={isLoading && (isCurrentStep || isCompletedStep)}
    >
      {children}
    </Button>
  );
}

// <---------- STEP ICON ---------->

type IconType = LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined;

const iconVariants = cva("", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-4",
      lg: "size-5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface StepIconProps {
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isKeepError?: boolean;
  icon?: IconType;
  index?: number;
  checkIcon?: IconType;
  errorIcon?: IconType;
}

const StepIcon = React.forwardRef<HTMLDivElement, StepIconProps>(
  (props, ref) => {
    const { size } = useStepper();

    const {
      isCompletedStep,
      isCurrentStep,
      isError,
      isLoading,
      isKeepError,
      icon: CustomIcon,
      index,
      checkIcon: CustomCheckIcon,
      errorIcon: CustomErrorIcon,
    } = props;

    const Icon = React.useMemo(() => CustomIcon || null, [CustomIcon]);

    const ErrorIcon = React.useMemo(
      () => CustomErrorIcon || null,
      [CustomErrorIcon]
    );

    const Check = React.useMemo(
      () => CustomCheckIcon || CheckIcon,
      [CustomCheckIcon]
    );

    return React.useMemo(() => {
      if (isCompletedStep) {
        if (isError && isKeepError) {
          return (
            <div key="icon">
              <X className={cn(iconVariants({ size }))} />
            </div>
          );
        }
        return (
          <div key="check-icon">
            <Check className={cn(iconVariants({ size }))} />
          </div>
        );
      }
      if (isCurrentStep) {
        if (isError && ErrorIcon) {
          return (
            <div key="error-icon">
              <ErrorIcon className={cn(iconVariants({ size }))} />
            </div>
          );
        }
        if (isError) {
          return (
            <div key="icon">
              <X className={cn(iconVariants({ size }))} />
            </div>
          );
        }
        if (isLoading) {
          return (
            <Loader2 className={cn(iconVariants({ size }), "animate-spin")} />
          );
        }
      }
      if (Icon) {
        return (
          <div key="step-icon">
            <Icon className={cn(iconVariants({ size }))} />
          </div>
        );
      }
      return (
        <span
          ref={ref}
          key="label"
          className={cn("text-md text-center font-medium")}
        >
          {(index || 0) + 1}
        </span>
      );
    }, [
      isCompletedStep,
      isCurrentStep,
      isError,
      isLoading,
      Icon,
      index,
      Check,
      ErrorIcon,
      isKeepError,
      ref,
      size,
    ]);
  }
);
StepIcon.displayName = "StepIcon";

// <---------- STEP LABEL ---------->

interface StepLabelProps {
  isCurrentStep?: boolean;
  opacity: number;
  label?: string | React.ReactNode;
  description?: string | null;
}

const labelVariants = cva("", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const descriptionVariants = cva("", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-xs",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

function StepLabel({
  isCurrentStep,
  opacity,
  label,
  description,
}: StepLabelProps) {
  const { variant, styles, size, orientation } = useStepper();
  const shouldRender = !!label || !!description;

  return shouldRender ? (
    <div
      aria-current={isCurrentStep ? "step" : undefined}
      className={cn(
        "stepper__step-label-container",
        "flex flex-col",
        variant !== "line" ? "ms-2" : orientation === "horizontal" && "my-2",
        variant === "circle-alt" && "text-center",
        variant === "circle-alt" && orientation === "horizontal" && "ms-0",
        variant === "circle-alt" && orientation === "vertical" && "text-start",
        styles?.["step-label-container"]
      )}
      style={{
        opacity,
      }}
    >
      {!!label && (
        <span
          className={cn(
            "stepper__step-label",
            labelVariants({ size }),
            styles?.["step-label"]
          )}
        >
          {label}
        </span>
      )}
      {!!description && (
        <span
          className={cn(
            "stepper__step-description",
            "text-muted-foreground",
            descriptionVariants({ size }),
            styles?.["step-description"]
          )}
        >
          {description}
        </span>
      )}
    </div>
  ) : null;
}

export { Stepper, Step, useStepper };
export type { StepProps, StepperProps, StepItem };