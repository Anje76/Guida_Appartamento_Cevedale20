/* =====================================================================
   CEVEDALE 20 — Registrazione Dati Ospite
   Add-on per index.html: si aggancia con UNA riga prima di </body>:
       <script src="registrazione.js"></script>
   - Cifra dati e foto nel browser (RSA-OAEP + AES-GCM) con la TUA chiave pubblica
   - Invia solo dati cifrati a Supabase (nessuno, nemmeno Supabase, può leggerli)
   ===================================================================== */
(function(){
'use strict';

/* ---------- CONFIGURAZIONE (da compilare, vedi guida) ---------- */
const REG_CONFIG = {
  supabaseUrl: 'https://qocougqxmpsenxcgyivu.supabase.co',
  anonKey: 'sb_publishable_ZywV8Deo6NBHSS8Ale92mA_tO6jIevf',
  publicKey: {"alg":"RSA-OAEP-256","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"yF0aGc55lYwj4Hr-9rXWU_gp-ALjBpP2vpMdL_8aCA7waxTJ7QO-Ii0dWktBpHjh6Tmrku75mrPoWrNmWUhnyL619PY1_oQWAaMraiXxfqqrRAeGpWjS59sYZmunOK8uTjAVZ0ZTuQfHBavwqXEUyDxAbPsx4sjXzYQZh4wZAMYUeyySH2WVV9Tu9BVs0H6__0Os9tDz-_9zUeopIQ7pJWNn9xDnsnlQrndt9uOitSxT-CG_P7olHOp_uHwBXLcj84sZonNIL7slmJqOyiu9XK5d6NdmBSqYvvNc0k69LW7SVZhezazzHlSm7P4sOrxTskMsFNj6ON9wjAfIJ63pe3qCQC-0k_2jtPtZSzDHHgvNrgMQLUWHWf6pbhPCv6L5ra7dPvsZ3-A11ESmcNozKQ4AMMGkKVdIliP6Ms-ZN3bclnWdRHf74OIopuZQMnc9QEmmnJmJZ5e7VBjHMToJEvPnthgpopSD58w0oOMrqLRb7Bm3ehMNKzFe6KA0Mbc3V6lful92UAS11wQIUVYOJ_wm3scP7XbL2CSOBLMand7SVIk1K2u4oKfv8t4SKMA48fDbXK_hr-ontkBVUqBIzoWUEZBnuZM4jiNf7x0n7kWgnEFiO2JR3urP6n6QXsdRxa_06xENkdEv-QtU4-7OByOUnBZ-r860XX4g36H4e-k"}
};

/* ---------- STILE (stesso linguaggio grafico dell'app) ---------- */
const css = `
.tile.wide{grid-column:1/-1; flex-direction:row; text-align:left; gap:14px; padding:16px 16px;
  background:linear-gradient(135deg,var(--forest),var(--forest-dk)); border-color:var(--forest-dk); color:#fff;
  box-shadow:0 14px 28px -12px rgba(51,81,58,.6), 0 0 0 2px rgba(227,165,58,.6);}
.tile.wide:hover{border-color:var(--gold); box-shadow:0 14px 28px -12px rgba(51,81,58,.6), 0 0 0 2px var(--gold);}
.tile.wide .tile-icon{width:56px;height:56px;border-radius:17px;flex:none;background:linear-gradient(160deg,#F3C873,var(--gold));color:var(--forest-dk);}
.tile.wide .tile-icon svg{width:29px;height:29px;}
.tile.wide .tile-text{flex:1;min-width:0;display:block;}
.tile.wide .tile-badge{display:inline-block;background:var(--gold);color:var(--forest-dk);font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:3px 9px;border-radius:999px;margin-bottom:5px;}
.tile.wide .tile-label{display:block;font-family:'Baloo 2',sans-serif;font-size:17.5px;color:#fff;line-height:1.15;}
.tile.wide .tile-sub{display:block;font-size:12px;line-height:1.4;color:rgba(255,255,255,.82);margin-top:3px;font-weight:500;}
.tile.wide .chev{display:flex;flex:none;color:var(--gold);}
.tile.wide .chev svg{width:22px;height:22px;}

.b-code.long .val{font-family:'Inter',sans-serif;font-size:13.5px;letter-spacing:0;font-weight:600;line-height:1.35;}
.b-code .goto{background:var(--gold)!important;color:var(--forest-dk)!important;border-color:var(--gold)!important;}

.reg-card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius-md);padding:14px;margin:0 0 14px;box-shadow:var(--shadow-sm);}
.reg-card h3{font-family:'Baloo 2',sans-serif;font-size:16px;margin:0 0 10px;color:var(--forest-dk);display:flex;align-items:center;justify-content:space-between;gap:8px;}
.reg-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 10px;}
.reg-f{min-width:0;}
.reg-f.full{grid-column:1/-1;}
.reg-f label{font-size:12px;font-weight:700;color:var(--forest-dk);display:block;margin-bottom:4px;}
.reg-f small{display:block;font-size:11px;color:var(--ink-soft);margin:-6px 0 8px;font-weight:500;}
.reg-f input[type=text],.reg-f input[type=date],.reg-f select{width:100%;border:1px solid var(--line);border-radius:var(--radius-sm);padding:10px 11px;font-family:inherit;font-size:14px;margin-bottom:10px;background:#fff;color:var(--ink);min-width:0;}
.reg-f.err input,.reg-f.err select{border-color:var(--danger);background:#FFF5F2;}
.reg-check{display:flex!important;gap:10px;align-items:flex-start;font-weight:500!important;font-size:13px!important;line-height:1.45;color:var(--ink)!important;}
.reg-check input{width:20px;height:20px;flex:none;margin:1px 0 0;accent-color:var(--forest);}
.reg-f.err .reg-check{color:var(--danger)!important;}
.reg-photos{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px;}
.reg-photo{border:1.5px dashed #C9BB98;border-radius:var(--radius-sm);padding:8px;text-align:center;background:rgba(255,255,255,.5);}
.reg-photo.err{border-color:var(--danger);background:#FFF5F2;}
.reg-photo .slot-title{font-size:12px;font-weight:700;color:var(--forest-dk);margin-bottom:6px;}
.reg-photo .pv{height:92px;border-radius:8px;background:var(--cream) center/cover no-repeat;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);font-size:12px;margin-bottom:7px;}
.reg-photo .btns{display:flex;gap:6px;}
.reg-mini{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:var(--cream);border:1px solid var(--line);border-radius:999px;padding:7px 6px;font-size:12px;font-weight:700;color:var(--forest-dk);cursor:pointer;}
.reg-mini svg{width:14px;height:14px;color:var(--gold-dk);}
.reg-x{border:none;background:transparent;color:var(--danger);font-size:12px;font-weight:700;cursor:pointer;padding:4px;}
.reg-primary{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:none;border-radius:999px;padding:15px;background:var(--forest);color:#fff;font-weight:700;font-size:14.5px;cursor:pointer;box-shadow:0 12px 24px -10px rgba(51,81,58,.55);margin:0 0 10px;}
.reg-primary:disabled{opacity:.6;cursor:wait;}
.reg-ghost{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:1.5px solid var(--forest);border-radius:999px;padding:12px;background:transparent;color:var(--forest-dk);font-weight:700;font-size:13.5px;cursor:pointer;margin:0 0 10px;}
.reg-msg{font-size:13px;line-height:1.45;margin:0 0 10px;color:var(--ink-soft);}
.reg-msg.bad{color:var(--danger);font-weight:600;}
.b-note.ok{background:#E8F2E6;border-color:#B9D4B3;border-left-color:var(--forest);}
.b-step.wait .num{background:var(--gold-dk);}
.b-step.off .num{background:#B9AF98;}
`;

/* ---------- TESTI ---------- */
const REG_T = {
it:{
  notConfigured:'Il servizio di registrazione online non è ancora attivo. Contattate l’host per completare la registrazione.',
  noCrypto:'Per proteggere i vostri dati serve una connessione sicura (HTTPS). Aprite il sito dal link ufficiale.',
  codeLabel:'Codice soggiorno', codeHelp:'Lo trovate nel messaggio dell’host, oppure aprite direttamente il link che vi è stato inviato.',
  cont:'Continua', checking:'Verifica in corso…',
  invalid:'Codice non valido o soggiorno già concluso.', net:'Connessione non riuscita. Controllate la rete e riprovate.',
  formIntro:'Potete registrare fino a <b>{left}</b> ospiti. Per ogni persona servono i dati anagrafici e le foto (fronte e retro) del documento.',
  guest:'Ospite', guestType:'Tipo di ospite',
  t16:'Ospite singolo', t17:'Capofamiglia', t18:'Capogruppo', t19:'Familiare', t20:'Membro del gruppo',
  surname:'Cognome', name:'Nome', sex:'Sesso', male:'Maschio', female:'Femmina', pick0:'— scegli —',
  birthDate:'Data di nascita', birthPlace:'Luogo di nascita', birthPlaceHint:'Comune e provincia, oppure Stato estero',
  citizenship:'Cittadinanza',
  noDoc:'Minorenne senza documento (non servono i dati del documento)',
  docType:'Tipo di documento', dIdc:'Carta d’identità', dPass:'Passaporto', dLic:'Patente di guida', dOther:'Altro documento',
  docNumber:'Numero del documento', docIssuer:'Rilasciato da', docIssuerHint:'Comune o Stato di rilascio',
  photoFront:'Documento — fronte', photoBack:'Documento — retro', noPhoto:'Nessuna foto', take:'Scatta', pick:'Galleria',
  remove:'Rimuovi', addGuest:'+ Aggiungi un altro ospite',
  consent:'Ho letto l’informativa sopra e acconsento al trattamento dei dati miei e degli altri ospiti da me registrati, per la sola comunicazione alla Questura. Dichiaro di essere autorizzato a fornirli.',
  send:'🔒 Cifra e invia', sending:'Cifratura e invio dell’ospite {i} di {n}…',
  fix:'Completate i campi evidenziati e allegate tutte le foto richieste.',
  full:'È stato raggiunto il numero massimo di ospiti per questo soggiorno.',
  sendErr:'Invio non riuscito. Riprovate: gli ospiti già inviati non vengono duplicati.',
  imgErr:'Impossibile leggere la foto. Riprovate.',
  sentBanner:'<b>Trasmissione avvenuta.</b> Dati e documenti sono stati cifrati e inviati all’host. Codice di ricezione: <b>{refs}</b>',
  st1Title:'Dati trasmessi', st1Text:'{n} di {max} ospiti registrati.',
  st2Title:'Controllo dei documenti',
  st2Wait:'In attesa del controllo da parte dell’host ({v} di {n} verificati). Questa pagina si aggiorna da sola.',
  st2Done:'<b>Controllo completato.</b> I documenti sono stati verificati dall’host.',
  st3Title:'Accesso all’appartamento', st3Wait:'Il codice della cassetta di sicurezza comparirà qui.',
  st3Done:'Ecco il codice della cassetta di sicurezza. Le istruzioni sono nella scheda “Check-in & Check-out”.',
  lockLabel:'Codice cassetta di sicurezza', copy:'Copia', copied:'Copiato ✓',
  refresh:'Aggiorna stato', addMore:'+ Registra un altro ospite', other:'Usa un altro codice soggiorno'
},
en:{
  notConfigured:'The online registration service is not active yet. Please contact the host to complete your registration.',
  noCrypto:'A secure connection (HTTPS) is required to protect your data. Please open the site from the official link.',
  codeLabel:'Stay code', codeHelp:'You’ll find it in the message from the host, or just open the link you were sent.',
  cont:'Continue', checking:'Checking…',
  invalid:'Invalid code, or the stay has already ended.', net:'Connection failed. Please check your network and try again.',
  formIntro:'You can register up to <b>{left}</b> guests. For each person we need personal details and photos (front and back) of their ID document.',
  guest:'Guest', guestType:'Guest type',
  t16:'Single guest', t17:'Head of family', t18:'Group leader', t19:'Family member', t20:'Group member',
  surname:'Surname', name:'First name', sex:'Sex', male:'Male', female:'Female', pick0:'— select —',
  birthDate:'Date of birth', birthPlace:'Place of birth', birthPlaceHint:'Town and province, or foreign country',
  citizenship:'Citizenship',
  noDoc:'Minor without an ID document (document details not needed)',
  docType:'Document type', dIdc:'Identity card', dPass:'Passport', dLic:'Driving licence', dOther:'Other document',
  docNumber:'Document number', docIssuer:'Issued by', docIssuerHint:'Town or country of issue',
  photoFront:'Document — front', photoBack:'Document — back', noPhoto:'No photo', take:'Take photo', pick:'Gallery',
  remove:'Remove', addGuest:'+ Add another guest',
  consent:'I have read the notice above and consent to the processing of my data and that of the other guests I register, solely for communication to the Police (Questura). I confirm I am authorised to provide it.',
  send:'🔒 Encrypt & send', sending:'Encrypting and sending guest {i} of {n}…',
  fix:'Please complete the highlighted fields and attach all required photos.',
  full:'The maximum number of guests for this stay has been reached.',
  sendErr:'Sending failed. Please try again: guests already sent won’t be duplicated.',
  imgErr:'Could not read the photo. Please try again.',
  sentBanner:'<b>Transmission completed.</b> Your data and documents were encrypted and sent to the host. Receipt code: <b>{refs}</b>',
  st1Title:'Data sent', st1Text:'{n} of {max} guests registered.',
  st2Title:'Document check',
  st2Wait:'Waiting for the host’s check ({v} of {n} verified). This page refreshes by itself.',
  st2Done:'<b>Check completed.</b> Your documents have been verified by the host.',
  st3Title:'Access to the apartment', st3Wait:'The lock box code will appear here.',
  st3Done:'Here is the lock box code. Instructions are in the “Check-in & Check-out” section.',
  lockLabel:'Lock box code', copy:'Copy', copied:'Copied ✓',
  refresh:'Refresh status', addMore:'+ Register another guest', other:'Use a different stay code'
}};
function rt(k,v){ let s=(REG_T[lang]||REG_T.it)[k]; if(s===undefined) s=k; if(v) for(const x in v) s=s.split('{'+x+'}').join(v[x]); return s; }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------- CONTENUTI DELLA SCHEDA + AGGANCI AI DATI ESISTENTI ---------- */
ICONS.idcard = '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.8-2.3 3-2.3s2.4.7 3 2.3M14.5 10h4M14.5 13h3"/>';

const NAV = {
  it:{id:'register', icon:'idcard', wide:true, badge:'Obbligatorio', label:'Registrazione Dati Ospite', sub:'Inviate i documenti in modo sicuro e ricevete il codice per entrare'},
  en:{id:'register', icon:'idcard', wide:true, badge:'Required', label:'Guest Registration', sub:'Send your ID securely and get the code to enter the apartment'}
};
const SECTION = {
it:{title:'Registrazione Dati Ospite', blocks:[
  {t:'warn', text:'<b>Obbligo dell’host.</b> Ai sensi dell’art. 109 del T.U.L.P.S. (R.D. 773/1931) l’host deve identificare tutti gli ospiti, controllarne i documenti e comunicarne le generalità alla Questura tramite il portale Alloggiati Web entro 24 ore dall’arrivo. Per questo vi chiediamo di compilare questa scheda.'},
  {t:'p', text:'I dati e i documenti che inviate saranno <b>controllati e verificati</b> dall’host. Al termine dell’invio vedrete la <b>conferma di trasmissione</b> e, appena completato il controllo, anche la <b>conferma di verifica</b>.'},
  {t:'note', text:'<b>Privacy e sicurezza.</b> Dati e foto vengono <b>cifrati sul vostro dispositivo</b> prima dell’invio: solo l’host può leggerli. Sono usati esclusivamente per la comunicazione alla Questura e <b>cancellati automaticamente al termine del soggiorno</b>; non vengono conservati né ceduti a terzi.'},
  {t:'p', text:'Registrate <b>tutti gli ospiti</b>, compresi i minori. Tenete a portata di mano i documenti d’identità in corso di validità e il <b>codice soggiorno</b> ricevuto dall’host.'},
  {t:'regapp'}
]},
en:{title:'Guest Registration', blocks:[
  {t:'warn', text:'<b>Host’s legal duty.</b> Under Art. 109 of the Italian Consolidated Public Security Act (R.D. 773/1931), the host must identify all guests, check their documents and report their details to the Police (Questura) via the Alloggiati Web portal within 24 hours of arrival. That’s why we ask you to complete this form.'},
  {t:'p', text:'The data and documents you send will be <b>checked and verified</b> by the host. Once sent, you’ll see a <b>transmission confirmation</b> and, as soon as the check is done, a <b>verification confirmation</b> too.'},
  {t:'note', text:'<b>Privacy and security.</b> Data and photos are <b>encrypted on your device</b> before sending: only the host can read them. They are used solely for the report to the Police and <b>automatically deleted at the end of your stay</b>; they are neither kept nor shared with third parties.'},
  {t:'p', text:'Please register <b>all guests</b>, including minors. Have valid ID documents at hand, plus the <b>stay code</b> sent by the host.'},
  {t:'regapp'}
]}};

['it','en'].forEach(l=>{
  const d = DATA[l];
  const i = d.nav.findIndex(n=>n.id==='rules');           // subito dopo Check-in & Check-out
  d.nav.splice(i<0?3:i, 0, NAV[l]);
  d.sections.register = SECTION[l];
  // scheda Check-in: il codice cassetta rimanda alla registrazione
  d.sections.checkin.blocks.forEach(b=>{
    if(b.t==='code'){
      b.value = l==='it' ? 'Fornito al termine della registrazione dati ospite' : 'Provided after completing the guest registration';
      b.to = 'register';
      b.btn = l==='it' ? 'Registrati' : 'Register';
    }
    if(b.t==='p'){
      b.text = b.text.replace('(che vi verrà comunicata il giorno del check-in)','(che vi verrà comunicata al termine della registrazione dati ospite)')
                     .replace('(which you’ll receive on check-in day)','(which you’ll receive after completing the guest registration)');
    }
  });
});
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

/* ---------- AGGANCI ALLE FUNZIONI DELL'APP ---------- */
const _blockHTML = blockHTML;
blockHTML = function(b){
  if(b.t==='regapp') return '<div id="regRoot"></div>';
  if(b.t==='code' && b.to){
    return `<div class="b-code long"><div><div class="lbl">${b.label}</div><div class="val">${b.value}</div></div><button type="button" class="goto" onclick="openSection('${b.to}')">${b.btn||'→'}</button></div>`;
  }
  return _blockHTML(b);
};
const _renderHome = renderHome;
renderHome = function(){
  _renderHome();
  const grid = document.getElementById('grid');
  DATA[lang].nav.forEach((it,i)=>{
    if(!it.wide) return;
    const t = grid.children[i]; if(!t) return;
    t.className = 'tile wide';
    t.innerHTML = `<span class="tile-icon">${icon(it.icon)}</span><span class="tile-text"><span class="tile-badge">${it.badge}</span><span class="tile-label">${it.label}</span><span class="tile-sub">${it.sub}</span></span><span class="chev">${icon('arrow')}</span>`;
  });
};
const _openSection = openSection;
openSection = function(id){ regStop(); _openSection(id); if(document.getElementById('regRoot')) regInit(); };
const _closeSection = closeSection;
closeSection = function(){ regStop(); _closeSection(); };

/* ---------- STATO ---------- */
const REG = {code:'', info:null, guests:[], seq:0, refs:[], timer:null, busy:false};
const root = ()=>document.getElementById('regRoot');
function regConfigured(){ return REG_CONFIG.supabaseUrl.indexOf('YOUR-')<0 && REG_CONFIG.anonKey.indexOf('YOUR-')<0 && !!REG_CONFIG.publicKey; }
function regStop(){ if(REG.timer){ clearInterval(REG.timer); REG.timer=null; } }
function regMsg(t,bad){ const m=document.getElementById('regMsg'); if(m) m.innerHTML = t?`<div class="reg-msg${bad?' bad':''}">${t}</div>`:''; }
const norm = c=>(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const pretty = c=>c.length===8 ? c.slice(0,4)+'-'+c.slice(4) : c;

async function rpc(fn,args){
  const r = await fetch(REG_CONFIG.supabaseUrl+'/rest/v1/rpc/'+fn,{method:'POST',
    headers:{'Content-Type':'application/json',apikey:REG_CONFIG.anonKey,Authorization:'Bearer '+REG_CONFIG.anonKey},
    body:JSON.stringify(args)});
  let j=null; try{ j=await r.json(); }catch(e){}
  if(!r.ok) throw new Error((j&&j.message)||('http_'+r.status));
  return j;
}

/* ---------- CIFRATURA (end-to-end) ---------- */
function b64(buf){ let s=''; const a=new Uint8Array(buf); for(let i=0;i<a.length;i+=0x8000) s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000)); return btoa(s); }
let _pub=null;
async function pubKey(){
  if(!_pub) _pub = await crypto.subtle.importKey('jwk',REG_CONFIG.publicKey,{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt']);
  return _pub;
}
async function encrypt(obj){
  const pub = await pubKey();
  const aes = await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({name:'AES-GCM',iv}, aes, new TextEncoder().encode(JSON.stringify(obj)));
  const wrapped = await crypto.subtle.encrypt({name:'RSA-OAEP'}, pub, await crypto.subtle.exportKey('raw',aes));
  return {blob:b64(ct), iv:b64(iv), key:b64(wrapped)};
}
function compress(file,maxDim=1600,q=0.72){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>{ const s=Math.min(1,maxDim/Math.max(img.width,img.height));
      const w=Math.round(img.width*s), h=Math.round(img.height*s);
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg',q)); };
    img.onerror=()=>{ URL.revokeObjectURL(url); rej(new Error('img')); };
    img.src=url;
  });
}

/* ---------- AVVIO ---------- */
function regInit(){
  REG.guests=[]; REG.refs=[]; REG.info=null; REG.busy=false;
  const r=root(); if(!r) return;
  if(!(window.crypto&&crypto.subtle)){ r.innerHTML=`<div class="b-warn">${rt('noCrypto')}</div>`; return; }
  if(!regConfigured()){ r.innerHTML=`<div class="b-ph">${rt('notConfigured')}</div>`; return; }
  let c = new URLSearchParams(location.search).get('s');
  if(!c){ try{ c=localStorage.getItem('cev20_stay'); }catch(e){} }
  regShowCode(c||'');
  if(c) regVerify(c,true);
}

function regShowCode(v){
  regStop();
  root().innerHTML = `<div class="reg-card"><div class="reg-f"><label for="regCode">${rt('codeLabel')}</label>
    <input type="text" id="regCode" value="${esc(v?pretty(norm(v)):'')}" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" style="font-family:'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;font-size:16px">
    <small>${rt('codeHelp')}</small></div><div id="regMsg"></div>
    <button type="button" class="reg-primary" id="regGo">${rt('cont')}</button></div>`;
  const go=()=>regVerify(document.getElementById('regCode').value);
  document.getElementById('regGo').onclick=go;
  document.getElementById('regCode').onkeydown=e=>{ if(e.key==='Enter') go(); };
}

async function regVerify(code,silent){
  const c=norm(code);
  if(c.length<6){ if(!silent) regMsg(rt('invalid'),true); return; }
  if(!silent) regMsg(rt('checking'));
  try{
    const info = await rpc('stay_info',{p_code:c});
    if(!info||!info.ok){ regMsg(silent?'':rt('invalid'),!silent); return; }
    REG.code=c; REG.info=info;
    try{ localStorage.setItem('cev20_stay',c); }catch(e){}
    if(info.submitted>0) regShowStatus(); else regShowForm();
  }catch(e){ regMsg(rt('net'),true); }
}

/* ---------- MODULO OSPITI ---------- */
function guestHTML(g){
  const types=['16','17','18','19','20'].map(k=>`<option value="${k}"${k===g.type?' selected':''}>${rt('t'+k)}</option>`).join('');
  const f=(key,label,input,cls,hint)=>`<div class="reg-f ${cls||''}"><label>${label}</label>${input}${hint?`<small>${hint}</small>`:''}</div>`;
  const txt=(key,auto)=>`<input type="text" data-f="${key}" autocomplete="off" autocapitalize="${auto||'words'}" spellcheck="false">`;
  const photo=(slot,label)=>`<div class="reg-photo" data-slot="${slot}"><div class="slot-title">${label}</div><div class="pv">${rt('noPhoto')}</div>
    <div class="btns"><label class="reg-mini">${icon('camera')}<span>${rt('take')}</span><input type="file" accept="image/*" capture="environment" hidden data-photo="${slot}"></label>
    <label class="reg-mini"><span>${rt('pick')}</span><input type="file" accept="image/*" hidden data-photo="${slot}"></label></div></div>`;
  const today=new Date().toISOString().slice(0,10);
  return `<div class="reg-card reg-guest" data-gid="${g.id}">
    <h3><span class="gt"></span><button type="button" class="reg-x" data-rm="${g.id}">${rt('remove')}</button></h3>
    <div class="reg-grid">
      ${f('type',rt('guestType'),`<select data-f="type">${types}</select>`,'full')}
      ${f('surname',rt('surname'),txt('surname'))}
      ${f('name',rt('name'),txt('name'))}
      ${f('sex',rt('sex'),`<select data-f="sex"><option value="">${rt('pick0')}</option><option value="M">${rt('male')}</option><option value="F">${rt('female')}</option></select>`)}
      ${f('birthDate',rt('birthDate'),`<input type="date" data-f="birthDate" max="${today}">`)}
      ${f('birthPlace',rt('birthPlace'),txt('birthPlace'),'full',rt('birthPlaceHint'))}
      ${f('citizenship',rt('citizenship'),txt('citizenship'),'full')}
      <div class="reg-f full"><label class="reg-check"><input type="checkbox" data-f="nodoc"><span>${rt('noDoc')}</span></label></div>
    </div>
    <div class="docblock"><div class="reg-grid">
      ${f('docType',rt('docType'),`<select data-f="docType"><option value="">${rt('pick0')}</option><option value="id">${rt('dIdc')}</option><option value="passport">${rt('dPass')}</option><option value="license">${rt('dLic')}</option><option value="other">${rt('dOther')}</option></select>`,'full')}
      ${f('docNumber',rt('docNumber'),txt('docNumber','characters'),'full')}
      ${f('docIssuer',rt('docIssuer'),txt('docIssuer'),'full',rt('docIssuerHint'))}
    </div>
    <div class="reg-photos">${photo('front',rt('photoFront'))}${photo('back',rt('photoBack'))}</div></div>
  </div>`;
}

function regRenumber(){
  const cards=[...document.querySelectorAll('#regGuests .reg-guest')];
  cards.forEach((c,i)=>{ c.querySelector('.gt').textContent = rt('guest')+' '+(i+1); c.querySelector('.reg-x').style.display = cards.length>1?'':'none'; });
  const add=document.getElementById('regAdd');
  if(add) add.style.display = cards.length < (REG.info.max_guests-REG.info.submitted) ? '' : 'none';
}
function regSyncDoc(card){
  const nodoc=card.querySelector('[data-f=nodoc]').checked;
  const dt=card.querySelector('[data-f=docType]').value;
  card.querySelector('.docblock').style.display = nodoc?'none':'';
  card.querySelector('[data-slot=back]').style.display = dt==='passport'?'none':'';
}
function regAddGuest(){
  const left=REG.info.max_guests-REG.info.submitted;
  if(document.querySelectorAll('#regGuests .reg-guest').length>=left) return;
  const g={id:++REG.seq, type:REG.guests.length?'19':'16', front:null, back:null};
  REG.guests.push(g);
  document.getElementById('regGuests').insertAdjacentHTML('beforeend',guestHTML(g));
  regRenumber();
}

function regShowForm(){
  regStop();
  const left=REG.info.max_guests-REG.info.submitted;
  if(left<=0){ regShowStatus(); return; }
  root().innerHTML = `<div class="b-note">${rt('formIntro',{left})}</div>
    <div id="regGuests"></div>
    <button type="button" class="reg-ghost" id="regAdd">${rt('addGuest')}</button>
    <div class="reg-f" id="regConsentBox"><label class="reg-check"><input type="checkbox" id="regConsent"><span>${rt('consent')}</span></label></div>
    <div id="regMsg"></div>
    <button type="button" class="reg-primary" id="regSend">${rt('send')}</button>`;
  REG.guests=[]; regAddGuest();
  const gs=document.getElementById('regGuests');
  gs.addEventListener('change',e=>{
    const t=e.target, card=t.closest('.reg-guest'); if(!card) return;
    if(t.matches('input[type=file]')) regOnPhoto(t);
    if(t.matches('[data-f=docType],[data-f=nodoc]')) regSyncDoc(card);
  });
  gs.addEventListener('click',e=>{
    const b=e.target.closest('[data-rm]'); if(!b) return;
    const id=+b.dataset.rm; REG.guests=REG.guests.filter(x=>x.id!==id);
    b.closest('.reg-guest').remove(); regRenumber();
  });
  document.getElementById('regAdd').onclick=regAddGuest;
  document.getElementById('regSend').onclick=regSend;
}

async function regOnPhoto(inp){
  const card=inp.closest('.reg-guest'), g=REG.guests.find(x=>x.id==card.dataset.gid);
  const slot=inp.dataset.photo, file=inp.files&&inp.files[0]; inp.value='';
  if(!file||!g) return;
  try{
    const url=await compress(file); g[slot]=url;
    const box=card.querySelector('.reg-photo[data-slot="'+slot+'"]'); box.classList.remove('err');
    const pv=box.querySelector('.pv'); pv.textContent=''; pv.style.backgroundImage='url("'+url+'")';
  }catch(e){ regMsg(rt('imgErr'),true); }
}

function regCollect(card,g){
  const val=f=>{ const e=card.querySelector('[data-f="'+f+'"]'); return e?(e.type==='checkbox'?e.checked:e.value.trim()):''; };
  const nodoc=val('nodoc'); let ok=true;
  const need=f=>{ const e=card.querySelector('[data-f="'+f+'"]'); const bad=!val(f); e.closest('.reg-f').classList.toggle('err',bad); if(bad) ok=false; };
  ['surname','name','sex','birthDate','birthPlace','citizenship'].forEach(need);
  const fr=card.querySelector('[data-slot=front]'), bk=card.querySelector('[data-slot=back]');
  const dt=val('docType');
  if(!nodoc){
    ['docType','docNumber','docIssuer'].forEach(need);
    const bf=!g.front, bb=dt!=='passport' && !g.back;
    fr.classList.toggle('err',bf); bk.classList.toggle('err',bb); if(bf||bb) ok=false;
  } else { fr.classList.remove('err'); bk.classList.remove('err'); }
  if(!ok) return null;
  const IT=REG_T.it, docLbl={id:IT.dIdc,passport:IT.dPass,license:IT.dLic,other:IT.dOther};
  const t=val('type');
  return { v:1, guestType:t, guestTypeLabel:IT['t'+t],
    surname:val('surname'), name:val('name'), sex:val('sex'), birthDate:val('birthDate'),
    birthPlace:val('birthPlace'), citizenship:val('citizenship'),
    noDoc:nodoc, docType:nodoc?'':docLbl[dt], docNumber:nodoc?'':val('docNumber'), docIssuer:nodoc?'':val('docIssuer'),
    front:nodoc?null:g.front, back:(nodoc||dt==='passport')?null:g.back, sentAt:new Date().toISOString() };
}

async function regSend(){
  if(REG.busy) return;
  const items=[]; let ok=true;
  document.querySelectorAll('#regGuests .reg-guest').forEach(card=>{
    const g=REG.guests.find(x=>x.id==card.dataset.gid); const p=regCollect(card,g);
    if(!p) ok=false; else items.push({card,g,p});
  });
  const cons=document.getElementById('regConsent').checked;
  document.getElementById('regConsentBox').classList.toggle('err',!cons);
  if(!ok||!cons){ regMsg(rt('fix'),true); const e=document.querySelector('#regRoot .err'); if(e) e.scrollIntoView({block:'center',behavior:'smooth'}); return; }
  REG.busy=true; const btn=document.getElementById('regSend'); btn.disabled=true;
  try{
    let n=0;
    for(const it of items){
      regMsg(rt('sending',{i:++n,n:items.length}));
      const enc=await encrypt(it.p);
      const ref=await rpc('submit_guest',{p_code:REG.code,p_enc_key:enc.key,p_iv:enc.iv,p_blob:enc.blob});
      REG.refs.push(ref);
      REG.info.submitted++;
      REG.guests=REG.guests.filter(x=>x!==it.g); it.card.remove();
    }
    REG.busy=false;
    const info=await rpc('stay_info',{p_code:REG.code}); if(info&&info.ok) REG.info=info;
    regShowStatus();
  }catch(e){
    REG.busy=false; btn.disabled=false;
    regMsg(String(e.message).indexOf('full')>=0?rt('full'):rt('sendErr'),true);
    try{ const info=await rpc('stay_info',{p_code:REG.code}); if(info&&info.ok){ REG.info=info; regRenumber(); } }catch(_){}
  }
}

/* ---------- STATO TRASMISSIONE / CONTROLLO ---------- */
function regShowStatus(){
  regStop();
  const i=REG.info, allV=i.submitted>0 && i.verified>=i.submitted, lock=i.lockbox;
  const step=(cls,num,title,text)=>`<div class="b-step ${cls}"><div class="num">${num}</div><div class="body"><div class="st-title">${title}</div><div class="st-text">${text}</div></div></div>`;
  let h='';
  if(REG.refs.length) h+=`<div class="b-note ok">✅ ${rt('sentBanner',{refs:esc(REG.refs.join(', '))})}</div>`;
  h+=`<div class="b-steps">`
    + step('','✓',rt('st1Title'),rt('st1Text',{n:i.submitted,max:i.max_guests}))
    + step(allV?'':'wait',allV?'✓':'2',rt('st2Title'),allV?rt('st2Done'):rt('st2Wait',{v:i.verified,n:i.submitted}))
    + step(lock?'':'off',lock?'✓':'3',rt('st3Title'),lock?rt('st3Done'):rt('st3Wait'))
    + `</div>`;
  if(lock) h+=`<div class="b-code"><div><div class="lbl">${rt('lockLabel')}</div><div class="val">${esc(lock)}</div></div><button type="button" id="regCopy">${rt('copy')}</button></div>`;
  h+=`<div id="regMsg"></div><button type="button" class="reg-ghost" id="regRef">${rt('refresh')}</button>`;
  if(i.submitted<i.max_guests) h+=`<button type="button" class="reg-primary" id="regMore">${rt('addMore')}</button>`;
  h+=`<button type="button" class="reg-x" id="regOther" style="display:block;margin:6px auto 0">${rt('other')}</button>`;
  root().innerHTML=h;
  document.getElementById('regRef').onclick=()=>regRefresh();
  const more=document.getElementById('regMore'); if(more) more.onclick=regShowForm;
  document.getElementById('regOther').onclick=()=>{ try{localStorage.removeItem('cev20_stay');}catch(e){} REG.refs=[]; regShowCode(''); };
  const cp=document.getElementById('regCopy');
  if(cp) cp.onclick=()=>{ try{navigator.clipboard.writeText(lock);}catch(e){} cp.textContent=rt('copied'); };
  if(!(allV&&lock)) REG.timer=setInterval(()=>regRefresh(true),30000);
}
async function regRefresh(quiet){
  try{
    const info=await rpc('stay_info',{p_code:REG.code});
    if(!info||!info.ok){ regShowCode(''); return; }
    REG.info=info; regShowStatus();
  }catch(e){ if(!quiet) regMsg(rt('net'),true); }
}
window.regStop = regStop;

/* ---------- ATTIVAZIONE ---------- */
renderAll();
const wantsReg = location.hash==='#register' || new URLSearchParams(location.search).has('s');
if(wantsReg) setTimeout(()=>openSection('register'),80);
})();
