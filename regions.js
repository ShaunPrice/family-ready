/* Family Cyber Ready — Australian state/territory region pack.
 * Numbers verified 4 Nov 2026 against agency, utility and government websites (see README "Region data sources").
 * Entries marked chk:true could only be confirmed from a secondary source — the app tells the user to confirm them.
 * Postcode ranges follow the Australia Post allocation (street ranges plus PO box / large-volume receiver ranges). */
(function (g) {
  'use strict';
  const NATIONAL_HEALTH = { name: '1800MEDICARE (nurse advice, formerly healthdirect)', phone: '1800633422', note: '24/7 registered nurses. Replaced the healthdirect line from 1 Jan 2026.' };

  const S = {
    NSW: {
      name: 'New South Wales', ses: '132500',
      fire: { name: 'NSW RFS Bush Fire Information Line', phone: '1800679737' },
      health: null,
      warnings: 'Hazards Near Me NSW app; rfs.nsw.gov.au; ses.nsw.gov.au',
      radio: 'ABC Radio Sydney 702 AM (or your local ABC station)',
      electricity: [
        { id: 'ausgrid', name: 'Ausgrid', area: 'Sydney east, north & inner; Central Coast; Hunter', phone: '131388' },
        { id: 'endeavour', name: 'Endeavour Energy', area: 'Greater Western Sydney, Blue Mountains, Southern Highlands, Illawarra, South Coast', phone: '131003' },
        { id: 'essential', name: 'Essential Energy', area: 'Regional and rural NSW', phone: '132080' }
      ],
      water: [
        { id: 'sydneywater', name: 'Sydney Water', area: 'Greater Sydney, Illawarra, Blue Mountains', phone: '132090' },
        { id: 'hunterwater', name: 'Hunter Water', area: 'Lower Hunter', phone: '1300657000' },
        { id: 'ccwater', name: 'Central Coast Council water', area: 'Central Coast', phone: '0243067900' }
      ],
      gas: [
        { id: 'jemena', name: 'Jemena Gas Networks', area: 'Sydney, Newcastle, Central Coast, Wollongong, parts of regional NSW', phone: '131909' },
        { id: 'agn', name: 'Australian Gas Networks', area: 'Southern regional NSW (Albury, Wagga Wagga, Cooma)', phone: '1800427532' },
        { id: 'evogas', name: 'Evoenergy gas', area: 'Queanbeyan, Goulburn, Yass, Nowra and nearby', phone: '131909' }
      ]
    },
    VIC: {
      name: 'Victoria', ses: '132500',
      fire: { name: 'VicEmergency Hotline', phone: '1800226226' },
      health: { name: 'NURSE-ON-CALL (Victoria)', phone: '1300606024', note: '24/7 registered nurse advice.' },
      warnings: 'VicEmergency app; emergency.vic.gov.au',
      radio: 'ABC Radio Melbourne 774 AM (or your local ABC station)',
      electricity: [
        { id: 'citipower', name: 'CitiPower', area: 'Melbourne CBD and inner suburbs', phone: '131280' },
        { id: 'powercor', name: 'Powercor', area: 'Western Victoria and Melbourne outer west', phone: '132412' },
        { id: 'jemenaelec', name: 'Jemena Electricity', area: 'Melbourne north-west', phone: '131626' },
        { id: 'unitedenergy', name: 'United Energy', area: 'Melbourne south-east, Mornington Peninsula', phone: '132099' },
        { id: 'ausnet', name: 'AusNet', area: 'Eastern and northern Victoria, Melbourne outer north and east', phone: '131799' }
      ],
      water: [
        { id: 'gww', name: 'Greater Western Water', area: 'Melbourne CBD, inner and western Melbourne', phone: '134499' },
        { id: 'yvw', name: 'Yarra Valley Water', area: 'Melbourne north and east', phone: '132762' },
        { id: 'sew', name: 'South East Water', area: 'Melbourne south-east, Mornington Peninsula', phone: '132812' },
        { id: 'barwon', name: 'Barwon Water', area: 'Geelong, Surf Coast, Bellarine, Colac', phone: '1300656007' },
        { id: 'chw', name: 'Central Highlands Water', area: 'Ballarat and Central Highlands', phone: '1800061514' },
        { id: 'coliban', name: 'Coliban Water', area: 'Bendigo and north-central Victoria', phone: '1300363200' },
        { id: 'gvw', name: 'Goulburn Valley Water', area: 'Shepparton, Goulburn Valley', phone: '1800454500' }
      ],
      gas: [
        { id: 'multinet', name: 'Multinet Gas', area: 'Inner and outer east Melbourne, Yarra Ranges, South Gippsland', phone: '132691' },
        { id: 'agn', name: 'Australian Gas Networks', area: 'North and south-east Melbourne, northern and eastern Victoria', phone: '1800427532' },
        { id: 'ausnetgas', name: 'AusNet gas', area: 'Central and western Victoria including Melbourne west', phone: '136707' }
      ]
    },
    QLD: {
      name: 'Queensland', ses: '132500',
      fire: null,
      health: { name: '13 HEALTH (Queensland)', phone: '13432584', note: '24/7 health advice.' },
      warnings: 'disaster.qld.gov.au current warnings; SES Assistance QLD app; getready.qld.gov.au',
      radio: 'ABC Radio Brisbane 612 AM (or your local ABC station)',
      electricity: [
        { id: 'energex', name: 'Energex', area: 'South East Queensland', phone: '136262', note: 'Fallen powerlines: 13 19 62.' },
        { id: 'ergon', name: 'Ergon Energy', area: 'Regional Queensland', phone: '132296', note: 'Fallen powerlines: 13 16 70.' }
      ],
      water: [
        { id: 'urbanutilities', name: 'Urban Utilities', area: 'Brisbane, Ipswich, Lockyer Valley, Scenic Rim, Somerset', phone: '132364' },
        { id: 'unitywater', name: 'Unitywater', area: 'Sunshine Coast, Moreton Bay', phone: '1300086489' },
        { id: 'goldcoast', name: 'City of Gold Coast water', area: 'Gold Coast', phone: '1300000928' },
        { id: 'redland', name: 'Redland City Council water', area: 'Redland City', phone: '0738298999' },
        { id: 'logan', name: 'Logan City Council water', area: 'Logan', phone: '0734123412', chk: true },
        { id: 'townsville', name: 'Townsville City Council', area: 'Townsville', phone: '134810', chk: true }
      ],
      gas: [
        { id: 'agn', name: 'Australian Gas Networks', area: 'Brisbane north of river, Ipswich, Gladstone, Rockhampton, Bundaberg, Hervey Bay', phone: '1800427532' },
        { id: 'allgas', name: 'Allgas / southern Brisbane & Gold Coast network', area: 'Southern Brisbane, Gold Coast, Toowoomba', phone: '1800427532', chk: true }
      ]
    },
    SA: {
      name: 'South Australia', ses: '132500',
      fire: { name: 'CFS Bushfire Information Hotline', phone: '1800362361' },
      health: null,
      warnings: 'Alert SA app; alert.sa.gov.au',
      radio: 'ABC Radio Adelaide 891 AM (or your local ABC station)',
      electricity: [{ id: 'sapn', name: 'SA Power Networks', area: 'All of South Australia', phone: '131366' }],
      water: [{ id: 'sawater', name: 'SA Water', area: 'All of South Australia', phone: '1300729283' }],
      gas: [{ id: 'agn', name: 'Australian Gas Networks', area: 'Adelaide and SA regional networks', phone: '1800427532' }]
    },
    WA: {
      name: 'Western Australia', ses: '132500',
      fire: { name: 'DFES Emergency Information Line', phone: '133337' },
      health: null,
      warnings: 'Emergency WA app; emergency.wa.gov.au',
      radio: 'ABC Radio Perth 102.5 FM (moved from 720 AM in 2026), or your local ABC station',
      electricity: [
        { id: 'westernpower', name: 'Western Power', area: 'Perth, Peel, South West, Wheatbelt, Goldfields (SWIS)', phone: '131351' },
        { id: 'horizon', name: 'Horizon Power', area: 'Regional and remote WA', phone: '132351' }
      ],
      water: [
        { id: 'watercorp', name: 'Water Corporation', area: 'Most of WA including Perth', phone: '131375' },
        { id: 'aqwest', name: 'Aqwest', area: 'Bunbury', phone: '0897809500' },
        { id: 'busselton', name: 'Busselton Water', area: 'Busselton', phone: '0897810500' }
      ],
      gas: [{ id: 'atco', name: 'ATCO Gas Australia', area: 'Perth, Mandurah, Bunbury, Geraldton, Kalgoorlie, Albany', phone: '131352' }]
    },
    TAS: {
      name: 'Tasmania', ses: '132500',
      fire: { name: 'TFS Information Line', phone: '1800000699' },
      health: null,
      warnings: 'TasALERT app; alert.tas.gov.au',
      radio: 'ABC Radio Hobart 936 AM (or your local ABC station)',
      electricity: [{ id: 'tasnetworks', name: 'TasNetworks', area: 'All of Tasmania', phone: '132004' }],
      water: [{ id: 'taswater', name: 'TasWater', area: 'All of Tasmania', phone: '136992' }],
      gas: [{ id: 'tasgas', name: 'Tas Gas Networks', area: 'Hobart, Launceston, north and north-west', phone: '1802111' }]
    },
    ACT: {
      name: 'Australian Capital Territory', ses: '132500',
      fire: { name: 'Access Canberra (ESA community information)', phone: '132281' },
      health: null,
      warnings: 'esa.act.gov.au; Hazards Near Me app',
      radio: 'ABC Radio Canberra 666 AM',
      electricity: [{ id: 'evoenergy', name: 'Evoenergy', area: 'Australian Capital Territory', phone: '131093' }],
      water: [{ id: 'iconwater', name: 'Icon Water', area: 'Canberra / ACT', phone: '0262483111' }],
      gas: [{ id: 'evogas', name: 'Evoenergy gas', area: 'ACT and Queanbeyan region', phone: '131909' }]
    },
    NT: {
      name: 'Northern Territory', ses: '132500',
      fire: null,
      health: null,
      warnings: 'SecureNT (securent.nt.gov.au)',
      radio: 'ABC Radio Darwin 105.7 FM (or your local ABC station)',
      electricity: [{ id: 'powerwater', name: 'Power and Water Corporation', area: 'All of the Northern Territory', phone: '1800245090' }],
      water: [{ id: 'powerwaterw', name: 'Power and Water Corporation (water)', area: 'All of the Northern Territory', phone: '1800245090' }],
      gas: [{ id: 'agn', name: 'Australian Gas Networks', area: 'Alice Springs', phone: '1800427532' }]
    }
  };
  const ORDER = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

  // Postcode → jurisdiction (Australia Post allocation).
  const RANGES = [
    [200, 299, 'ACT'], [800, 999, 'NT'],
    [1000, 1999, 'NSW'], [2000, 2599, 'NSW'], [2600, 2618, 'ACT'], [2619, 2899, 'NSW'], [2900, 2920, 'ACT'], [2921, 2999, 'NSW'],
    [3000, 3999, 'VIC'], [8000, 8999, 'VIC'],
    [4000, 4999, 'QLD'], [9000, 9999, 'QLD'],
    [5000, 5999, 'SA'], [6000, 6797, 'WA'], [6800, 6999, 'WA'], [7000, 7999, 'TAS']
  ];
  // Postcodes known to include localities on both sides of a border. The user must choose.
  const BORDER = { 2540: ['NSW', 'ACT'], 2611: ['ACT', 'NSW'], 2618: ['ACT', 'NSW'], 2620: ['NSW', 'ACT'], 3644: ['VIC', 'NSW'], 3691: ['VIC', 'NSW'], 3707: ['VIC', 'NSW'], 4383: ['QLD', 'NSW'], 4385: ['QLD', 'NSW'], 872: ['NT', 'SA', 'WA'] };

  function detect(pc) {
    const s = String(pc || '').trim();
    if (!/^\d{4}$/.test(s)) return null;
    const n = parseInt(s, 10);
    if (BORDER[n]) return { postcode: s, codes: BORDER[n].slice(), border: true };
    const r = RANGES.find((x) => n >= x[0] && n <= x[1]);
    return r ? { postcode: s, codes: [r[2]], border: false } : null;
  }

  function pick(list, id, other, label, allowNone) {
    if (allowNone && (id === 'none' || (!id && !list.length))) return null;
    if (id === 'other') {
      if (!other || !other.name || !other.phone) throw new Error(`Enter a name and number for the ${label}.`);
      return { id: 'other', name: other.name, phone: other.phone, area: 'Entered by coordinator', chk: true };
    }
    if (!id) return allowNone ? null : list[0];
    const f = list.find((x) => x.id === id);
    if (!f) throw new Error(`Unknown ${label} for this state.`);
    return f;
  }

  function apply(plan, sel) {
    const st = S[sel && sel.code];
    if (!st) throw new Error('Select a valid Australian state or territory.');
    if (sel.postcode) { const d = detect(sel.postcode); if (!d || !d.codes.includes(sel.code)) throw new Error(`Postcode ${sel.postcode} does not belong to ${sel.code}.`); }
    const o = sel.other || {};
    const power = pick(st.electricity, sel.power, o.power, 'electricity distributor', false);
    const water = pick(st.water, sel.water, o.water, 'water utility', false);
    const gas = pick(st.gas, sel.gas === undefined ? 'none' : sel.gas, o.gas, 'gas network', true);
    const p = JSON.parse(JSON.stringify(plan));
    const keep = (p.contacts || []).filter((c) => !String(c.id).startsWith('rg-'));
    const note = (x, base) => [base || '', x.note || '', x.chk ? 'Confirm this number with the provider.' : ''].filter(Boolean).join(' ');
    const rEmergency = [{ id: 'rg-ses', group: 'Emergency', name: `${st.name} SES (flood, storm)`, phone: st.ses, note: 'Trees down, storm/flood/cyclone damage.' }];
    if (st.fire) rEmergency.push({ id: 'rg-fire', group: 'Emergency', name: st.fire.name, phone: st.fire.phone, note: 'Information and warnings. Call 000 for an emergency.' });
    const rOther = [];
    if (st.health) rOther.push({ id: 'rg-health', group: 'Health', name: st.health.name, phone: st.health.phone, note: st.health.note || '' });
    rOther.push({ id: 'rg-medicare', group: 'Health', name: NATIONAL_HEALTH.name, phone: NATIONAL_HEALTH.phone, note: NATIONAL_HEALTH.note });
    rOther.push({ id: 'rg-power', group: 'Utilities', name: `${power.name} — power faults`, phone: power.phone, note: note(power, power.area) });
    rOther.push({ id: 'rg-water', group: 'Utilities', name: `${water.name} — water faults`, phone: water.phone, note: note(water, water.area) });
    if (gas) rOther.push({ id: 'rg-gas', group: 'Utilities', name: `${gas.name} — gas leaks`, phone: gas.phone, note: note(gas, 'Leave the area first, then call. ' + gas.area) });
    const firstNonEmergency = keep.findIndex((c) => c.group !== 'Emergency');
    const cut = firstNonEmergency < 0 ? keep.length : firstNonEmergency;
    p.contacts = keep.slice(0, cut).concat(rEmergency, keep.slice(cut), rOther);

    p.household = p.household || {};
    p.household.radio = `${st.radio} — battery or car radio`;
    p.procedures = (p.procedures || []).filter((x) => x.id !== 'official');
    p.procedures.splice(1, 0, { id: 'official', title: `Official information sources — ${st.name}`, summary: 'Where to check before acting on any message.', steps: [
      `Warnings: ${st.warnings}.`,
      `Radio: ${st.radio}. Keep a battery or car radio available.`,
      st.fire ? `Fire and emergency information: ${st.fire.name}.` : 'Fire and emergency information: the state warnings service above.',
      `Power faults: ${power.name}. Water faults: ${water.name}.${gas ? ' Gas leaks: ' + gas.name + '.' : ''}`,
      'Call 000 for any life-threatening emergency.'
    ] });
    (p.scenarios || []).forEach((s) => { s.procedures = s.procedures || []; if (!s.procedures.includes('official')) s.procedures.unshift('official'); });
    p.region = { code: sel.code, name: st.name, postcode: sel.postcode || '', power: power.id, water: water.id, gas: gas ? gas.id : 'none',
      summary: [power.name, water.name, gas ? gas.name : 'no mains gas'].join(' · '), dataDate: '2026-11-04' };
    return p;
  }

  function validate(plan) {
    const r = plan && plan.region;
    if (!r) return 'Region set-up has not been completed (no state or territory defined).';
    const st = S[r.code];
    if (!st) return `Region code ${r.code} is not an Australian state or territory.`;
    if (r.name !== st.name) return 'Region name does not match its state code.';
    if (r.postcode) { const d = detect(r.postcode); if (!d || !d.codes.includes(r.code)) return `Postcode ${r.postcode} does not belong to ${r.code}.`; }
    const ids = new Set((plan.contacts || []).map((c) => c.id));
    for (const need of ['rg-ses', 'rg-power', 'rg-water']) if (!ids.has(need)) return `Region contacts are incomplete (${need} missing) — re-apply region set-up.`;
    return null;
  }

  g.FCR_REGION = { states: S, order: ORDER, detect, apply, validate, national: { health: NATIONAL_HEALTH } };
})(typeof window !== 'undefined' ? window : globalThis);
