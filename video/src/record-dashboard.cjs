// Records the two real dashboard clips (video/src/clips/*.webm) with Playwright, against a local API
// (DASHBOARD_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, TELEGRAM_API_BASE pointing at a local stand-in)
// and the web app on :3000. It drives the real glasses API, so the audit rows are real. Fake values only.
const { chromium } = require('playwright');
const fs = require('fs');
const API='http://localhost:3001', TOK='demo-dashboard-token-0123456789', WH='whsec-demo-0123456789';
const j=async(m,p,b,h={})=>{const r=await fetch(API+p,{method:m,headers:{'content-type':'application/json',...h},body:b?JSON.stringify(b):undefined});return {s:r.status,b:await r.json().catch(()=>null)}};
const cursorJs=()=>{const mk=()=>{const c=document.createElement('div');c.style.cssText='position:fixed;z-index:99999;width:30px;height:30px;border-radius:50%;background:rgba(15,122,64,.28);border:2px solid #0f7a40;pointer-events:none;left:-40px;top:-40px;transform:translate(-50%,-50%);transition:transform .08s';document.documentElement.appendChild(c);document.addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'});document.addEventListener('mousedown',()=>c.style.transform='translate(-50%,-50%) scale(.7)');document.addEventListener('mouseup',()=>c.style.transform='translate(-50%,-50%)')};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mk);else mk();};
async function ctx(b,name){const c=await b.newContext({viewport:{width:1440,height:810},colorScheme:'light',recordVideo:{dir:'/home/user/greenlight/video/work/rec/'+name,size:{width:1440,height:810}}});await c.addInitScript(()=>{localStorage.setItem('theme','light');localStorage.setItem('greenlight.dashboard','demo-dashboard-token-0123456789')});await c.addInitScript(cursorJs);await c.addInitScript(()=>{const st=document.createElement('style');st.textContent='nextjs-portal{display:none!important}';document.documentElement.appendChild(st)});return c;}
const clean=p=>p.evaluate(()=>document.querySelectorAll('nextjs-portal').forEach(e=>e.remove()));
async function moveTo(p,loc,steps=25){const bb=await loc.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps});}
(async()=>{
  const b=await chromium.launch();
  // --- A: setup
  let c=await ctx(b,'setup'); let p=await c.newPage();
  await p.goto('http://localhost:3000/app/connect'); await p.waitForTimeout(1500); await clean(p);
  await p.mouse.move(700,300,{steps:5});
  await moveTo(p,p.getByText('Telegram').first(),30); await p.waitForTimeout(1200);
  await moveTo(p,p.getByText('Gmail').first(),25); await p.waitForTimeout(700);
  await moveTo(p,p.getByRole('link',{name:'Rules'}),30); await p.mouse.down(); await p.mouse.up();
  await p.waitForURL('**/app/rules'); await p.waitForTimeout(900); await clean(p);
  const r1=p.getByRole('textbox',{name:'Rule 1',exact:true}), r2=p.getByRole('textbox',{name:'Rule 2',exact:true});
  await r1.waitFor(); await p.waitForTimeout(700);
  await moveTo(p,r1,20); await r1.click(); await p.keyboard.press('Control+A');
  await p.keyboard.type('Flag any refund or expense over $500.',{delay:28});
  await moveTo(p,r2,15); await r2.click(); await p.keyboard.press('Control+A');
  await p.keyboard.type('Never double-book investor calls.',{delay:28});
  const rm=p.getByRole('button',{name:'Remove rule 3'}); await moveTo(p,rm,20); await rm.click(); await p.waitForTimeout(400);
  const save=p.getByRole('button',{name:/Save rules/}); await moveTo(p,save,20); await save.click(); await p.waitForTimeout(1300);
  await moveTo(p,p.getByRole('link',{name:'Pair glasses'}),25); await p.mouse.down(); await p.mouse.up();
  await p.waitForURL('**/app/pair'); await p.waitForTimeout(2500); await clean(p);
  await moveTo(p,p.getByRole('button',{name:/Copy/}),25); await p.waitForTimeout(2200);
  await c.close();
  // --- real decisions through the real API (what the glasses do)
  const post=async(id,text,user)=>j('POST','/telegram/webhook',{update_id:id,message:{message_id:id,text,chat:{id:-100123,type:'group'},from:{username:user}}},{'x-telegram-bot-api-secret-token':WH});
  console.log('webhook',(await post(41,'Refund $320 AWS credit for Acme Corp','rohan')).s,(await post(42,'Expense $900 team offsite deposit','priya')).s);
  const code=(await j('POST','/api/pair',{},{authorization:'Bearer '+TOK})).b.code;
  const tok=(await j('POST','/api/pair/exchange',{code})).b.token;
  const q=(await j('GET','/api/queue',null,{authorization:'Bearer '+tok})).b; const cards=q.cards||q.rows||q;
  console.log('cards',cards.map(x=>x.headline));
  const by=t=>cards.find(x=>x.headline.includes(t));
  console.log('approve',(await j('POST',`/api/decisions/${by('AWS').id}/act`,{action:'APPROVE'},{authorization:'Bearer '+tok})).s);
  await new Promise(r=>setTimeout(r,3500));
  console.log('decline',(await j('POST',`/api/decisions/${by('offsite').id}/act`,{action:'DECLINE'},{authorization:'Bearer '+tok})).s);
  await new Promise(r=>setTimeout(r,3500));
  // --- B: audit
  c=await ctx(b,'audit'); p=await c.newPage();
  await p.goto('http://localhost:3000/app/audit'); await p.waitForTimeout(2500); await clean(p);
  await p.mouse.move(900,300,{steps:5});
  const rows=p.locator('tbody tr'); await moveTo(p,rows.nth(0),30); await p.waitForTimeout(2000);
  await moveTo(p,rows.nth(1),20); await p.waitForTimeout(2200);
  await moveTo(p,p.getByRole('columnheader',{name:'Engine'}),30); await p.waitForTimeout(2500);
  await c.close(); await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
