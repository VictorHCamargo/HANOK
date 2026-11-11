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
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const canAnimate=()=>!reduceMotion.matches;
 let cardObserver;
 if('IntersectionObserver' in window){
   cardObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
     if(entry.isIntersecting){entry.target.classList.add('is-visible');cardObserver.unobserve(entry.target);}
   }),{threshold:.08,rootMargin:'0px 0px 50px 0px'});
 }
 function observeReveal(elements){
   const all=Array.from(elements||[]);
   all.forEach((el,index)=>{
     if(!canAnimate()||!cardObserver)return;
     el.classList.add('card-reveal-ready');
     el.style.setProperty('--stagger',`${Math.min(index%6,5)*65}ms`);
     cardObserver.observe(el);
   });
 }
 document.addEventListener('DOMContentLoaded',()=>{
   if(canAnimate()&&'IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.07,rootMargin:'0px 0px 25px 0px'});
      document.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('reveal-ready');observer.observe(el);});
   }
   document.documentElement.classList.add('page-loaded');
   // Uma linha discreta no topo acompanha a rolagem da página.
   if(document.body.classList.contains('dashboard-body')===false){
     const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
     let pending=false;
     const update=()=>{const total=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${total>0?Math.min(1,scrollY/total):0})`;pending=false;};
     window.addEventListener('scroll',()=>{if(!pending){requestAnimationFrame(update);pending=true;}},{passive:true});update();
   }
   document.querySelectorAll('a[data-page-transition]').forEach(link=>link.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||link.target||!link.href)return;e.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>location.assign(link.href),150);}));
 });
 window.HanokUI={toast,loading,observeReveal};
})();
