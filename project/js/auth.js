/* Autenticação SIMULADA no navegador — não confere segurança para produção. */
(() => {
  'use strict';
  const ACCOUNTS_KEY='hanok:demo:v2:accounts';
  const SESSION_KEY='hanok:demo:v2:session';
  const DEMO_EMAIL='admin@hanok.demo';
  const DEMO_PASSWORD='Hanok@2026'; // Somente conta pública de teste; nunca colocar senha real aqui.
  const getAccounts=()=>{try {const x=JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||'[]');return Array.isArray(x)?x:[];}catch{return [];}};
  const saveAccounts=a=>{try{localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(a));return true;}catch{return false;}};
  const publicUser=u=>u?{id:u.id,name:u.name,email:u.email,role:u.role,active:u.active!==false,createdAt:u.createdAt}:null;
  const normMail=v=>String(v||'').trim().toLowerCase();
  const secureString=v=>String(v||'').trim().replace(/\s+/g,' ');
  const validMail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)&&v.length<=120;
  function uid(){return 'user-'+crypto.randomUUID();}
  function salt(){const b=crypto.getRandomValues(new Uint8Array(16));return Array.from(b,v=>v.toString(16).padStart(2,'0')).join('');}
  async function hash(password,hexSalt){
    if(!crypto?.subtle)throw new Error('Abra o projeto pelo servidor local (http://localhost).');
    const bytes=new TextEncoder().encode(password);
    const key=await crypto.subtle.importKey('raw',bytes,'PBKDF2',false,['deriveBits']);
    const derived=await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(hexSalt.match(/.{2}/g).map(x=>parseInt(x,16))),iterations:120000,hash:'SHA-256'},key,256);
    return Array.from(new Uint8Array(derived),v=>v.toString(16).padStart(2,'0')).join('');
  }
  async function ensureAdmin(){
    const accounts=getAccounts();
    if(accounts.some(a=>a.email===DEMO_EMAIL))return;
    const s=salt();accounts.push({id:uid(),name:'Administrador HANOK',email:DEMO_EMAIL,role:'admin',active:true,salt:s,passwordHash:await hash(DEMO_PASSWORD,s),createdAt:new Date().toISOString(),demo:true});
    if(!saveAccounts(accounts))throw new Error('Sem acesso ao armazenamento. Confira o modo privado do navegador.');
  }
  function current(){
    let id;try{id=sessionStorage.getItem(SESSION_KEY);}catch{return null;}
    if(!id)return null;
    const u=getAccounts().find(a=>a.id===id&&a.active!==false);
    if(!u){logout(false);return null;}
    return publicUser(u);
  }
  function logout(redirect=true){try{sessionStorage.removeItem(SESSION_KEY);}catch{}window.dispatchEvent(new Event('hanok:auth'));if(redirect)location.assign('index.html');}
  async function register(name,email,password){
    const n=secureString(name),e=normMail(email);
    if(n.length<3||n.length>70)throw new Error('Informe um nome de 3 a 70 caracteres.');
    if(!validMail(e))throw new Error('Informe um e-mail válido.');
    if(password.length<8||password.length>128||!/[a-zA-Z]/.test(password)||!/[0-9]/.test(password))throw new Error('Use 8 a 128 caracteres, incluindo letra e número.');
    await ensureAdmin();
    if(getAccounts().some(a=>a.email===e))throw new Error('Já existe uma conta com esse e-mail. Faça login.');
    const s=salt(),record={id:uid(),name:n,email:e,role:'cliente',active:true,salt:s,passwordHash:await hash(password,s),createdAt:new Date().toISOString()};
    if(!saveAccounts([...getAccounts(),record]))throw new Error('Não foi possível salvar o cadastro no navegador.');
    sessionStorage.setItem(SESSION_KEY,record.id);window.dispatchEvent(new Event('hanok:auth'));return publicUser(record);
  }
  async function login(email,password){
    await ensureAdmin();
    const u=getAccounts().find(a=>a.email===normMail(email));
    // Mensagem genérica impede diferenciar e-mail inexistente de senha inválida.
    if(!u||await hash(password,u.salt)!==u.passwordHash)throw new Error('E-mail ou senha incorretos.');
    if(u.active===false)throw new Error('Conta desativada. Entre em contato com um administrador.');
    try{sessionStorage.setItem(SESSION_KEY,u.id);}catch{throw new Error('Ative o armazenamento de sessão no navegador.');}
    window.dispatchEvent(new Event('hanok:auth'));return publicUser(u);
  }
  function requireRole(role){const u=current();if(u&&u.role===role)return u;const url=new URL('login.html',location.href);url.searchParams.set('next',role==='admin'?'admin.html':'minha-conta.html');if(u&&u.role!=='admin'&&role==='admin'){url.searchParams.set('erro','permissao');}location.replace(url.href);return null;}
  function updateUser(id,change){
    const actor=current();if(!actor||actor.role!=='admin')throw new Error('Somente administradores podem alterar acessos.');
    if(!['role','active'].includes(change.field))throw new Error('Campo não permitido.');
    const users=getAccounts(),u=users.find(a=>a.id===id);
    if(!u)throw new Error('Usuário não encontrado.');
    if(u.id===actor.id)throw new Error('Você não pode alterar o próprio acesso.');
    if(u.demo&&change.field==='active'&&change.value===false)throw new Error('A conta principal de demonstração deve permanecer ativa.');
    if(change.field==='role'&&!['admin','cliente'].includes(change.value))throw new Error('Perfil inválido.');
    if(change.field==='active'&&typeof change.value!=='boolean')throw new Error('Status inválido.');
    if(u.role==='admin'&&(change.field==='role'&&change.value==='cliente'||change.field==='active'&&change.value===false)&&users.filter(a=>a.role==='admin'&&a.active!==false).length<=1)throw new Error('É necessário manter pelo menos um administrador ativo.');
    u[change.field]=change.value;
    if(!saveAccounts(users))throw new Error('Falha ao salvar a alteração.');
    return publicUser(u);
  }
  function userList(){if(current()?.role!=='admin')return [];return getAccounts().map(publicUser);}
  window.HanokAuth={ensureAdmin,current,register,login,logout,requireRole,updateUser,userList,DEMO_EMAIL};
  function accountUI(){
    document.querySelectorAll('[data-account-link]').forEach(el=>{
      const u=current();el.textContent=u?u.name.split(' ')[0]:'Entrar';el.href=u?(u.role==='admin'?'admin.html':'minha-conta.html'):'login.html';
    });
    document.querySelectorAll('[data-admin-link]').forEach(el=>el.hidden=current()?.role!=='admin');
    document.querySelectorAll('[data-logout]').forEach(el=>el.hidden=!current());
  }
  document.addEventListener('DOMContentLoaded',()=>{accountUI();document.querySelectorAll('[data-logout]').forEach(el=>el.addEventListener('click',()=>logout()));});
  window.addEventListener('hanok:auth',accountUI);
})();
