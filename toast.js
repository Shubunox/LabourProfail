import { icon } from './icons.js';

function ensureStack(){
  let stack = document.querySelector('.toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}

const iconFor = { success:'checkCircle', error:'xCircle', warning:'alertCircle', info:'info' };

export const toast = {
  show({ type='info', title, msg, duration=4200 }){
    const stack = ensureStack();
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
      <span class="ic ${type}">${icon(iconFor[type]||'info')}</span>
      <div>
        ${title ? `<div class="title">${title}</div>`:''}
        ${msg ? `<div class="msg">${msg}</div>`:''}
      </div>`;
    stack.appendChild(el);
    setTimeout(()=>{
      el.style.transition = 'all 220ms ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(16px)';
      setTimeout(()=> el.remove(), 220);
    }, duration);
  },
};
