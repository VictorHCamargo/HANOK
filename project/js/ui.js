/* Microinterações acessíveis: revelação, navegação e notificações. */
(() => {
 'use strict';
 function toast(message,type='info'){
  let area=document.getElementById('global-notices');if(!area){area=document.createElement('div');area.id='global-notices';area.className='notice-stack';area.setAttribute('aria-live','polite');document.body.append(area);}
  const item=document.createElement('div');item.className='notice notice-'+type;item.setAttribute('role',type==='error'?'alert':'status');const dot=document.createElement('span');dot.className='notice-dot';dot.textContent=type==='error'?'!':type==='success'?'✓':'i';const label=document.createElement('span');label.textContent=message;const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Dispensar aviso');close.addEventListener('click',()=>item.remove());item.append(dot,label,close);area.append(item);setTimeout(()=>item.remove(),5000);
 }
 function loading(button,busy,label='Salvando...'){
   if(!button)return;
   if(busy){button.dataset.originalText=button.textContent;button.disabled=true;button.classList.add('is-loading');button.textContent=label;}
   else{button.disabled=false;button.classList.remove('is-loading');if(button.dataset.originalText)button.textContent=button.dataset.originalText;}
 }
 document.addEventListener('DOMContentLoaded',()=>{
   if(!matchMedia('(prefers-reduced-motion:reduce)').matches&&'IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px 30px 0px'});
      document.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('reveal-ready');observer.observe(el);});
   }
   document.documentElement.classList.add('page-loaded');
   document.querySelectorAll('a[data-page-transition]').forEach(link=>link.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||link.target||!link.href)return;e.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>location.assign(link.href),150);}));
 });
 window.HanokUI={toast,loading};
})();
