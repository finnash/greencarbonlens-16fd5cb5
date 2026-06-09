import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import {
  QUIZ,
  estimateBaselineKgPerYear,
  formatKgCo2e,
  quizSchema,
  type QuizAnswers,
} from "@/lib/carbon";
import { completeOnboarding } from "@/lib/profile.functions";

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
    <main
      id="main-content"
      className="min-h-dvh bg-background text-foreground"
    >
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-6 py-8">
        <header className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary"
          >
            <Sparkles className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Onboarding
            </p>
            <h1 className="text-sm font-semibold tracking-tight">
              Build your carbon baseline
            </h1>
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
              onChange={(v) =>
                setAnswers((a) => ({ ...a, [current.key]: v }) as QuizAnswers)
              }
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

function QuestionStep({
  question,
  value,
  onChange,
}: {
  question: (typeof QUIZ)[number];
  value: QuizAnswers[keyof QuizAnswers];
  onChange: (v: QuizAnswers[keyof QuizAnswers]) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{question.title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{question.help}</p>

      {question.kind === "single" ? (
        <div role="radiogroup" aria-label={question.title} className="mt-6 space-y-2">
          {question.options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(opt.value as QuizAnswers[keyof QuizAnswers])}
                className={`flex w-full items-start justify-between rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card hover:border-border"
                }`}
              >
                <span>
                  <span className="block text-sm font-medium">{opt.label}</span>
                  {opt.hint ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {opt.hint}
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden
                  className={`mt-1 size-4 rounded-full border ${
                    selected ? "border-primary bg-primary" : "border-border"
                  }`}
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <Label htmlFor={question.key} className="text-sm font-medium">
            {question.title}
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id={question.key}
              type="number"
              inputMode="numeric"
              min={question.min}
              max={question.max}
              step={question.step}
              value={Number(value)}
              onChange={(e) => {
                const n = Number(e.target.value);
                onChange(Number.isFinite(n) ? n : 0);
              }}
              className="text-lg"
            />
            <span className="text-sm text-muted-foreground" aria-hidden>
              {question.suffix}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultStep({
  estimate,
  displayName,
  onDisplayNameChange,
}: {
  estimate: ReturnType<typeof estimateBaselineKgPerYear>;
  displayName: string;
  onDisplayNameChange: (v: string) => void;
}) {
  const cats = Object.entries(estimate.byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">Your estimated baseline</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We'll refine this as you log activities. The Paris-aligned target is roughly 2 t/yr.
      </p>

      <div className="mt-6 rounded-xl border border-border/70 bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Annual footprint
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {formatKgCo2e(estimate.total)}
          <span className="ml-1 text-sm font-normal text-muted-foreground">CO₂e / yr</span>
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {cats.map(([cat, v]) => (
            <li key={cat} className="flex items-center justify-between">
              <span className="capitalize text-muted-foreground">{cat}</span>
              <span className="tabular-nums">{formatKgCo2e(v)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <Label htmlFor="display_name" className="text-sm font-medium">
          Display name <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="display_name"
          value={displayName}
          maxLength={60}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          placeholder="e.g. Adith"
          className="mt-2"
        />
      </div>
    </div>
  );
}