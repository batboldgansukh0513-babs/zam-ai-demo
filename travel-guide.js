(()=> {
  const $=id=>document.getElementById(id);
  const esc=v=>String(v||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const destination=brief=>/япон|japan|tokyo|токио|osaka|осака|kyoto|киото/i.test(brief)?'japan':/солонгос|korea|seoul|сеул|busan|пусан/i.test(brief)?'korea':'other';
  const options=kind=>{
    const items=kind==='japan'?[
      ['Агаараар · хамгийн хурдан','Улаанбаатар → Токио/Осака','Очсон өдрөө хотын хөтөлбөртөө шууд орно.'],
      ['Агаар + газар','Улаанбаатар → Сөүл → Япон','Дамжин өнгөрөх хотын соёл, хоол, галт тэрэгний туршлагыг нэмнэ.'],
      ['Газар + далай','Хятад/Солонгосоор дамжин Япон','Хил, виз, боомт, улирлын хуваарийг албан ёсоор нягтална.']
    ]:kind==='korea'?[
      ['Агаараар · хамгийн хурдан','Улаанбаатар → Сөүл/Пусан','Хотод очоод шууд аяллаа эхлүүлэх сонголт.'],
      ['Агаар + газар','Сөүл → Пусан галт тэрэг','2 хотын хоол, далайн эрэг, соёлыг нэг аялалд багтаана.'],
      ['Газар + далай','Хятад/Японоор дамжих','Хил, виз, боомт болон холбогдох тээврийг заавал нягтална.']
    ]:[
      ['Агаараар','Хамгийн богино цагийн сонголт','Нисэх буудал, дамжин суух нөхцөлийг албан ёсоор шалгана.'],
      ['Газар + агаар','Замдаа хот нэмэх','Галт тэрэг, автобус эсвэл дамжин нисэх хувилбар.'],
      ['Газар + далай','Удаан аяллын сонголт','Хил, боомт, виз, улирлын нөхцөл гол нөлөөтэй.']
    ];
    return '<section class="route-choice-panel"><span>ЭХЛЭЭД АЯЛЛЫН ХЭВ МАЯГАА СОНГООРОЙ</span><div>'+items.map((x,i)=>'<button type="button" class="guide-route-choice" data-choice="'+esc(x[0])+'"><b>0'+(i+1)+' · '+esc(x[0])+'</b><small>'+esc(x[1])+'</small><em>'+esc(x[2])+'</em></button>').join('')+'</div></section>';
  };
  const card=s=>s.status==='ok'?'<article class="scrape-card"><span>'+esc(s.kind)+'</span><h4>'+esc(s.title)+'</h4><p>'+esc(s.excerpt||'Товч агуулга олдсонгүй.')+'</p><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' дээр нээх ↗</a></article>':'<article class="scrape-card scrape-unavailable"><span>'+esc(s.kind)+'</span><h4>'+esc(s.name)+'</h4><p>'+esc(s.error||'Уншиж чадсангүй.')+'</p><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">Эх сурвалжийг нээх ↗</a></article>';
  const addMessage=(who,text)=>{
    const messages=$('messages');if(!messages)return;
    const div=document.createElement('div');div.className='zam-chat-message '+who;div.textContent=text;messages.appendChild(div);messages.scrollTop=messages.scrollHeight;
  };
  async function buildGuide(brief){
    const hub=$('guideHub'),content=$('guideContent'),title=$('guideTitle'),sources=$('guideSources');
    hub.hidden=false;title.textContent='Таны аяллын сонголтууд ба эх сурвалж';
    content.innerHTML='<div class="guide-loading"><span></span><b>Албан ёсны веб эх сурвалжуудыг шалгаж байна…</b><small>Маршрутын сонголт болон бодит эх сурвалжийг нэгтгэж байна.</small></div>';
    sources.hidden=true;sources.innerHTML='';
    try{
      const response=await fetch('/api/sources?brief='+encodeURIComponent(brief));
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Эх сурвалж уншиж чадсангүй.');
      const kind=destination(brief);
      content.innerHTML=options(kind)+'<div class="scrape-summary"><span>ЭХ СУРВАЛЖИЙН ТОВЧ МЭДЭЭЛЭЛ</span><h3>'+esc(data.destination==='japan'?'Япон':'Солонгос')+' чиглэлийн баталгаатай эх сурвалж</h3><p>'+esc(data.notice)+'</p></div><div class="scrape-grid">'+(data.sources||[]).map(card).join('')+'</div>';
      addMessage('bot','Танд 3 аяллын хэв маягийн сонголт гаргалаа. Нэгийг нь сонгоод цааш дэлгэрүүлж асуугаарай.');
      hub.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(error){
      content.innerHTML='<div class="guide-error"><b>Эх сурвалжийг одоогоор нэгтгэж чадсангүй.</b><span>'+esc(error.message)+'</span><small>Япон эсвэл Солонгос чиглэлээр дахин туршина уу.</small></div>';
      addMessage('bot','Одоогоор эх сурвалжийн хүсэлт амжилтгүй боллоо. Япон эсвэл Солонгос гэж тодруулж дахин бичээрэй.');
    }
  }
  document.addEventListener('click',event=>{
    const choice=event.target.closest('.guide-route-choice');if(!choice)return;
    document.querySelectorAll('.guide-route-choice').forEach(x=>x.classList.toggle('selected',x===choice));
    addMessage('user',choice.dataset.choice);
    addMessage('bot','Сонголтыг хадгаллаа. Одоо замдаа үзэх газар, хоол, байр эсвэл визийн талаар асууж болно.');
  });
  document.addEventListener('DOMContentLoaded',()=>{
    const messages=$('messages'),form=$('chatForm'),input=$('chatInput');
    if(messages){messages.innerHTML='';addMessage('bot','Сайн байна уу. Хаашаа явах, хэд хоног, юу сонирхдгоо бичээрэй. Би газар, агаар, усан замын боломжуудыг гаргана.');}
    if(input)input.placeholder='Жишээ: Япон руу 7 хоног, хоол ба аниме сонирхно';
    if(form)form.addEventListener('submit',event=>{
      event.preventDefault();event.stopImmediatePropagation();
      const brief=input?.value?.trim();if(!brief)return;
      addMessage('user',brief);input.value='';buildGuide(brief);
    },true);
  });
})();