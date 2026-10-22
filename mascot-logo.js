(() => {
  const partCount=8;
  const loadPart = (index) => new Promise((resolve, reject) => {
    const script=document.createElement('script');
    script.src='assets/mascot-logo-part-'+(index+1)+'.js?v=1';
    script.onload=resolve; script.onerror=reject; document.head.appendChild(script);
  });
  const applyMascotLogo = async () => {
    const brand=document.querySelector('header .brand');
    if(!brand || brand.dataset.mascotLogo) return;
    try {
      for(let i=0;i<partCount;i++) await loadPart(i);
      const mascot=(window.__zamMascotParts||[]).join('');
      if(!mascot) return;
      brand.dataset.mascotLogo='true';
      brand.classList.add('brand-mascot');
      brand.setAttribute('aria-label','ZAM AI');
      brand.innerHTML='<img src="'+mascot+'" alt="ZAM AI аяллын туслах" />';
      window.__zamMascotParts=[];
    } catch (_) {}
  };
  const schedule=()=>window.setTimeout(applyMascotLogo,350);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule);
  else schedule();
})();