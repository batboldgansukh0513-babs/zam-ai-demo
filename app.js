const extraCss=document.createElement('link');extraCss.rel='stylesheet';extraCss.href='selection.css?v=route-summary1';document.head.appendChild(extraCss);
const screens=[...document.querySelectorAll('.screen')],steps=[...document.querySelectorAll('.steps span')],messages=document.querySelector('#messages');
const summaryCards=[...document.querySelectorAll('.summary-card')];
function currentSummary(index){summaryCards.forEach((card,i)=>card.classList.toggle('is-current',i===index))}
function show(id){screens.forEach(x=>x.classList.toggle('active',x.id===id));steps.forEach(x=>x.classList.toggle('active',x.dataset.step===id));document.querySelector('#stageTitle').textContent=({routes:'Таны 4 маршрут',visa:'Виз ба нэвтрэх',stay:'Байрлах ба зорчих',day:'Өдөр тутмын хөтөлбөр'})[id];currentSummary(({routes:0,visa:1,stay:2,day:3})[id])}
function message(text,kind){const el=document.createElement('div');el.className='bubble '+kind;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight}
function ask(value){const q=value.trim();if(!q)return;message(q,'user');document.querySelector('#chatInput').value='';setTimeout(()=>message('Танд таарсан 4 маршрутыг баруун талд гаргалаа. Нэгийг нь сонгоод дараагийн алхам руу орно уу.','bot'),250);document.querySelector('#routeLead').textContent='“'+q+'” хүсэлтэд таарсан сонголтууд';show('routes')}
function setRoute(route){document.querySelector('#summaryRoute').textContent=route.dataset.route;document.querySelector('#summaryTransport').textContent=route.dataset.transport+' · '+route.dataset.price;document.querySelector('#summaryDetail').textContent=route.dataset.detail}
function setVisa(button){document.querySelector('#summaryVisa').textContent=button.querySelector('b').textContent}
function setStay(){const choices=[...document.querySelectorAll('.stay-grid .selected')].map(x=>x.dataset.summary);document.querySelector('#summaryStay').textContent=choices.join(' + ')}
document.querySelector('#chatForm').onsubmit=e=>{e.preventDefault();ask(document.querySelector('#chatInput').value)};
document.querySelectorAll('.prompt-row button').forEach(b=>b.onclick=()=>ask(b.dataset.prompt));
document.querySelectorAll('.route').forEach(b=>b.onclick=()=>{document.querySelectorAll('.route').forEach(x=>x.classList.remove('featured'));b.classList.add('featured');setRoute(b);show('visa')});
document.querySelectorAll('.decision').forEach(b=>b.onclick=()=>{document.querySelectorAll('.decision').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');setVisa(b);show(b.dataset.next)});
document.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{b.parentElement.querySelectorAll('.pick').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');setStay()});
document.querySelectorAll('[data-next]').forEach(b=>{if(!b.classList.contains('decision'))b.onclick=()=>{if(b.dataset.next==='day'){setStay();document.querySelector('#summaryDay').textContent='Tokyo essentials'}show(b.dataset.next)}});
document.querySelector('#restart').onclick=()=>show('routes');
setRoute(document.querySelector('.route.featured'));setStay();
const tokyo=[35.6762,139.6503],map=L.map('mapMini',{zoomControl:false,attributionControl:false}).setView(tokyo,12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);L.marker(tokyo).addTo(map).bindPopup('Таны буудал').openPopup();L.circle([35.6595,139.7005],{radius:700,color:'#bd9253',fillColor:'#bd9253',fillOpacity:.22}).addTo(map);
