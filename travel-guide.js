(()=> {
  const $=id=>document.getElementById(id);
  const esc=v=>String(v||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const destination=brief=>/япон|japan|tokyo|токио|osaka|осака|kyoto|киото/i.test(brief)?'japan':/солонгос|korea|seoul|сеул|busan|пусан/i.test(brief)?'korea':'other';
  let activeKind='other';
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
  const fullPlan=(choice,kind)=>{
    const japan=kind==='japan';
    const place=japan?'Япон':'Солонгос';
    const cities=japan?'Улаанбаатар → Сөүл → Фүкүока → Токио':'Улаанбаатар → Сөүл → Пусан';
    const road=choice.includes('далай')?
      ['Улаанбаатар','Дамжин өнгөрөх хот','Боомт ба усан тээвэр','Очих хот','Буудал']:['Улаанбаатар','Нисэх буудал','Дамжин өнгөрөх хот','Очих хот','Буудал'];
    const days=japan?[
      ['1-р өдөр · очих','Буудалдаа очих, eSIM/Suica эсвэл нийтийн тээврийн картаа тохируулах, оройн ойр орчны алхалт.'],
      ['2-р өдөр · хотын төв','Asakusa эсвэл Shibuya, музей/зах, оройн хоолны бүсээс нэгийг сонго.'],
      ['3-р өдөр · сонирхлоор','Аниме, хоол, байгаль, худалдаа гэсэн 4 сэдвээс нэг өдрийн хөтөлбөр сонго.'],
      ['4-р өдөр · ойрын аялал','Kamakura, Hakone, Nikko зэрэг ойрын чиглэлийг цаг агаар ба тээврийн хуваариар нягтал.'],
      ['5-р өдөр · уян өдөр','Орхигдсон цэг, бэлэг дурсгал, буудал солих эсвэл амралтын өдөр.'],
      ['6-р өдөр · буцах бэлтгэл','Онлайн check-in, ачаа, буудлаас нисэх буудал руу явах цагийг баталгаажуул.'],
      ['7-р өдөр · буцах','Нисэх буудлын очих дараалал, ачаа, паспорт, виз/дамжин өнгөрөх бичгээ дахин шалга.']
    ]:[
      ['1-р өдөр · очих','Буудал, eSIM болон T-money картаа тохируулж, ойр орчмоор тайван алх.'],
      ['2-р өдөр · Сөүл','Gyeongbokgung, Bukchon, Insadong-ийн дундаас өөрийн хэмнэлээр сонго.'],
      ['3-р өдөр · хоол ба соёл','Зах, музей, кафе, оройн хоолны бүсээ нэгтгэж төлөвлө.'],
      ['4-р өдөр · далайн эрэг эсвэл Пусан','KTX/автобусын цагийг албан ёсны эх сурвалжаас шалгаад нэг өдрийн аялал болго.'],
      ['5-р өдөр · буцах','Check-in, ачаа, буудлаас буудал/нисэх буудал хүртэлх чиглэлээ баталгаажуул.']
    ];
    const ideas=japan?['Asakusa','Shibuya','Meiji Jingu','teamLab','Akihabara','Tsukiji/өөр зах','Shinjuku Gyoen','Kamakura','Hakone','Nikko']:
      ['Gyeongbokgung','Bukchon Hanok','Insadong','Hongdae','Myeongdong','Namsan','Han River','Haeundae','Gamcheon','Jagalchi Market'];
    const links=japan?[
      ['Японы аялал жуулчлал','https://www.japan.travel/en/'],['Japan Rail Pass','https://japanrailpass.net/en/'],['Tokyo Metro','https://www.tokyometro.jp/en/'],['Japan eVISA','https://www.evisa.mofa.go.jp/index']
    ]:[
      ['VISITKOREA','https://english.visitkorea.or.kr/'],['KORAIL','https://www.letskorail.com/ebizbf/EbizBfAbout_TrainGuide.do'],['Visit Seoul','https://english.visitseoul.net/'],['K-ETA','https://www.k-eta.go.kr/portal/apply/index.do']
    ];
    return '<section class="complete-plan" aria-label="Бүрэн аяллын зураглал">'+
      '<div class="complete-plan-head"><span>ТАНЫ СОНГОЛТ · '+esc(choice)+'</span><h3>'+esc(place)+' руу хийх бүрэн аяллын зураглал</h3><p>Энэ бол сонгосон чиглэлээрээ цааш явах дараалал. Хугацаа, виз, тээврийн бодит нөхцөлийг доорх албан эх сурвалжаар баталгаажуулна уу.</p></div>'+
      '<div class="journey-line">'+road.map((x,i)=>'<div class="journey-node '+(i===0?'start':'')+'"><i>'+(['⌂','✈','⌁','◉','⌂'][i]||'•')+'</i><b>'+esc(x)+'</b><small>'+String(i+1).padStart(2,'0')+'</small></div>').join('')+'</div>'+
      '<section class="plan-section"><span>01 · ЯВАХААС ӨМНӨ</span><div class="plan-checks"><label><input type="checkbox"> Паспортын хүчинтэй хугацаа</label><label><input type="checkbox"> Виз ба дамжин өнгөрөх нөхцөл</label><label><input type="checkbox"> Даатгал</label><label><input type="checkbox"> Тээврийн цаг, ачааны дүрэм</label><label><input type="checkbox"> Буудлын баталгаа</label><label><input type="checkbox"> Офлайн газрын зураг, eSIM</label></div></section>'+
      '<section class="plan-section"><span>02 · ӨДӨР БҮРИЙН УРСГАЛ</span><div class="daily-roadmap">'+days.map((d,i)=>'<article><b>'+esc(d[0])+'</b><p>'+esc(d[1])+'</p><button type="button" class="plan-choice" data-plan-choice="'+esc(d[0])+'-ийн хөтөлбөр">Энэ өдрийг нарийвчлах →</button></article>').join('')+'</div></section>'+
      '<section class="plan-section"><span>03 · ОЧООД СОНГОЖ БОЛОХ 10 ГАЗАР</span><div class="idea-pills">'+ideas.map((x,i)=>'<button type="button" class="plan-choice" data-plan-choice="'+esc(x)+'-г хөтөлбөрт нэмэх">'+String(i+1).padStart(2,'0')+' · '+esc(x)+' +</button>').join('')+'</div></section>'+
      '<section class="plan-section"><span>04 · АЛБАН ЁСНЫ ЗАХИАЛАХ / ШАЛГАХ ХОЛБООС</span><div class="official-links">'+links.map(x=>'<a href="'+esc(x[1])+'" target="_blank" rel="noopener noreferrer"><b>'+esc(x[0])+'</b><em>Албан хуудсыг нээх ↗</em></a>').join('')+'</div></section>'+
      '<div class="plan-next"><b>Дараагийн алхам: <strong>'+esc(cities)+'</strong> чиглэлийн тээвэр, виз ба буудлын нөхцөлийг дээрх эх сурвалжаас нягтал.</b><button type="button" data-guide-preset="'+esc(place)+' руу явахад виз, буудал болон хот доторх тээврийн дэлгэрэнгүй зөвлөгөө өгөөч">Виз, буудал, тээврийн дэлгэрэнгүйг асуух →</button></div>'+
    '</section>';
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
      const kind=destination(brief);activeKind=kind;
      content.innerHTML=options(kind)+'<div class="scrape-summary"><span>ЭХ СУРВАЛЖИЙН ТОВЧ МЭДЭЭЛЭЛ</span><h3>'+esc(data.destination==='japan'?'Япон':'Солонгос')+' чиглэлийн баталгаатай эх сурвалж</h3><p>'+esc(data.notice)+'</p></div><div class="scrape-grid">'+(data.sources||[]).map(card).join('')+'</div>';
      addMessage('bot','Танд 3 аяллын хэв маягийн сонголт гаргалаа. Нэгийг нь сонгоод цааш дэлгэрүүлж асуугаарай.');
      hub.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(error){
      content.innerHTML='<div class="guide-error"><b>Эх сурвалжийг одоогоор нэгтгэж чадсангүй.</b><span>'+esc(error.message)+'</span><small>Япон эсвэл Солонгос чиглэлээр дахин туршина уу.</small></div>';
      addMessage('bot','Одоогоор эх сурвалжийн хүсэлт амжилтгүй боллоо. Япон эсвэл Солонгос гэж тодруулж дахин бичээрэй.');
    }
  }
  document.addEventListener('click',event=>{
    const choice=event.target.closest('.guide-route-choice');
    if(choice){
      document.querySelectorAll('.guide-route-choice').forEach(x=>x.classList.toggle('selected',x===choice));
      document.querySelector('.complete-plan')?.remove();
      choice.closest('.route-choice-panel')?.insertAdjacentHTML('afterend',fullPlan(choice.dataset.choice,activeKind));
      addMessage('user',choice.dataset.choice);
      addMessage('bot','Сонголтыг хадгаллаа. Одоо виз, замын дараалал, өдөр тутмын хөтөлбөр болон албан эх сурвалжууд доор бүрэн гарлаа.');
      document.querySelector('.complete-plan')?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    const plan=event.target.closest('[data-plan-choice]');
    if(plan){
      addMessage('user',plan.dataset.planChoice);
      addMessage('bot','Сонголтыг хөтөлбөрт тэмдэглэлээ. Тухайн өдрийн тээвэр, цаг, захиалгыг албан эх сурвалжаас нягталж үргэлжлүүлээрэй.');
    }
  });
  document.addEventListener('DOMContentLoaded',()=>{
    const messages=$('messages'),form=$('chatForm'),input=$('chatInput'),content=$('guideContent');
    const submitBrief=brief=>{
      const value=String(brief||'').trim();if(!value)return;
      addMessage('user',value);if(input)input.value='';buildGuide(value);
    };
    if(messages){messages.innerHTML='';addMessage('bot','Сайн байна уу. Хаашаа явах, хэд хоног, юу сонирхдгоо бичээрэй. Би газар, агаар, усан замын боломжуудыг гаргана.');}
    if(input)input.placeholder='Жишээ: Япон руу 7 хоног, хоол ба аниме сонирхно';
    if(content)content.innerHTML='<div class="guide-start"><b>Аяллаа эхлүүлье</b><p>Зүүн талын чатанд чиглэлээ бичээд сумтай товчийг дарна уу. Эсвэл жишээг шууд туршиж болно.</p><button type="button" data-guide-preset="Япон руу 7 хоног, хоол ба аниме сонирхно">Япон руу 7 хоног аялъя <span>→</span></button><button type="button" data-guide-preset="Солонгос руу 5 хоног, хоол ба далайн эрэг сонирхно">Солонгос руу 5 хоног аялъя <span>→</span></button></div>';
    if(form)form.addEventListener('submit',event=>{
      event.preventDefault();event.stopImmediatePropagation();submitBrief(input?.value);
    },true);
    document.addEventListener('click',event=>{
      const preset=event.target.closest('[data-guide-preset],[data-prompt]');
      if(!preset)return;
      event.preventDefault();event.stopImmediatePropagation();
      submitBrief(preset.dataset.guidePreset||preset.dataset.prompt);
    },true);
    const newChat=$('newChat');
    if(newChat)newChat.addEventListener('click',event=>{
      event.preventDefault();event.stopImmediatePropagation();
      if(messages){messages.innerHTML='';addMessage('bot','Шинэ аяллаа бичээрэй. Би эхлээд явах хэв маягийн сонголтуудыг гаргана.');}
      if(content)content.innerHTML='<div class="guide-start"><b>Шинэ аялал эхлүүлье</b><p>Хаашаа, хэд хоног, юу сонирхдгоо бичээд сумтай товчийг дарна уу.</p></div>';
    },true);
  });
})();