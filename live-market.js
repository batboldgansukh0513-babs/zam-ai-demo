(()=> {
  const $=id=>document.getElementById(id);
  const money=(amount,currency)=>{try{return new Intl.NumberFormat('mn-MN',{style:'currency',currency:currency||'USD',maximumFractionDigits:0}).format(Number(amount));}catch(_){return String(amount)+' '+(currency||'');}};
  const safe=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dateValue=id=>$(id)?.value||'';
  const setChannels=(place,checkIn,checkOut)=>{
    const q=encodeURIComponent(place||'');
    const nights=checkIn&&checkOut?Math.max(1,Math.round((new Date(checkOut)-new Date(checkIn))/86400000)):1;
    const urls={
      trip:'https://www.trip.com/hotels/list?city='+q+'&checkin='+encodeURIComponent(checkIn)+'&checkout='+encodeURIComponent(checkOut),
      booking:'https://www.booking.com/searchresults.html?ss='+q+'&checkin='+encodeURIComponent(checkIn)+'&checkout='+encodeURIComponent(checkOut),
      agoda:'https://www.agoda.com/search?textToSearch='+q+'&checkIn='+encodeURIComponent(checkIn)+'&los='+nights,
      hotels:'https://www.hotels.com/Hotel-Search?destination='+q+'&startDate='+encodeURIComponent(checkIn)+'&endDate='+encodeURIComponent(checkOut)
    };
    document.querySelectorAll('#bookingChannels a[data-channel]').forEach(a=>a.href=urls[a.dataset.channel]||'#');
  };
  const flightCard=o=>'<article class="live-offer"><div><b>'+safe(o.airline||'Нислэг')+(o.flightNumber?' · '+safe(o.flightNumber):'')+'</b><small>'+safe(o.origin)+' → '+safe(o.destination)+' · '+Number(o.stops||0)+' дамжих</small></div><strong>'+money(o.price,o.currency)+'</strong><span>'+safe(o.foundAt||'сая')+'</span></article>';
  const hotelCard=o=>'<article class="live-offer hotel-offer"><div><b>'+safe(o.name)+'</b><small>'+(o.rating?safe(o.rating)+' ★ · ':'')+safe(o.room||'Өрөө')+(o.board?' · '+safe(o.board):'')+'</small><em>'+safe(o.cancellation||'Нөхцөлийг захиалахаас өмнө шалгана уу.')+'</em></div><strong>'+money(o.price,o.currency)+'</strong><span>'+safe(o.payment||'Үнэ')+'</span></article>';
  const updateSellerCards=(offers)=>{
    const cards=[['trip',offers[0]],['tapa',offers[1]||offers[0]]];
    cards.forEach(([prefix,offer],idx)=>{
      const price=$(prefix+'OfferPrice'), currency=$(prefix+'OfferCurrency'), checked=$(prefix+'OfferChecked');
      const brand=$(prefix+'OfferBrand'), source=$(prefix+'OfferSource');
      if(!offer){if(price)price.textContent='Санал олдсонгүй';return;}
      if(price)price.textContent=money(offer.price,offer.currency);
      if(currency)currency.textContent=(offer.origin||'')+' → '+(offer.destination||'')+' · '+(offer.stops||0)+' дамжих';
      if(checked)checked.textContent='API · '+(offer.foundAt||'сая');
      if(brand)brand.textContent=idx===0?'LIVE':(offer.gate||'AVIASALES').toUpperCase();
      if(source)source.textContent=idx===0?'Travelpayouts / Aviasales':(offer.gate?'Захиалгын суваг: '+offer.gate:'Travelpayouts-ийн бодит санал');
    });
  };
  async function searchLive(){
    const origin=$('searchFrom')?.value?.trim(), city=$('searchTo')?.value?.trim();
    const departure=dateValue('searchDepart'), returnDate=dateValue('searchReturn'), adults=$('searchTravelers')?.value||'1';
    const status=$('liveMarketStatus'), flights=$('liveFlightResults'), hotels=$('liveHotelResults');
    setChannels(city,departure,returnDate);
    if(!origin||!city||!departure){if(status)status.textContent='Хаанаас, хаашаа, явах огноогоо бөглөөд дахин хайна уу.';return;}
    status.textContent='Бодит үнийг эх сурвалжаас шалгаж байна…';
    flights.innerHTML='<span class="live-loading">Нислэгийн үнийг шалгаж байна…</span>';
    hotels.innerHTML=returnDate?'<span class="live-loading">Буудлын өрөө, үнийг шалгаж байна…</span>':'<span class="live-loading">Буцах огноо сонговол буудлын бодит үнэ шалгана.</span>';
    const flightUrl='/api/flights?origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(city)+'&departure='+encodeURIComponent(departure)+(returnDate?'&returnDate='+encodeURIComponent(returnDate):'');
    const hotelUrl='/api/hotels?city='+encodeURIComponent(city)+'&checkIn='+encodeURIComponent(departure)+'&checkOut='+encodeURIComponent(returnDate)+'&adults='+encodeURIComponent(adults);
    const [flightRes,hotelRes]=await Promise.allSettled([
      fetch(flightUrl).then(r=>r.json().then(j=>({ok:r.ok,data:j}))),
      returnDate?fetch(hotelUrl).then(r=>r.json().then(j=>({ok:r.ok,data:j})):Promise.resolve({ok:false,data:{error:'Буцах огноо сонгоно уу.'}})
    ]);
    const f=flightRes.status==='fulfilled'?flightRes.value:{ok:false,data:{error:'Нислэгийн хайлт түр амжилтгүй.'}};
    const h=hotelRes.status==='fulfilled'?hotelRes.value:{ok:false,data:{error:'Буудлын хайлт түр амжилтгүй.'}};
    flights.innerHTML=f.ok&&f.data.offers?.length?'<div class="live-source">Үнэ: '+safe(f.data.source||'эх сурвалж')+'</div>'+f.data.offers.map(flightCard).join(''):'<div class="live-error">'+safe(f.data.error||'Энэ чиглэлд бодит санал одоогоор олдсонгүй.')+'</div>';
    if(f.ok&&f.data.offers?.length) updateSellerCards(f.data.offers);
    hotels.innerHTML=h.ok&&h.data.offers?.length?'<div class="live-source">Үнэ: '+safe(h.data.source||'эх сурвалж')+'</div>'+h.data.offers.map(hotelCard).join(''):'<div class="live-error">'+safe(h.data.error||'Буудлын live санал одоогоор олдсонгүй.')+'</div>';
    status.textContent=(f.ok||h.ok)?'Сүүлд шалгасан: '+new Date().toLocaleString('mn-MN')+' · Үнэ өөрчлөгдөж болзошгүй.':'Үнэ авах тохиргоо эсвэл эх сурвалжийн хариуг шалгана уу.';
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const form=$('tripSearch');
    if(form) form.addEventListener('submit',()=>setTimeout(searchLive,30));
    setChannels($('searchTo')?.value||'',dateValue('searchDepart'),dateValue('searchReturn'));
  });
})();