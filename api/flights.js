const airportCodes={
  'улаанбаатар':'UBN','ulaanbaatar':'UBN','ubn':'UBN','токио':'TYO','tokyo':'TYO','tyo':'TYO',
  'сеул':'SEL','seoul':'SEL','sel':'SEL','бээжин':'BJS','beijing':'BJS','bjs':'BJS',
  'бангкок':'BKK','bangkok':'BKK','bkk':'BKK','истанбул':'IST','istanbul':'IST','ist':'IST',
  'хөх хот':'HET','hohhot':'HET','het':'HET','хонг конг':'HKG','hong kong':'HKG','hkg':'HKG'
};
function airportCode(value){const text=String(value||'').trim();if(/^[a-z]{3}$/i.test(text))return text.toUpperCase();return airportCodes[text.toLowerCase()]||null;}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'GET only'});
  const token=process.env.TRAVELPAYOUTS_TOKEN;
  if(!token)return res.status(503).json({error:'Travelpayouts API token тохируулаагүй байна.'});
  const origin=airportCode(req.query.origin),destination=airportCode(req.query.destination);
  if(!origin||!destination)return res.status(400).json({error:'Одоогоор Улаанбаатар (UBN), Токио (TYO), Сөүл (SEL), Бээжин (BJS), Бангкок (BKK), Истанбул (IST), Хөх хот (HET), Хонг Конг (HKG) чиглэлийг хайж болно. IATA 3 үсэгт код мөн ашиглаж болно.'});
  const departure=String(req.query.departure||'').slice(0,10);
  const returnDate=String(req.query.returnDate||'').slice(0,10);
  const params=new URLSearchParams({origin,destination,one_way:returnDate?'false':'true',sorting:'price',trip_class:'0',currency:'usd',limit:'20',page:'1',period_type:'month',beginning_of_period:(departure?departure.slice(0,7)+'-01':new Date().toISOString().slice(0,7)+'-01')});
  if(returnDate)params.set('return_date',returnDate);
  try{
    const response=await fetch('https://api.travelpayouts.com/v2/prices/latest?'+params,{headers:{'X-Access-Token':token,'Accept':'application/json'}});
    const data=await response.json();
    if(!response.ok||data.success===false)throw new Error(data.error||'Travelpayouts-ийн хариу ирсэнгүй.');
    const offers=(Array.isArray(data.data)?data.data:[]).filter(item=>Number.isFinite(Number(item.value))).sort((a,b)=>Number(a.value)-Number(b.value)).slice(0,4).map(item=>({price:Number(item.value),currency:String(data.currency||'usd').toUpperCase(),airline:item.airline||'',gate:item.gate||'',flightNumber:item.flight_number||'',stops:Number(item.number_of_changes||0),departDate:item.depart_date||departure,returnDate:item.return_date||returnDate,origin:item.origin||origin,destination:item.destination||destination,foundAt:item.found_at?new Date(item.found_at).toLocaleString('mn-MN'):'сая'}));
    return res.status(200).json({offers,source:'Travelpayouts Data API',cached:true});
  }catch(error){console.error('Travelpayouts flight search failed:',error.message||error);return res.status(502).json({error:'Travelpayouts-ийн бодит үнийн сангаас мэдээлэл авч чадсангүй. '+(error.message||'')});}
}
