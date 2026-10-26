const sourceSets={
  japan:[
    {name:'Japan National Tourism Organization',url:'https://www.japan.travel/en/',kind:'Албан ёсны аялал жуулчлал'},
    {name:'Japan Rail Pass',url:'https://japanrailpass.net/en/',kind:'Төмөр замын мэдээлэл'},
    {name:'Tokyo Metro',url:'https://www.tokyometro.jp/en/',kind:'Хот доторх тээвэр'},
    {name:'Japan eVISA',url:'https://www.evisa.mofa.go.jp/index',kind:'Визийн албан эх сурвалж'}
  ],
  korea:[
    {name:'VISITKOREA',url:'https://english.visitkorea.or.kr/',kind:'Албан ёсны аялал жуулчлал'},
    {name:'KORAIL',url:'https://www.letskorail.com/ebizbf/EbizBfAbout_TrainGuide.do',kind:'Төмөр замын мэдээлэл'},
    {name:'Visit Seoul',url:'https://english.visitseoul.net/',kind:'Хотын албан ёсны гарын авлага'},
    {name:'K-ETA',url:'https://www.k-eta.go.kr/portal/apply/index.do',kind:'Нэвтрэх нөхцөлийн албан эх сурвалж'}
  ]
};
function pickSet(text){
  const value=String(text||'').toLowerCase();
  if(/япон|japan|tokyo|токио|osaka|осака|kyoto|киото/.test(value))return {key:'japan',sources:sourceSets.japan};
  if(/солонгос|korea|seoul|сеул|busan|пусан/.test(value))return {key:'korea',sources:sourceSets.korea};
  return null;
}
function strip(html){
  return String(html||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
}
function title(html){const found=String(html||'').match(/<title[^>]*>([\s\S]*?)<\/title>/i);return found?strip(found[1]).slice(0,120):'';}
function description(html){const found=String(html||'').match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)/i)||String(html||'').match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)/i);return found?strip(found[1]).slice(0,360):strip(html).slice(0,360);}
async function read(source){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
  try{
    const res=await fetch(source.url,{headers:{'User-Agent':'ZAM-AI-Travel-Guide/1.0 (+https://zam-ai-demo.vercel.app/)','Accept':'text/html,application/xhtml+xml'},signal:controller.signal,redirect:'follow'});
    const html=await res.text();
    if(!res.ok)throw new Error('HTTP '+res.status);
    return {name:source.name,kind:source.kind,url:res.url||source.url,title:title(html)||source.name,excerpt:description(html),checkedAt:new Date().toISOString(),status:'ok'};
  }catch(error){
    return {name:source.name,kind:source.kind,url:source.url,error:'Эх сурвалж одоогоор уншигдсангүй.',status:'unavailable'};
  }finally{clearTimeout(timer);}
}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'GET only'});
  const brief=String(req.query.brief||'').slice(0,1500);
  const picked=pickSet(brief);
  if(!picked)return res.status(422).json({error:'Эхний scrape туршилт Япон болон Солонгос чиглэлд ажиллана. Дараагийн улсуудыг албан ёсны эх сурвалжаар нэмнэ.'});
  const sources=await Promise.all(picked.sources.map(read));
  return res.status(200).json({destination:picked.key,sources,checkedAt:new Date().toISOString(),notice:'Нээлттэй албан ёсны веб хуудсаас татсан товч агуулга. Виз, хуваарь, нөхцөлийг тухайн эх сурвалжийн хуудаснаас заавал нягтална уу.'});
}