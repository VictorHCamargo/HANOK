/* Experiência do cliente: cardápio, filtros, carrinho e reserva simulada. */
(() => {
  'use strict';
  const D = window.HanokData;
  if (!D) return;
  const $ = id => document.getElementById(id);
  const A=window.HanokAuth,UI=window.HanokUI;
  const CART_KEY='hanok:cart:tab';
  let initial=[];try{initial=JSON.parse(sessionStorage.getItem(CART_KEY)||'[]');}catch{}
  const cart = new Map(Array.isArray(initial)?initial.filter(x=>Array.isArray(x)&&typeof x[0]==='string'&&Number.isInteger(x[1])&&x[1]>0&&x[1]<=99):[]);
  const persistCart=()=>{try{sessionStorage.setItem(CART_KEY,JSON.stringify([...cart]));}catch{}};
  const requestLogin=()=>{UI?.toast('Entre ou crie uma conta para concluir.','info');const target='login.html?next='+encodeURIComponent('index.html#cardapio');setTimeout(()=>location.assign(target),550);};
  // Fallback visual quando a foto remota do destaque não estiver disponível.
  const heroImage=document.querySelector('.hero-picture > img');
  if(heroImage){
    const showFallback=()=>{
      if(!heroImage.isConnected)return;
      const fallback=D.element('div','hero-image-fallback');
      fallback.append(D.element('span','hero-image-korean','한옥'),D.element('strong','','HANOK'),D.element('span','','Gastronomia coreana'));
      heroImage.replaceWith(fallback);
    };
    heroImage.addEventListener('error',showFallback,{once:true});
    if(heroImage.complete&&heroImage.naturalWidth===0)showFallback();
  }
  let filter = 'todos';
  let toastTimer;

  const navToggle=$('nav-toggle');
  const navigation=$('navigation');
  navToggle.addEventListener('click',()=>{
    const open=navigation.classList.toggle('open');
    navToggle.setAttribute('aria-expanded',String(open));
    navToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  });
  navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navigation.classList.remove('open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Abrir menu');}));

  function notify(message){
    const el=$('toast');el.textContent=message;el.classList.add('visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2600);
  }
  function addToCart(id){
    const product=D.getProducts().find(p=>p.id===id);if(!product)return notify('Produto não encontrado.');
    cart.set(id,Math.min(99,(cart.get(id)||0)+1));persistCart();renderCart();notify(`${product.name} adicionado ao pedido.`);
  }
  function makeProductCard(p){
    const article=D.element('article','product-card');
    const picture=D.element('div','product-image');
    if(p.image){
      const img=document.createElement('img');img.src=D.safeImage(p.image);img.alt=`Imagem ilustrativa: ${p.name}`;img.loading='lazy';
      img.addEventListener('error',()=>{img.remove();picture.prepend(D.element('span','no-image','Imagem indisponível'));},{once:true});picture.append(img);
    }else picture.append(D.element('span','no-image',p.name));
    picture.append(D.element('span','product-tag',D.CATEGORIES[p.category]));
    const content=D.element('div','product-content');const heading=D.element('div','product-heading');
    heading.append(D.element('h3','',p.name),D.element('span','price',D.money(p.price)));
    content.append(heading,D.element('p','',p.description));
    const add=D.element('button','button button-primary button-wide','Adicionar ao pedido');add.type='button';add.addEventListener('click',()=>addToCart(p.id));content.append(add);
    article.append(picture,content);return article;
  }
  function renderMenu(){
    const search=$('menu-search').value.trim().toLocaleLowerCase('pt-BR');
    const products=D.getProducts().filter(p=>(filter==='todos'||p.category===filter) && (!search||(p.name+' '+p.description).toLocaleLowerCase('pt-BR').includes(search)));
    const grid=$('menu-grid');grid.replaceChildren();
    if(!products.length){grid.append(D.element('div','empty-state','Nenhum produto encontrado. Tente outra busca ou categoria.'));return;}
    products.forEach(p=>grid.append(makeProductCard(p)));
  }
  document.querySelectorAll('.filter-button').forEach(button=>button.addEventListener('click',()=>{
    filter=button.dataset.category;
    document.querySelectorAll('.filter-button').forEach(tab=>{const active=tab===button;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active));});renderMenu();
  }));
  $('menu-search').addEventListener('input',renderMenu);

  const dialog=$('cart-dialog');const items=$('cart-items');const orderForm=$('order-form');
  function cartEntries(){
    const products=new Map(D.getProducts().map(p=>[p.id,p]));
    for(const id of [...cart.keys()])if(!products.has(id))cart.delete(id);
    return [...cart].map(([id,quantity])=>({p:products.get(id),quantity}));
  }
  function changeQuantity(id,delta){
    const next=(cart.get(id)||0)+delta;
    if(next<=0)cart.delete(id);else cart.set(id,Math.min(99,next));persistCart();renderCart();
  }
  function renderCart(){
    const entries=cartEntries();items.replaceChildren();let total=0,count=0;
    if(!entries.length) items.append(D.element('div','empty-state','Seu pedido está vazio. Adicione itens do cardápio.'));
    for(const {p,quantity} of entries){
      total+=p.price*quantity;count+=quantity;
      const line=D.element('div','cart-line'),info=D.element('div','cart-line-info'),ctrl=D.element('div','quantity-controls');
      info.append(D.element('strong','',p.name),D.element('span','',D.money(p.price*quantity)));
      const less=D.element('button','','−'),more=D.element('button','','+');less.type=more.type='button';less.setAttribute('aria-label',`Remover uma unidade de ${p.name}`);more.setAttribute('aria-label',`Adicionar uma unidade de ${p.name}`);
      less.addEventListener('click',()=>changeQuantity(p.id,-1));more.addEventListener('click',()=>changeQuantity(p.id,1));
      ctrl.append(less,D.element('span','',String(quantity)),more);line.append(info,ctrl);items.append(line);
    }
    $('cart-total').textContent=D.money(total);$('cart-count').textContent=String(count);$('cart-count-menu').textContent=`(${count})`;
    orderForm.querySelector('button[type=submit]').disabled=!entries.length;
  }
  function openCart(){renderCart();$('order-feedback').textContent='';dialog.showModal();}
  $('open-cart').addEventListener('click',openCart);$('open-cart-menu').addEventListener('click',openCart);$('close-cart').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  const fulfillment=$('order-fulfillment'),deliveryField=$('delivery-field'),deliveryAddress=deliveryField.querySelector('textarea');
  fulfillment.addEventListener('change',()=>{const delivery=fulfillment.value==='entrega';deliveryField.hidden=!delivery;deliveryAddress.required=delivery;});
  orderForm.addEventListener('submit',event=>{
    event.preventDefault();const feedback=$('order-feedback'),entries=cartEntries();
    if(!entries.length){feedback.textContent='Adicione um produto antes de continuar.';feedback.classList.add('error');return;}
    if(!A?.current()){feedback.classList.add('error');feedback.textContent='Faça login para salvar o pedido de demonstração.';requestLogin();return;}
    const form=new FormData(orderForm);const customer=String(form.get('customer')||'').trim();const method=String(form.get('fulfillment')||'');const address=String(form.get('address')||'').trim();
    if(!customer||(method==='entrega'&&!address)){feedback.textContent='Preencha os campos obrigatórios.';feedback.classList.add('error');return;}
    const order={id:D.id(),userId:A.current().id,customer,fulfillment:method,address:method==='entrega'?address:'',items:entries.map(({p,quantity})=>({productId:p.id,name:p.name,unitPrice:p.price,quantity})),total:Math.round(entries.reduce((sum,{p,quantity})=>sum+p.price*quantity,0)*100)/100,status:'Recebido',createdAt:new Date().toISOString()};
    if(!D.saveOrder(order)){feedback.textContent='Não foi possível salvar: armazenamento do navegador indisponível.';feedback.classList.add('error');return;}
    cart.clear();persistCart();renderCart();orderForm.reset();deliveryField.hidden=true;deliveryAddress.required=false;
    feedback.classList.remove('error');feedback.textContent='Pedido de demonstração salvo somente neste navegador. Nenhum pedido foi enviado ou pago.';
  });

  const reservationForm=$('reservation-form'),dateInput=$('reservation-date'),timeSelect=$('reservation-time');
  const WEEKDAY_SLOTS=['18:30','19:30','20:30','21:30'],WEEKEND_SLOTS=['12:30','13:30','18:30','19:30','20:30','21:30'];
  dateInput.min=D.today();
  function availableTimes(dateValue){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)||dateValue<D.today())return [];
    const [y,m,d]=dateValue.split('-').map(Number);const check=new Date(y,m-1,d);
    if(check.getFullYear()!==y||check.getMonth()!==m-1||check.getDate()!==d)return [];
    const weekday=check.getDay();if(weekday===1)return [];
    const slots=(weekday===0||weekday===6)?WEEKEND_SLOTS:WEEKDAY_SLOTS;
    const now=new Date();return slots.filter(slot=>{
      if(dateValue!==D.today())return true;
      const [h,min]=slot.split(':').map(Number);return h*60+min>now.getHours()*60+now.getMinutes();
    });
  }
  function updateTimes(){
    const slots=availableTimes(dateInput.value);timeSelect.replaceChildren();
    const placeholder=D.element('option','',slots.length?'Selecione um horário':'Sem horários disponíveis');placeholder.value='';timeSelect.append(placeholder);
    slots.forEach(slot=>{const option=D.element('option','',slot);option.value=slot;timeSelect.append(option);});
    timeSelect.disabled=!slots.length;
  }
  dateInput.addEventListener('change',updateTimes);updateTimes();
  reservationForm.addEventListener('submit',event=>{
    event.preventDefault();const form=new FormData(reservationForm),feedback=$('reservation-feedback');
    const date=String(form.get('date')||''),time=String(form.get('time')||''),customer=String(form.get('customer')||'').trim(),guests=Number(form.get('guests'));
    if(!customer||!availableTimes(date).includes(time)||!Number.isInteger(guests)||guests<1||guests>8){feedback.classList.add('error');feedback.textContent='Confira a data, o horário e os demais dados.';return;}
    if(!A?.current()){feedback.classList.add('error');feedback.textContent='Entre na sua conta para solicitar uma reserva.';requestLogin();return;}
    const reservation={id:D.id(),userId:A.current().id,customer,date,time,guests,notes:String(form.get('notes')||'').trim(),status:'Pendente',createdAt:new Date().toISOString()};
    if(!D.saveReservation(reservation)){feedback.classList.add('error');feedback.textContent='Não foi possível salvar: armazenamento do navegador indisponível.';return;}
    reservationForm.reset();updateTimes();feedback.classList.remove('error');feedback.textContent='Solicitação de demonstração salva neste navegador. Nenhuma reserva foi enviada ou confirmada.';
  });
  window.addEventListener('storage',()=>{renderMenu();renderCart();});
  renderMenu();renderCart();
  const known=A?.current();if(known){const orderName=orderForm.elements.namedItem('customer'),reservationName=reservationForm.elements.namedItem('customer');if(orderName)orderName.value=known.name;if(reservationName)reservationName.value=known.name;}
})();
