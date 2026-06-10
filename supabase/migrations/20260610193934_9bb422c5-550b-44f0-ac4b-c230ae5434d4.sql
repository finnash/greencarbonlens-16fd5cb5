
INSERT INTO public.challenges (slug, title, description, category, duration_days, expected_kg_co2e_saved, difficulty, is_active)
SELECT * FROM (VALUES
  ('meatless-week', 'Meatless Week', 'Skip red meat for 7 days. Swap to plant-based meals.', 'food'::activity_category, 7, 14.0, 2, true),
  ('bike-commute', 'Bike Commute', 'Replace 5 car commutes with bike or walking this week.', 'transport'::activity_category, 7, 12.5, 3, true),
  ('cold-wash', 'Cold Wash Challenge', 'Wash all laundry in cold water for 14 days.', 'energy'::activity_category, 14, 4.0, 1, true),
  ('no-fly-month', 'No-Fly Month', 'Avoid all flights for 30 days. Choose train or video calls.', 'travel'::activity_category, 30, 90.0, 5, true),
  ('led-swap', 'LED Swap', 'Replace 5 incandescent bulbs with LEDs.', 'energy'::activity_category, 1, 25.0, 1, true),
  ('plant-mondays', 'Plant-Based Mondays', 'Eat fully plant-based every Monday for 4 weeks.', 'food'::activity_category, 28, 8.0, 2, true)
) AS v(slug, title, description, category, duration_days, expected_kg_co2e_saved, difficulty, is_active)
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE VIEW public.leaderboard_view
WITH (security_invoker = true)
AS
SELECT
  uc.user_id,
  COALESCE(NULLIF(p.display_name, ''), 'Anonymous') AS handle,
  COALESCE(SUM(uc.kg_co2e_saved) FILTER (WHERE uc.updated_at >= now() - INTERVAL '7 days'), 0)::numeric AS week_kg_saved,
  COALESCE(SUM(uc.kg_co2e_saved), 0)::numeric AS total_kg_saved,
  COUNT(*) FILTER (WHERE uc.status = 'completed') AS completed_count
FROM public.user_challenges uc
LEFT JOIN public.profiles p ON p.id = uc.user_id
GROUP BY uc.user_id, p.display_name;

GRANT SELECT ON public.leaderboard_view TO authenticated;
