import { icon } from './icons.js';

/**
 * createDataTable(el, options)
 * options: {
 *   columns: [{ key, label, sortable, render(row), width }],
 *   rows: [...],
 *   getId: row => string,
 *   pageSize: number,
 *   searchKeys: [string],
 *   filters: [{ key, label, options:[{value,label}] }],
 *   bulkActions: [{ label, onClick(selectedRows) }],
 *   onRowClick: row => void,
 *   emptyState: { icon, title, desc },
 * }
 */
export function createDataTable(el, options){
  const state = {
    page: 1, pageSize: options.pageSize || 10, sortKey: null, sortDir: 1,
    query: '', density: 'comfortable', activeFilters: {}, selected: new Set(), visibleCols: new Set(options.columns.map(c=>c.key)),
  };

  function filteredRows(){
    let rows = options.rows;
    if(state.query){
      const q = state.query.toLowerCase();
      const keys = options.searchKeys || options.columns.map(c=>c.key);
      rows = rows.filter(r=> keys.some(k=> String(r[k]??'').toLowerCase().includes(q)));
    }
    Object.entries(state.activeFilters).forEach(([k,v])=>{
      if(v) rows = rows.filter(r=> String(r[k]) === v);
    });
    if(state.sortKey){
      rows = [...rows].sort((a,b)=>{
        const av=a[state.sortKey], bv=b[state.sortKey];
        if(typeof av==='number') return (av-bv)*state.sortDir;
        return String(av).localeCompare(String(bv))*state.sortDir;
      });
    }
    return rows;
  }

  function paginate(rows){
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total/state.pageSize));
    state.page = Math.min(state.page, pages);
    const start = (state.page-1)*state.pageSize;
    return { rows: rows.slice(start, start+state.pageSize), total, pages };
  }

  function render(){
    const all = filteredRows();
    const { rows, total, pages } = paginate(all);
    const cols = options.columns.filter(c=> state.visibleCols.has(c.key));

    if(options.rows.length===0){
      el.innerHTML = emptyStateHtml(options.emptyState);
      return;
    }

    el.innerHTML = `
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="search-input-wrap">${icon('search')}<input class="input" style="width:220px" id="tblSearch" placeholder="Search…" value="${state.query}"/></div>
          ${(options.filters||[]).map(f=> `
            <select class="select" style="width:auto;height:34px;" data-filter="${f.key}">
              <option value="">${f.label}: All</option>
              ${f.options.map(o=> `<option value="${o.value}" ${state.activeFilters[f.key]===o.value?'selected':''}>${o.label}</option>`).join('')}
            </select>`).join('')}
        </div>
        <div class="table-toolbar-right">
          ${state.selected.size ? bulkActionsHtml(state.selected.size) : ''}
          <div class="pillbar">
            <button class="pill ${state.density==='comfortable'?'active':''}" data-density="comfortable">Comfortable</button>
            <button class="pill ${state.density==='compact'?'active':''}" data-density="compact">Compact</button>
          </div>
          <button class="btn btn-secondary btn-sm" id="tblExport">${icon('download')}Export</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="dtable ${state.density==='compact'?'compact':''}">
          <thead><tr>
            ${options.selectable ? `<th style="width:34px;"><input type="checkbox" class="checkbox" id="selectAll"/></th>`:''}
            ${cols.map(c=> `<th class="${c.sortable?'sortable':''}" data-key="${c.key}" style="${c.width?`width:${c.width}`:''}">${c.label}${c.sortable?`<span class="sort-ic">${state.sortKey===c.key?(state.sortDir===1?'↑':'↓'):'↕'}</span>`:''}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${rows.map(r=>{
              const id = options.getId(r);
              return `<tr data-id="${id}" class="${state.selected.has(id)?'selected':''}" style="${options.onRowClick?'cursor:pointer':''}">
                ${options.selectable ? `<td><input type="checkbox" class="row-checkbox" data-id="${id}" ${state.selected.has(id)?'checked':''}/></td>`:''}
                ${cols.map(c=> `<td>${c.render ? c.render(r) : (r[c.key] ?? '—')}</td>`).join('')}
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span>${total.toLocaleString()} record${total===1?'':'s'}${state.selected.size?` · ${state.selected.size} selected`:''}</span>
        <div class="pager">
          <button data-pg="first" ${state.page===1?'disabled':''}>${icon('chevronLeft')}${icon('chevronLeft')}</button>
          <button data-pg="prev" ${state.page===1?'disabled':''}>${icon('chevronLeft')}</button>
          <span style="padding:0 8px;">Page ${state.page} of ${pages}</span>
          <button data-pg="next" ${state.page===pages?'disabled':''}>${icon('chevronRight')}</button>
          <button data-pg="last" ${state.page===pages?'disabled':''}>${icon('chevronRight')}${icon('chevronRight')}</button>
        </div>
      </div>`;

    bind(all);
  }

  function bulkActionsHtml(n){
    return (options.bulkActions||[]).map(a=> `<button class="btn btn-secondary btn-sm" data-bulk="${a.label}">${a.label} (${n})</button>`).join('');
  }

  function bind(all){
    el.querySelector('#tblSearch')?.addEventListener('input', (e)=>{ state.query = e.target.value; state.page=1; render(); });
    el.querySelectorAll('[data-filter]').forEach(sel=> sel.addEventListener('change', (e)=>{ state.activeFilters[e.target.dataset.filter] = e.target.value; state.page=1; render(); }));
    el.querySelectorAll('[data-density]').forEach(btn=> btn.addEventListener('click', ()=>{ state.density = btn.dataset.density; render(); }));
    el.querySelectorAll('th.sortable').forEach(th=> th.addEventListener('click', ()=>{
      const k = th.dataset.key;
      state.sortDir = state.sortKey===k ? -state.sortDir : 1;
      state.sortKey = k; render();
    }));
    el.querySelectorAll('[data-pg]').forEach(btn=> btn.addEventListener('click', ()=>{
      const pages = Math.max(1, Math.ceil(filteredRows().length/state.pageSize));
      if(btn.dataset.pg==='first') state.page=1;
      if(btn.dataset.pg==='prev') state.page=Math.max(1,state.page-1);
      if(btn.dataset.pg==='next') state.page=Math.min(pages,state.page+1);
      if(btn.dataset.pg==='last') state.page=pages;
      render();
    }));
    el.querySelector('#tblExport')?.addEventListener('click', ()=> exportCsv(filteredRows(), options.columns));
    el.querySelector('#selectAll')?.addEventListener('change', (e)=>{
      const { rows } = paginate(filteredRows());
      rows.forEach(r=> e.target.checked ? state.selected.add(options.getId(r)) : state.selected.delete(options.getId(r)));
      render();
    });
    el.querySelectorAll('.row-checkbox').forEach(cb=> cb.addEventListener('click', (e)=>{
      e.stopPropagation();
      cb.checked ? state.selected.add(cb.dataset.id) : state.selected.delete(cb.dataset.id);
      render();
    }));
    el.querySelectorAll('[data-bulk]').forEach(btn=> btn.addEventListener('click', ()=>{
      const action = (options.bulkActions||[]).find(a=> a.label===btn.dataset.bulk);
      const rows = all.filter(r=> state.selected.has(options.getId(r)));
      action?.onClick(rows);
    }));
    if(options.onRowClick){
      el.querySelectorAll('tbody tr').forEach(tr=> tr.addEventListener('click', (e)=>{
        if(e.target.closest('input')) return;
        const row = options.rows.find(r=> options.getId(r)===tr.dataset.id);
        options.onRowClick(row);
      }));
    }
  }

  function exportCsv(rows, cols){
    const header = cols.map(c=>c.label).join(',');
    const lines = rows.map(r=> cols.map(c=> `"${String(r[c.key]??'').replace(/"/g,'""')}"`).join(','));
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'export.csv'; a.click();
  }

  function emptyStateHtml(cfg){
    const c = cfg || { icon:'grid', title:'No records yet', desc:'Data will appear here once available.' };
    return `<div class="state-block"><div class="state-icon">${icon(c.icon)}</div><h3>${c.title}</h3><p>${c.desc}</p></div>`;
  }

  render();
  return { refresh: render, getSelected: ()=> Array.from(state.selected) };
}
