import { icon } from './icons.js';
import { api } from '../services/api.js';

let root = null;
let activeIndex = 0;
let flatItems = [];

function ensureRoot(){
  if(root) return root;
  root = document.createElement('div');
  root.className = 'modal-scrim';
  root.innerHTML = `
    <div class="modal cmdk">
      <div class="cmdk-input-row">
        ${icon('search')}
        <input class="cmdk-input" id="cmdkInput" placeholder="Search staff, vendors, warehouses, POs, invoices, approvals…" autocomplete="off" />
        <button class="icon-btn" id="cmdkClose">${icon('x')}</button>
      </div>
      <div class="cmdk-results" id="cmdkResults"></div>
      <div class="cmdk-foot">
        <span>${icon('chevronDown')}${icon('chevronRight')} Navigate</span>
        <span>${icon('check')} Select</span>
        <span>Esc Close</span>
      </div>
    </div>`;
  document.body.appendChild(root);
  root.addEventListener('click', (e)=>{ if(e.target===root) close(); });
  root.querySelector('#cmdkClose').addEventListener('click', close);
  root.querySelector('#cmdkInput').addEventListener('input', (e)=> runSearch(e.target.value));
  root.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ close(); }
    if(e.key==='ArrowDown'){ e.preventDefault(); move(1); }
    if(e.key==='ArrowUp'){ e.preventDefault(); move(-1); }
    if(e.key==='Enter'){ e.preventDefault(); flatItems[activeIndex]?.action(); }
  });
  return root;
}

function move(dir){
  if(!flatItems.length) return;
  activeIndex = (activeIndex + dir + flatItems.length) % flatItems.length;
  render(flatItems, true);
}

async function runSearch(q){
  const results = document.getElementById('cmdkResults');
  if(!q || q.length < 1){
    results.innerHTML = `<div style="padding:32px 10px;text-align:center;color:var(--text-tertiary);font-size:var(--fs-sm);">Type to search across the workspace</div>`;
    flatItems = [];
    return;
  }
  const [staff, vendors, warehouses, approvals, invoices, pos] = await Promise.all([
    api.listStaff(), api.listVendors(), api.listWarehouses(), api.listApprovals(), api.listInvoices(), api.listPurchaseOrders(),
  ]);
  const ql = q.toLowerCase();
  const groups = [
    { label:'Staff', icon:'users', href:'workforce-staff.html', matches: staff.filter(s=> s.name.toLowerCase().includes(ql)).slice(0,4).map(s=>({ title:s.name, meta:s.id, href:'workforce-staff.html' })) },
    { label:'Vendors', icon:'truck', href:'workforce-vendors.html', matches: vendors.filter(v=> v.name.toLowerCase().includes(ql)).slice(0,4).map(v=>({ title:v.name, meta:v.code, href:'workforce-vendors.html' })) },
    { label:'Warehouses', icon:'building', href:'admin-warehouses.html', matches: warehouses.filter(w=> w.name.toLowerCase().includes(ql) || w.code.toLowerCase().includes(ql)).slice(0,4).map(w=>({ title:w.name, meta:w.code, href:'admin-warehouses.html' })) },
    { label:'Approvals', icon:'checkCircle', href:'governance-approvals.html', matches: approvals.filter(a=> a.title.toLowerCase().includes(ql)).slice(0,4).map(a=>({ title:a.title, meta:a.priority, href:'governance-approvals.html' })) },
    { label:'Purchase Orders', icon:'fileText', href:'procurement-pos.html', matches: pos.filter(p=> p.id.toLowerCase().includes(ql)).slice(0,4).map(p=>({ title:p.id, meta:p.period, href:'procurement-pos.html' })) },
    { label:'Invoices', icon:'receipt', href:'procurement-invoices.html', matches: invoices.filter(i=> i.id.toLowerCase().includes(ql)).slice(0,4).map(i=>({ title:i.id, meta:i.matchStatus, href:'procurement-invoices.html' })) },
  ].filter(g=> g.matches.length);

  flatItems = [];
  groups.forEach(g=> g.matches.forEach(m=> flatItems.push({ ...m, group:g.label, icon:g.icon, action:()=>{ location.href = m.href; } })));
  activeIndex = 0;
  render(groups.map(g=>({...g})), false);
}

function render(groups, isFlat){
  const results = document.getElementById('cmdkResults');
  if(!flatItems.length){
    results.innerHTML = `<div style="padding:32px 10px;text-align:center;color:var(--text-tertiary);font-size:var(--fs-sm);">No matches found</div>`;
    return;
  }
  let idx = 0;
  const bygroup = {};
  flatItems.forEach(item=>{ (bygroup[item.group] ||= []).push(item); });
  results.innerHTML = Object.entries(bygroup).map(([label, items])=>{
    return `<div class="cmdk-group-label">${label}</div>` + items.map(it=>{
      const i = idx++;
      const html = `<div class="cmdk-item ${i===activeIndex?'active':''}" data-idx="${i}">${icon(it.icon)}<span>${it.title}</span><span class="meta">${it.meta||''}</span></div>`;
      return html;
    }).join('');
  }).join('');
  results.querySelectorAll('.cmdk-item').forEach(el=>{
    el.addEventListener('click', ()=> flatItems[+el.dataset.idx]?.action());
    el.addEventListener('mouseenter', ()=>{ activeIndex = +el.dataset.idx; render(groups, true); });
  });
}

export function openCommandPalette(){
  const r = ensureRoot();
  requestAnimationFrame(()=> r.classList.add('show'));
  const input = document.getElementById('cmdkInput');
  input.value = '';
  input.focus();
  runSearch('');
}
function close(){ root?.classList.remove('show'); }
