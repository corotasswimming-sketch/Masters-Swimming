/* Public video pages only. Text nodes are translated without replacing form elements. */
(()=>{
 'use strict';
 const translations=window.PBLAP_VIDEO_TRANSLATIONS;
 const allowed=['ru','en','ro'], query=new URL(location.href).searchParams.get('lang');
 let saved;try{saved=localStorage.getItem('pblap-video-language');}catch{}
 let language=allowed.includes(query)?query:allowed.includes(saved)?saved:'ru';
 const sources=new WeakMap(),attributes=new WeakMap();
 function t(value){
  if(language==='ru'||!value)return value;
  if(translations[value])return translations[value][language];
  const trimmed=value.trim();
  if(translations[trimmed])return value.replace(trimmed,translations[trimmed][language]);
  // Only these application-owned messages contain variable values (email / progress).
  const pairs=[['Загружено ','%. Не закрывай страницу.'],['Готовим загрузку. Ответ придёт на ',''],['Видео получено. Бесплатная оценка придёт на ','. Проверяй также папку «Спам». Повторно отправлять видео не нужно.']];
  for(const [prefix,suffix] of pairs)if(value.startsWith(prefix)&&(!suffix||value.endsWith(suffix))){
   return t(prefix)+value.slice(prefix.length,suffix?value.length-suffix.length:undefined)+t(suffix);
  }
  // SVG descriptions combine the diagram label and the selected instruction.
  const split=value.indexOf('. ');
  if(split>0&&translations[value.slice(0,split)]&&translations[value.slice(split+2)])return t(value.slice(0,split))+'. '+t(value.slice(split+2));
  return value;
 }
 function translateNode(node){
  if(!node.parentElement||node.parentElement.closest('script,style,textarea,[data-language-switch]'))return;
  let record=sources.get(node);
  if(!record||node.nodeValue!==record.last)record={source:node.nodeValue};
  record.last=t(record.source);sources.set(node,record);
  if(node.nodeValue!==record.last)node.nodeValue=record.last;
 }
 function translateElement(el){
  for(const name of ['aria-label','placeholder'])if(el.hasAttribute(name)){
   let map=attributes.get(el);if(!map){map={};attributes.set(el,map);}
   const current=el.getAttribute(name);let record=map[name];
   if(!record||current!==record.last)record={source:current};
   record.last=t(record.source);map[name]=record;
   if(current!==record.last)el.setAttribute(name,record.last);
  }
 }
 function translateTree(root){
  if(root.nodeType===Node.TEXT_NODE){translateNode(root);return;}
  if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;
  if(root.nodeType===Node.ELEMENT_NODE&&root.closest('script,style,textarea,[data-language-switch]'))return;
  if(root.nodeType===Node.ELEMENT_NODE)translateElement(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode())translateNode(node);
  root.querySelectorAll('[aria-label],[placeholder]').forEach(translateElement);
 }
 function links(){document.querySelectorAll('a[href]').forEach(a=>{
  const url=new URL(a.getAttribute('href'),location.href);
  if(url.origin===location.origin&&/\/video-(guide|review)\.html$/.test(url.pathname)){
   url.searchParams.set('lang',language);a.setAttribute('href',url.pathname+url.search+url.hash);
  }
 });}
 const bar=document.createElement('nav');bar.dataset.languageSwitch='';bar.className='video-languages';
 for(const [code,name] of [['ru','Русский'],['en','English'],['ro','Română']]){
  const button=document.createElement('button');button.type='button';button.textContent=code.toUpperCase();button.lang=code;button.setAttribute('aria-label',name);button.dataset.language=code;
  button.addEventListener('click',()=>setLanguage(code));bar.append(button);
 }
 document.querySelector('header').append(bar);
 const style=document.createElement('style');style.textContent='.video-languages{display:flex;gap:4px;align-items:center;flex-shrink:0}.video-languages button{font-family:inherit;font-size:12px;font-weight:600;line-height:1.2;padding:9px 10px;border:1px solid #ffffff30;border-radius:20px;color:inherit;background:transparent;cursor:pointer}.video-languages button[aria-pressed="true"]{background:#aedbd2;color:#17262c;border-color:#aedbd2}.video-languages button:focus-visible{outline:2px solid #aedbd2;outline-offset:3px}body>header{flex-wrap:wrap;gap:14px}@media(max-width:480px){body>header{padding-left:20px;padding-right:20px}.video-languages{margin-left:auto}}';document.head.append(style);
 function setLanguage(code){
  language=code;document.documentElement.lang=code;
  bar.setAttribute('aria-label',({ru:'Язык',en:'Language',ro:'Limbă'})[code]);
  bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===code)));
  try{localStorage.setItem('pblap-video-language',code);}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',code);history.replaceState(null,'',url.pathname+url.search+url.hash);
  translateTree(document);links();
 }
 setLanguage(language);
 const observer=new MutationObserver(records=>{
  observer.disconnect();
  for(const record of records){
   if(record.type==='characterData')translateNode(record.target);
   else if(record.type==='attributes')translateElement(record.target);
   else record.addedNodes.forEach(translateTree);
  }
  links();observe();
 });
 function observe(){observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder']});}
 observe();
})();
