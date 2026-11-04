/* Family Cyber Ready — all-hazards extension to the starter plan.
 * Adds family roles, supply locations, the supplies & maintenance register, and hazard scenarios.
 * Sources (checked 4 Nov 2026): Australian Red Cross Get Packing checklist; NSW SES emergency kit; Get Ready Queensland
 * kit checklist 2026 and Severe Weather Safety Guide; ACT ESA home emergency kit; WA DFES; NT PFES; Fire and Rescue NSW
 * smoke alarms; QFD smoke alarm law; CFA/MFS fire blankets; healthdirect first aid kits and CPR; ACCC power banks;
 * WorkSafe Tasmania fuel storage; NSW Government bushfire home preparation; AFDRS (CFA, QFD); Australian Warning System;
 * NSW/QLD/Tas SES flood, storm, tsunami; BOM cyclones; DFES earthquake; SA Government chemical emergency; ACMA emergency calls.
 * Intervals marked "(assumption)" are common recommendations without an official Australian figure. */
(function (g) {
  'use strict';
  const P = g.FCR_STARTER;

  P.roles = [
    { id: 'lead', title: 'Incident coordinator', duties: ['Activates the plan and chooses the scenario', 'Decides stay or leave, using official warnings', 'Sends signed updates and keeps the incident log'] },
    { id: 'deputy', title: 'Deputy coordinator', duties: ['Takes over if the coordinator is away or unreachable', 'Holds the encrypted key backup and passphrase'] },
    { id: 'comms', title: 'Communications & check-ins', duties: ['Runs the check-in schedule and relay contact', 'Monitors ABC radio and the state warnings service', 'Checks on neighbours'] },
    { id: 'care', title: 'Care lead', duties: ['Children, older people and anyone with medical needs', 'Medications, prescriptions and medical equipment', 'Collects children from school or care'] },
    { id: 'supplies', title: 'Supplies & equipment lead', duties: ['Keeps the emergency kit and stores stocked', 'Runs the maintenance checks in the Kit tab', 'Rations water and food during an incident'] },
    { id: 'home', title: 'Home & utilities lead', duties: ['Power, water and gas shut-off', 'Property preparation (bushfire, storm, flood, cyclone)', 'Generator and fuel safety'] },
    { id: 'pets', title: 'Pets & animals', duties: ['Pet carriers, food, medicines and records', 'Moves animals early'] },
    { id: 'grab', title: 'Grab bag & documents', duties: ['Takes the grab-and-go bag, documents and chargers when leaving', 'Keeps document copies current'] }
  ];
  P.members = [
    { id: 'm1', name: 'Parent 1', contact: 'cf1', roles: ['lead', 'home'] },
    { id: 'm2', name: 'Parent 2', contact: 'cf2', roles: ['deputy', 'care', 'grab'] },
    { id: 'm3', name: 'Family member 3', contact: 'cf3', roles: ['comms', 'supplies', 'pets'] }
  ];
  P.locations = [
    { id: 'kit', name: 'Emergency kit', detail: 'Waterproof container — e.g. hall cupboard, bottom shelf. Mark with reflective tape.' },
    { id: 'grab', name: 'Grab-and-go bag', detail: 'Ready to carry — e.g. beside the front door.' },
    { id: 'store', name: 'Home store', detail: 'Water, food and bulky items — e.g. garage shelving.' },
    { id: 'meds', name: 'Medicines', detail: 'e.g. bathroom cabinet; refrigerated medicines in the fridge.' },
    { id: 'kitchen', name: 'Kitchen', detail: 'Fire blanket at the kitchen exit; extinguisher nearby.' },
    { id: 'house', name: 'Around the house', detail: 'Smoke alarms, switchboard, water and gas shut-off points.' },
    { id: 'car', name: 'Car(s)', detail: 'Car emergency kit in the boot.' },
    { id: 'shed', name: 'Shed / outdoors', detail: 'Fuel containers, generator, tools, tarpaulin.' }
  ];
  const S = (id, item, loc, qty, check, replace, role, note) => ({ id, item, loc, qty, check, replace, role, note, last: '', exp: '' });
  P.supplies = [
    S('water', 'Drinking water (sealed, dated containers)', 'store', 'Minimum 10 L per person (QLD advises enough for 5 days); more in hot weather, for pets and medical needs', 3, 'Up to 12 months in airtight containers; label with the date changed', 'supplies', 'Quarterly check (assumption; Get Ready QLD: review kit at least twice a year). Do not drink tap water after an event until declared safe.'),
    S('food', 'Non-perishable food and can opener', 'store', '3+ days for the household (5 days recommended in QLD)', 3, 'Before use-by; rotate into everyday use', 'supplies', 'Include baby formula and special diets; check expiry dates.'),
    S('cooker', 'Portable stove and spare gas canister', 'store', '1 stove, 1 spare canister', 12, 'Spare canister after use', 'supplies', 'Use outdoors only.'),
    S('radio', 'Battery or wind-up radio (ABC frequency marked)', 'kit', '1', 6, 'When faulty', 'comms', 'Test at each kit check (assumption interval).'),
    S('torch', 'Torches or lanterns', 'kit', '1 per person', 6, 'When faulty', 'supplies', 'Check with batteries every 6 months (ACT ESA). Consider wind-up torches.'),
    S('batteries', 'Spare batteries (all device types)', 'kit', 'Enough for 3–5 days', 6, 'When expired or flat', 'supplies', 'Store separately from torches.'),
    S('powerbank', 'Power banks and charging cables', 'grab', '1 per person, charged', 3, 'Immediately if swollen, hot, leaking or damaged', 'supplies', 'Recharge every 3 months (assumption). Charge on a non-flammable surface (ACCC).'),
    S('firstaid', 'First aid kit (with sunscreen and insect repellent)', 'kit', '1 per household', 12, 'Used items straight away; expired items when found', 'care', 'Check after every use and at least yearly (healthdirect).'),
    S('medicines', 'Medicines, list of doses and prescription copies', 'meds', '14 days for each person', 3, 'Rotate before expiry', 'care', 'Small esky and ice bricks for medicines that must stay cold.'),
    S('cash', 'Cash in small notes and coins', 'kit', 'Small amount', 12, 'Top up after use', 'lead', 'EFTPOS and ATMs may not work.'),
    S('documents', 'Copies of key documents (ID, insurance, wills, medical, property)', 'grab', '1 set in a waterproof bag + digital copy', 12, 'After any life change (new ID, insurance, move)', 'grab', 'Keep originals or backups elsewhere.'),
    S('printed', 'Printed copy of this plan and contact list', 'kit', '1 in kit, 1 in each car', 12, 'After each full plan update', 'lead', 'Use Print / save PDF on the Now screen.'),
    S('hygiene', 'Toiletries, toilet paper, sanitiser, masks, rubbish bags', 'kit', 'Per person, 3+ days', 12, 'Top up after use', 'supplies', ''),
    S('clothing', 'Change of clothes, sturdy shoes, wool/cotton clothing', 'grab', 'Per person, 3–4 days', 12, 'As children grow', 'grab', ''),
    S('ppe', 'Protective gear: heavy gloves, safety glasses, P2 masks, hats', 'kit', 'Per person', 12, 'Damaged items', 'home', ''),
    S('bedding', 'Blankets or sleeping bags', 'store', 'Per person', 12, '', 'supplies', ''),
    S('tools', 'Tools: wrench, pliers, screwdriver, tarpaulin, rope, whistle', 'shed', '1 set', 12, '', 'home', 'Wrench and pliers for shutting off utilities.'),
    S('keys', 'Spare house and car keys, paper maps', 'grab', '1 set', 12, '', 'grab', ''),
    S('pets', 'Pet food, water, carrier, lead, medicines, records', 'store', 'At least 1 week', 3, 'Rotate before expiry', 'pets', 'Microchip details and photos in a waterproof bag.'),
    S('smoketest', 'Smoke alarms — test button', 'house', 'Every bedroom, hallway and level', 1, 'Whole unit every 10 years', 'home', 'Test monthly (FRNSW). QLD: interconnected photoelectric alarms required in all homes by 1 Jan 2027.'),
    S('smokeclean', 'Smoke alarms — vacuum and replaceable batteries', 'house', 'All alarms', 6, 'Replaceable batteries every 12 months', 'home', 'Vacuum every 6 months (FRNSW). 10-year lithium units have no replaceable battery.'),
    S('extinguisher', 'Fire extinguisher', 'kitchen', '1', 6, 'After any use, or if the gauge is out of the green', 'home', 'Gauge and pin check (assumption interval — no official household figure).'),
    S('fireblanket', 'Fire blanket', 'kitchen', '1 (AS/NZS 3504)', 12, 'Immediately after any use', 'home', 'Mount near the kitchen exit, not beside the stove.'),
    S('carkit', 'Car emergency kit (water, food, torch, jumper leads, hi-vis, blanket)', 'car', '1 per car', 6, 'Water and food regularly', 'supplies', 'Keep at least a quarter tank (NSW SES); keep it fuller in fire and storm season (assumption).'),
    S('fuel', 'Stored fuel and containers', 'shed', 'Within state limits', 12, 'Damaged or degraded containers (assumption: about 5 years)', 'home', 'Use approved containers. Rotate petrol every 3–6 months (assumption).'),
    S('generator', 'Generator (delete if none)', 'shed', '1', 1, '', 'home', 'Test run per manufacturer (assumption: monthly). Never indoors. Never connect to house wiring unless a licensed electrician has installed a changeover (transfer) switch.'),
    S('property', 'Property preparation (gutters, vegetation, loose items)', 'house', 'Whole property', 12, '', 'home', 'Before every bushfire and storm/cyclone season.'),
    S('kitreview', 'Whole emergency kit review', 'kit', 'All items', 6, 'Used or expired items', 'supplies', 'At least twice a year (Get Ready QLD).'),
    S('planreview', 'Plan review and family rehearsal', 'house', 'Whole family', 12, '', 'lead', 'Review yearly and after moving (Get Ready QLD). Practise the home fire escape twice a year (FRNSW).')
  ];

  P.contacts.splice(1, 0, { id: 'c106', group: 'Emergency', name: 'Text emergency call (106)', phone: '106', note: 'For people who are deaf or have a hearing or speech impairment, via the National Relay Service.' });

  // Tag existing infrastructure checklists with roles
  const tag = (cid, map) => { const c = P.checklists.find((x) => x.id === cid); if (c) c.items.forEach((i) => { if (map[i.id]) i.role = map[i.id]; }); };
  tag('first30', { a3: 'comms', a4: 'comms', a7: 'lead', a8: 'lead' });
  const pw = P.checklists.find((x) => x.id === 'power');
  pw.items.unshift({ id: 'p0', t: 'Life support or powered medical equipment: register it with your electricity retailer in advance, and keep a backup power and transfer plan.', role: 'care' });
  pw.items.push({ id: 'p9', t: 'Never use BBQs, heat beads or outdoor heaters indoors — carbon monoxide kills.', role: 'home' });
  tag('power', { p1: 'home', p2: 'home', p4: 'care', p5: 'supplies', p7: 'home', p8: 'comms' });
  tag('water', { w1: 'comms', w4: 'supplies', w5: 'supplies', w7: 'care' });
  tag('telco', { t3: 'comms', t5: 'lead' });
  tag('payments', { f1: 'lead', f3: 'care', f4: 'supplies' });
  tag('recovery', { r4: 'lead', r5: 'supplies', r6: 'lead' });
  const ready = P.checklists.find((x) => x.id === 'ready');
  if (ready) { ready.title = 'Quarterly readiness check'; ready.desc = 'Every three months. Detailed intervals are in the Kit tab.'; ready.items.unshift({ id: 'q0', t: 'Open the Kit tab and clear everything marked Due or Overdue.', role: 'supplies' }); }

  // Hazard checklists: items carry sec (Before / During / After) and an optional role
  const ORDER = { Before: 0, During: 1, After: 2 };
  const L = (id, title, desc, items, regions) => ({ id, title, desc, regions, items: items.map(([sec, t, role], n) => ({ id: id + n, sec, t, role, _o: n })).sort((a, b) => (ORDER[a.sec] - ORDER[b.sec]) || (a._o - b._o)).map(({ _o, ...i }) => i) });
  P.checklists.push(
    L('blackout1', 'Communications blackout — days 1 to 3', 'Phones, SMS and internet all down.', [
      ['During', 'Follow the Blackout protocol procedure — do not wait for instructions.', 'lead'],
      ['During', 'Radio on for news on the hour; note announced relief or evacuation centres.', 'comms'],
      ['During', 'Phones: switch on at the top of each hour for check-ins, otherwise off. No network at all: meet at 9 am and 3 pm.', 'comms'],
      ['During', 'Try 000 from any mobile — it can use another network if one is working.', ''],
      ['During', 'Ration water first for drinking; record what is used.', 'supplies'],
      ['During', 'Use fridge food first, then freezer, then pantry.', 'supplies'],
      ['During', 'Leave a dated note at home: who, where, when.', 'lead'],
      ['During', 'Check on neighbours, especially older or isolated people.', 'comms']
    ]),
    L('blackout2', 'Communications blackout — days 4 to 7', 'Prolonged outage with no restoration date.', [
      ['During', 'Review stay or leave each morning using the Deciding to leave procedure.', 'lead'],
      ['During', 'Check medicine supply for every person; seek a pharmacy or relief centre early.', 'care'],
      ['During', 'Count remaining water and food days; ask at relief centres for resupply.', 'supplies'],
      ['During', 'Sanitation without water: lined bucket and rubbish bags, kept away from food.', 'home'],
      ['During', 'If leaving, go to the out-of-area meeting point by the agreed route; leave a note.', 'lead'],
      ['During', 'Without any phone network, go in person to police, fire or SES stations or hospitals for help.', '']
    ]),
    L('bushfire', 'Bushfire', 'Check the Fire Danger Rating daily in fire season.', [
      ['Before', 'Make a bushfire survival plan and decide now: leave early or stay.', 'lead'],
      ['Before', 'Keep grass short, gutters clear and a cleared area around the house.', 'home'],
      ['Before', 'Install the state warnings app and save the fire information line.', 'comms'],
      ['Before', 'Extreme: check the plan and that the property is already prepared; leaving early in the day is safest. Catastrophic: leave risk areas.', 'lead'],
      ['During', 'Leave early — late departures are the most dangerous.', 'lead'],
      ['During', 'Never try to outrun a fire in a car.', ''],
      ['During', 'Caught in a car: park clear of trees, windows and vents shut, engine off, lights on, get below window level under a wool blanket.', ''],
      ['During', 'If trapped, shelter in a solid building with two exits until the front passes.', ''],
      ['During', 'Wear long wool or cotton clothing and sturdy leather shoes.', 'grab'],
      ['During', 'Move pets early; take carriers and records.', 'pets'],
      ['After', 'Patrol inside, outside and the roof space for embers for several hours.', 'home'],
      ['After', 'Return only when authorities say roads and the area are safe.', 'lead'],
      ['After', 'Tell family you are safe; use a recovery centre if needed.', 'comms']
    ]),
    L('flood', 'Flood', 'Riverine and flash flooding.', [
      ['Before', 'Know your flood risk, evacuation route and the trigger to leave.', 'lead'],
      ['Before', 'Lift belongings, electrical items and chemicals above expected flood level.', 'home'],
      ['Before', 'Move pets and animals to safety early.', 'pets'],
      ['Before', 'Fuel the car and park it on high ground.', 'home'],
      ['During', 'Never drive, ride, walk or swim through floodwater.', ''],
      ['During', 'Leave early, before roads close.', 'lead'],
      ['Before', 'Before water arrives: switch off power at the switchboard (solar too) and gas at the meter. Never touch electrics if wet.', 'home'],
      ['During', 'If trapped, go to the highest level of a sturdy building (not the roof cavity) and call 000.', ''],
      ['After', 'Keep power off until a licensed electrician checks it; gas off until the gas distributor (LPG: a gasfitter) checks it.', 'home'],
      ['After', 'Discard food, drinks and medicines that touched floodwater.', 'supplies'],
      ['After', 'Drink bottled or boiled water until supply is declared safe.', 'supplies'],
      ['After', 'Photograph damage and contact the insurer.', 'lead']
    ]),
    L('storm', 'Severe storm', 'Damaging winds, hail, lightning.', [
      ['Before', 'Secure or bring in trampolines, outdoor furniture and loose items.', 'home'],
      ['Before', 'Park cars under cover or away from trees.', 'home'],
      ['Before', 'Bring children and pets inside; unplug computers.', 'care'],
      ['During', 'Stay inside, away from windows, external doors and skylights.', ''],
      ['During', 'Treat fallen powerlines as live — stay 8 m away and report them (000 or the distributor). If one falls on the car, stay inside.', ''],
      ['During', 'Do not drive through flooded roads.', ''],
      ['After', 'Call the SES (132 500) for storm damage; 000 if life is at risk.', 'lead'],
      ['After', 'Have gas and electrical appliances checked before use if damaged.', 'home'],
      ['After', 'Check on neighbours when safe.', 'comms']
    ]),
    L('cyclone', 'Tropical cyclone', 'Season 1 November to 30 April.', [
      ['Before', 'Before the season: trim branches, clear gutters and drains, fix loose roofing.', 'home'],
      ['Before', 'When threatened: fit screens or board windows; secure outdoor items, boats and tanks.', 'home'],
      ['Before', 'Fill water containers; prepare for loss of power, water and internet.', 'supplies'],
      ['Before', 'Fuel the car and confirm when and where you would evacuate.', 'lead'],
      ['During', 'Shelter in the strongest room, away from windows.', ''],
      ['During', 'The calm eye is not the end — destructive winds return.', ''],
      ['During', 'If the building breaks up, shelter under a strong table or mattress.', ''],
      ['After', 'Stay inside until the all-clear; return only when advised.', 'lead'],
      ['After', 'Do not drink tap water until confirmed safe.', 'supplies'],
      ['After', 'Avoid floodwater, fallen powerlines and debris.', '']
    ], ['QLD', 'WA', 'NT']),
    L('heatwave', 'Heatwave', 'Extended extreme heat, often with power outages.', [
      ['Before', 'Service the air conditioner before summer.', 'home'],
      ['Before', 'Ask the doctor how to manage medicines and conditions in heat.', 'care'],
      ['Before', 'Identify cool public places nearby (library, shopping centre, pool).', 'comms'],
      ['During', 'Drink water regularly, even if not thirsty.', ''],
      ['During', 'Stay out of the sun 11 am–3 pm; close curtains and blinds. If home is too hot or power is out, go to a cool public place.', ''],
      ['During', 'Never leave children, babies or pets in a car.', 'care'],
      ['During', 'Check on older relatives and neighbours daily.', 'comms'],
      ['During', 'Heatstroke (hot skin, confusion, collapse): call 000 and cool the person.', 'care']
    ]),
    L('housefire', 'House fire', 'Practise the escape plan twice a year.', [
      ['Before', 'Working smoke alarms on every level and in bedrooms and hallways.', 'home'],
      ['Before', 'Two ways out of every room; keys for security screens reachable.', 'home'],
      ['Before', 'Agree an outside meeting place (e.g. the letterbox).', 'lead'],
      ['Before', 'Plan help for anyone with a disability, young children or pets.', 'care'],
      ['During', 'Pan fire: turn off the heat if safe and cover with the fire blanket — never water. If fire spreads, get out.', ''],
      ['During', 'Get out and stay out — do not stop for belongings.', ''],
      ['During', 'Get down low under smoke; close doors behind you.', ''],
      ['During', 'Call 000 once outside.', ''],
      ['After', 'Count everyone at the meeting place. Never go back inside.', 'lead']
    ]),
    L('earthquake', 'Earthquake', 'Rare but possible across Australia.', [
      ['Before', 'Secure heavy furniture and objects that could topple.', 'home'],
      ['Before', 'Practise Drop, Cover and Hold On.', 'lead'],
      ['During', 'Drop, Cover and Hold On until shaking stops.', ''],
      ['During', 'Outdoors: move clear of buildings, powerlines and trees.', ''],
      ['During', 'Coast: after strong shaking, go to high ground — do not wait for a warning.', ''],
      ['After', 'Expect aftershocks; leave damaged buildings carefully.', ''],
      ['After', 'No matches or candles until gas leaks are ruled out. Smell gas: follow the Gas, electricity and carbon monoxide safety procedure.', 'home'],
      ['After', 'Call SES 132 500 for damage, 000 if life is at risk.', 'lead']
    ]),
    L('tsunami', 'Tsunami', 'Coastal households, beaches and estuaries.', [
      ['Before', 'Know whether home and usual beaches are tsunami-prone and the route to high ground.', 'lead'],
      ['During', 'Act on the first warning or natural signs (strong shaking, roaring, unusual sea).', ''],
      ['During', 'Get out of the water and away from beaches, harbours and estuaries.', ''],
      ['During', 'Go at least 10 m above sea level or 1 km inland, or to an upper floor of a solid building.', ''],
      ['After', 'Wait for official advice before returning — more waves can come.', 'lead'],
      ['After', 'Discard food and water that touched tsunami water.', 'supplies']
    ]),
    L('shelter', 'Shelter in place (smoke or chemical release)', 'When told to shelter indoors.', [
      ['Before', 'Choose a safe room: few windows, above ground, with water.', 'home'],
      ['Before', 'Keep plastic sheeting, duct tape and scissors with the kit.', 'supplies'],
      ['During', 'Get everyone and pets inside; close all windows and doors.', 'care'],
      ['During', 'Turn off air conditioning, heating and fans that draw outside air.', 'home'],
      ['During', 'Seal gaps with wet towels or plastic and tape.', 'home'],
      ['During', 'Listen to ABC radio; leave only when emergency services say it is safe.', 'comms'],
      ['After', 'If exposed: cut clothing off, bag it, blot skin and wash with soap and water.', 'care']
    ]),
    L('pandemic', 'Pandemic or infectious disease', 'Follow current health department advice.', [
      ['Before', 'Keep vaccinations up to date.', 'care'],
      ['Before', 'Hold 4–14 days of food and essentials; regular medicines without stockpiling.', 'supplies'],
      ['Before', 'Plan schoolwork and activities in case schools close.', 'care'],
      ['During', 'Wash hands often; cough into the elbow.', ''],
      ['During', 'Stay home when sick; isolate a sick person in a separate room where possible.', 'care'],
      ['During', 'Wear masks when health authorities advise.', ''],
      ['During', 'Limit visitors; keep away from older and vulnerable people.', '']
    ]),
    L('medical', 'Medical emergency', 'Collapse, injury or serious illness.', [
      ['During', 'Call 000 for an ambulance; stay on the line and follow instructions.', ''],
      ['During', 'DRSABCD: Danger, Response, Send for help, Airway, Breathing, CPR, Defibrillation.', ''],
      ['During', 'Not breathing normally: CPR — centre of chest, one-third depth, 100–120 a minute; 30 compressions to 2 breaths, or compressions only.', ''],
      ['During', 'Use a defibrillator (AED) as soon as one arrives — it talks you through it.', ''],
      ['During', 'Continue until help takes over or the person recovers.', ''],
      ['After', 'Bring medicines list and Medicare card to hospital.', 'care']
    ]),
    L('leaveplan', 'Leaving home (evacuation)', 'When authorities advise or home becomes unsafe.', [
      ['During', 'Anyone needing help to move, or relying on power or carers, leaves at the first warning; transport arranged beforehand.', 'care'],
      ['During', 'Take the grab-and-go bag, documents, chargers and cash.', 'grab'],
      ['During', 'Take medicines (with esky for cold medicines), glasses and medical equipment.', 'care'],
      ['During', 'Take pets with food, carriers and records.', 'pets'],
      ['During', 'Turn off power, water and gas if leaving for more than a day and it is safe.', 'home'],
      ['During', 'Leave a dated note; SMS the family and relay contact with destination.', 'comms'],
      ['During', 'Follow the advised route; never drive through floodwater or smoke.', 'lead'],
      ['During', 'If a powerline falls on the car, stay inside until emergency services arrive.', '']
    ])
  );

  P.procedures.push(
    { id: 'blackout', title: 'Blackout protocol (no communications)', summary: 'Pre-agreed actions that need no phone, SMS or internet.', steps: [
      'If you cannot contact anyone, follow this protocol without waiting for instructions.',
      'If away from home and it is safe, make your way home. If home is unsafe or unreachable, go to the active meeting point.',
      'Be at the active meeting point at 9:00 am and 3:00 pm each day. Wait 30 minutes, then leave a dated note.',
      'Children at school or care stay there until collected by a listed adult. The Care lead collects them.',
      'Before leaving any location, leave a dated note: names, time, where you are going.',
      'Listen to ABC radio on the hour for warnings and relief or evacuation centres.',
      'From day 4, the coordinator decides stay or leave each morning (see Deciding to leave home).',
      'The printed plan is the master copy once phones fail. Keep it with the kit.'
    ] },
    { id: 'utilsafety', title: 'Gas, electricity and carbon monoxide safety', summary: 'The most common causes of injury and death during outages and after disasters.', steps: [
      'Smell gas: no flames, no light switches or phones near the leak. Open doors and windows, turn off at the meter or cylinder if safe, get out, then call the gas distributor or 000.',
      'Never use BBQs, heat beads, camp stoves, patio heaters or unflued heaters indoors or in garages.',
      'Generators only outdoors, away from windows and vents; never connected to house wiring without an electrician-installed changeover switch.',
      'Carbon monoxide signs: headache, dizziness, nausea, drowsiness. Get everyone to fresh air. Unconscious or not breathing: call 000 and start CPR.',
      'Fallen powerlines: treat as live, stay 8 m away, report to 000 or the electricity distributor. If one falls on the car, stay inside.',
      'After flood or fire, keep power off until a licensed electrician checks it, and gas off until the distributor or a gasfitter checks it.'
    ] },
    { id: 'warnings', title: 'Warning levels and fire danger ratings', summary: 'Australian Warning System and the Australian Fire Danger Rating System.', steps: [
      'Advice (yellow): an incident has started, no immediate danger. Stay informed.',
      'Watch and Act (orange): conditions are changing. Take action now to protect your family.',
      'Emergency Warning (red): you are in danger. Act immediately — waiting puts lives at risk.',
      'Fire danger Moderate: plan and prepare. High: be ready to act.',
      'Fire danger Extreme: take action now to protect life and property; leaving bushfire risk areas early in the day is your safest option.',
      'Fire danger Catastrophic: for survival, leave bushfire risk areas — the night before or early morning.',
      'Keep emergency/government alerts switched on in phone settings (AusAlert cell broadcast, from Oct 2026). Never block Emergency Alert SMS from +61 444 444 444.'
    ] },
    { id: 'maintenance', title: 'Supplies and equipment maintenance', summary: 'How the Kit tab schedule works.', steps: [
      'Every item in the Kit tab shows where it is kept, the quantity, how often to check it and when to replace it.',
      'The Supplies & equipment lead clears everything marked Due or Overdue at least each quarter.',
      'Tap Checked to record a check on your phone; the coordinator records it for everyone with a quick update.',
      'Test smoke alarms monthly; vacuum them every 6 months; replace the whole unit every 10 years.',
      'Replace stored water at least every 12 months; check water, food and medicines every season.',
      'Intervals marked "assumption" are common practice without an official Australian figure — adjust to the manufacturer.'
    ] }
  );

  // Scenarios (incident mode). Infrastructure scenarios keep their earlier ids.
  const sc = (id, title, checklists, procedures, regions) => ({ id, title, checklists, procedures, regions });
  const keep = P.scenarios.filter((s) => s.id !== 'multi');
  keep.forEach((s) => { if (['power', 'water'].includes(s.id)) s.procedures.push('utilsafety'); });
  P.scenarios = [
    sc('multi', 'Critical infrastructure cyber incident', ['first30', 'power', 'water', 'telco', 'payments', 'scam'], ['utilsafety', 'checkin', 'verify', 'food', 'generator', 'leave']),
    sc('blackout', 'Total communications blackout', ['first30', 'blackout1', 'blackout2', 'payments'], ['utilsafety', 'blackout', 'checkin', 'leave', 'food'])
  ].concat(keep, [
    sc('bushfire', 'Bushfire', ['bushfire', 'leaveplan'], ['warnings', 'leave', 'checkin']),
    sc('flood', 'Flood', ['flood', 'leaveplan'], ['utilsafety', 'warnings', 'leave', 'checkin']),
    sc('storm', 'Severe storm', ['storm', 'power'], ['utilsafety', 'warnings', 'checkin', 'food']),
    sc('cyclone', 'Tropical cyclone', ['cyclone', 'power', 'water'], ['utilsafety', 'warnings', 'leave', 'checkin'], ['QLD', 'WA', 'NT']),
    sc('heatwave', 'Heatwave', ['heatwave', 'power'], ['utilsafety', 'checkin', 'food']),
    sc('housefire', 'House fire', ['housefire'], ['checkin']),
    sc('earthquake', 'Earthquake', ['earthquake'], ['utilsafety', 'checkin', 'leave']),
    sc('tsunami', 'Tsunami', ['tsunami', 'leaveplan'], ['warnings', 'checkin']),
    sc('shelter', 'Shelter in place', ['shelter'], ['verify']),
    sc('pandemic', 'Pandemic', ['pandemic', 'payments'], ['verify']),
    sc('medical', 'Medical emergency', ['medical'], []),
    sc('evacuate', 'Leaving home', ['leaveplan'], ['leave', 'checkin'])
  ]);
  P.title = 'Our Family Emergency Plan';
})(typeof window !== 'undefined' ? window : globalThis);
