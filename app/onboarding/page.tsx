import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar";

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-primary/[0.07] via-background to-muted/25">
      <OnboardingTopBar />
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain px-4 py-10 [-webkit-overflow-scrolling:touch]">
        <OnboardingForm />
      </div>
    </div>
  );
}
