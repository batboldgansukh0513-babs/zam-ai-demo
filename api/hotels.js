const cityCodes={
  'токио':'TYO','tokyo':'TYO','tyo':'TYO','сеул':'SEL','seoul':'SEL','sel':'SEL',
  'бээжин':'BJS','beijing':'BJS','bjs':'BJS','бангкок':'BKK','bangkok':'BKK','bkk':'BKK',
  'истанбул':'IST','istanbul':'IST','ist':'IST','хонг конг':'HKG','hong kong':'HKG','hkg':'HKG',
  'парис':'PAR','paris':'PAR','лондон':'LON','london':'LON','сингапур':'SIN','singapore':'SIN'
};
function cityCode(value){const text=String(value||'').trim();return /^[A-Za-z]{3}$/.test(text)?text.toUpperCase():(cityCodes[text.toLowerCase()]||null);}
function fail(res,status,error){return res.status(status).json({error});}
async function amadeusToken(id,secret){
  const body=new URLSearchParams({grant_type:'client_credentials',client_id:id,client_secret:secret});
  const r=await fetch('https://api.amadeus.com/v1/security/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  const json=await r.json();
  if(!r.ok||!json.access_token) throw new Error(json.error_description||'Amadeus authorization failed.');
  return json.access_token;
}
export default async function handler(req,res){
  if(req.method!=='GET') return fail(res,405,'GET only');
  const clientId=process.env.AMADEUS_CLIENT_ID, clientSecret=process.env.AMADEUS_CLIENT_SECRET;
  if(!clientId||!clientSecret) return fail(res,503,'Буудлын бодит үнийг авахын тулд Vercel дээр AMADEUS_CLIENT_ID болон AMADEUS_CLIENT_SECRET нэмнэ үү.');
  const city=cityCode(req.query.city);
  const checkIn=String(req.query.checkIn||'').slice(0,10), checkOut=String(req.query.checkOut||'').slice(0,10);
  const adults=Math.max(1,Math.min(9,Number(req.query.adults)||1));
  if(!city) return fail(res,400,'Одоогоор Tokyo, Seoul, Beijing, Bangkok, Istanbul, Hong Kong, Paris, London, Singapore болон IATA хотын 3 үсэгт код ашиглана уу.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(checkIn)||!/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return fail(res,400,'Буудлын бодит үнийн хувьд орох, гарах огноо шаардлагатай.');
  try{
    const token=await amadeusToken(clientId,clientSecret);
    const headers={Authorization:'Bearer '+token};
    const hotelsRes=await fetch('https://api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode='+encodeURIComponent(city)+'&radius=5&radiusUnit=KM&hotelSource=ALL', {headers});
    const hotelsJson=await hotelsRes.json();
    if(!hotelsRes.ok) throw new Error(hotelsJson.errors?.[0]?.detail||'Hotel list was unavailable.');
    const ids=(hotelsJson.data||[]).map(h=>h.hotelId).filter(Boolean).slice(0,8);
    if(!ids.length) return res.status(200).json({offers:[],source:'Amadeus Hotel Search',checkedAt:new Date().toISOString()});
    const offersUrl='https://api.amadeus.com/v3/shopping/hotel-offers?hotelIds='+encodeURIComponent(ids.join(','))+'&adults='+adults+'&checkInDate='+checkIn+'&checkOutDate='+checkOut+'&roomQuantity=1';
    const offersRes=await fetch(offersUrl,{headers});
    const offersJson=await offersRes.json();
    if(!offersRes.ok) throw new Error(offersJson.errors?.[0]?.detail||'Live hotel offers were unavailable.');
    const offers=(offersJson.data||[]).flatMap(hotel=>(hotel.offers||[]).slice(0,1).map(offer=>({
      name:hotel.hotel?.name||'Зочид буудал',
      rating:hotel.hotel?.rating||'',
      cityCode:hotel.hotel?.cityCode||city,
      price:offer.price?.total||offer.price?.base||null,
      currency:offer.price?.currency||'',
      room:offer.room?.typeEstimated?.category||offer.room?.description?.text||'Өрөөний нөхцөлийг захиалах хуудсаар баталгаажуулна',
      board:offer.boardType||'',
      payment:offer.policies?.paymentType||'',
      cancellation:offer.policies?.cancellations?.[0]?.description?.text||'Цуцлалтын нөхцөлийг шалгана уу.',
      checkIn:offer.checkInDate||checkIn,checkOut:offer.checkOutDate||checkOut
    }))).filter(x=>x.price).sort((a,b)=>Number(a.price)-Number(b.price)).slice(0,4);
    return res.status(200).json({offers,source:'Amadeus Hotel Search · live availability',checkedAt:new Date().toISOString()});
  }catch(error){
    console.error('Amadeus hotel search failed:',error.message||error);
    return fail(res,502,'Буудлын live үнийг авч чадсангүй. '+(error.message||''));
  }
}