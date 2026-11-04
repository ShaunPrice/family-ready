/* Family Cyber Ready — family member app */
(function () {
  'use strict';
  // Hardening: trusted coordinator fingerprints come from trust.js (window.FCR_TRUST).
  const TRUSTED = ((window.FCR_TRUST && window.FCR_TRUST.fingerprints) || []).map((f) => String(f).trim().toUpperCase()).filter(Boolean);

  const SKEY = 'fcr.state.v1';
  const LKEY = 'fcr.local.v1';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('Could not save on this device: ' + e.message); return false; } };

  let state = load(SKEY, { pin: null, seq: 0, issued: 0, plan: null, log: [], pending: [], demo: false });
  let local = load(LKEY, { checks: {}, incident: null, journal: [], theme: '' });
  let deferredInstall = null;
  let staged = null;

  const plan = () => state.plan;
  const fmtDate = (ts) => ts ? new Date(ts * 1000).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const nowS = () => Math.floor(Date.now() / 1000);

  function fmtPhone(p) {
    const d = String(p || '').replace(/[^\d+]/g, '');
    if (/^(000|112)$/.test(d)) return d;
    if (/^13\d{4}$/.test(d)) return d.replace(/^(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3');
    if (/^1[38]00\d{6}$/.test(d)) return d.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
    if (/^04\d{8}$/.test(d)) return d.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
    if (/^0[2378]\d{8}$/.test(d)) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1 $2 $3');
    return p || '';
  }
  const telHref = (p) => 'tel:' + String(p).replace(/[^\d+]/g, '');
  const smsHref = (p) => 'sms:' + String(p).replace(/[^\d+]/g, '');
  const isMobile = (p) => /^(\+?61|0)4\d{8}$/.test(String(p).replace(/[^\d+]/g, ''));

  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'banner info'; t.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:9;box-shadow:0 6px 24px rgba(0,0,0,.25)'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('hidden'), 3800);
  }

  // ---------------- views ----------------
  const ICON = {
    call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  };

  function header() {
    const p = plan();
    $('#hdr-title').textContent = p ? p.title : 'Family Cyber Ready';
    const rc = p && p.region ? p.region.code + ' · ' : '';
    $('#hdr-ver').innerHTML = state.demo ? `${esc(rc)}DEMO<br>not verified` : (p ? `${esc(rc)}Version ${state.seq}<br>${esc(new Date(state.issued * 1000).toLocaleDateString('en-AU'))}` : '');
  }

  function viewOnboard() {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const I = {
      hazard: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>',
      people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
      phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
      kit: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 11v5M9.5 13.5h5"/>',
      seal: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"/><path d="m9 12 2 2 4-4"/>',
      lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
      pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'
    };
    const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
    const row = (k, t, d) => `<li>${svg(k)}<div><b>${t}</b><span>${d}</span></div></li>`;
    return `
      <section class="hero">
        <div class="where">${svg('pin')}For households in Australia only</div>
        <h1>Your family's emergency plan, on every phone.</h1>
        <p>Checklists, contacts and roles for every kind of emergency. Keeps working when the power, mobile network and internet are down.</p>
        <div class="actions">
          <a class="btn primary block" href="#update">Install my family plan</a>
          <a class="btn ghost block" href="coordinator.html">Create a plan for my family</a>
        </div>
      </section>
      <h2 class="section-h">What it covers</h2>
      <ul class="covers">
        ${row('hazard', 'Every emergency', 'Bushfire, flood, storm, cyclone, heatwave, house fire, earthquake, tsunami, pandemic and medical emergencies — and cyber attacks on power, water, phone and payment systems, including a total communications blackout.')}
        ${row('people', 'Who does what', 'Each family member sees their own role and tasks the moment something happens.')}
        ${row('phone', 'The right numbers', 'One tap to 000, your state SES and fire services, your power, water and gas faults lines, and family.')}
        ${row('kit', 'Supplies and equipment', 'Where everything is kept, and when each item needs checking or replacing.')}
        ${row('seal', 'Updates you can trust', 'Your family coordinator sends signed updates by email or SMS. Fake messages are rejected.')}
        ${row('lock', 'Private by design', 'No account and no tracking. Your plan is stored only on your family\'s phones.')}
      </ul>
      <div class="card"><h2>Getting started</h2>
        <p><b>Family member:</b> your coordinator sends you a signed plan file by email or MMS, or a code starting <span class="mono">FCR1</span>. Tap <i>Install my family plan</i>.</p>
        <p style="margin:0"><b>Coordinator:</b> one person creates the plan, sets your state and sends it to everyone.</p>
      </div>
      ${installCard(ios)}
      <div class="card"><h2>Look around first</h2><p class="muted">Open a sample plan for your state. It is not verified, and your family's signed plan replaces it.</p>
        <label class="field" for="dpost">Postcode</label><input type="text" id="dpost" inputmode="numeric" maxlength="4" placeholder="e.g. 2570">
        <div id="ddetect" class="small" style="margin-top:6px"></div>
        <label class="field" for="dstate">State or territory</label>
        <select id="dstate"><option value="">Select your state or territory</option>${FCR_REGION.order.map((k) => `<option value="${k}">${esc(FCR_REGION.states[k].name)}</option>`).join('')}</select>
        <button class="block" style="margin-top:12px" data-act="demo">Open sample plan</button></div>
      <p class="small muted" style="padding:0 4px">This app supports, and does not replace, official emergency advice. Always follow instructions from emergency services and utilities. Contact numbers checked 4 November 2026.</p>`;
  }
  function installCard(ios) {
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone) return '';
    if (ios) return `<div class="banner warn"><b class="t">Install on iPhone:</b> <span class="t">tap Share, then <b>Add to Home Screen</b>, and open the app from the home screen. The home-screen app keeps its own copy of the plan.</span></div>`;
    return `<div class="banner info"><b>Install on Android:</b> use the button below, or Chrome menu ⋮ → <b>Install app</b>.
      <div style="margin-top:8px"><button class="primary ${deferredInstall ? '' : 'hidden'}" data-act="install" id="installBtn">Install app</button></div></div>`;
  }

  function viewNow() {
    const p = plan(); if (!p) return viewOnboard();
    const h = p.household || {};
    const act = (h.meeting || []).find((m) => m.id === h.activeMeeting) || (h.meeting || [])[0];
    const notices = (p.notices || []).slice(0, 5).map((n) => `<div class="banner ${n.level === 'urgent' ? 'urgent' : n.level === 'warn' ? 'warn' : 'info'}"><div class="small">${esc(fmtDate(n.ts))} · ${esc(n.level.toUpperCase())}</div><div class="t">${esc(n.text)}</div></div>`).join('');
    const inc = local.incident;
    let incHtml;
    if (inc) {
      const sc = (p.scenarios || []).find((s) => s.id === inc.scenario) || { title: inc.scenario, checklists: [], procedures: [] };
      const lists = (sc.checklists || []).map((id) => p.checklists.find((c) => c.id === id)).filter(Boolean);
      const procs = (sc.procedures || []).map((id) => p.procedures.find((c) => c.id === id)).filter(Boolean);
      incHtml = `<div class="banner urgent"><div class="row"><div class="grow"><b>Incident mode: ${esc(sc.title)}</b><div class="small t">Started ${esc(new Date(inc.start).toLocaleString('en-AU', { timeStyle: 'short', dateStyle: 'short' }))} · <span id="elapsed">${elapsed(inc.start)}</span></div></div></div></div>
        <div class="card"><h2>Work through these checklists</h2>
          ${lists.map((c) => { const pr = progress(c); return `<a class="btn block" style="justify-content:space-between;margin:0 0 8px" href="#list/${esc(c.id)}"><span>${esc(c.title)}</span><span class="pill ${pr.done === pr.total ? 'ok' : ''}">${pr.done}/${pr.total}</span></a>`; }).join('')}
          ${procs.length ? `<h3 style="margin-top:12px">Procedures</h3>${procs.map((c) => `<a class="btn block" style="margin:0 0 8px;justify-content:flex-start" href="#procs/${esc(c.id)}">${esc(c.title)}</a>`).join('')}` : ''}
        </div>
        <div class="card"><h2>Incident log</h2><p class="muted small">Stays on this device. Record what happened and when.</p>
          <div class="row"><input type="text" id="jtext" placeholder="e.g. Power off whole street" class="grow"><button class="primary" data-act="jadd">Add</button></div>
          <ul class="list small" style="margin-top:8px">${(local.journal || []).slice().reverse().map((j) => `<li style="padding:6px 0;border-bottom:1px solid var(--line)"><b>${esc(new Date(j.ts).toLocaleTimeString('en-AU', { timeStyle: 'short' }))}</b> ${esc(j.text)}</li>`).join('')}</ul>
          <button class="danger block" style="margin-top:12px" data-act="endinc">Stand down incident</button></div>`;
    } else {
      incHtml = `<div class="card"><h2>Something has happened?</h2><p class="muted">Choose what is affected to start incident mode.</p>
        <div class="grid2">${(p.scenarios || []).map((s) => `<button class="scenario-btn" data-act="startinc" data-id="${esc(s.id)}">${esc(s.title)}</button>`).join('')}</div></div>`;
    }
    return `
      ${state.demo ? '<div class="banner warn"><b>Demo plan — not verified.</b> <span class="t">Install your family\'s signed plan from the Update tab.</span></div>' : ''}
      ${notices}
      ${maintBanner()}
      ${local.incident ? incHtml.replace('<div class="card"><h2>Work through', rolesCard(local.incident, (p.scenarios || []).find((s) => s.id === local.incident.scenario)) + '<div class="card"><h2>Work through') : incHtml + rolesCard(null, null)}
      <div class="card"><h2>Where we meet</h2>
        ${act ? `<p><span class="pill ok">ACTIVE</span> <b>${esc(act.name)}</b><br>${esc(act.detail)}</p>` : ''}
        ${(h.meeting || []).filter((m) => m !== act).map((m) => `<p class="muted"><b>${esc(m.name)}</b><br>${esc(m.detail)}</p>`).join('')}
      </div>
      <div class="card"><h2>Home</h2>
        ${p.region ? `<p><span class="pill ${state.demo ? 'warn' : 'ok'}">${esc(p.region.code)}</span> <b>${esc(p.region.name)}</b>${p.region.postcode ? ' · ' + esc(p.region.postcode) : ''}<br><span class="small muted">${state.demo ? 'Demo region — not verified' : 'Region confirmed in the signed plan'}${p.region.summary ? ' · ' + esc(p.region.summary) : ''}</span></p>` : '<div class="banner warn">This plan has no region set. Ask the coordinator to complete region set-up.</div>'}
        <p><b>${esc(h.name)}</b><br>${esc(h.address)}</p>
        ${h.radio ? `<p><b>Radio:</b> ${esc(h.radio)}</p>` : ''}
        ${h.notes ? `<p class="muted">${esc(h.notes)}</p>` : ''}
      </div>
      ${installCard(/iphone|ipad|ipod/i.test(navigator.userAgent))}
      <div class="card"><div class="row wrap">
        <button data-act="print">Print / save PDF</button>
        <button data-act="theme">Theme: ${esc(local.theme || 'auto')}</button>
        <button data-act="about">Plan &amp; security info</button>
      </div></div>`;
  }
  function maintBanner() {
    if (!(plan().supplies || []).length) return '';
    const sm = supplySummary();
    if (!sm.overdue && !sm.due) return '';
    return `<a class="banner ${sm.overdue ? 'urgent' : 'warn'}" href="#kit/due" style="display:block;text-decoration:none"><b>Supplies &amp; equipment:</b> <span class="t">${sm.overdue ? sm.overdue + ' overdue' : ''}${sm.overdue && sm.due ? ', ' : ''}${sm.due ? sm.due + ' due soon' : ''} — tap to review.</span></a>`;
  }
  function elapsed(start) {
    const m = Math.floor((Date.now() - start) / 60000);
    return m < 60 ? `${m} min elapsed` : `${Math.floor(m / 60)} h ${m % 60} min elapsed`;
  }

  function progress(c) {
    const ch = local.checks[c.id] || {};
    const total = (c.items || []).length;
    const done = (c.items || []).filter((i) => ch[i.id]).length;
    return { done, total };
  }

  // ---------------- roles ----------------
  const roleOf = (id) => ((plan().roles || []).find((r) => r.id === id) || { id, title: id, duties: [] });
  const membersFor = (rid) => (plan().members || []).filter((m) => (m.roles || []).includes(rid));
  const meMember = () => (plan().members || []).find((m) => m.id === local.me) || null;
  const myRoles = () => { const m = meMember(); return m ? (m.roles || []) : []; };
  const isMine = (item) => !!(item.role && myRoles().includes(item.role));
  function whoPill(item) {
    if (!item.role) return item.who ? ` <span class="pill">${esc(item.who)}</span>` : '';
    const names = membersFor(item.role).map((m) => m.name);
    return ` <span class="pill ${isMine(item) ? 'ok' : ''}">${isMine(item) ? 'YOU · ' : ''}${esc(roleOf(item.role).title)}${names.length && !isMine(item) ? ': ' + esc(names.join(', ')) : ''}</span>`;
  }

  // ---------------- supplies & maintenance ----------------
  const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const fmtD = (d) => d ? (d instanceof Date ? d : new Date(d + 'T00:00:00')).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  function addMonths(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setMonth(d.getMonth() + Number(n)); return d; }
  function supplyStatus(s) {
    const localLast = (local.supplyChecks || {})[s.id];
    const last = [s.last, localLast].filter(Boolean).sort().pop() || '';
    const now = new Date(); const why = []; let st = 'ok'; let next = null;
    const bump = (lvl) => { if (lvl === 'overdue' || (lvl === 'due' && st === 'ok')) st = lvl; };
    if (s.check) {
      if (!last) { bump('due'); why.push('Not yet checked'); }
      else { next = addMonths(last, s.check); const days = (next - now) / 864e5; if (days < 0) { bump('overdue'); why.push('Check overdue'); } else if (days <= 30) { bump('due'); why.push('Check due within 30 days'); } }
    }
    if (s.exp) { const days = (new Date(s.exp + 'T00:00:00') - now) / 864e5; if (days < 0) { bump('overdue'); why.push('Expired — replace'); } else if (days <= 60) { bump('due'); why.push('Expires within 60 days'); } }
    return { st, last, next, why, localOnly: !!(localLast && localLast > (s.last || '')) };
  }
  function supplySummary() {
    const out = { overdue: 0, due: 0, ok: 0 };
    (plan().supplies || []).forEach((s) => { out[supplyStatus(s).st]++; });
    return out;
  }
  const locOf = (id) => ((plan().locations || []).find((l) => l.id === id) || { id, name: id || 'Unassigned', detail: '' });

  function viewKit(filter) {
    const p = plan(); if (!p) return viewOnboard();
    const sup = p.supplies || [];
    if (!sup.length) return '<h1>Supplies &amp; equipment</h1><div class="card"><p class="muted">No supplies have been recorded in this plan yet. Ask the coordinator to add them.</p></div>';
    const sm = supplySummary();
    const show = (s) => filter !== 'due' || supplyStatus(s).st !== 'ok';
    const locs = (p.locations || []).concat([{ id: '', name: 'Other / unassigned', detail: '' }]);
    const body = locs.map((l) => {
      const items = sup.filter((s) => (s.loc || '') === l.id || (!l.id && !(p.locations || []).some((x) => x.id === s.loc))).filter(show);
      if (!items.length) return '';
      return `<div class="group-h">${esc(l.name)}</div>${l.detail ? `<p class="small muted" style="margin:-2px 2px 6px">${esc(l.detail)}</p>` : ''}<div class="card tight">${items.map((s) => {
        const ss = supplyStatus(s);
        return `<div class="contact" style="align-items:flex-start"><div class="grow">
          <div class="name">${esc(s.item)} ${ss.st !== 'ok' ? `<span class="pill ${ss.st === 'overdue' ? 'urgent' : 'warn'}">${ss.st === 'overdue' ? 'OVERDUE' : 'DUE'}</span>` : '<span class="pill ok">OK</span>'}</div>
          ${s.qty ? `<div class="small">Quantity: ${esc(s.qty)}</div>` : ''}
          <div class="small muted">${s.check ? `Check every ${esc(s.check)} month${s.check > 1 ? 's' : ''} · last ${esc(fmtD(ss.last))}${ss.localOnly ? ' (this phone)' : ''}${ss.next ? ' · next ' + esc(fmtD(ss.next)) : ''}` : 'No routine check'}${s.exp ? ` · expires ${esc(fmtD(s.exp))}` : ''}</div>
          ${s.replace ? `<div class="small"><b>Replace:</b> ${esc(s.replace)}</div>` : ''}
          ${s.note ? `<div class="small muted">${esc(s.note)}</div>` : ''}
          ${ss.why.length ? `<div class="small" style="color:var(--${ss.st === 'overdue' ? 'urgent' : 'warn'})">${esc(ss.why.join(' · '))}</div>` : ''}
          ${s.role ? `<div class="small">Responsible: ${esc(roleOf(s.role).title)}${membersFor(s.role).length ? ' — ' + esc(membersFor(s.role).map((m) => m.name).join(', ')) : ''}</div>` : ''}
        </div>${s.check ? `<button class="small" data-act="supchk" data-id="${esc(s.id)}" style="min-height:40px">Checked</button>` : ''}</div>`;
      }).join('')}</div>`;
    }).join('');
    return `<h1>Supplies &amp; equipment</h1>
      <div class="row wrap" style="margin-bottom:8px"><span class="pill urgent">${sm.overdue} overdue</span><span class="pill warn">${sm.due} due soon</span><span class="pill ok">${sm.ok} OK</span></div>
      <div class="row" style="margin-bottom:6px"><a class="btn grow ${filter !== 'due' ? 'primary' : ''}" href="#kit">All items</a><a class="btn grow ${filter === 'due' ? 'primary' : ''}" href="#kit/due">Needs attention</a></div>
      <p class="small muted">"Checked" records the check on this phone. The coordinator records it for everyone with a quick update.</p>
      ${body || '<div class="card"><p class="muted">Nothing needs attention.</p></div>'}`;
  }

  function rolesCard(inc, sc) {
    const p = plan();
    const members = p.members || [];
    if (!members.length) return '';
    const me = meMember();
    if (!me) return `<div class="card"><h2>Who is using this phone?</h2><p class="muted small">Your own tasks will be highlighted in every checklist.</p>
      <select id="meSel"><option value="">— Choose —</option>${members.map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('')}</select></div>`;
    const roles = (me.roles || []).map(roleOf);
    let tasks = '';
    if (inc && sc) {
      const mine = [];
      (sc.checklists || []).forEach((cid) => { const c = p.checklists.find((x) => x.id === cid); if (c) c.items.forEach((i) => { if (isMine(i)) mine.push({ c, i }); }); });
      tasks = mine.length ? `<h3 style="margin-top:10px">Your tasks now</h3><ul class="list">${mine.map(({ c, i }) => { const done = (local.checks[c.id] || {})[i.id]; return `<li><label class="check ${done ? 'done' : ''}"><input type="checkbox" data-chk="${esc(c.id)}" data-item="${esc(i.id)}" ${done ? 'checked' : ''}><span class="txt">${esc(i.t)} <span class="small muted">(${esc(c.title)})</span></span></label></li>`; }).join('')}</ul>` : '';
    }
    return `<div class="card"><div class="row"><h2 class="grow" style="margin:0">${esc(me.name)} — your role${roles.length > 1 ? 's' : ''}</h2><button class="small" data-act="notme" style="min-height:36px">Change</button></div>
      ${roles.length ? roles.map((r) => `<p style="margin-top:8px"><b>${esc(r.title)}</b>${r.duties && r.duties.length ? `</p><ul class="small" style="margin:0 0 6px;padding-left:20px">${r.duties.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '</p>'}`).join('') : '<p class="muted">No role assigned yet.</p>'}
      ${tasks}
      <details style="margin-top:8px"><summary class="small" style="cursor:pointer;min-height:32px">Who does what (whole family)</summary>
        <ul class="small" style="padding-left:18px">${(p.roles || []).map((r) => `<li><b>${esc(r.title)}:</b> ${esc(membersFor(r.id).map((m) => m.name).join(', ') || 'unassigned')}</li>`).join('')}</ul></details></div>`;
  }

  function viewLists(sub) {
    const p = plan(); if (!p) return viewOnboard();
    if (sub) {
      const c = p.checklists.find((x) => x.id === sub);
      if (c) {
        const ch = local.checks[c.id] || {}; const pr = progress(c);
        return `<a href="#lists" class="small">← All checklists</a>
          <div class="card" style="margin-top:8px"><h1>${esc(c.title)}</h1>${c.desc ? `<p class="muted">${esc(c.desc)}</p>` : ''}
            <div class="progress"><i style="width:${pr.total ? (pr.done / pr.total) * 100 : 0}%"></i></div><div class="small muted">${pr.done} of ${pr.total} done</div>
            <ul class="list" style="margin-top:6px">${c.items.map((i, n) => `${i.sec && (n === 0 || c.items[n - 1].sec !== i.sec) ? `<li class="group-h" style="margin:12px 0 0">${esc(i.sec)}</li>` : ''}<li><label class="check ${ch[i.id] ? 'done' : ''}"><input type="checkbox" data-chk="${esc(c.id)}" data-item="${esc(i.id)}" ${ch[i.id] ? 'checked' : ''}><span class="txt">${esc(i.t)}${whoPill(i)}</span></label></li>`).join('')}</ul>
            <button class="block" style="margin-top:10px" data-act="reset" data-id="${esc(c.id)}">Reset this checklist</button></div>`;
      }
    }
    return `<h1>Checklists</h1>${p.checklists.map((c) => { const pr = progress(c); return `<a class="card" href="#list/${esc(c.id)}" style="display:block;text-decoration:none;color:inherit">
      <div class="row"><div class="grow"><b>${esc(c.title)}</b><div class="small muted">${esc(c.desc || '')}</div></div><span class="pill ${pr.done === pr.total && pr.total ? 'ok' : ''}">${pr.done}/${pr.total}</span></div>
      <div class="progress"><i style="width:${pr.total ? (pr.done / pr.total) * 100 : 0}%"></i></div></a>`; }).join('')}`;
  }

  function viewContacts(q) {
    const p = plan(); if (!p) return viewOnboard();
    const query = (q || '').toLowerCase();
    const groups = {};
    p.contacts.filter((c) => !query || `${c.name} ${c.group} ${c.note} ${c.phone}`.toLowerCase().includes(query))
      .forEach((c) => { (groups[c.group || 'Other'] = groups[c.group || 'Other'] || []).push(c); });
    const body = Object.keys(groups).map((g) => `<div class="group-h">${esc(g)}</div><div class="card tight">${groups[g].map((c) => `
      <div class="contact"><div class="grow"><div class="name">${esc(c.name)}</div>
        <div class="num">${c.phone ? esc(fmtPhone(c.phone)) : '<span class="muted">No number yet</span>'}</div>
        ${c.alt ? `<div class="small">Alt: ${esc(fmtPhone(c.alt))}</div>` : ''}${c.note ? `<div class="small muted">${esc(c.note)}</div>` : ''}</div>
        ${c.phone && isMobile(c.phone) ? `<a class="btn iconbtn" href="${esc(smsHref(c.phone))}" aria-label="SMS ${esc(c.name)}">${ICON.sms}</a>` : ''}
        ${c.phone ? `<a class="btn iconbtn primary" href="${esc(telHref(c.phone))}" aria-label="Call ${esc(c.name)}">${ICON.call}</a>` : ''}
      </div>`).join('')}</div>`).join('');
    return `<h1>Contacts</h1><input type="search" id="csearch" placeholder="Search contacts" value="${esc(q || '')}" style="margin-bottom:6px">
      <p class="small muted">Calls and SMS use your phone network, not the internet.</p><div id="cbody">${body || '<p class="muted">No matches.</p>'}</div>`;
  }

  function viewProcs(open) {
    const p = plan(); if (!p) return viewOnboard();
    return `<h1>Procedures</h1>${p.procedures.map((x) => `<details class="proc" id="proc-${esc(x.id)}" ${open === x.id ? 'open' : ''}><summary>${esc(x.title)}</summary>
      ${x.summary ? `<p class="muted" style="padding:0 16px">${esc(x.summary)}</p>` : ''}<ol>${x.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></details>`).join('')}`;
  }

  function viewUpdate() {
    const enrolled = !!state.pin;
    const android = /android/i.test(navigator.userAgent);
    return `<h1>${enrolled ? 'Update plan' : 'Install family plan'}</h1>
      <div class="card"><h2>From an SMS or email text</h2>
        <p class="muted small">${android ? 'Tip: in Messages, long-press the code → Share → Family Ready.' : 'Copy the whole message (it starts with FCR1), then paste here.'}</p>
        <textarea id="utext" placeholder="Paste FCR1… code(s) here" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>
        <div class="row wrap" style="margin-top:8px">
          <button class="primary grow" data-act="checktext">Check and preview</button>
          ${navigator.clipboard && navigator.clipboard.readText ? '<button data-act="paste">Paste</button>' : ''}
        </div></div>
      <div class="card"><h2>From a file (email or MMS attachment)</h2>
        <p class="muted small">${android ? 'Open the attachment and share it to Family Ready, or pick it here.' : 'Save the attachment to Files, then choose it here.'}</p>
        <input type="file" id="ufile" accept=".fcr,.txt,text/plain,application/octet-stream">
      </div>
      ${state.pending && state.pending.length ? `<div class="banner warn">Waiting for ${state.pending.length} earlier update(s) before newer ones can be applied. Ask the coordinator to resend, or send a full plan.</div>` : ''}
      ${enrolled ? `<div class="card"><h2>Share with another family member</h2>
        <p class="muted small">Sends the signed plan and its updates. Their app checks the same signature, so this is safe over any channel (AirDrop, Bluetooth, email).</p>
        <div class="row wrap"><button data-act="sharebackup">Share signed plan</button><button data-act="dlbackup">Save backup file</button></div></div>` : ''}`;
  }

  function viewAbout() {
    const pin = state.pin;
    return `<h2>Plan &amp; security</h2>
      ${pin ? `<p>Trusted coordinator key fingerprint:</p><div class="fp">${esc(pin.fp)}</div>
        <p class="small">${TRUSTED.length ? (TRUSTED.includes(pin.fp) ? '<span class="pill ok">Hardened</span> This key is built into the app.' : '<span class="pill warn">Rotated key</span> Not yet listed in trust.js.') : '<span class="pill">Trust on first use</span>'}</p>
        <p class="small muted">Only messages signed with this key are accepted. If someone asks you to "re-install" from a different key, verify with the coordinator in person or by voice call first.</p>
        <p><b>Region:</b> ${esc(state.plan && state.plan.region ? state.plan.region.name + ' (' + state.plan.region.code + ')' : 'not set')}<br><b>Version:</b> ${state.seq} · <b>Issued:</b> ${esc(fmtDate(state.issued))}<br><b>Plan ID:</b> <span class="mono">${esc(pin.pid)}</span></p>` : '<p>No verified plan installed.</p>'}
      <p class="small muted">This app supports, and does not replace, official emergency advice. Always follow instructions from emergency services and utilities. State contact numbers checked ${esc((window.FCR_REGION && '4 Nov 2026') || '')}; verify locally.</p>
      <p class="small muted">Storage: ${esc(navigator.storage && navigator.storage.persist ? 'persistent storage requested' : 'standard')} · App ${esc(APP_VER)}</p>
      <div class="row wrap" style="margin-top:10px"><button data-act="close">Close</button><button class="danger" data-act="wipe">Remove plan from this device</button></div>`;
  }

  // ---------------- printing ----------------
  function renderPrint() {
    const p = plan(); if (!p) return;
    const h = p.household || {};
    $('#print-all').innerHTML = `<h1>${esc(p.title)}</h1><p>Version ${state.seq} · issued ${esc(fmtDate(state.issued))}${state.pin ? ' · key ' + esc(state.pin.fp) : ''}</p>
      <section><h2>Home and meeting points</h2><p><b>${esc(h.name)}</b>, ${esc(h.address)}<br>Radio: ${esc(h.radio || '')}<br>${esc(h.notes || '')}</p>
      <table>${(h.meeting || []).map((m) => `<tr><td><b>${esc(m.name)}</b>${m.id === h.activeMeeting ? ' (active)' : ''}</td><td>${esc(m.detail)}</td></tr>`).join('')}</table></section>
      <section><h2>Contacts</h2><table>${p.contacts.map((c) => `<tr><td>${esc(c.group)}</td><td><b>${esc(c.name)}</b></td><td>${esc(fmtPhone(c.phone))}</td><td>${esc(c.note || '')}</td></tr>`).join('')}</table></section>
      ${(p.roles || []).length ? `<section><h2>Who does what</h2><table>${p.roles.map((r) => `<tr><td><b>${esc(r.title)}</b></td><td>${esc(membersFor(r.id).map((m) => m.name).join(', ') || 'unassigned')}</td><td>${esc((r.duties || []).join('; '))}</td></tr>`).join('')}</table></section>` : ''}
      ${(p.supplies || []).length ? `<section><h2>Supplies, equipment and maintenance</h2><table><tr><td><b>Item</b></td><td><b>Where</b></td><td><b>Qty</b></td><td><b>Check</b></td><td><b>Replace</b></td><td><b>Last checked</b></td></tr>${p.supplies.map((s) => `<tr><td>${esc(s.item)}</td><td>${esc(locOf(s.loc).name)}</td><td>${esc(s.qty || '')}</td><td>${s.check ? 'every ' + esc(s.check) + ' mth' : ''}</td><td>${esc(s.replace || '')}${s.exp ? ' (exp ' + esc(s.exp) + ')' : ''}</td><td>${esc(supplyStatus(s).last || '')}</td></tr>`).join('')}</table></section>` : ''}
      ${p.checklists.map((c) => `<section><h2>${esc(c.title)}</h2>${c.items.map((i) => `<div>${i.sec ? '<i>' + esc(i.sec) + ':</i> ' : ''}<span class="box"></span>${esc(i.t)}${i.role ? ' — ' + esc(roleOf(i.role).title) : ''}</div>`).join('')}</section>`).join('')}
      ${p.procedures.map((x) => `<section><h2>${esc(x.title)}</h2><ol>${x.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>`).join('')}`;
  }

  // ---------------- import pipeline ----------------
  async function stageImport(text) {
    const envs = FCR.extract(text);
    if (!envs.length) throw new Error('No plan code found. Codes start with FCR1 and must be copied in full.');
    const base = state.demo ? { pin: null, seq: 0, issued: 0, plan: null, log: [], pending: [], demo: false } : JSON.parse(JSON.stringify(state));
    base.demo = false;
    const queue = [];
    const results = [];
    for (const raw of envs.concat(FCR.extract((base.pending || []).join('\n')))) {
      try { queue.push({ env: raw, payload: await FCR.decodePayload(raw) }); }
      catch (e) { results.push({ status: 'error', msg: 'Unreadable or damaged code: ' + e.message }); }
    }
    // De-duplicate by signature, then apply in sequence order.
    const seen = new Set();
    const items = queue.filter((q) => (seen.has(q.env.sig) ? false : seen.add(q.env.sig))).sort((a, b) => (a.payload.seq || 0) - (b.payload.seq || 0));
    base.pending = [];
    let enrol = null;
    let progressMade = true; let remaining = items;
    while (progressMade && remaining.length) {
      progressMade = false; const next = [];
      for (const it of remaining) {
        const r = await stageOne(base, it, (fp) => { enrol = fp; });
        if (r.status === 'pending') next.push(it); else { results.push(r); if (r.status === 'ok') progressMade = true; }
      }
      remaining = next;
    }
    for (const it of remaining) { base.pending.push(it.env.raw); results.push({ status: 'pending', seq: it.payload.seq, msg: `Update ${it.payload.seq} is waiting for update ${base.seq + 1}.` }); }
    return { base, results, enrol };
  }

  async function stageOne(st, it, onEnrol) {
    const { env, payload } = it;
    const seq = payload.seq | 0;
    const kindName = { P: 'Full plan', U: 'Update', K: 'Key change' }[env.type];
    try {
      if (!st.pin) {
        if (env.type !== 'P') return { status: 'pending', seq };
        if (!payload.pk || !payload.pid) throw new Error('Plan is missing its signing key');
        if (!(await FCR.verify(env, payload.pk))) throw new Error('Signature check failed — this plan has been altered.');
        const fp = await FCR.fingerprint(payload.pk);
        if (TRUSTED.length && !TRUSTED.includes(fp)) throw new Error('Signed by a key this app is not set up to trust — NOT from your coordinator.');
        st.pin = { pk: payload.pk, fp, kid: await FCR.keyId(payload.pk), pid: payload.pid };
        onEnrol(fp);
      } else {
        if (payload.pid !== st.pin.pid) throw new Error('This message belongs to a different family plan.');
        if (payload.kid !== st.pin.kid) throw new Error('Signed by an unknown key — NOT from your coordinator.');
        if (!(await FCR.verify(env, st.pin.pk))) throw new Error('Signature check failed — possible tampering or impersonation.');
      }
      if (env.type === 'P') {
        if (payload.pk !== st.pin.pk) throw new Error('Plan key does not match the trusted key.');
        if (seq <= st.seq) return { status: 'old', seq, msg: `${kindName} version ${seq} — you already have version ${st.seq}.` };
        validatePlan(payload.plan);
        st.plan = payload.plan; st.seq = seq; st.issued = payload.ts; st.log = [env.raw];
        return { status: 'ok', seq, msg: `${kindName} version ${seq}, issued ${fmtDate(payload.ts)}`, changes: summarisePlan(payload.plan) };
      }
      if (seq <= st.seq) return { status: 'old', seq, msg: `${kindName} ${seq} already applied.` };
      if (seq > st.seq + 1) return { status: 'pending', seq };
      if (env.type === 'U') {
        if (!st.plan) throw new Error('Install a full plan first.');
        const r = FCR.applyOps(st.plan, payload.ops, { seq, ts: payload.ts });
        validatePlan(r.plan);
        st.plan = r.plan; st.seq = seq; st.issued = payload.ts; st.log.push(env.raw);
        return { status: 'ok', seq, msg: `${kindName} ${seq}, issued ${fmtDate(payload.ts)}`, changes: r.changes };
      }
      if (env.type === 'K') {
        if (!payload.npk) throw new Error('Key change is missing the new key.');
        const fp = await FCR.fingerprint(payload.npk);
        st.pin = { pk: payload.npk, fp, kid: await FCR.keyId(payload.npk), pid: st.pin.pid };
        st.seq = seq; st.issued = payload.ts; st.log.push(env.raw);
        return { status: 'ok', seq, msg: `${kindName} ${seq}: coordinator moved to a new key.`, changes: ['New key fingerprint ' + fp] };
      }
      throw new Error('Unknown message type');
    } catch (e) { return { status: 'error', seq, msg: `${kindName || 'Message'} ${seq || ''}: ${e.message}` }; }
  }
  function validatePlan(p) {
    if (!p || typeof p !== 'object' || !Array.isArray(p.contacts) || !Array.isArray(p.checklists) || !Array.isArray(p.procedures)) throw new Error('Plan structure is invalid');
    const rErr = FCR_REGION.validate(p); if (rErr) throw new Error(rErr);
  }
  function summarisePlan(p) {
    return [p.region ? `Region: ${p.region.name} (${p.region.code})${p.region.postcode ? ', postcode ' + p.region.postcode : ''}` : 'No region', `${p.contacts.length} contacts`, `${p.checklists.length} checklists`, `${p.procedures.length} procedures`, `${(p.scenarios || []).length} scenarios`];
  }

  async function runImport(text) {
    try {
      staged = await stageImport(text);
      showResults(staged);
    } catch (e) { showDialog(`<h2>Nothing imported</h2><div class="banner urgent">${esc(e.message)}</div><button class="block" data-act="close">Close</button>`); }
  }
  function showResults(s) {
    const okCount = s.results.filter((r) => r.status === 'ok').length;
    const pendingCount = s.results.filter((r) => r.status === 'pending').length;
    const errCount = s.results.filter((r) => r.status === 'error').length;
    const canApply = okCount > 0 || pendingCount > 0;
    let html = `<h2>${errCount && !okCount ? 'Update rejected' : 'Verified update'}</h2>`;
    if (s.enrol && TRUSTED.includes(s.enrol)) {
      html += `<div class="banner ok"><b>First-time setup.</b> <span class="t">This plan is signed by the coordinator key built into this app:</span></div>
        <div class="fp" id="enrolfp">${esc(s.enrol)}</div>
        <label class="check"><input type="checkbox" id="fpok" checked disabled><span class="txt">Fingerprint matches the trusted key in this app.</span></label>`;
    } else if (s.enrol) {
      html += `<div class="banner info"><b>First-time setup.</b> <span class="t">Phone or ask your coordinator to read out their key fingerprint. It must match exactly:</span></div>
        <div class="fp" id="enrolfp">${esc(s.enrol)}</div>
        <label class="check"><input type="checkbox" id="fpok"><span class="txt">The coordinator confirmed this fingerprint by voice or in person.</span></label>`;
    }
    html += s.results.map((r) => `<div class="result ${r.status}"><b>${r.status === 'ok' ? '✓ Verified' : r.status === 'error' ? '✕ Rejected' : r.status === 'old' ? '• Skipped' : '… Waiting'}</b> — ${esc(r.msg)}
      ${r.changes && r.changes.length ? `<ul>${r.changes.slice(0, 12).map((c) => `<li>${esc(c)}</li>`).join('')}${r.changes.length > 12 ? `<li>…and ${r.changes.length - 12} more</li>` : ''}</ul>` : ''}</div>`).join('');
    if (errCount) html += `<p class="small muted">Rejected messages were not applied. If you were not expecting them, tell the coordinator by phone.</p>`;
    html += `<div class="row" style="margin-top:12px"><button class="grow" data-act="close">Cancel</button>${canApply ? `<button class="primary grow" data-act="apply" id="applyBtn" ${s.enrol && !TRUSTED.includes(s.enrol) ? 'disabled' : ''}>Apply</button>` : ''}</div>`;
    showDialog(html);
  }
  function commit() {
    if (!staged) return;
    state = staged.base; staged = null;
    save(SKEY, state);
    closeDialog();
    const u = $('#utext'); if (u) u.value = '';
    toast(`Plan updated to version ${state.seq}.`);
    location.hash = '#now'; render();
  }

  function backupText() { return (state.log || []).concat(state.pending || []).join('\n\n') + '\n'; }
  function backupName() { return `family-plan-v${state.seq}.fcr`; }

  // ---------------- dialog & render ----------------
  function showDialog(html) { $('#dlg-body').innerHTML = html; const d = $('#dlg'); if (!d.open) d.showModal(); }
  function closeDialog() { const d = $('#dlg'); if (d.open) d.close(); }

  function render() {
    applyTheme(); header();
    const h = (location.hash || '#now').slice(1);
    const [tab, sub] = h.split('/');
    const map = { now: viewNow, lists: () => viewLists(), list: () => viewLists(sub), contacts: () => viewContacts(''), procs: () => viewProcs(sub), kit: () => viewKit(sub), update: viewUpdate };
    $('#view').innerHTML = (map[tab] || viewNow)();
    const navTab = tab === 'list' ? 'lists' : (map[tab] ? tab : 'now');
    document.querySelectorAll('nav.tabs a').forEach((a) => { if (a.dataset.tab === navTab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (tab === 'procs' && sub) { const el = document.getElementById('proc-' + sub); if (el) el.scrollIntoView({ block: 'start' }); } else window.scrollTo(0, 0);
    renderPrint();
    const hero = document.querySelector('.hero');
    if (hero) { const im = new Image(); im.onload = () => hero.classList.add('has-art'); im.src = 'img/hero.webp'; }
  }
  function applyTheme() { if (local.theme) document.documentElement.setAttribute('data-theme', local.theme); else document.documentElement.removeAttribute('data-theme'); }

  // ---------------- events ----------------
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'demo') {
      const code = $('#dstate').value; const pc = $('#dpost').value.trim();
      if (!code) { toast('Select your state or territory first.'); return; }
      if (pc) { const d = FCR_REGION.detect(pc); if (!d || !d.codes.includes(code)) { toast(d ? `Postcode ${pc} is in ${d.codes.join('/')}, not ${code}.` : 'Postcode not recognised.'); return; } }
      const demoPlan = FCR_REGION.apply(JSON.parse(JSON.stringify(window.FCR_STARTER)), { code, postcode: pc });
      state = { pin: null, seq: 0, issued: nowS(), plan: demoPlan, log: [], pending: [], demo: true }; save(SKEY, state); location.hash = '#now'; render();
    }
    else if (act === 'install' && deferredInstall) { deferredInstall.prompt(); deferredInstall = null; b.classList.add('hidden'); }
    else if (act === 'startinc') { local.incident = { scenario: b.dataset.id, start: Date.now() }; local.journal = local.journal || []; local.journal.push({ ts: Date.now(), text: 'Incident mode started' }); save(LKEY, local); render(); }
    else if (act === 'endinc') { if (confirm('Stand down incident mode? Checklist ticks are kept until you reset them.')) { local.journal.push({ ts: Date.now(), text: 'Stood down' }); local.incident = null; save(LKEY, local); render(); } }
    else if (act === 'jadd') { const t = $('#jtext'); if (t && t.value.trim()) { local.journal.push({ ts: Date.now(), text: t.value.trim().slice(0, 500) }); save(LKEY, local); render(); } }
    else if (act === 'reset') { if (confirm('Clear all ticks on this checklist?')) { delete local.checks[b.dataset.id]; save(LKEY, local); render(); } }
    else if (act === 'supchk') { local.supplyChecks = local.supplyChecks || {}; local.supplyChecks[b.dataset.id] = todayISO(); save(LKEY, local); toast('Recorded on this phone. Tell the coordinator so it is recorded for everyone.'); render(); }
    else if (act === 'notme') { local.me = ''; save(LKEY, local); render(); }
    else if (act === 'print') { renderPrint(); window.print(); }
    else if (act === 'theme') { local.theme = local.theme === '' ? 'dark' : local.theme === 'dark' ? 'light' : ''; save(LKEY, local); render(); }
    else if (act === 'about') showDialog(viewAbout());
    else if (act === 'close') { staged = null; closeDialog(); }
    else if (act === 'apply') commit();
    else if (act === 'wipe') { if (confirm('Remove the plan and trusted key from this device? You will need a new signed plan from the coordinator.')) { localStorage.removeItem(SKEY); state = { pin: null, seq: 0, issued: 0, plan: null, log: [], pending: [], demo: false }; closeDialog(); location.hash = '#now'; render(); } }
    else if (act === 'paste') { try { const t = await navigator.clipboard.readText(); $('#utext').value = t; runImport(t); } catch (err) { toast('Paste was blocked — long-press the box and choose Paste.'); } }
    else if (act === 'checktext') runImport($('#utext').value);
    else if (act === 'dlbackup') downloadText(backupText(), backupName());
    else if (act === 'sharebackup') {
      const file = new File([backupText()], backupName(), { type: 'text/plain' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Family plan (signed)' }); } catch (err) {} }
      else downloadText(backupText(), backupName());
    }
  });
  document.addEventListener('change', async (e) => {
    const t = e.target;
    if (t.matches('[data-chk]')) {
      const c = t.dataset.chk, i = t.dataset.item;
      local.checks[c] = local.checks[c] || {};
      if (t.checked) local.checks[c][i] = Date.now(); else delete local.checks[c][i];
      save(LKEY, local);
      t.closest('.check').classList.toggle('done', t.checked);
      const cl = plan().checklists.find((x) => x.id === c); const pr = progress(cl);
      const bar = $('.progress > i'); if (bar) bar.style.width = (pr.done / pr.total) * 100 + '%';
      const lab = bar && bar.parentElement.nextElementSibling; if (lab) lab.textContent = `${pr.done} of ${pr.total} done`;
    } else if (t.id === 'ufile' && t.files[0]) {
      const f = t.files[0];
      if (f.size > 512 * 1024) { toast('File too large to be a plan.'); return; }
      runImport(await f.text()); t.value = '';
    } else if (t.id === 'meSel') { local.me = t.value; save(LKEY, local); render();
    } else if (t.id === 'fpok') { const a = $('#applyBtn'); if (a) a.disabled = !t.checked; }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'dpost') {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
      const out = $('#ddetect'); const pc = e.target.value;
      if (pc.length < 4) { out.textContent = ''; return; }
      const d = FCR_REGION.detect(pc);
      if (!d) { out.innerHTML = '<span style="color:var(--urgent)">Not a recognised Australian postcode.</span>'; return; }
      const names = d.codes.map((k) => FCR_REGION.states[k].name).join(' / ');
      out.innerHTML = d.codes.length > 1 ? `<span style="color:var(--warn)">Crosses a border (${esc(names)}) — choose below.</span>` : `<span style="color:var(--ok)">Detected: ${esc(names)}</span>`;
      if (!d.codes.includes($('#dstate').value)) $('#dstate').value = d.codes[0];
    }
    if (e.target.id === 'csearch') { const v = e.target.value; const tmp = document.createElement('div'); tmp.innerHTML = viewContacts(v); $('#cbody').innerHTML = tmp.querySelector('#cbody').innerHTML; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'jtext') { const b = document.querySelector('[data-act="jadd"]'); if (b) b.click(); } });
  $('#dlg').addEventListener('cancel', () => { staged = null; });

  function downloadText(text, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; const b = $('#installBtn'); if (b) b.classList.remove('hidden'); });
  setInterval(() => { const el = $('#elapsed'); if (el && local.incident) el.textContent = elapsed(local.incident.start); }, 30000);

  const APP_VER = '1.4.1';
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  // Android share target (POST handled by sw.js) or ?import= fallback
  (async function handleIncoming() {
    const u = new URL(location.href);
    if (u.searchParams.has('shared') && 'caches' in window) {
      history.replaceState(null, '', location.pathname + '#update');
      try { const c = await caches.open('fcr-share'); const r = await c.match('shared-payload'); if (r) { const t = await r.text(); await c.delete('shared-payload'); render(); runImport(t); return; } } catch (e) {}
    }
    const shared = u.searchParams.get('text');
    if (shared) { history.replaceState(null, '', location.pathname + '#update'); render(); runImport(shared); return; }
    render();
  })();

  window.__fcrApp = { stageImport, commit: () => commit(), getState: () => state, runImport };
})();
