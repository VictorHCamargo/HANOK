/* Painel administrativo local: CRUD + listagem e mudança de status de pedidos e reservas. */
(() => {
  'use strict';
  const D=window.HanokData;
  if(!D)return;
  const $=id=>document.getElementById(id);
  const form=$('product-form');
  const field=name=>form.elements.namedItem(name);
  function formatInstant(date){const d=new Date(date);return Number.isNaN(d.getTime())?'Data não disponível':d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});}
  function empty(text){return D.element('div','admin-empty',text);}
  function action(label,css,handler){const b=D.element('button','small-action '+css,label);b.type='button';b.addEventListener('click',handler);return b;}
  function refreshStats(){$('stat-products').textContent=D.getProducts().length;$('stat-orders').textContent=D.getOrders().length;$('stat-reservations').textContent=D.getReservations().length;}
  function resetProductForm(){form.reset();field('id').value='';$('product-form-title').textContent='Adicionar produto';$('save-product').textContent='Adicionar produto';$('cancel-edit').hidden=true;$('product-feedback').textContent='';}
  function startEdit(id){
    const product=D.getProducts().find(p=>p.id===id);if(!product)return;
    Object.keys(product).forEach(key=>{const input=field(key);if(input)input.value=product[key];});
    $('product-form-title').textContent='Editar produto';$('save-product').textContent='Salvar alterações';$('cancel-edit').hidden=false;
    form.scrollIntoView({behavior:'smooth',block:'start'});field('name').focus({preventScroll:true});
  }
  function deleteProduct(id){
    const product=D.getProducts().find(p=>p.id===id);if(!product||!confirm(`Excluir "${product.name}" do cardápio de demonstração?`))return;
    const saved=D.saveProducts(D.getProducts().filter(p=>p.id!==id));
    if(!saved){alert('Não foi possível salvar. Verifique o armazenamento do navegador.');return;}
    if(field('id').value===id)resetProductForm();renderAll();
  }
  function renderProducts(){
    const list=$('products-list'),products=D.getProducts();list.replaceChildren();
    if(!products.length){list.append(empty('Nenhum produto cadastrado.'));return;}
    for(const p of products){
      const item=D.element('article','admin-item'),info=D.element('div','admin-item-main'),actions=D.element('div','admin-item-actions');
      info.append(D.element('strong','',p.name),D.element('p','',p.description),D.element('div','meta',`${D.CATEGORIES[p.category]} · ${D.money(p.price)}`));
      actions.append(action('Editar','',()=>startEdit(p.id)),action('Excluir','danger',()=>deleteProduct(p.id)));item.append(info,actions);list.append(item);
    }
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();const feedback=$('product-feedback');feedback.classList.remove('error');
    const current=D.getProducts();const product={id:field('id').value||D.id(),name:field('name').value.trim(),description:field('description').value.trim(),category:field('category').value,price:Number(field('price').value),image:field('image').value.trim()};
    if(!product.name||!product.description||!D.CATEGORIES[product.category]||!Number.isFinite(product.price)||product.price<.01||product.price>99999){feedback.textContent='Preencha todos os campos obrigatórios com valores válidos.';feedback.classList.add('error');return;}
    if(product.image&&!D.safeImage(product.image)){feedback.textContent='A URL da imagem deve começar com https:// e ser válida.';feedback.classList.add('error');return;}
    const index=current.findIndex(p=>p.id===product.id);
    if(index>=0)current[index]=product;else current.push(product);
    if(!D.saveProducts(current)){feedback.textContent='Não foi possível salvar. Verifique o armazenamento local.';feedback.classList.add('error');return;}
    resetProductForm();renderAll();$('product-feedback').textContent='Produto salvo no cardápio local de demonstração.';
  });
  $('cancel-edit').addEventListener('click',resetProductForm);
  $('reset-products').addEventListener('click',()=>{
    if(!confirm('Restaurar os produtos de exemplo? Os itens personalizados serão substituídos.'))return;
    if(!D.saveProducts(D.DEFAULT_PRODUCTS)){alert('Falha ao salvar os produtos.');return;}
    resetProductForm();renderAll();
  });
  function makeStatusSelect(current,options,onChange){
    const select=D.element('select','status-select');select.setAttribute('aria-label','Alterar status');
    for(const status of options){const opt=D.element('option','',status);opt.value=status;select.append(opt);}
    select.value=options.includes(current)?current:options[0];
    select.addEventListener('change',()=>onChange(select.value));return select;
  }
  function changeStatus(type,id,status){
    const isOrder=type==='order';const current=isOrder?D.getOrders():D.getReservations();const item=current.find(i=>i.id===id);
    if(!item)return;
    item.status=status;
    const saved=isOrder?D.saveOrders(current):D.saveReservations(current);
    if(!saved){alert('Não foi possível atualizar o status.');renderAll();return;}
    renderAll();
  }
  function renderOrders(){
    const list=$('orders-list');list.replaceChildren();const orders=D.getOrders();if(!orders.length){list.append(empty('Nenhum pedido de demonstração foi criado.'));return;}
    for(const order of orders){
      const item=D.element('article','admin-item'),info=D.element('div','admin-item-main'),actions=D.element('div','admin-item-actions');
      const lines=Array.isArray(order.items)?order.items.map(i=>`${Number(i.quantity)||0}× ${String(i.name||'Produto')}`).join(', '):'Sem itens';
      info.append(D.element('strong','',`${order.customer||'Cliente'} • ${D.money(order.total)}`),D.element('p','',`${order.fulfillment==='entrega'?'Entrega':'Retirada'} · ${formatInstant(order.createdAt)}`),D.element('p','',lines));
      if(order.fulfillment==='entrega'&&order.address)info.append(D.element('p','',`Endereço de teste: ${order.address}`));
      actions.append(makeStatusSelect(order.status,D.ORDER_STATUSES,status=>changeStatus('order',order.id,status)));item.append(info,actions);list.append(item);
    }
  }
  function renderReservations(){
    const list=$('reservations-list');list.replaceChildren();const reservations=D.getReservations();if(!reservations.length){list.append(empty('Nenhuma solicitação de reserva simulada foi criada.'));return;}
    for(const reservation of reservations){
      const item=D.element('article','admin-item'),info=D.element('div','admin-item-main'),actions=D.element('div','admin-item-actions');
      info.append(D.element('strong','',`${reservation.customer||'Cliente'} • ${reservation.guests||'?'} pessoa(s)`),D.element('p','',`${D.formatDate(reservation.date)} às ${reservation.time||'—'}`));
      if(reservation.notes)info.append(D.element('p','',`Observações: ${reservation.notes}`));
      actions.append(makeStatusSelect(reservation.status,D.RESERVATION_STATUSES,status=>changeStatus('reservation',reservation.id,status)));item.append(info,actions);list.append(item);
    }
  }
  function renderAll(){refreshStats();renderProducts();renderOrders();renderReservations();}
  document.querySelectorAll('.admin-tab').forEach(tab=>tab.addEventListener('click',()=>{
    document.querySelectorAll('.admin-tab').forEach(b=>{const active=b===tab;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('.admin-panel').forEach(panel=>{panel.hidden=panel.id!==tab.dataset.panel;});
  }));
  window.addEventListener('storage',renderAll);
  renderAll();
})();
