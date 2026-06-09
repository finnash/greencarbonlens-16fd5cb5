import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FACTOR_LIST, type FactorSlug, computeKgCo2e, formatKgCo2e } from "@/lib/carbon";
import { logActivity } from "@/lib/activity.functions";

/**
 * Quick activity log entry sheet.
 *
 * Renders a category-grouped factor picker, an amount input, and an optional
 * note. Computes the kg CO2e preview client-side so users see impact before
 * submitting; the server re-computes from the trusted factor table.
 */
export function QuickLogSheet({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const log = useServerFn(logActivity);
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState<FactorSlug>("car_petrol_medium");
  const [amount, setAmount] = useState<string>("10");
  const [notes, setNotes] = useState<string>("");

  const numericAmount = Number(amount);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const factor = FACTOR_LIST.find((f) => f.slug === slug)!;
  const preview = validAmount ? computeKgCo2e(slug, numericAmount) : 0;

  const grouped = useMemo(() => {
    const out = new Map<string, typeof FACTOR_LIST[number][]>();
    for (const f of FACTOR_LIST) {
      const list = out.get(f.category) ?? [];
      list.push(f);
      out.set(f.category, list);
    }
    return Array.from(out.entries());
  }, []);

  const mutation = useMutation({
    mutationFn: (input: { factor_slug: FactorSlug; amount: number; notes?: string }) =>
      log({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", userId] });
      toast.success(`Logged ${formatKgCo2e(preview)} CO₂e`);
      setOpen(false);
      setAmount("10");
      setNotes("");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Could not log activity";
      toast.error(message);
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          <span>Log activity</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Log an activity</SheetTitle>
          <SheetDescription>
            Pick what you did, how much, and we'll score it against published emission
            factors.
          </SheetDescription>
        </SheetHeader>

        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validAmount) return;
            mutation.mutate({
              factor_slug: slug,
              amount: numericAmount,
              notes: notes.trim() || undefined,
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="factor">Activity</Label>
            <Select value={slug} onValueChange={(v) => setSlug(v as FactorSlug)}>
              <SelectTrigger id="factor" aria-label="Activity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {grouped.map(([cat, list]) => (
                  <SelectGroup key={cat}>
                    <SelectLabel className="capitalize">{cat}</SelectLabel>
                    {list.map((f) => (
                      <SelectItem key={f.slug} value={f.slug}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount <span className="text-muted-foreground">({factor.unit})</span>
            </Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              aria-describedby="amount-help"
            />
            <p id="amount-help" className="text-xs text-muted-foreground">
              Source: {factor.source}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              maxLength={280}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. commute to office"
            />
          </div>

          <div
            aria-live="polite"
            className="rounded-lg border border-border/70 bg-card/60 p-4"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Estimated impact
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatKgCo2e(preview)}{" "}
              <span className="text-sm font-normal text-muted-foreground">CO₂e</span>
            </p>
          </div>

          <SheetFooter>
            <Button
              type="submit"
              disabled={!validAmount || mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Save entry"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}