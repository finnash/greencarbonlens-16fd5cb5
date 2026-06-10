import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import { QUIZ, estimateBaselineKgPerYear, quizSchema, type QuizAnswers } from "@/lib/carbon";
import { completeOnboarding } from "@/lib/profile.functions";
import { QuestionStep } from "@/components/onboarding/QuestionStep";
import { ResultStep } from "@/components/onboarding/ResultStep";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding · CarbonLens" },
      {
        name: "description",
        content: "Answer five quick questions to estimate your baseline carbon footprint.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

const DEFAULTS: QuizAnswers = {
  commute: "transit",
  commute_km_per_day: 10,
  diet: "low_meat",
  electricity_kwh_month: 250,
  flights_long_per_year: 0,
};

function OnboardingPage() {
  const navigate = useNavigate();
  const submit = useServerFn(completeOnboarding);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULTS);
  const [displayName, setDisplayName] = useState("");

  const total = QUIZ.length;
  const isLast = step === total;
  const current = QUIZ[step];
  const progress = Math.round(((step + (isLast ? 1 : 0)) / (total + 1)) * 100);

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = quizSchema.parse(answers);
      return submit({ data: { display_name: displayName || undefined, answers: parsed } });
    },
    onSuccess: () => {
      toast.success("Baseline saved");
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    },
  });

  const estimate = estimateBaselineKgPerYear(answers);

  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-6 py-8">
        <header className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary"
          >
            <Sparkles className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Onboarding</p>
            <h1 className="text-sm font-semibold tracking-tight">Build your carbon baseline</h1>
          </div>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {Math.min(step + 1, total + 1)} / {total + 1}
          </span>
        </header>

        <Progress value={progress} className="mt-4 h-1.5" aria-label="Onboarding progress" />

        <section className="mt-8 flex-1">
          {!isLast ? (
            <QuestionStep
              key={current.key}
              question={current}
              value={answers[current.key]}
              onChange={(v) => setAnswers((a) => ({ ...a, [current.key]: v }) as QuizAnswers)}
            />
          ) : (
            <ResultStep
              estimate={estimate}
              displayName={displayName}
              onDisplayNameChange={setDisplayName}
            />
          )}
        </section>

        <nav className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || mutation.isPending}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          {!isLast ? (
            <Button onClick={() => setStep((s) => Math.min(total, s + 1))}>
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Save baseline
            </Button>
          )}
        </nav>
      </div>
    </main>
  );
}
