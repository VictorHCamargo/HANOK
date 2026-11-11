/* Utilitários compartilhados entre o site e o painel. Sem backend: demonstração em localStorage. */
(() => {
  'use strict';
  const PREFIX = 'hanok:demo:v1:';
  const DEFAULT_PRODUCTS = Object.freeze([
    {id:'demo-tteokbokki',name:'Tteokbokki Tradicional',description:'Bolinhos de arroz ao molho coreano de gochujang.',category:'entradas',price:48,image:'https://images.unsplash.com/photo-1583032015879-e5022757608b?auto=format&fit=crop&w=700&q=80'},
    {id:'demo-bulgogi',name:'Bulgogi',description:'Carne marinada em molho de inspiração coreana, com gergelim.',category:'pratos',price:89,image:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80'},
    {id:'demo-bibimbap',name:'Dolsot Bibimbap',description:'Tigela de arroz com vegetais temperados e acompanhamentos.',category:'pratos',price:78,image:'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=700&q=80'},
    {id:'demo-dakgangjeong',name:'Dakgangjeong',description:'Frango crocante com molho levemente picante e agridoce.',category:'entradas',price:54,image:'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=700&q=80'},
    {id:'demo-soju',name:'Soju (exemplo)',description:'Bebida coreana. Item ilustrativo, destinado a maiores de 18 anos.',category:'bebidas',price:42,image:''},
    {id:'demo-makgeolli',name:'Makgeolli (exemplo)',description:'Bebida fermentada de arroz. Item ilustrativo para maiores de 18 anos.',category:'bebidas',price:58,image:''}
  ]);
  const CATEGORIES = Object.freeze({entradas:'Entradas',pratos:'Pratos',bebidas:'Bebidas'});
  const ORDER_STATUSES = Object.freeze(['Recebido','Em preparo','Pronto','Concluído','Cancelado']);
  const RESERVATION_STATUSES = Object.freeze(['Pendente','Confirmada','Cancelada']);

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return clone(fallback);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : clone(fallback);
    } catch (_) { return clone(fallback); }
  }
  function write(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function safeImage(url) {
    if (typeof url !== 'string' || url.length > 400) return '';
    try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : ''; }
    catch (_) { return ''; }
  }
  function normalizeProduct(p) {
    if (!p || typeof p !== 'object' || typeof p.id !== 'string' || typeof p.name !== 'string') return null;
    if (!(p.category in CATEGORIES) || !Number.isFinite(Number(p.price)) || Number(p.price) <= 0) return null;
    return {id:p.id.slice(0,100),name:p.name.slice(0,75),description:String(p.description||'').slice(0,240),category:p.category,price:Math.round(Number(p.price)*100)/100,image:safeImage(p.image)};
  }
  function getProducts() {return read('products',DEFAULT_PRODUCTS).map(normalizeProduct).filter(Boolean);}
  function saveProducts(list) { return write('products',list.map(normalizeProduct).filter(Boolean)); }
  function getOrders() { return read('orders',[]).filter(item=>item && typeof item === 'object' && typeof item.id === 'string'); }
  function getReservations() { return read('reservations',[]).filter(item=>item && typeof item === 'object' && typeof item.id === 'string'); }
  function saveOrder(order) {return write('orders',[order,...getOrders()].slice(0,200));}
  function saveReservation(reservation) {return write('reservations',[reservation,...getReservations()].slice(0,200));}
  function saveOrders(list) {return write('orders',list);}
  function saveReservations(list) {return write('reservations',list);}
  function money(value) {return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0);}
  function id() {return 'hx-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);}
  function today() {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function element(tag,className,text) {const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function formatDate(dateValue) {if(typeof dateValue!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(dateValue))return 'Data não informada';const [y,m,d]=dateValue.split('-');return `${d}/${m}/${y}`;}
  window.HanokData={DEFAULT_PRODUCTS,CATEGORIES,ORDER_STATUSES,RESERVATION_STATUSES,getProducts,saveProducts,getOrders,getReservations,saveOrder,saveReservation,saveOrders,saveReservations,safeImage,money,id,today,element,formatDate};
})();
