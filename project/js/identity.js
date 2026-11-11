/* Alternância de fundos do brand book (preservada do projeto original). */
(() => {
  'use strict';
  const buttons=document.querySelectorAll('[data-background]');
  const cards=document.querySelectorAll('.identity-card');
  buttons.forEach(button=>button.addEventListener('click',()=>{
    buttons.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    cards.forEach(card=>{card.dataset.bg=button.dataset.background;});
  }));
})();
