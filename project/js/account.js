(() => {
 'use strict';const A=window.HanokAuth,D=window.HanokData,$=id=>document.getElementById(id);
 const u=A.current();if(!u){A.requireRole('cliente');return;}
 document.body.classList.add('authorized');
 $('profile-name').textContent=u.name.split(' ')[0];$('profile-fullname').textContent=u.name;$('profile-email').textContent=u.email;$('profile-role').textContent=u.role==='admin'?'Administrador':'Cliente';$('profile-avatar').textContent=u.name.charAt(0).toUpperCase();$('account-logout').addEventListener('click',()=>A.logout());
 function render(type){const list=$(type==='order'?'my-orders':'my-reservations');list.replaceChildren();const records=(type==='order'?D.getOrders():D.getReservations()).filter(x=>x.userId===u.id);
   if(!records.length){list.append(D.element('div','admin-empty',type==='order'?'Você ainda não realizou pedidos de demonstração.':'Você ainda não solicitou reservas de demonstração.'));return;}
   for(const r of records){const row=D.element('article','record-row'),icon=D.element('span','record-avatar',type==='order'?'▤':'◷'),info=D.element('div','record-info'),right=D.element('div','record-right');
     if(type==='order')info.append(D.element('strong','',`${D.money(r.total)} · ${r.fulfillment==='entrega'?'Entrega':'Retirada'}`),D.element('small','',r.items.map(i=>`${i.quantity}× ${i.name}`).join(', ')));else info.append(D.element('strong','',`${r.guests} pessoa(s) · ${D.formatDate(r.date)} às ${r.time}`),D.element('small','',r.notes||'Sem observações'));
     right.append(D.element('span','status-pill',r.status));row.append(icon,info,right);list.append(row);
   }
 }
 render('order');render('reservation');window.addEventListener('storage',()=>{render('order');render('reservation');});
})();
