/* HANOK Studio: painel de demonstração. Só exibe dados a usuários admin logados. */
(() => {
 'use strict';
 const D=window.HanokData,A=window.HanokAuth,UI=window.HanokUI;
 if(!D||!A)return;
 const user=A.requireRole('admin');if(!user)return;
 document.body.classList.add('authorized');
 const $=id=>document.getElementById(id);
 const form=$('product-form'),field=n=>form.elements.namedItem(n);
 const viewLabels={overview:['Visão geral','Todos os detalhes da HANOK em um só lugar.'],products:['Cardápio','Organize os sabores e valores da HANOK.'],orders:['Pedidos','Acompanhe o preparo e a conclusão dos pedidos.'],reservations:['Reservas','Gerencie as solicitações de atendimento.'],users:['Usuários e acessos','Controle os perfis dos usuários cadastrados.'],settings:['Configurações','Personalize sua experiência de administração.']};
 let view='overview',query='';
 $('admin-name').textContent=user.name.split(' ')[0];
 $('today-chip').textContent=new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date());
 $('admin-logout').addEventListener('click',()=>A.logout());
 function isVisible(text){return String(text||'').toLocaleLowerCase('pt-BR').includes(query);}
 function el(tag,cls,text){return D.element(tag,cls,text);}
 function action(label,classes,fn,title){const b=el('button','small-action '+classes,label);b.type='button';if(title)b.title=title;b.addEventListener('click',fn);return b;}
 function feedback(message,error=false){const f=$('product-feedback');f.textContent=message;f.classList.toggle('error',error);UI?.toast(message,error?'error':'success');}
 function empty(message){return el('div','admin-empty',message);}
 function dateTime(value){const d=new Date(value);return Number.isNaN(d.getTime())?'Data não informada':new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d);}
 function pill(status){const x=el('span','status-pill status-'+String(status).toLowerCase().replace(/[^a-z0-9]/g,'-'),status);return x;}
 function go(next){
   if(!viewLabels[next])return;view=next;query='';$('admin-search').value='';
   document.querySelectorAll('[data-page]').forEach(e=>{const active=e.dataset.page===next;e.hidden=!active;e.classList.toggle('active',active);});
   document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===next;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
   $('breadcrumb-current').textContent=viewLabels[next][0];$('view-title').textContent=viewLabels[next][0];$('view-description').textContent=viewLabels[next][1];
   $('main-cta').hidden=next!=='overview'&&next!=='products';
   document.querySelector('.dashboard-shell').classList.remove('sidebar-open');$('sidebar-toggle').setAttribute('aria-expanded','false');
   renderAll();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 }
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
 document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.jump)));
 $('main-cta').addEventListener('click',()=>{go('products');field('name').focus({preventScroll:true});});
 $('sidebar-toggle').addEventListener('click',()=>{const open=document.querySelector('.dashboard-shell').classList.toggle('sidebar-open');$('sidebar-toggle').setAttribute('aria-expanded',String(open));});
 $('admin-search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('pt-BR');renderAll();});
 function stats(){
   $('stat-products').textContent=D.getProducts().length;$('stat-orders').textContent=D.getOrders().length;$('stat-reservations').textContent=D.getReservations().length;$('stat-users').textContent=A.userList().length;
   $('sidebar-orders').textContent=D.getOrders().filter(o=>!['Concluído','Cancelado'].includes(o.status)).length;
   $('product-count').textContent=D.getProducts().length+' itens';$('user-count').textContent=A.userList().length+' usuários';
 }
 function resetForm(){form.reset();field('id').value='';$('product-form-title').textContent='Adicionar produto';$('save-product').textContent='Adicionar produto';$('cancel-edit').hidden=true;$('product-feedback').textContent='';}
 function editProduct(id){const product=D.getProducts().find(p=>p.id===id);if(!product)return;Object.keys(product).forEach(k=>{const input=field(k);if(input)input.value=product[k];});$('product-form-title').textContent='Editar produto';$('save-product').textContent='Salvar alterações';$('cancel-edit').hidden=false;form.scrollIntoView({block:'center',behavior:'smooth'});field('name').focus({preventScroll:true});}
 function removeProduct(id){const p=D.getProducts().find(x=>x.id===id);if(!p||!confirm(`Deseja excluir “${p.name}”?`))return;const success=D.saveProducts(D.getProducts().filter(x=>x.id!==id));if(!success)return UI.toast('Não foi possível excluir: armazenamento cheio ou bloqueado.','error');if(field('id').value===id)resetForm();UI.toast('Produto excluído.','success');renderAll();}
 function productRow(p){
   const row=el('article','admin-product-row'),image=el('div','row-image'),info=el('div','row-information'),act=el('div','record-actions');
   if(p.image){const img=document.createElement('img');img.loading='lazy';img.src=D.safeImage(p.image);img.alt='';img.addEventListener('error',()=>img.remove());image.append(img);}else image.textContent='◫';
   info.append(el('strong','',p.name),el('p','',`${D.CATEGORIES[p.category]} · ${D.money(p.price)}`),el('small','',p.description));act.append(action('Editar','',()=>editProduct(p.id)),action('Excluir','danger',()=>removeProduct(p.id)));
   row.append(image,info,act);return row;
 }
 function renderProducts(){const list=$('products-list');list.replaceChildren();const data=D.getProducts().filter(p=>isVisible(`${p.name} ${p.description} ${p.category}`));if(!data.length){list.append(empty('Nenhum produto corresponde à busca.'));return;}data.forEach(p=>list.append(productRow(p)));}
 $('cancel-edit').addEventListener('click',resetForm);
 form.addEventListener('submit',e=>{
   e.preventDefault();if(!form.reportValidity())return;
   const product={id:field('id').value||D.id(),name:field('name').value.trim().replace(/\s+/g,' '),description:field('description').value.trim(),category:field('category').value,price:Number(field('price').value),image:field('image').value.trim()};
   if(product.name.length<2||product.description.length<5||!Object.hasOwn(D.CATEGORIES,product.category)||!Number.isFinite(product.price)||product.price<.01||product.price>99999){feedback('Revise nome, descrição, categoria e preço. Preencha valores válidos.',true);return;}
   if(product.image&&!D.safeImage(product.image)){feedback('A imagem deve ter uma URL HTTPS válida.',true);return;}
   const data=D.getProducts();const idx=data.findIndex(p=>p.id===product.id);if(idx>=0)data[idx]=product;else data.unshift(product);
   if(!D.saveProducts(data)){feedback('Falha ao salvar. Verifique o armazenamento do navegador.',true);return;}
   resetForm();feedback('Produto salvo com sucesso.');renderAll();
 });
 $('reset-products').addEventListener('click',()=>{if(!confirm('Deseja restaurar o cardápio inicial?'))return;if(!D.saveProducts(D.DEFAULT_PRODUCTS))return UI.toast('Falha ao restaurar os produtos.','error');resetForm();UI.toast('Cardápio restaurado.','success');renderAll();});
 function statusControl(record,type){
   const sel=el('select','status-select');sel.setAttribute('aria-label','Alterar status');const opts=type==='order'?D.ORDER_STATUSES:D.RESERVATION_STATUSES;
   opts.forEach(s=>{const op=el('option','',s);op.value=s;sel.append(op);});sel.value=opts.includes(record.status)?record.status:opts[0];
   sel.addEventListener('change',()=>{
     const entries=type==='order'?D.getOrders():D.getReservations(),target=entries.find(x=>x.id===record.id);
     if(!target)return;target.status=sel.value;const ok=type==='order'?D.saveOrders(entries):D.saveReservations(entries);
     if(!ok){UI.toast('Não foi possível salvar o status.','error');renderAll();return;}
     UI.toast('Status atualizado.','success');renderAll();
   });return sel;
 }
 function recordRow(item,type,compact=false){
   const row=el('article','record-row'),badge=el('div','record-avatar',type==='order'?'▤':'◷'),data=el('div','record-info'),right=el('div','record-right');
   if(type==='order'){
     const lines=Array.isArray(item.items)?item.items.map(i=>`${Number(i.quantity)||0}× ${String(i.name||'Item')}`).join(', '):'Sem itens';
     data.append(el('strong','',`${item.customer||'Cliente'} · ${D.money(item.total)}`),el('small','',lines),el('small','',`${item.fulfillment==='entrega'?'Entrega':'Retirada'} • ${dateTime(item.createdAt)}`));
     if(item.fulfillment==='entrega'&&item.address&&!compact)data.append(el('small','',`Endereço: ${item.address}`));
   }else data.append(el('strong','',`${item.customer||'Cliente'} · ${item.guests||'?'} pessoa(s)`),el('small','',`${D.formatDate(item.date)} às ${item.time||'—'}`),el('small','',item.notes||'Sem observações'));
   if(compact)right.append(pill(item.status));else right.append(pill(item.status),statusControl(item,type));row.append(badge,data,right);return row;
 }
 function renderRecords(listId,items,type,compact=false){const root=$(listId);root.replaceChildren();const data=items.filter(x=>isVisible(`${x.customer} ${x.status} ${x.id}`));if(!data.length){root.append(empty(query?'Nenhum registro encontrado.':'Nenhum registro ainda. Experimente criar um pedido no site.'));return;}data.forEach(item=>root.append(recordRow(item,type,compact)));}
 function renderUsers(){
   const tbody=$('users-tbody');tbody.replaceChildren();const users=A.userList().filter(u=>isVisible(`${u.name} ${u.email} ${u.role}`));$('users-empty').hidden=!!users.length;
   for(const u of users){
     const tr=document.createElement('tr');const main=document.createElement('td');const wrap=el('div','user-cell'),avatar=el('span','avatar '+(u.role==='admin'?'avatar-admin':''),u.name.charAt(0).toUpperCase()),label=el('span','user-detail');label.append(el('strong','',u.name),el('small','',u.email));wrap.append(avatar,label);main.append(wrap);
     const roleTd=document.createElement('td');roleTd.append(pill(u.role==='admin'?'Administrador':'Cliente'));
     const stat=document.createElement('td');stat.append(pill(u.active?'Ativo':'Inativo'));
     const created=document.createElement('td');created.textContent=dateTime(u.createdAt);
     const actions=document.createElement('td'),ctrl=el('div','user-controls');
     if(u.id===user.id){ctrl.append(el('span','muted','Sua conta'));}
     else{
       const select=el('select','status-select');select.setAttribute('aria-label',`Perfil de ${u.name}`);for(const role of ['cliente','admin']){const op=el('option','',role==='admin'?'Administrador':'Cliente');op.value=role;select.append(op);}select.value=u.role;select.addEventListener('change',()=>updateAccess(u.id,{field:'role',value:select.value}));
       const toggle=action(u.active?'Desativar':'Ativar',u.active?'danger':'',()=>updateAccess(u.id,{field:'active',value:!u.active}));ctrl.append(select,toggle);
     }
     actions.append(ctrl);tr.append(main,roleTd,stat,created,actions);tbody.append(tr);
   }
 }
 function updateAccess(id,change){
   const subject=A.userList().find(u=>u.id===id);if(!subject)return;
   if(!confirm(`Deseja ${change.field==='role'?'alterar o perfil de':'alterar o status de'} ${subject.name}?`)){renderUsers();return;}
   try{A.updateUser(id,change);UI.toast('Permissão atualizada.','success');renderAll();}catch(err){UI.toast(err.message,'error');renderAll();}
 }
 function renderAll(){stats();renderProducts();renderRecords('orders-list',D.getOrders(),'order');renderRecords('reservations-list',D.getReservations(),'reservation');renderRecords('recent-orders',D.getOrders().slice(0,4),'order',true);renderRecords('recent-reservations',D.getReservations().slice(0,4),'reservation',true);renderUsers();}
 window.addEventListener('storage',renderAll);
 go('overview');
})();
