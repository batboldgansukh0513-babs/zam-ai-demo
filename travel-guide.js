(()=> {
  const $=id=>document.getElementById(id);
  const esc=value=>String(value||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const linkify=text=>text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,(_,label,url)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' <i>↗</i></a>');
  function renderMarkdown(markdown){
    const lines=String(markdown||'').split(/\r?\n/);
    let html='', listOpen=false;
    const close=()=>{if(listOpen){html+='</ol>';listOpen=false;}};
    for(const raw of lines){
      const line=raw.trim();
      if(!line){close();continue;}
      if(/^##\s+/.test(line)){close();html+='<h4>'+linkify(esc(line.replace(/^##\s+/,'')))+'</h4>';continue;}
      if(/^#\s+/.test(line)){close();html+='<h3>'+linkify(esc(line.replace(/^#\s+/,'')))+'</h3>';continue;}
      if(/^[-*]\s+/.test(line)){if(!listOpen){html+='<ol>';listOpen=true;}html+='<li>'+linkify(esc(line.replace(/^[-*]\s+/,'')))+'</li>';continue;}
      if(/^\d+[.)]\s+/.test(line)){if(!listOpen){html+='<ol>';listOpen=true;}html+='<li>'+linkify(esc(line.replace(/^\d+[.)]\s+/,'')))+'</li>';continue;}
      close();html+='<p>'+linkify(esc(line))+'</p>';
    }
    close();return html||'<p>Зөвлөгөө үүссэнгүй. Дахин оролдоно уу.</p>';
  }
  async function buildGuide(){
    const brief=$('travelBrief')?.value?.trim();
    const hub=$('guideHub'), content=$('guideContent'), title=$('guideTitle'), sources=$('guideSources');
    if(!brief)return;
    hub.hidden=false;
    title.textContent='Таны аяллын цогц гарын авлага';
    content.innerHTML='<div class="guide-loading"><span></span><b>Хамгийн сүүлийн үеийн эх сурвалжаас шалгаж байна…</b><small>Маршрут, виз, замын нөхцөл, үзвэр, хоол, байр болон захиалгын холбоосыг нэгтгэж байна.</small></div>';
    sources.hidden=true;sources.innerHTML='';
    try{
      const message='GUIDE_MODE\nАялал: '+from+'-аас '+to+' руу. Явах огноо: '+depart+'. Буцах: '+back+'. Зорчигч: '+people+' том хүн. Газар, агаар, усан зам болон холимог бүх бодит боломжийг шалгаж, Монгол аялагчид зориулсан маш нарийн цогц зөвлөгөө гарга.';
      const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Зөвлөгөө татаж чадсангүй.');
      content.innerHTML=renderMarkdown(data.answer);
      if(data.notice)content.insertAdjacentHTML('afterbegin','<div class="guide-notice">'+esc(data.notice)+'</div>');
      if(Array.isArray(data.sources)&&data.sources.length){
        sources.hidden=false;
        sources.innerHTML='<b>Шалгасан эх сурвалж</b><div>'+data.sources.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||'Эх сурвалж')+' ↗</a>').join('')+'</div>';
      }
      hub.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(error){
      content.innerHTML='<div class="guide-error"><b>Одоогоор цогц зөвлөгөө бэлдэх боломжгүй байна.</b><span>'+esc(error.message)+'</span><small>Дахин хайх эсвэл API тохиргоог шалгана уу.</small></div>';
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const form=$('tripSearch');
    if(form)form.addEventListener('submit',(event)=>{event.preventDefault();event.stopImmediatePropagation();buildGuide();},true);
  });
})();