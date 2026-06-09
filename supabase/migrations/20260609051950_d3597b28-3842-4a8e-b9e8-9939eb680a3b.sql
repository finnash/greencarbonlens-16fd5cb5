
INSERT INTO public.activity_factors (slug, category, name, unit, kg_co2e_per_unit, source, region) VALUES
-- Transport (kg CO2e per km unless noted)
('car_petrol_small',  'transport', 'Petrol car (small)',    'km', 0.1410, 'UK DEFRA 2024', 'GLOBAL'),
('car_petrol_medium', 'transport', 'Petrol car (medium)',   'km', 0.1781, 'UK DEFRA 2024', 'GLOBAL'),
('car_diesel_medium', 'transport', 'Diesel car (medium)',   'km', 0.1683, 'UK DEFRA 2024', 'GLOBAL'),
('car_hybrid_medium', 'transport', 'Hybrid car (medium)',   'km', 0.1093, 'UK DEFRA 2024', 'GLOBAL'),
('car_ev_medium',     'transport', 'Electric car (grid avg)','km', 0.0470, 'IEA 2024',      'GLOBAL'),
('bus_local',         'transport', 'Local bus',             'km', 0.1023, 'UK DEFRA 2024', 'GLOBAL'),
('train_commuter',    'transport', 'Commuter train',        'km', 0.0354, 'UK DEFRA 2024', 'GLOBAL'),
('metro_subway',      'transport', 'Metro / subway',        'km', 0.0275, 'UK DEFRA 2024', 'GLOBAL'),
('motorbike_medium',  'transport', 'Motorbike (medium)',    'km', 0.1135, 'UK DEFRA 2024', 'GLOBAL'),
('rideshare_solo',    'transport', 'Rideshare (solo)',      'km', 0.2100, 'EPA 2024',      'GLOBAL'),
('cycling',           'transport', 'Bicycle',               'km', 0.0000, 'Zero emissions','GLOBAL'),
('walking',           'transport', 'Walking',               'km', 0.0000, 'Zero emissions','GLOBAL'),
-- Travel (aviation)
('flight_short_eco',  'travel',    'Short-haul flight (eco)',  'km', 0.1535, 'UK DEFRA 2024', 'GLOBAL'),
('flight_long_eco',   'travel',    'Long-haul flight (eco)',   'km', 0.1481, 'UK DEFRA 2024', 'GLOBAL'),
('flight_long_business','travel',  'Long-haul flight (biz)',   'km', 0.4296, 'UK DEFRA 2024', 'GLOBAL'),
-- Energy (per kWh)
('electricity_grid_avg','energy',  'Grid electricity (avg)',   'kWh', 0.4330, 'IEA 2024',      'GLOBAL'),
('electricity_renewable','energy', 'Renewable electricity',    'kWh', 0.0410, 'IEA 2024',      'GLOBAL'),
('natural_gas',       'energy',    'Natural gas (heating)',    'kWh', 0.2020, 'UK DEFRA 2024', 'GLOBAL'),
-- Food (per meal/serving)
('meal_beef',         'food',      'Beef meal',                'meal', 7.2600, 'Our World in Data', 'GLOBAL'),
('meal_lamb',         'food',      'Lamb meal',                'meal', 6.4500, 'Our World in Data', 'GLOBAL'),
('meal_pork',         'food',      'Pork meal',                'meal', 2.5400, 'Our World in Data', 'GLOBAL'),
('meal_chicken',      'food',      'Chicken meal',             'meal', 1.7800, 'Our World in Data', 'GLOBAL'),
('meal_fish',         'food',      'Fish meal',                'meal', 1.6200, 'Our World in Data', 'GLOBAL'),
('meal_vegetarian',   'food',      'Vegetarian meal',          'meal', 0.7800, 'Our World in Data', 'GLOBAL'),
('meal_vegan',        'food',      'Vegan meal',               'meal', 0.4800, 'Our World in Data', 'GLOBAL'),
('coffee_cup',        'food',      'Coffee (cup w/ dairy)',    'cup',  0.2800, 'Our World in Data', 'GLOBAL'),
-- Shopping
('clothing_new_item', 'shopping',  'New clothing item',        'item', 10.0000,'Carbon Trust',  'GLOBAL'),
('electronics_phone', 'shopping',  'New smartphone',           'item', 70.0000,'Apple LCA 2024','GLOBAL'),
-- Waste
('waste_general_kg',  'waste',     'General waste',            'kg',   0.4670, 'UK DEFRA 2024', 'GLOBAL'),
('waste_recycled_kg', 'waste',     'Recycled waste',           'kg',   0.0210, 'UK DEFRA 2024', 'GLOBAL')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  unit = EXCLUDED.unit,
  kg_co2e_per_unit = EXCLUDED.kg_co2e_per_unit,
  source = EXCLUDED.source;
