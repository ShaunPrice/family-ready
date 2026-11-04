/* Starter family plan. The coordinator edits this before publishing.
 * National numbers only; state and utility numbers are added by region set-up (regions.js). */
(function (g) {
  g.FCR_STARTER = {
    title: 'Our Family Incident Plan',
    household: {
      name: 'Our household',
      address: 'Street address, suburb, postcode',
      activeMeeting: 'mp1',
      radio: 'Set by region set-up',
      notes: 'Main water stop-valve: by the front tap. Switchboard/meter box: side of garage. Gas meter: front left.',
      meeting: [
        { id: 'mp1', name: 'Primary — at home', detail: 'Stay home for infrastructure outages. For bushfire, flood or tsunami, leave early on the plan trigger — do not wait to be told. Check in by SMS on the hour.' },
        { id: 'mp2', name: 'Secondary — nearby', detail: 'Local park / community centre (name it here).' },
        { id: 'mp3', name: 'Out of area', detail: 'Relative or friend in another suburb or region (address here).' }
      ]
    },
    contacts: [
      { id: 'c000', group: 'Emergency', name: 'Police / Fire / Ambulance', phone: '000', note: 'Life-threatening emergencies only. 112 also works from mobiles.' },
      { id: 'cpal', group: 'Emergency', name: 'Police Assistance Line', phone: '131444', note: 'Non-urgent police matters.' },
      { id: 'cpoi', group: 'Emergency', name: 'Poisons Information', phone: '131126', note: '24/7.' },
      { id: 'ccyb', group: 'Cyber & scams', name: 'Australian Cyber Security Hotline', phone: '1300292371', note: '1300 CYBER1, 24/7. Also report at cyber.gov.au/report.' },
      { id: 'cnsh', group: 'Cyber & scams', name: 'National Security Hotline', phone: '1800123400', note: 'Suspicious activity related to national security.' },
      { id: 'cf1', group: 'Family', name: 'Parent 1', phone: '', note: 'Mobile; work number in notes.' },
      { id: 'cf2', group: 'Family', name: 'Parent 2', phone: '', note: '' },
      { id: 'cf3', group: 'Family', name: 'Family member 3', phone: '', note: '' },
      { id: 'crel', group: 'Family', name: 'Out-of-area relay contact', phone: '', note: 'Everyone reports to this person if local networks are congested.' },
      { id: 'cnb1', group: 'Neighbours', name: 'Neighbour', phone: '', note: 'Spare key holder / check on each other.' },
      { id: 'cgp', group: 'Health', name: 'GP / medical centre', phone: '', note: '' },
      { id: 'cphm', group: 'Health', name: 'Pharmacy', phone: '', note: 'Note repeat prescriptions held.' }
    ],
    scenarios: [
      { id: 'power', title: 'Power outage', checklists: ['first30', 'power', 'payments'], procedures: ['checkin', 'verify', 'food', 'generator'] },
      { id: 'water', title: 'Water outage or unsafe water', checklists: ['first30', 'water'], procedures: ['checkin', 'verify'] },
      { id: 'telco', title: 'Phone / internet outage', checklists: ['first30', 'telco', 'payments'], procedures: ['checkin', 'verify'] },
      { id: 'multi', title: 'Multiple services down', checklists: ['first30', 'power', 'water', 'telco', 'payments', 'scam'], procedures: ['checkin', 'verify', 'food', 'generator', 'leave'] },
      { id: 'scam', title: 'Scam / disinformation wave', checklists: ['scam'], procedures: ['verify'] }
    ],
    checklists: [
      { id: 'first30', title: 'First 30 minutes', desc: 'Any suspected critical-infrastructure incident.', items: [
        { id: 'a1', t: 'Confirm everyone is safe. Call 000 only for life-threatening emergencies.' },
        { id: 'a2', t: 'Check whether neighbours are affected (is it just us, or the street?).' },
        { id: 'a3', t: 'Switch on battery/car radio for official information.' },
        { id: 'a4', t: 'Send ONE short SMS check-in to the family (SMS often works when calls and data fail).' },
        { id: 'a5', t: 'Switch phones to low-power mode; reduce screen brightness.' },
        { id: 'a6', t: 'Do not click links or call numbers from unexpected messages — use numbers in this app.' },
        { id: 'a7', t: 'Note the time and what you observed in the incident log.' },
        { id: 'a8', t: 'Agree who is coordinating (default: Parent 1).' }
      ]},
      { id: 'power', title: 'Extended power outage', desc: 'Grid outage longer than an hour.', items: [
        { id: 'p1', t: 'Report or check the outage with the electricity distributor (number in Contacts).' },
        { id: 'p2', t: 'Turn off and unplug sensitive appliances; leave one light switched on to show when power returns.' },
        { id: 'p3', t: 'Keep fridge and freezer closed.' },
        { id: 'p4', t: 'Check on anyone dependent on powered medical equipment; activate their backup plan.' },
        { id: 'p5', t: 'Charge phones from power banks or the car (engine running, outdoors only).' },
        { id: 'p6', t: 'Use torches, not candles, where possible.' },
        { id: 'p7', t: 'If using a generator, follow the Generator safety procedure.' },
        { id: 'p8', t: 'Check on neighbours, especially elderly or isolated people.' }
      ]},
      { id: 'water', title: 'Water outage or unsafe water', desc: 'Supply loss, or a boil-water / do-not-drink notice.', items: [
        { id: 'w1', t: 'Confirm any notice through the water utility or official radio — not social media alone.' },
        { id: 'w2', t: 'Boil-water notice: bring water to a rolling boil before drinking, cooking, brushing teeth or making ice.' },
        { id: 'w3', t: 'Do-not-drink notice: boiling does NOT make it safe — use stored or bottled water only.' },
        { id: 'w4', t: 'Use stored water for drinking first; keep other water for hygiene and flushing.' },
        { id: 'w5', t: 'Fill clean containers and the bath while supply runs (if water is safe); never leave young children near a filled bath.' },
        { id: 'w6', t: 'Discard ice and drinks made with tap water after the notice time.' },
        { id: 'w7', t: 'Check on infants, elderly and pets — they are most affected.' }
      ]},
      { id: 'telco', title: 'Phone and internet outage', desc: 'Mobile, NBN or data networks disrupted.', items: [
        { id: 't1', t: 'Try SMS before calls; try calls before data apps.' },
        { id: 't2', t: 'Try 000 even with no signal on your own network — emergency calls can use other networks.' },
        { id: 't3', t: 'Use the out-of-area relay contact if local lines are congested.' },
        { id: 't4', t: 'If no contact at all: go to the active meeting point at the agreed check-in time.' },
        { id: 't5', t: 'Leave a written note at home saying where you have gone and when.' },
        { id: 't6', t: 'Keep radio on for updates; do not rely on social media.' }
      ]},
      { id: 'payments', title: 'Payments, fuel and supplies', desc: 'EFTPOS, ATMs or fuel pumps unavailable.', items: [
        { id: 'f1', t: 'Use emergency cash reserve sparingly (small notes and coins).' },
        { id: 'f2', t: 'Check fuel level; do not drive unnecessarily.' },
        { id: 'f3', t: 'Check medication supply for every family member (aim for 14 days).' },
        { id: 'f4', t: 'Inventory food and water; plan meals using fridge food first, then freezer, then pantry.' },
        { id: 'f5', t: 'Avoid panic buying; share with neighbours where you can.' }
      ]},
      { id: 'scam', title: 'Scams and disinformation', desc: 'Criminals exploit incidents with fake messages.', items: [
        { id: 's1', t: 'Treat any message asking for payment, login or personal details as a scam.' },
        { id: 's2', t: 'Utilities and government will not ask you to click a link to "restore service".' },
        { id: 's3', t: 'Verify by calling the number in this app — never a number given in the message.' },
        { id: 's4', t: 'Family requests for money or urgent help: confirm by calling back on a known number.' },
        { id: 's5', t: 'Only accept plan updates that this app shows as Verified.' },
        { id: 's6', t: 'Report scams: Cyber Security Hotline 1300 CYBER1, or Scamwatch when online.' }
      ]},
      { id: 'recovery', title: 'Recovery and stand-down', desc: 'After services are restored.', items: [
        { id: 'r1', t: 'Confirm restoration through official channels.' },
        { id: 'r2', t: 'Check fridge/freezer food — when in doubt, throw it out.' },
        { id: 'r3', t: 'Run taps after a water incident as advised by the water utility.' },
        { id: 'r4', t: 'Check bank accounts for unusual transactions.' },
        { id: 'r5', t: 'Replace used supplies, cash and batteries.' },
        { id: 'r6', t: 'Family debrief: what worked, what to change. Coordinator publishes plan update.' }
      ]},
      { id: 'ready', title: 'Quarterly readiness check', desc: 'Do this every three months.', items: [
        { id: 'q1', t: 'Water: at least 3 days of drinking water for every person and pet.' },
        { id: 'q2', t: 'Food: 3+ days of non-perishable food; manual can opener.' },
        { id: 'q3', t: 'Battery/crank radio, torches, spare batteries tested.' },
        { id: 'q4', t: 'Power banks charged; car charger in each car.' },
        { id: 'q5', t: 'Cash reserve in small notes.' },
        { id: 'q6', t: 'First aid kit and medication supply checked.' },
        { id: 'q7', t: 'Printed copy of this plan in the go-kit (use Print in the app).' },
        { id: 'q8', t: 'Every family member has the app installed and on the latest plan version.' },
        { id: 'q9', t: 'Practise one scenario with the family.' }
      ]}
    ],
    procedures: [
      { id: 'checkin', title: 'Family check-in and reunification', summary: 'How we find each other when networks are unreliable.', steps: [
        'Send a short SMS to the family group: name, location, status (OK / need help), time.',
        'If no reply within 30 minutes, SMS the out-of-area relay contact instead.',
        'Check in again on the hour, every hour, until the coordinator stands down.',
        'If there is no contact at all for 2 hours, go to the active meeting point.',
        'Children at school stay with the school until collected by a listed adult.',
        'Leave a dated note at home if you leave.'
      ]},
      { id: 'verify', title: 'Verifying information', summary: 'Assume false information spreads faster than true information.', steps: [
        'Primary sources: ABC emergency broadcasts, the utility\'s own number, and the state emergency warnings service (see Official sources procedure).',
        'Ignore instructions received by unexpected SMS, email, social media or phone calls.',
        'Call back using numbers stored in this app.',
        'Plan updates only count if this app shows them as Verified with our coordinator\'s fingerprint.',
        'When unsure, wait and verify — very few cyber incidents require immediate action at home.'
      ]},
      { id: 'food', title: 'Food safety during a power outage', summary: 'General guidance; follow official advice where issued.', steps: [
        'Keep fridge and freezer doors closed.',
        'A closed fridge generally keeps food cold for about 4 hours.',
        'A full, closed freezer generally holds for about 48 hours (about 24 hours if half full).',
        'Discard perishable food (meat, dairy, leftovers) that has been above 5°C for more than 4 hours.',
        'When in doubt, throw it out.'
      ]},
      { id: 'generator', title: 'Generator safety', summary: 'Carbon monoxide is odourless and lethal.', steps: [
        'Never run a generator indoors, in a garage or carport, or near windows and vents.',
        'Never connect a generator to the house wiring unless a licensed electrician has installed a changeover switch.',
        'Use heavy-duty extension leads rated for the load.',
        'Let the generator cool before refuelling; store fuel away from the house.'
      ]},
      { id: 'leave', title: 'Deciding to leave home', summary: 'For outages, stay home unless it becomes unsafe. For bushfire, flood or tsunami, leave early on your trigger — do not wait to be told.', steps: [
        'Leave if authorities advise it, or if home becomes unsafe (no water for days, extreme heat with no power, medical need).',
        'Agree destination (out-of-area meeting point) and route before leaving.',
        'Take the go-kit, medications, documents, chargers, cash and pets.',
        'SMS the family and relay contact with destination and expected arrival time.',
        'If leaving for more than a day and it is safe, turn off power, gas (meter or cylinder) and water.'
      ]},
      { id: 'updates', title: 'How plan updates work', summary: 'For every family member.', steps: [
        'Only the coordinator can create updates; they are digitally signed.',
        'Full plans arrive as an email or MMS attachment; small updates arrive as an SMS code starting FCR1.',
        'Android: share the SMS or file to this app. iPhone: copy the SMS text, open the app, Update tab, Paste.',
        'The app checks the signature and shows what will change before you accept.',
        'If the app says an update is NOT verified, delete it and tell the coordinator by phone.'
      ]}
    ],
    notices: []
  };
})(typeof window !== 'undefined' ? window : globalThis);
