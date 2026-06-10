/**
 * Single onboarding question — either a `single` radio group or a numeric
 * input. Purely controlled; parent owns the answers object.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QUIZ, QuizAnswers } from "@/lib/carbon";

export function QuestionStep({
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
                    <span className="mt-0.5 block text-xs text-muted-foreground">{opt.hint}</span>
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
