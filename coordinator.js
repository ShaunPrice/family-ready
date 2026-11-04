/* Family Cyber Ready — coordinator console (key custody, signing, publishing) */
(function () {
  'use strict';
  const CKEY = 'fcr.coord.v1';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nowS = () => Math.floor(Date.now() / 1000);
  let c = (() => { try { return JSON.parse(localStorage.getItem(CKEY)) || null; } catch (e) { return null; } })() || { sealed: null, pid: null, seq: 0, published: null, draft: '', history: [] };
  let priv = null;           // unlocked CryptoKey, memory only
  let fp = '', kid = '';
  let lastOut = null;
  const persist = () => localStorage.setItem(CKEY, JSON.stringify(c));

  async function refreshKeyInfo() {
    if (c.sealed) { fp = await FCR.fingerprint(c.sealed.pk); kid = await FCR.keyId(c.sealed.pk); }
    $('#hdr').innerHTML = c.sealed ? `v${c.seq}<br>${priv ? 'unlocked' : 'locked'}` : '';
    renderKey();
  }

  function renderKey() {
    const el = $('#keycard');
    if (!c.sealed) {
      el.innerHTML = `<h2>Signing key</h2><p>Create the family signing key. The passphrase protects it on this device and in backups — it is never sent anywhere.</p>
        <label class="field">Passphrase (at least 12 characters)</label><input type="password" id="pp1" autocomplete="new-password">
        <label class="field">Repeat passphrase</label><input type="password" id="pp2" autocomplete="new-password">
        <div class="row wrap" style="margin-top:10px"><button class="primary" data-act="genkey">Create signing key</button>
        <label class="btn">Restore from backup<input type="file" id="restore" accept=".json,.fcrkey,application/json" class="hidden"></label></div>`;
      return;
    }
    el.innerHTML = `<h2>Signing key</h2><p class="muted small">Family members must confirm this fingerprint by voice or in person when they first install the plan.</p>
      <div class="fp" id="fp">${esc(fp)}</div>
      <p class="small">Plan ID <span class="mono">${esc(c.pid)}</span> · Key ID <span class="mono">${esc(kid)}</span> · Next version <b>${c.seq + 1}</b></p>
      ${priv ? `<div class="banner ok">Unlocked for this session.</div>
        <div class="row wrap"><button data-act="lock">Lock</button><button data-act="backup">Download encrypted key backup</button><button class="danger" data-act="rotate">Rotate key…</button></div>`
      : `<label class="field">Passphrase</label><div class="row"><input type="password" id="pp" autocomplete="current-password" class="grow"><button class="primary" data-act="unlock">Unlock</button></div>`}`;
  }

  function requireUnlocked() { if (!priv) throw new Error('Unlock the signing key first.'); }
  function parseDraft() {
    let p;
    try { p = JSON.parse($('#draft').value); } catch (e) { throw new Error('Plan is not valid JSON: ' + e.message); }
    const problems = [];
    if (!Array.isArray(p.contacts)) problems.push('contacts must be a list');
    if (!Array.isArray(p.checklists)) problems.push('checklists must be a list');
    if (!Array.isArray(p.procedures)) problems.push('procedures must be a list');
    const ids = new Set();
    const chk = (arr, name) => (arr || []).forEach((x, i) => { if (!x.id) problems.push(`${name}[${i}] has no id`); else if (ids.has(name + x.id)) problems.push(`duplicate id ${x.id} in ${name}`); ids.add(name + x.id); });
    chk(p.contacts, 'contacts'); chk(p.checklists, 'checklists'); chk(p.procedures, 'procedures'); chk(p.scenarios, 'scenarios');
    (p.checklists || []).forEach((cl) => chk(cl.items, 'items:' + cl.id));
    (p.scenarios || []).forEach((s) => {
      (s.checklists || []).forEach((id) => { if (!(p.checklists || []).some((x) => x.id === id)) problems.push(`scenario ${s.id} refers to missing checklist ${id}`); });
      (s.procedures || []).forEach((id) => { if (!(p.procedures || []).some((x) => x.id === id)) problems.push(`scenario ${s.id} refers to missing procedure ${id}`); });
    });
    chk(p.members, 'members'); chk(p.roles, 'roles'); chk(p.locations, 'locations'); chk(p.supplies, 'supplies');
    const roleIds = new Set((p.roles || []).map((r) => r.id));
    const locIds = new Set((p.locations || []).map((l) => l.id));
    (p.members || []).forEach((m) => (m.roles || []).forEach((r) => { if (!roleIds.has(r)) problems.push(`member ${m.id} has unknown role ${r}`); }));
    (p.checklists || []).forEach((cl) => (cl.items || []).forEach((i) => { if (i.role && !roleIds.has(i.role)) problems.push(`item ${cl.id}/${i.id} has unknown role ${i.role}`); }));
    (p.supplies || []).forEach((s) => {
      if (s.loc && !locIds.has(s.loc)) problems.push(`supply ${s.id} has unknown location ${s.loc}`);
      if (s.role && !roleIds.has(s.role)) problems.push(`supply ${s.id} has unknown role ${s.role}`);
      if (s.check != null && s.check !== '' && !(Number(s.check) > 0)) problems.push(`supply ${s.id} check interval must be months > 0`);
      ['last', 'exp'].forEach((k) => { if (s[k] && !/^\d{4}-\d{2}-\d{2}$/.test(s[k])) problems.push(`supply ${s.id} ${k} must be YYYY-MM-DD`); });
    });
    const rErr = FCR_REGION.validate(p);
    if (rErr) problems.push(rErr);
    if (problems.length) throw new Error(problems.join('; '));
    return p;
  }
  function msg(text, ok) { $('#draftmsg').innerHTML = `<span style="color:var(--${ok ? 'ok' : 'urgent'})">${esc(text)}</span>`; }

  function renderQuickForm() { renderQuickForm0(); if ($('#qmem')) syncRoleBoxes(); }
  function renderQuickForm0() {
    const t = $('#qtype').value;
    const p = c.published;
    const f = $('#qform');
    if (!p && t !== 'raw') { f.innerHTML = '<p class="banner warn">Publish a full plan first.</p>'; return; }
    if (t === 'notice') f.innerHTML = `<label class="field">Level</label><select id="qlevel"><option value="info">Information</option><option value="warn">Warning</option><option value="urgent">Urgent</option></select>
      <label class="field">Message</label><textarea id="qtext" maxlength="600" placeholder="e.g. Power expected back 6pm. Stay home. Next check-in 4pm."></textarea>`;
    else if (t === 'phone') f.innerHTML = `<label class="field">Contact</label><select id="qcontact">${p.contacts.map((x) => `<option value="${esc(x.id)}">${esc(x.group)} — ${esc(x.name)}</option>`).join('')}</select>
      <label class="field">New number</label><input type="text" id="qphone" inputmode="tel" placeholder="04xx xxx xxx">`;
    else if (t === 'check') f.innerHTML = (p.supplies || []).length ? `<label class="field">Item checked</label><select id="qsup">${p.supplies.map((s) => `<option value="${esc(s.id)}">${esc(s.item)}${s.last ? ' (last ' + esc(s.last) + ')' : ''}</option>`).join('')}</select>
      <label class="field">Date checked</label><input type="text" id="qdate" value="${new Date().toISOString().slice(0, 10)}" placeholder="YYYY-MM-DD">
      <label class="field">New expiry date (optional, if replaced)</label><input type="text" id="qexp" placeholder="YYYY-MM-DD">` : '<p class="banner warn">The plan has no supplies yet.</p>';
    else if (t === 'roles') f.innerHTML = (p.members || []).length ? `<label class="field">Family member</label><select id="qmem">${p.members.map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('')}</select>
      <div id="qrolebox" style="margin-top:8px">${(p.roles || []).map((r) => `<label class="check"><input type="checkbox" class="qrole" value="${esc(r.id)}"><span class="txt">${esc(r.title)}</span></label>`).join('')}</div>` : '<p class="banner warn">The plan has no family members yet.</p>';
    else if (t === 'meet') f.innerHTML = `<label class="field">Active meeting point</label><select id="qmeet">${(p.household.meeting || []).map((m) => `<option value="${esc(m.id)}" ${m.id === p.household.activeMeeting ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>
      <label class="field">Optional notice</label><input type="text" id="qmeetnote" placeholder="e.g. Go to secondary meeting point by 3pm">`;
    else if (t === 'raw') f.innerHTML = `<label class="field">Operations (JSON list)</label><textarea class="code" id="qraw" style="min-height:120px" spellcheck="false">[["n","info","Test message"]]</textarea>
      <p class="small muted">["s","path","value"] set · ["d","path"] delete · ["a","path",{item with id}] add/replace · ["n","info|warn|urgent","text"] notice. Paths use ids, e.g. <span class="mono">contacts/cf1/phone</span>.</p>`;
  }

  function syncRoleBoxes() {
    const m = (c.published.members || []).find((x) => x.id === $('#qmem').value) || { roles: [] };
    document.querySelectorAll('.qrole').forEach((b) => { b.checked = (m.roles || []).includes(b.value); });
  }
  function buildOps() {
    const t = $('#qtype').value;
    if (t === 'notice') { const txt = $('#qtext').value.trim(); if (!txt) throw new Error('Enter a message.'); return [['n', $('#qlevel').value, txt]]; }
    if (t === 'phone') { const ph = $('#qphone').value.replace(/[^\d+]/g, ''); if (!ph) throw new Error('Enter a number.'); return [['s', `contacts/${$('#qcontact').value}/phone`, ph]]; }
    if (t === 'check') {
      const d = $('#qdate').value.trim(); const ex = $('#qexp').value.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error('Date checked must be YYYY-MM-DD.');
      if (ex && !/^\d{4}-\d{2}-\d{2}$/.test(ex)) throw new Error('Expiry must be YYYY-MM-DD.');
      const id = $('#qsup').value; const ops = [['s', `supplies/${id}/last`, d]]; if (ex) ops.push(['s', `supplies/${id}/exp`, ex]); return ops;
    }
    if (t === 'roles') { const roles = Array.from(document.querySelectorAll('.qrole:checked')).map((x) => x.value); return [['s', `members/${$('#qmem').value}/roles`, roles]]; }
    if (t === 'meet') { const ops = [['s', 'household/activeMeeting', $('#qmeet').value]]; const n = $('#qmeetnote').value.trim(); if (n) ops.push(['n', 'warn', n]); return ops; }
    const ops = JSON.parse($('#qraw').value); if (!Array.isArray(ops)) throw new Error('Operations must be a JSON list.'); return ops;
  }

  function showOut(env, type, label) {
    lastOut = { env, type, label };
    $('#outcard').classList.remove('hidden');
    $('#outtitle').textContent = label;
    $('#out').value = env;
    const segs = FCR.smsSegments(env);
    $('#outmeta').innerHTML = `${env.length.toLocaleString()} characters · ${segs} SMS segment${segs > 1 ? 's' : ''}${type === 'P' ? ' — send as a file attachment' : segs > 6 ? ' — consider email instead' : ''}`;
    $('#smslink').href = 'sms:?&body=' + encodeURIComponent(env);
    $('#smslink').classList.toggle('hidden', type === 'P' && env.length > 1500);
    $('#maillink').href = 'mailto:?subject=' + encodeURIComponent(`Family plan ${label}`) + '&body=' + encodeURIComponent(`Signed family plan update. Open the Family Ready app → Update → paste or share this message.\n\n${env}\n`);
    $('#outcard').scrollIntoView({ behavior: 'smooth' });
  }
  function fileName() { return lastOut.type === 'P' ? `family-plan-v${c.seq}.fcr` : `family-update-${c.seq}.fcr`; }

  function addHistory(type, summary, env) {
    c.history.unshift({ seq: c.seq, type, ts: nowS(), summary, env });
    c.history = c.history.slice(0, 100);
  }
  function renderHistory() {
    $('#history').innerHTML = c.history.length ? c.history.map((h, i) => `<div class="result ok"><b>v${h.seq} · ${esc({ P: 'Full plan', U: 'Quick update', K: 'Key rotation' }[h.type])}</b> · ${esc(new Date(h.ts * 1000).toLocaleString('en-AU'))}<br>${esc(h.summary)}
      <div><button class="small" data-act="reshow" data-i="${i}" style="min-height:34px;margin-top:4px">Show again</button></div></div>`).join('') : '<p class="muted">Nothing published yet.</p>';
  }

  // ---------------- region set-up ----------------
  function renderRegion() {
    let cur = null;
    try { cur = JSON.parse($('#draft').value).region || null; } catch (e) {}
    const sel = $('#rstate');
    sel.innerHTML = '<option value="">— Select state or territory —</option>' + FCR_REGION.order.map((k) => `<option value="${k}">${esc(FCR_REGION.states[k].name)} (${k})</option>`).join('');
    if (cur) { sel.value = cur.code; $('#rpost').value = cur.postcode || ''; }
    detectFromPostcode(false);
    renderProviders(cur);
    regionStatus(cur);
  }
  function detectFromPostcode(setSelect) {
    const pc = $('#rpost').value.trim();
    const out = $('#rdetect');
    if (!pc) { out.innerHTML = '<span class="muted">Enter the postcode to detect the state automatically (works offline).</span>'; return null; }
    const d = FCR_REGION.detect(pc);
    if (!d) { out.innerHTML = '<span style="color:var(--urgent)">Not a recognised Australian postcode.</span>'; return null; }
    const names = d.codes.map((k) => FCR_REGION.states[k].name);
    out.innerHTML = d.codes.length > 1
      ? `<span style="color:var(--warn)">Postcode ${esc(pc)} crosses a border (${esc(names.join(' / '))}). Select the correct one below.</span>`
      : `<span style="color:var(--ok)">Postcode ${esc(pc)} → ${esc(names[0])}</span>`;
    if (setSelect && (d.codes.length === 1 || !d.codes.includes($('#rstate').value))) { $('#rstate').value = d.codes[0]; renderProviders(null); }
    return d;
  }
  function provSelect(id, label, list, chosen, allowNone) {
    return `<label class="field" for="${id}">${label}</label><select id="${id}">
      ${allowNone ? '<option value="none">None / not connected</option>' : ''}
      ${list.map((x) => `<option value="${esc(x.id)}" ${chosen === x.id ? 'selected' : ''}>${esc(x.name)}${x.area ? ' — ' + esc(x.area) : ''}</option>`).join('')}
      <option value="other" ${chosen === 'other' ? 'selected' : ''}>Other (enter details)</option></select>
      <div id="${id}-other" class="row ${chosen === 'other' ? '' : 'hidden'}" style="margin-top:6px"><input type="text" id="${id}-on" placeholder="Name" class="grow"><input type="text" id="${id}-op" placeholder="Faults number" inputmode="tel" class="grow"></div>`;
  }
  function renderProviders(cur) {
    const code = $('#rstate').value;
    const box = $('#rproviders');
    if (!code) { box.innerHTML = ''; return; }
    const st = FCR_REGION.states[code];
    const c = cur && cur.code === code ? cur : {};
    box.innerHTML = provSelect('rpow', 'Electricity distributor (see top of power bill)', st.electricity, c.power || (st.electricity[0] || {}).id, false)
      + provSelect('rwat', 'Water utility', st.water, c.water || (st.water[0] || {}).id, false)
      + provSelect('rgas', 'Mains gas network', st.gas, c.gas || 'none', true);
  }
  function readOther(id) { return { name: ($('#' + id + '-on') || {}).value || '', phone: (($('#' + id + '-op') || {}).value || '').replace(/[^\d+]/g, '') }; }
  function regionStatus(r) {
    $('#rstatus').innerHTML = r ? `<div class="banner ok">Draft region: <b>${esc(r.name)}</b>${r.postcode ? ' · postcode ' + esc(r.postcode) : ''} · ${esc(r.summary || '')}</div>` : '<div class="banner warn">No region set yet — publishing is blocked until this is done.</div>';
  }
  function renderAll() { refreshKeyInfo(); renderQuickForm(); renderHistory(); }

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    try {
      switch (b.dataset.act) {
        case 'genkey': {
          const p1 = $('#pp1').value, p2 = $('#pp2').value;
          if (p1.length < 12) throw new Error('Use a passphrase of at least 12 characters.');
          if (p1 !== p2) throw new Error('Passphrases do not match.');
          const kp = await FCR.generateKeyPair();
          c.sealed = await FCR.sealKey(kp.jwk, kp.pk, p1);
          c.pid = c.pid || FCR.b64u(crypto.getRandomValues(new Uint8Array(9)));
          c.sealed.pid = c.pid;
          persist(); priv = await FCR.importPrivate(kp.jwk);
          if (!$('#draft').value.trim()) { $('#draft').value = JSON.stringify(window.FCR_STARTER, null, 2); c.draft = $('#draft').value; persist(); renderRegion(); }
          await refreshKeyInfo();
          alert('Signing key created. Download the encrypted backup now and store it safely (e.g. USB in the go-kit). Without it, a lost device means re-enrolling every family phone.');
          break;
        }
        case 'unlock': priv = await FCR.unsealKey(c.sealed, $('#pp').value); await refreshKeyInfo(); break;
        case 'lock': priv = null; await refreshKeyInfo(); break;
        case 'backup': download(JSON.stringify({ ...c.sealed, pid: c.pid, seq: c.seq }, null, 1), `family-signing-key-${kid}.fcrkey`, 'application/json'); break;
        case 'rotate': {
          requireUnlocked();
          const np = prompt('New passphrase for the new key (12+ characters):');
          if (!np || np.length < 12) throw new Error('Rotation cancelled — passphrase too short.');
          if (!confirm('Rotate key? Family apps will accept the change automatically because it is signed by the current key. Send the output to every family member.')) return;
          const kp = await FCR.generateKeyPair();
          c.seq += 1;
          const env = await FCR.sign('K', { v: 1, pid: c.pid, kid, seq: c.seq, ts: nowS(), npk: kp.pk }, priv);
          c.sealed = await FCR.sealKey(kp.jwk, kp.pk, np); c.sealed.pid = c.pid;
          priv = await FCR.importPrivate(kp.jwk);
          addHistory('K', 'New key ' + (await FCR.fingerprint(kp.pk)), env); persist();
          await refreshKeyInfo(); renderHistory(); showOut(env, 'K', `Key rotation v${c.seq}`);
          break;
        }
        case 'applyregion': {
          const code = $('#rstate').value;
          if (!code) throw new Error('Select the state or territory.');
          const pc = $('#rpost').value.trim();
          if (pc) { const d = FCR_REGION.detect(pc); if (!d) throw new Error('Postcode is not a recognised Australian postcode.'); if (!d.codes.includes(code)) throw new Error(`Postcode ${pc} is in ${d.codes.join('/')}, not ${code}. Correct the postcode or the state.`); }
          let p; try { p = JSON.parse($('#draft').value); } catch (err) { p = JSON.parse(JSON.stringify(window.FCR_STARTER)); }
          const sel = { code, postcode: pc, power: $('#rpow').value, water: $('#rwat').value, gas: $('#rgas').value, other: { power: readOther('rpow'), water: readOther('rwat'), gas: readOther('rgas') } };
          const np = FCR_REGION.apply(p, sel);
          $('#draft').value = JSON.stringify(np, null, 2); c.draft = $('#draft').value; persist();
          regionStatus(np.region); msg('Region applied to draft. Review, then sign & publish.', true);
          break;
        }
        case 'clearregion': {
          let p; try { p = JSON.parse($('#draft').value); } catch (err) { throw new Error('The draft plan is not valid JSON.'); }
          if (!p.region) { msg('The draft has no region set.', true); break; }
          if (!confirm('Remove the state, postcode and all state-specific contacts from the draft? Publishing stays blocked until a region is set again.')) break;
          const np = FCR_REGION.clear(p);
          $('#draft').value = JSON.stringify(np, null, 2); c.draft = $('#draft').value; persist();
          $('#rpost').value = ''; $('#rstate').value = ''; renderProviders(null); detectFromPostcode(false); regionStatus(null);
          msg('Region cleared from the draft. Apply a region before publishing.', true);
          break;
        }
        case 'starter':
          if ($('#draft').value.trim() && !confirm('Replace the current draft with the starter plan?')) return;
          $('#draft').value = JSON.stringify(window.FCR_STARTER, null, 2); c.draft = $('#draft').value; persist(); renderRegion(); msg('Starter plan loaded. Complete region set-up, then fill in your family details.', true); break;
        case 'format': { const p = parseDraft(); $('#draft').value = JSON.stringify(p, null, 2); c.draft = $('#draft').value; persist(); msg(`Valid: ${p.contacts.length} contacts, ${p.checklists.length} checklists, ${p.procedures.length} procedures.`, true); break; }
        case 'publish': {
          requireUnlocked();
          const p = parseDraft();
          p.notices = p.notices || [];
          c.seq += 1;
          const env = await FCR.sign('P', { v: 1, pid: c.pid, kid, pk: c.sealed.pk, seq: c.seq, ts: nowS(), plan: p }, priv);
          c.published = p; c.draft = JSON.stringify(p, null, 2); $('#draft').value = c.draft;
          addHistory('P', `${p.contacts.length} contacts, ${p.checklists.length} checklists`, env); persist();
          msg(`Published version ${c.seq}.`, true); renderAll(); showOut(env, 'P', `Full plan v${c.seq}`);
          break;
        }
        case 'quick': {
          requireUnlocked();
          if (!c.published) throw new Error('Publish a full plan first.');
          const ops = buildOps();
          const nextSeq = c.seq + 1; const ts = nowS();
          const r = FCR.applyOps(c.published, ops, { seq: nextSeq, ts }); // validates the ops before signing
          const rErr = FCR_REGION.validate(r.plan); if (rErr) throw new Error('Update refused: ' + rErr);
          const env = await FCR.sign('U', { v: 1, pid: c.pid, kid, seq: nextSeq, ts, ops }, priv);
          c.seq = nextSeq; c.published = r.plan;
          try { const d = JSON.parse($('#draft').value); c.draft = JSON.stringify(FCR.applyOps(d, ops, { seq: nextSeq, ts }).plan, null, 2); }
          catch (err) { c.draft = JSON.stringify(r.plan, null, 2); }
          $('#draft').value = c.draft;
          addHistory('U', r.changes.join('; '), env); persist();
          renderAll(); showOut(env, 'U', `Quick update v${c.seq}`);
          break;
        }
        case 'copy': await navigator.clipboard.writeText(lastOut.env); b.textContent = 'Copied'; setTimeout(() => (b.textContent = 'Copy'), 1500); break;
        case 'share': {
          const file = new File([lastOut.env + '\n'], fileName(), { type: 'text/plain' });
          if (lastOut.type === 'P' && navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: lastOut.label });
          else if (navigator.share) await navigator.share({ text: lastOut.env, title: lastOut.label });
          else throw new Error('Sharing is not supported here — use Copy or Save file.');
          break;
        }
        case 'savefile': download(lastOut.env + '\n', fileName(), 'text/plain'); break;
        case 'reshow': { const h = c.history[+b.dataset.i]; showOut(h.env, h.type, `${{ P: 'Full plan', U: 'Quick update', K: 'Key rotation' }[h.type]} v${h.seq}`); break; }
      }
    } catch (err) { if (err && err.name === 'AbortError') return; alert(err.message || String(err)); }
  });

  document.addEventListener('change', async (e) => {
    if (e.target.id === 'qtype') renderQuickForm();
    if (e.target.id === 'qmem') syncRoleBoxes();
    if (e.target.id === 'rstate') renderProviders(null);
    if (['rpow', 'rwat', 'rgas'].includes(e.target.id)) $('#' + e.target.id + '-other').classList.toggle('hidden', e.target.value !== 'other');
    if (e.target.id === 'restore' && e.target.files[0]) {
      try {
        const s = JSON.parse(await e.target.files[0].text());
        if (s.fcrKey !== 1 || !s.pk || !s.ct) throw new Error('Not a Family Ready key backup.');
        const pass = prompt('Passphrase for this backup:');
        priv = await FCR.unsealKey(s, pass || '');
        c.sealed = { fcrKey: 1, pk: s.pk, salt: s.salt, iv: s.iv, it: s.it, ct: s.ct, pid: s.pid };
        c.pid = s.pid; c.seq = Math.max(c.seq, s.seq || 0);
        persist(); renderAll();
        alert('Key restored. If the latest published version was higher than ' + c.seq + ', publish a full plan so versions move forward.');
      } catch (err) { alert(err.message); }
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'draft') { c.draft = e.target.value; persist(); }
    if (e.target.id === 'rpost') { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); if (e.target.value.length === 4) detectFromPostcode(true); else detectFromPostcode(false); }
  });

  function download(text, name, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  $('#draft').value = c.draft || '';
  renderAll(); renderRegion();
  window.__fcrCoord = { state: () => c };
})();
