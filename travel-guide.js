(()=> {
  const $=id=>document.getElementById(id);
  const esc=v=>String(v||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const card=s=>s.status==='ok'?'<article class="scrape-card"><span>'+esc(s.kind)+'</span><h4>'+esc(s.title)+'</h4><p>'+esc(s.excerpt||'Товч агуулга олдсонгүй.')+'</p><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' дээр нээх ↗</a></article>':'<article class="scrape-card scrape-unavailable"><span>'+esc(s.kind)+'</span><h4>'+esc(s.name)+'</h4><p>'+esc(s.error||'Уншиж чадсангүй.')+'</p><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">Эх сурвалжийг нээх ↗</a></article>';
  async function buildGuide(){
    const brief=$('travelBrief')?.value?.trim(),hub=$('guideHub'),content=$('guideContent'),title=$('guideTitle'),sources=$('guideSources');
    if(!brief)return;
    hub.hidden=false;title.textContent='Вебээс шууд нэгтгэсэн аяллын эх сурвалж';
    content.innerHTML='<div class="guide-loading"><span></span><b>Нээлттэй албан ёсны эх сурвалжуудыг уншиж байна…</b><small>Энэ туршилт API key ашиглахгүй.</small></div>';
    sources.hidden=true;sources.innerHTML='';
    try{
      const response=await fetch('/api/sources?brief='+encodeURIComponent(brief));
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Эх сурвалж уншиж чадсангүй.');
      content.innerHTML='<div class="scrape-summary"><span>LIVE WEB PREVIEW</span><h3>'+esc(data.destination==='japan'?'Японы албан ёсны эх сурвалжууд':'Солонгосын албан ёсны эх сурвалжууд')+'</h3><p>'+esc(data.notice)+'</p></div><div class="scrape-grid">'+(data.sources||[]).map(card).join('')+'</div>';
      hub.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(error){content.innerHTML='<div class="guide-error"><b>Эх сурвалжийг одоогоор нэгтгэж чадсангүй.</b><span>'+esc(error.message)+'</span><small>Япон эсвэл Солонгос чиглэлээр дахин туршина уу.</small></div>';}
  }
  document.addEventListener('DOMContentLoaded',()=>{const form=$('tripSearch');if(form)form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();buildGuide();},true);});
})();