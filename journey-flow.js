(()=> {
  const steps={routes:'01 Маршрут',visa:'02 Нэвтрэх',stay:'03 Байрлах',day:'04 Очоод'};
  const $=s=>document.querySelector(s);
  const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
  const save=(stage,title,detail)=>{
    const current=JSON.parse(sessionStorage.getItem('zamJourneyFlow')||'{}');
    current[stage]={title,detail,at:Date.now()};
    sessionStorage.setItem('zamJourneyFlow',JSON.stringify(current));
  };
  const choiceText=button=>{
    const title=button.dataset.title||button.dataset.route||button.dataset.summary||button.querySelector('b')?.textContent||'Сонголт';
    const detail=button.dataset.detail||button.dataset.transport||button.querySelector('small')?.textContent||'';
    return {title:clean(title),detail:clean(detail)};
  };
  const continuation=(stage,choice)=>{
    const target=$('#'+stage);
    if(!target)return;
    let note=target.querySelector('.flow-continuation');
    if(!note){
      note=document.createElement('div');
      note.className='flow-continuation';
      target.insertBefore(note,target.firstChild);
    }
    note.innerHTML='<span>СОНГОГДСОН УРСГАЛ</span><b>'+choice.title+'</b><small>'+choice.detail+'</small><i>Дараагийн алхам: '+(steps[stage]||stage)+'</i>';
  };
  const move=(stage,choice)=>{
    const target=$('#'+stage);
    if(!target)return;
    document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s===target));
    document.querySelectorAll('.steps [data-step]').forEach(s=>s.classList.toggle('active',s.dataset.step===stage));
    const stageTitle=$('#stageTitle');
    if(stageTitle)stageTitle.textContent=steps[stage]||'Таны аяллын төлөвлөгөө';
    save(stage,choice.title,choice.detail);
    continuation(stage,choice);
    target.scrollIntoView({behavior:'smooth',block:'start'});
  };
  const mark=(button)=>{
    const parent=button.parentElement;
    if(parent)parent.querySelectorAll('.selected,.picked').forEach(x=>{if(x!==button)x.classList.remove('selected','picked');});
    button.classList.add('selected');
  };
  const nextFor=button=>{
    if(button.matches('.route,.route-journey'))return 'visa';
    if(button.matches('.decision[data-next]'))return button.dataset.next;
    if(button.matches('#stay .pick,.stay-grid .pick'))return 'day';
    return null;
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button)return;
    const stage=nextFor(button);
    if(stage){
      const choice=choiceText(button);
      mark(button);
      window.setTimeout(()=>move(stage,choice),40);
      return;
    }
    if(button.matches('.timeline button,.add-stop button')){
      const choice=choiceText(button);
      mark(button);
      save('day',choice.title,choice.detail);
    }
  });
  document.addEventListener('DOMContentLoaded',()=>{
    const data=JSON.parse(sessionStorage.getItem('zamJourneyFlow')||'{}');
    Object.entries(data).forEach(([stage,choice])=>continuation(stage,choice));
  });
})();