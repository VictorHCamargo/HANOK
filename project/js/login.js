(() => {
 'use strict';const A=window.HanokAuth,UI=window.HanokUI;
 const $=id=>document.getElementById(id);
 const params=new URLSearchParams(location.search);
 const safeNext=()=>{const next=params.get('next');return ['admin.html','minha-conta.html','index.html','index.html#cardapio','index.html#reserva'].includes(next)?next:null;};
 const show=(mode)=>{const login=mode==='login';$('login-form').hidden=!login;$('register-form').hidden=login;for(const [id,active] of [['tab-login',login],['tab-register',!login]]){$(id).classList.toggle('active',active);$(id).setAttribute('aria-pressed',String(active));}$('login-feedback').textContent='';$('register-feedback').textContent='';};
 $('tab-login').addEventListener('click',()=>show('login'));
 $('tab-register').addEventListener('click',()=>show('register'));
 $('fill-demo').addEventListener('click',()=>{show('login');$('login-form').elements.email.value='admin@hanok.demo';$('login-form').elements.password.value='Hanok@2026';$('login-form').elements.password.focus();});
 if(params.get('erro')==='permissao')UI.toast('Você precisa ser administrador para acessar essa área.','error');
 function redirect(user){const next=safeNext();location.assign(next&&!(next==='admin.html'&&user.role!=='admin')?next:user.role==='admin'?'admin.html':'minha-conta.html');}
 $('login-form').addEventListener('submit',async e=>{
   e.preventDefault();const form=e.currentTarget,btn=form.querySelector('button[type=submit]');$('login-feedback').textContent='';UI.loading(btn,true,'Verificando conta...');
   try{const user=await A.login(form.elements.email.value,form.elements.password.value);UI.toast('Login realizado.','success');redirect(user);}catch(err){$('login-feedback').textContent=err.message;$('login-feedback').classList.add('error');UI.toast(err.message,'error');}finally{UI.loading(btn,false);}
 });
 $('register-form').addEventListener('submit',async e=>{
   e.preventDefault();const f=e.currentTarget,btn=f.querySelector('button[type=submit]');$('register-feedback').textContent='';
   if(f.elements.password.value!==f.elements.confirm.value){$('register-feedback').textContent='As senhas não coincidem.';$('register-feedback').classList.add('error');return;}
   UI.loading(btn,true,'Criando conta...');
   try{const user=await A.register(f.elements.name.value,f.elements.email.value,f.elements.password.value);UI.toast('Cadastro realizado com sucesso!','success');redirect(user);}catch(err){$('register-feedback').textContent=err.message;$('register-feedback').classList.add('error');UI.toast(err.message,'error');}finally{UI.loading(btn,false);}
 });
})();
