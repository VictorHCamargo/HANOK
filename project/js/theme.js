/* Preferência de tema compartilhada entre as páginas. */
(() => {
  'use strict';
  const KEY='hanok:theme:v1';
  function read(){try{const v=localStorage.getItem(KEY);if(v==='light'||v==='dark')return v;}catch{}return matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';}
  function apply(value){document.documentElement.dataset.theme=value;document.documentElement.style.colorScheme=value;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',value==='light'?'#faf7f4':'#101013');document.querySelectorAll('[data-theme-toggle]').forEach(b=>{b.setAttribute('aria-label',value==='dark'?'Ativar modo claro':'Ativar modo escuro');b.setAttribute('title',value==='dark'?'Ativar modo claro':'Ativar modo escuro');b.querySelector('[data-theme-icon]')?.replaceChildren(document.createTextNode(value==='dark'?'☀':'☾'));});}
  const mode=read();apply(mode);
  document.addEventListener('DOMContentLoaded',()=>{apply(read());document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(KEY,next);}catch{}apply(next);}));});
  window.addEventListener('storage',e=>{if(e.key===KEY)apply(read());});
})();
