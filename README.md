# Family Cyber Ready

An offline Progressive Web App (PWA) family emergency plan for all hazards — critical-infrastructure cyber incidents and total communications blackout, bushfire, flood, storm, cyclone (QLD, WA, NT), heatwave, house fire, earthquake, tsunami, shelter-in-place, pandemic and medical emergencies. It records who does what, where supplies are kept, and when equipment must be checked or replaced. One codebase installs on Android and iPhone from the browser.

**For households in Australia only.** Emergency numbers, warning systems, utilities and postcode detection cover the eight Australian states and territories; the app is not designed for use elsewhere.

## Contents

| File | Purpose |
|---|---|
| `index.html`, `app.js`, `styles.css` | Family member app: Now (incident mode, notices, meeting points, incident log), Checklists, Contacts, Procedures, Update |
| `coordinator.html`, `coordinator.js` | Coordinator console: signing-key custody, plan editor, full-plan and SMS quick-update signing, key rotation |
| `trust.js` | Trust anchor for single-family hardened forks (empty on the public site) |
| `fcr-core.js` | Shared envelope format, ECDSA verification, update operations |
| `starter-plan.js` | Starter plan: national contacts, infrastructure checklists, procedures |
| `starter-hazards.js` | All-hazards pack: family roles, supply locations, supplies & maintenance register, hazard checklists, blackout protocol, warning levels |
| `regions.js` | State/territory pack (all 8 jurisdictions), offline postcode detection, region validation |
| `fonts/` | Atkinson Hyperlegible Next (SIL Open Font License, `fonts/OFL.txt`), self-hosted for offline use |
| `img/` | Optional illustrations (hero), cached when present |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline cache, install metadata, Android share target |

## 1. Deploy (one time)

The app must be served once over HTTPS; thereafter it runs with no network.

1. Create a GitHub repository (public or private with Pages enabled) and upload all files keeping the folder structure.
2. Settings → Pages → deploy from the `main` branch, root folder.
3. Open `https://<user>.github.io/<repo>/` on each phone.
   - **iPhone:** Safari → Share → *Add to Home Screen*. Always open the home-screen icon; it keeps its own storage, separate from Safari.
   - **Android:** Chrome → *Install app*. The installed app appears in the Share sheet for SMS text and attachments.

Any static HTTPS host works (Cloudflare Pages, Netlify, an internal web server). No server-side code or database is used.

This public deployment serves any family: each coordinator creates their own key in `coordinator.html`, and each phone trusts only the key it was first enrolled with (confirmed by a voice-read fingerprint). Families cannot affect one another.

Optional hardening (single-family forks only): list the coordinator fingerprint(s) in `trust.js`, e.g. `window.FCR_TRUST = { fingerprints: ['A1B2-C3D4-E5F6-0718'] };`. Phones from that deployment then refuse any other key at first install and auto-confirm the listed key. After a key rotation, add the new fingerprint (keep the old one until all phones have rotated). Do not set this on a shared public deployment — it would lock out every other family.

## 2. Coordinator set-up

1. Open `coordinator.html` on one trusted device. Create the signing key with a strong passphrase.
2. **Download the encrypted key backup** and store it offline (e.g. USB in the go-kit, plus a second location).
3. Load the starter plan and complete **Region set-up** (see section 2a). Replace placeholders (family names and mobiles, address, meeting points), then *Sign & publish*.
4. Send the `.fcr` file to each family member by email or MMS attachment.
5. On each phone: Update → choose the file (or share it to the app on Android). Read the fingerprint aloud to each family member; they tick the confirmation box and apply. This is the only moment trust is established.

## 2a. Region set-up (state or territory)

Publishing is blocked until the household's state or territory is defined.

1. Enter the household postcode. The state is detected offline from Australia Post postcode ranges.
2. Confirm or select the state or territory. A postcode that does not belong to the selected state is refused.
3. Select the electricity distributor (shown at the top of the power bill), water utility and mains gas network from that state's list, or choose *Other* and enter the details.
4. *Apply region to draft plan*. This adds the state SES, fire/emergency information line, state health line (VIC, QLD), the national 1800MEDICARE nurse line, the chosen utilities, the ABC emergency broadcaster, and an *Official information sources* procedure for that state. Family contacts are not changed.

The region is sealed inside the signed plan. Family phones show it in the header and on the Now screen as *confirmed in the signed plan*, and they reject any plan or update — even a correctly signed one — that removes the region or sets an invalid state code. The demo mode on a new phone also asks for postcode and state.

**Stated assumptions:**
- Cross-border postcodes are flagged for manual choice: 2540, 2611, 2618, 2620, 3644, 3691, 3707, 4383, 4385 and 0872. This list is based on general knowledge of border localities and was not tested against an authoritative dataset; any other postcode is mapped by its Australia Post range.
- Items marked *Confirm this number with the provider* (Logan and Townsville water, Allgas in Queensland, and any *Other* entry) could only be confirmed from secondary sources.

## 2b. Roles, supplies and maintenance

- **Roles:** eight roles (Incident coordinator, Deputy, Communications & check-ins, Care lead, Supplies & equipment lead, Home & utilities lead, Pets & animals, Grab bag & documents) are assigned to family members in `members`. Checklist items carry a `role`. Each phone asks "Who is using this phone?" and then shows that person's duties and, in incident mode, **Your tasks now**. Reassign roles with the *Assign family roles* quick update.
- **Supplies register (Kit tab):** 29 items with location, quantity, check interval (months), replacement rule, responsible role, last-checked and expiry dates. Items show OK, Due (within 30 days, expiry within 60 days, or never checked) or Overdue. *Checked* records a check on that phone; the coordinator records it for everyone with the *Record an equipment / supplies check* quick update.
- **Key intervals (sources in `starter-hazards.js`):** smoke alarms tested monthly, vacuumed 6-monthly, replaced at 10 years; stored water and food checked each season, water replaced within 12 months; torches and batteries 6-monthly; first aid kit yearly and after use; whole kit review twice a year; plan review yearly; home fire escape practised twice a year. Extinguisher checks, power-bank top-ups, generator test runs and petrol rotation have no official Australian household figure and are marked *assumption* in the app.

## 3. Operating during an incident

| Change | Channel | Coordinator action |
|---|---|---|
| Broadcast notice (info / warn / urgent) | SMS | Quick update → Notice |
| Change a contact number | SMS | Quick update → Contact phone |
| Change active meeting point | SMS | Quick update → Meeting point |
| Record an equipment check | SMS | Quick update → Equipment / supplies check |
| Reassign roles | SMS | Quick update → Assign family roles |
| Larger edits | Email / MMS attachment | Edit JSON → Sign & publish full plan |

Quick updates are typically 240–280 characters (2 SMS segments). A full all-hazards plan is about 17 KB and is sent as an attachment.

Family members: iPhone — copy the SMS, open the app, Update → Paste → Check and preview → Apply. Android — share the message to *Family Ready*.

Any family member can re-share the signed plan (Update → *Share signed plan*) over AirDrop, Bluetooth or email; the receiving phone verifies the same signature.

## 4. Security model

- Every message is signed with ECDSA P-256 / SHA-256 by the coordinator's key. Messages are bound to the plan ID and carry a monotonic version number.
- Family apps pin the coordinator key at first install (trust on first use, confirmed by a voice-read fingerprint, or pre-set in `trust.js` for single-family forks).
- Rejected automatically: altered messages, messages signed by any other key, messages for another plan, replays of older versions. Updates that arrive out of order are held until the gap is filled.
- The private key is stored only on the coordinator device, encrypted with PBKDF2-SHA256 (310,000 iterations) and AES-256-GCM, and is held unlocked only in memory.
- Key rotation is signed by the old key and accepted automatically by family apps.
- A strict Content Security Policy prevents script injection; all plan text is escaped on display.

Residual risks (accepted by design): compromise of the coordinator device while unlocked; social engineering of a family member during first enrolment; loss of both coordinator device and key backup (requires re-enrolment of every phone).

## 5. Known platform limitations

- iOS does not support web-app share targets; iPhone users paste text or pick a saved attachment.
- iOS may clear website data for sites not added to the home screen. Installed home-screen apps are not subject to this; the app also requests persistent storage.
- Phone calls and SMS from the app use the cellular network, so they function without internet where the network is available.
- Plan updates require the coordinator's device to function; nominate and equip a deputy coordinator with the key backup and passphrase.

## 6. Maintenance

- When changing app files, bump `VERSION` in `sw.js` so devices refresh the cached app on next online launch.
- Review public numbers annually and after any change of utility provider. Region data is in `regions.js` (data date 4 Nov 2026).
- Note: the national nurse advice line changed from healthdirect (1800 022 222) to 1800MEDICARE (1800 633 422) on 1 January 2026; Victoria retains NURSE-ON-CALL and Queensland 13 HEALTH.
- Use the *Quarterly readiness check* checklist, and conduct one scenario exercise per quarter.

## 7. Verification performed (4 Nov 2026)

v1.3 all-hazards proof (21 checks): QLD plan includes cyclone and NSW excludes it; all hazard scenarios present; 8 roles, 3 members, 8 locations, 29 supplies; unknown role reference rejected; full plan ~17 KB; role and equipment-check quick updates fit 2 SMS; Kit tab groups items by location with intervals; unchecked items flagged due; phone-level check recorded; maintenance banner on Now; phone user sees own roles and duties; signed role reassignment and equipment check applied; 3-month item checked in January shown overdue; incident mode lists the person's own tasks; hazard checklists show Before/During/After with owners; blackout protocol present; printout includes roles and maintenance schedule.


Region proof (16 checks): publish blocked without region; postcodes 2570→NSW, 3000→VIC, 6000→WA detected; 2620 flagged as cross-border; postcode/state mismatch refused; NSW distributor list offered; NSW pack applied with correct numbers; family contacts preserved; enrolment preview, header and Now screen show the signed region; coordinator refuses an update removing the region; family phones reject a signed update setting an invalid state and a signed plan with no region; WA demo loads WA numbers. A separate unit check built and validated the pack for all eight jurisdictions.


Original security suite (re-run, all passing), including: enrolment fingerprint match; apply blocked until fingerprint confirmed; email-wrapped codes parsed; out-of-order updates held then applied in sequence; replay skipped; single-character tampering rejected; attacker-key forgery rejected (000 number unchanged); foreign-key plan rejected; offline reload with checklist state retained; key rotation followed by new-key update; signed backup restored on a third device; wrong coordinator passphrase refused. Not yet tested on physical iOS/Android hardware.

An independent content review against Australian official guidance was carried out before release; 25 findings were corrected (including flood electrical safety, a gas-leak and carbon-monoxide procedure, life-support registration, early-leave triggers, assisted evacuation, AusAlert alerts and the 106 text emergency number).

## 7a. Public-use notice

This app supports, and does not replace, official emergency advice. Contact data is reviewed annually (last checked 4 Nov 2026). No licence has been granted for reuse of the code yet; all rights are reserved until a licence file is added.

## 8. Region data sources (checked 4 Nov 2026)

SES 132 500 (all states); NSW RFS, VicEmergency, CFS SA, DFES WA, TFS, ACT ESA; Ausgrid, Endeavour, Essential, CitiPower, Powercor, Jemena, United Energy, AusNet, Energex, Ergon, SA Power Networks, Western Power, Horizon Power, TasNetworks, Evoenergy, Power and Water; Sydney Water, Hunter Water, Central Coast Council, GWW, Yarra Valley Water, South East Water, Barwon, Central Highlands, Coliban, Goulburn Valley, Urban Utilities, Unitywater, City of Gold Coast, Redland, SA Water, Water Corporation, Aqwest, Busselton Water, TasWater, Icon Water; Jemena Gas, AGIG/AGN, Multinet, AusNet gas, ATCO, Tas Gas Networks, Evoenergy gas; health.vic.gov.au (NURSE-ON-CALL), qld.gov.au (13 HEALTH), SA Health and WA Health (1800MEDICARE); qld.gov.au utilities contacts; securent.nt.gov.au.
