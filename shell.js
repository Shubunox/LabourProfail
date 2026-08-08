import { NAV, PAGE_META } from './nav-config.js';
import { icon, icons } from './icons.js';
import { api } from '../services/api.js';
import { openCommandPalette } from './search.js';
import { toast } from './toast.js';

function currentFile(){
  const p = location.pathname.split('/').pop();
  return p || 'index.html';
}

function buildSidebar(activeKey){
  const collapsed = sessionStorage.getItem('lp_sidebar_collapsed') === '1';
  const groups = NAV.map(g=>{
    const items = g.items.map(i=> `
      <a class="nav-item ${i.key===activeKey?'active':''}" href="${i.href}">
        ${icon(i.icon)}<span>${i.label}</span>
      </a>`).join('');
    return `<div class="nav-group">${g.group ? `<div class="nav-group-label">${g.group}</div>`:''}${items}</div>`;
  }).join('');

  return `
  <aside class="sidebar ${collapsed?'collapsed':''}" id="sidebar">
    <div class="sidebar-brand">
      <div class="mark">LP</div>
      <div class="name">LabourPro<small>WMS Labour Ops</small></div>
    </div>
    <nav class="sidebar-scroll">${groups}</nav>
    <div class="sidebar-foot">
      <div class="status-pill" id="statusPill">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusText">Checking systems…</span>
      </div>
    </div>
    <button class="sidebar-collapse-btn" id="collapseBtn" aria-label="Toggle sidebar">${icon('chevronLeft')}</button>
  </aside>`;
}

function buildTopbar(meta){
  const crumbs = meta ? `
    <span>LabourPro</span>${icon('chevronRight')}
    <span>${meta.group || 'Overview'}</span>${meta.group ? icon('chevronRight'):''}
    <span class="crumb-current">${meta.label}</span>
  ` : `<span class="crumb-current">Overview</span>`;

  return `
  <header class="topbar">
    <div style="display:flex;align-items:center;gap:10px;min-width:0;">
      <button class="icon-btn mobile-nav-toggle" id="mobileNavToggle" aria-label="Open navigation">${icon('panelLeft')}</button>
      <div class="breadcrumbs">${crumbs}</div>
    </div>
    <div class="topbar-right">
      <button class="search-trigger" id="searchTrigger">
        ${icon('search')}<span>Search staff, vendors, POs…</span><span class="kbd">Ctrl K</span>
      </button>
      <button class="icon-btn" id="notifBtn" aria-label="Notifications">${icon('bell')}<span class="dot"></span></button>
      <div class="user-chip">
        <div class="avatar">FM</div>
        <div class="who"><b>Facility Manager</b><small>BLR-1 Warehouse</small></div>
      </div>
    </div>
  </header>`;
}

async function refreshStatus(){
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if(!dot) return;
  try{
    const status = await api.getSystemStatus();
    const values = Object.values(status);
    const degraded = values.includes('DEGRADED');
    const notConfigured = values.every(v=> v==='NOT_CONFIGURED') || status.biometricGateway==='NOT_CONFIGURED';
    dot.className = 'status-dot ' + (degraded ? 'warn' : '');
    text.textContent = degraded ? 'System degraded' : notConfigured ? 'Biometric gateway not configured' : 'All systems operational';
  }catch(e){
    dot.className = 'status-dot err';
    text.textContent = 'Status unavailable';
  }
}

export function mountShell(){
  const file = currentFile();
  const meta = PAGE_META[file];
  const shellRoot = document.getElementById('shell-root');
  if(!shellRoot) return;

  shellRoot.insertAdjacentHTML('afterbegin', `
    <div class="scrim" id="scrim"></div>
    ${buildSidebar(meta ? meta.key : 'overview')}
  `);
  const main = document.querySelector('.main');
  if(main) main.insertAdjacentHTML('afterbegin', buildTopbar(meta));

  // Collapse toggle
  const collapseBtn = document.getElementById('collapseBtn');
  const sidebar = document.getElementById('sidebar');
  collapseBtn?.addEventListener('click', ()=>{
    const nowCollapsed = !sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed', nowCollapsed);
    main?.classList.toggle('collapsed', nowCollapsed);
    sessionStorage.setItem('lp_sidebar_collapsed', nowCollapsed ? '1':'0');
  });
  if(sessionStorage.getItem('lp_sidebar_collapsed')==='1'){ main?.classList.add('collapsed'); }

  // Mobile nav
  const scrim = document.getElementById('scrim');
  const openMobile = ()=>{ sidebar.classList.add('mobile-open'); scrim.classList.add('show'); };
  const closeMobile = ()=>{ sidebar.classList.remove('mobile-open'); scrim.classList.remove('show'); };
  document.getElementById('mobileNavToggle')?.addEventListener('click', openMobile);
  scrim?.addEventListener('click', closeMobile);

  // Search
  document.getElementById('searchTrigger')?.addEventListener('click', openCommandPalette);
  window.addEventListener('keydown', (e)=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openCommandPalette(); }
  });

  document.getElementById('notifBtn')?.addEventListener('click', ()=>{
    toast.show({ type:'info', title:'Notifications', msg:'No notifications wired to a live channel yet in this build.' });
  });

  refreshStatus();
  setInterval(refreshStatus, 20000);
}

export function devModeBanner(){
  if(!api.isDevMode()) return '';
  return `
  <div class="panel" style="border-color:rgba(251,191,36,0.35);background:var(--warning-soft);padding:10px 14px;display:flex;align-items:center;gap:10px;margin-bottom:18px;">
    ${icon('info')}
    <div style="font-size:var(--fs-xs);color:var(--text-secondary);"><b style="color:var(--warning);">Development data active.</b> Every record on this screen is simulated and tagged for testing only — nothing here represents real warehouses, staff, or hardware.</div>
  </div>`;
}
