'use strict';
/* Project Nation V4.0: original offline strategy simulation extension to V3. */
const V4_COUNTRY_DEFAULT='FRA';
const FLAG_PATTERNS=['horizontal','vertical','diagonal','cross','nordic','quartered','chevron','solid'];
const FLAG_SYMBOLS=['star','sun','shield','diamond','circle','globe','none'];
const DEFAULT_FLAG={pattern:'horizontal',ratio:'3:2',c1:'#542ba0',c2:'#ffffff',c3:'#9870d6',symbol:'star',symbolColor:'#ffd166',count:1,size:100,x:50,y:50,border:false};
const SECTORS={retail:{icon:'🏬',jobs:90,income:1800},technology:{icon:'💻',jobs:130,income:3900},airline:{icon:'✈️',jobs:240,income:4300},rail:{icon:'🚆',jobs:150,income:3000},energy:{icon:'⚡',jobs:120,income:2900},tourism:{icon:'🏖️',jobs:130,income:2700}};
const EXTRA_SHOP=[
 {id:'hospital',icon:'🏥',name:'Regional Hospital',cost:750000,desc:'Expand healthcare capacity and access.',bonus:'Healthcare +14 · Jobs +300',happy:2,jobs:300,health:14,upkeep:18500},
 {id:'university',icon:'🎓',name:'National University',cost:1600000,desc:'Fund research, training, and higher education.',bonus:'Education +18 · Research +12',education:18,research:12,jobs:180,upkeep:28000},
 {id:'solar',icon:'☀️',name:'Solar Power Network',cost:570000,desc:'Generate electricity for homes and factories.',bonus:'Power +16 · Environment +5',energy:16,environment:5,jobs:80,upkeep:7100},
 {id:'power',icon:'⚡',name:'Electricity Grid Upgrade',cost:450000,desc:'Stabilize the national electricity grid.',bonus:'Power +22',energy:22,upkeep:6900},
 {id:'metro',icon:'🚇',name:'Capital Metro',cost:2300000,desc:'Move residents between districts.',bonus:'Transport +18 · Jobs +240',transport:18,jobs:240,upkeep:32000},
 {id:'airport',icon:'✈️',name:'International Airport',cost:4800000,desc:'Connect your country to international visitors and businesses.',bonus:'Tourism +22 · Revenue +$18K/month',tourism:22,revenue:18000,jobs:700,upkeep:67000},
 {id:'stadium',icon:'🏟️',name:'National Football Stadium',cost:1900000,desc:'Host club football and international matches.',bonus:'Sports +22 · Tourism +8',sports:22,tourism:8,jobs:160,upkeep:17000},
 {id:'hotels',icon:'🏨',name:'Tourism & Hotel Grants',cost:350000,desc:'Encourage resorts, attractions and hospitality companies.',bonus:'Tourism +15 · Jobs +180',tourism:15,jobs:180,upkeep:6500},
 {id:'research',icon:'🔬',name:'National Research Centre',cost:2200000,desc:'Develop new technology and skilled careers.',bonus:'Research +20 · Education +5',research:20,education:5,jobs:220,upkeep:26000},
 {id:'space',icon:'🚀',name:'Civilian Space Programme',cost:12000000,desc:'Launch science missions and satellite research.',bonus:'Research +35 · Reputation +20',research:35,reputation:20,upkeep:95000},
 {id:'games',icon:'🏅',name:'National Sports Games',cost:310000,desc:'Hold championships in multiple sports.',bonus:'Sports +12 · Happiness +3',sports:12,happy:3,upkeep:4500},
 {id:'museum',icon:'🏛️',name:'National Museum',cost:650000,desc:'Preserve culture and welcome visitors.',bonus:'Tourism +9 · Happiness +3',tourism:9,happy:3,upkeep:9400},
 {id:'safety',icon:'🛟',name:'Disaster Preparedness Fund',cost:420000,desc:'Support emergency services and infrastructure resilience.',bonus:'Safety +15',safety:15,upkeep:3000}
];
SHOP.push(...EXTRA_SHOP);
const EXTRA_EVENTS=[
 ['National Newspaper Launch','Independent journalists propose a new national paper.','Support press independence','Offer a competitive public grant','Decline government involvement'],
 ['Citizens Want a Holiday','Workers ask for an annual national culture day.','Create the national holiday','Trial the holiday in the capital','Keep the current calendar'],
 ['An International Airline Calls','An airline wants to operate flights from your country.','Invest in airport connections','Approve a private partnership','Delay the license'],
 ['New Railway Proposal','Transportation planners want to connect several cities.','Fund a railway study','Invite private rail operators','Postpone expansion'],
 ['National Football Cup','Football supporters want an annual national cup.','Fund the competition','Find commercial sponsors','Reject the plan'],
 ['Community Basketball League','Local clubs request indoor courts and competitions.','Fund sporting facilities','Partner with local clubs','Decline funding'],
 ['Science Scholarship Programme','Researchers request scholarships for talented students.','Sponsor national scholarships','Offer a smaller grant','Let universities handle it'],
 ['Clean Energy Debate','Energy providers propose a new renewable electricity project.','Subsidize clean energy','Allow private investment','Focus on current facilities'],
 ['Internet Infrastructure','Rural communities lack fast internet.','Expand broadband access','Offer private incentives','Wait for commercial expansion'],
 ['Coastal Tourism Plan','Tourism operators want public improvements to beaches and parks.','Support sustainable tourism','Focus on local businesses','Decline spending'],
 ['A Big Music Festival','Festival organizers propose an annual cultural event.','Fund a national festival','Offer a smaller cultural grant','Keep public funding elsewhere'],
 ['New Housing District','Planners request permission for affordable homes.','Fund public housing','Offer development incentives','Wait for private builders'],
 ['Student Council Petition','Students want representation in education decisions.','Create a student advisory body','Hold annual student surveys','Make no changes'],
 ['Healthcare Careers','Hospitals request funding for training new staff.','Sponsor healthcare training','Provide targeted incentives','Delay the programme'],
 ['Startup Technology Hub','Developers want a place to launch companies.','Create a tech hub','Offer private investors grants','Decline subsidies'],
 ['City Museum Proposal','Historians want a museum preserving national heritage.','Fund a museum','Help local archives','Reject funding'],
 ['National Parks Week','Environmental groups request a conservation celebration.','Host a national programme','Hold regional volunteer events','Leave it to local groups'],
 ['Rising Electricity Demand','Factories and homes need more power infrastructure.','Upgrade the grid','Offer renewable grants','Defer new investment'],
 ['Commuter Rail Fares','Transit users request affordable train tickets.','Subsidize cheaper tickets','Offer targeted discounts','Keep prices unchanged'],
 ['A Regional University','An underserved region wants its first university.','Fund construction','Provide distance learning','Delay the expansion'],
 ['Sporting Youth Grants','Young athletes request funding for local training.','Create national sports grants','Support selected clubs','No new grants'],
 ['World Culture Expo','Other countries invite your nation to a cultural expo.','Send a large delegation','Send a modest exhibition','Stay home'],
 ['Smart City Technology','An engineering company proposes smart traffic lights.','Launch a pilot city project','Seek private sponsorship','Maintain current roads'],
 ['Tourist Visa Reform','Tourism firms ask for easier visitor applications.','Simplify visitor rules','Trial an online system','Keep procedures unchanged'],
 ['Small Town Revitalization','Residents want support for small-town shops.','Fund town centers','Offer business tax relief','Avoid new spending'],
 ['Public Health Awareness','Clinics request a preventative health campaign.','Fund a nationwide campaign','Support regional outreach','No public campaign'],
 ['Election Debate','Party leaders request a televised public debate.','Fund an open debate','Allow independent organizers','Decline public sponsorship'],
 ['Historical Landmark','Architects want to protect an old railway station.','Restore the station','Provide a preservation grant','Allow new development'],
 ['Music and Art Schools','Parents want more affordable creative education.','Fund arts schools','Create extracurricular grants','Leave it to private providers'],
 ['National Cycling Routes','Cities want safe bike routes and walking paths.','Build connected routes','Fund a small pilot','Do not expand the network'],
 ['Foreign Trade Delegation','A neighboring nation invites you to a trade fair.','Send a full delegation','Send a small team','Skip the invitation'],
 ['Space Science Partnership','Scientists propose collaborating on satellite research.','Fund a research partnership','Begin with a small feasibility study','Decline the proposal'],
 ['Weekend Sports Access','Citizens want school sports grounds open on weekends.','Fund public access','Let cities decide','Keep existing restrictions'],
 ['Digital Public Services','Residents ask for online government applications.','Build an online portal','Launch one pilot service','Keep paper applications'],
 ['Water Conservation Plan','Dry weather has prompted calls for careful water use.','Invest in water reuse','Offer home efficiency grants','Avoid new initiatives'],
 ['Business Apprenticeships','Employers seek help training young workers.','Fund national apprenticeships','Create targeted incentives','Let companies fund training'],
 ['Public Broadcasting Debate','Citizens want more educational programming.','Fund a public education channel','Offer independent production grants','Make no investment'],
 ['National History Archive','Educators ask for digital access to historic records.','Create a public archive','Digitize selected materials','Defer the project'],
 ['Regional Food Markets','Farmers ask for help reaching local customers.','Build regional market hubs','Provide transport grants','Keep existing market rules'],
 ['Sports Medicine Centre','Athletes and doctors request a national sports clinic.','Build the clinic','Offer targeted medical grants','Decline new spending']
];
EXTRA_EVENTS.forEach(([title,text,a,b,c],i)=>{
 const cost=13000+(i%5)*6000;
 DECISIONS.push({title,text,options:[[a,'Higher investment and stronger public response.',{money:-cost*2,happy:4+(i%3)}],[b,'A compromise with smaller budget impact.',{money:-cost,happy:2+(i%2)}],[c,'Preserves funds but may disappoint some citizens.',{happy:-2-(i%3)}]]});
});
let foundingMode='custom',foundingFlag={...DEFAULT_FLAG},flagDraft={...DEFAULT_FLAG},flagTarget='founding';
const v3Normalize=normalizeState;
normalizeState=function(raw){
 const s=v3Normalize(raw);
 s.foundingMode=s.foundingMode==='existing'?'existing':'custom';
 s.homeCountry=COUNTRY_BY_ID.has(s.homeCountry)?s.homeCountry:V4_COUNTRY_DEFAULT;
 s.territories=Object.fromEntries(Object.entries(s.territories||{}).filter(([k,v])=>COUNTRY_BY_ID.has(k)&&!!v));
 if(!Object.keys(s.territories).length)s.territories[s.homeCountry]=true;
 s.flagDesign=sanitizeFlag(s.flagDesign||{...DEFAULT_FLAG,c1:s.flag});s.flag=s.flagDesign.c1;
 if(!Array.isArray(s.cities)||!s.cities.length){s.cities=[{id:'capital',name:s.capital,tiles:[...s.tiles]}];s.activeCity='capital';}
 s.cities=s.cities.slice(0,12).map((c,i)=>({id:String(c.id||'city-'+i),name:String(c.name||'City '+(i+1)).slice(0,48),tiles:Array.isArray(c.tiles)&&c.tiles.length===256?c.tiles.map(t=>t in TILES||t==='empty'?' '+t:'' ).map(t=>t.trim()||'empty'):[...s.tiles]}));
 s.activeCity=s.cities.some(x=>x.id===s.activeCity)?s.activeCity:s.cities[0].id;
 s.tiles=s.cities.find(c=>c.id===s.activeCity).tiles;
 s.leaderAge=clamp(Math.floor(Number(s.leaderAge)||32),18,99);
 s.leaderTrait=['pragmatic','charismatic','visionary','careful'].includes(s.leaderTrait)?s.leaderTrait:'pragmatic';
 s.leaderReputation=clamp(Number(s.leaderReputation??65),0,100);
 const old=s.constitution||{};
 s.constitution={electionYears:clamp(Number(old.electionYears??4),0,6),termLimit:clamp(Number(old.termLimit??2),0,3),legislature:['parliament','congress','council','none'].includes(old.legislature)?old.legislature:'parliament',autonomy:['unitary','mixed','federal'].includes(old.autonomy)?old.autonomy:'mixed'};
 s.lastElectionMonth=Number(s.lastElectionMonth)||1;
 s.electionsWon=Math.max(0,Number(s.electionsWon)||0);
 s.companies=Array.isArray(s.companies)?s.companies.slice(0,40).filter(x=>x&&typeof x.name==='string'&&SECTORS[x.sector]).map(x=>({name:String(x.name).slice(0,40),sector:x.sector})):[];
 s.leagueName=String(s.leagueName||'National Elite League').slice(0,48);
 s.clubs=Array.isArray(s.clubs)?s.clubs.slice(0,14).map((x,i)=>({id:String(x.id||'club'+i),name:String(x.name||'Club '+(i+1)).slice(0,48),city:String(x.city||'capital'),rating:clamp(Number(x.rating)||60,40,94),p:Math.max(0,Number(x.p)||0),w:Math.max(0,Number(x.w)||0),d:Math.max(0,Number(x.d)||0),l:Math.max(0,Number(x.l)||0),gf:Math.max(0,Number(x.gf)||0),ga:Math.max(0,Number(x.ga)||0)})):[];
 if(!s.clubs.length)s.clubs=['United FC','Athletic Club','City Wanderers','Royal Rovers'].map((name,i)=>({id:'starter'+i,name:i===0?s.capital+' United':name,city:s.cities[0].id,rating:60+i*5,p:0,w:0,d:0,l:0,gf:0,ga:0}));
 s.matchday=Math.max(0,Number(s.matchday)||0);
 s.news=Array.isArray(s.news)?s.news.slice(0,60).map(x=>String(x).slice(0,240)):[];
 s.financeHistory=Array.isArray(s.financeHistory)?s.financeHistory.slice(-24).map(x=>({month:Number(x.month)||1,money:Number(x.money)||0})):[];
 s.pendingFollowups=Array.isArray(s.pendingFollowups)?s.pendingFollowups.slice(0,6):[];
 s.nextCrisisAt=Math.max(3,Number(s.badAt)||rng(3,23));
 return s;
};
function sanitizeFlag(f){
 const color=(v,d)=>/^#[0-9a-f]{6}$/i.test(v||'')?v:d;
 return{pattern:FLAG_PATTERNS.includes(f.pattern)?f.pattern:'horizontal',ratio:['3:2','2:1','5:3'].includes(f.ratio)?f.ratio:'3:2',c1:color(f.c1,DEFAULT_FLAG.c1),c2:color(f.c2,DEFAULT_FLAG.c2),c3:color(f.c3,DEFAULT_FLAG.c3),symbol:FLAG_SYMBOLS.includes(f.symbol)?f.symbol:'star',symbolColor:color(f.symbolColor,DEFAULT_FLAG.symbolColor),count:[1,3,5].includes(Number(f.count))?Number(f.count):1,size:clamp(Number(f.size)||100,35,180),x:clamp(Number(f.x)||50,10,90),y:clamp(Number(f.y)||50,10,90),border:Boolean(f.border)};
}
function flagSVG(flag,withSvg=true){
 const f=sanitizeFlag(flag),{c1,c2,c3,symbolColor}=f;const shapes=[];
 if(f.pattern==='horizontal')shapes.push(`<rect y="80" width="360" height="80" fill="${c2}"/><rect y="160" width="360" height="80" fill="${c3}"/>`);
 if(f.pattern==='vertical')shapes.push(`<rect x="120" width="120" height="240" fill="${c2}"/><rect x="240" width="120" height="240" fill="${c3}"/>`);
 if(f.pattern==='diagonal')shapes.push(`<polygon points="0,240 360,0 360,240" fill="${c2}"/><polygon points="0,211 317,0 360,0 0,240" fill="${c3}"/>`);
 if(f.pattern==='cross')shapes.push(`<rect x="143" width="74" height="240" fill="${c2}"/><rect y="82" width="360" height="76" fill="${c2}"/><rect x="169" width="22" height="240" fill="${c3}"/><rect y="108" width="360" height="23" fill="${c3}"/>`);
 if(f.pattern==='nordic')shapes.push(`<rect x="100" width="70" height="240" fill="${c2}"/><rect y="89" width="360" height="60" fill="${c2}"/><rect x="121" width="26" height="240" fill="${c3}"/><rect y="108" width="360" height="22" fill="${c3}"/>`);
 if(f.pattern==='quartered')shapes.push(`<rect x="180" width="180" height="120" fill="${c2}"/><rect y="120" width="180" height="120" fill="${c2}"/><rect x="180" y="120" width="180" height="120" fill="${c3}"/>`);
 if(f.pattern==='chevron')shapes.push(`<rect x="0" y="120" width="360" height="120" fill="${c2}"/><path d="M0 0 L145 120 L0 240 Z" fill="${c3}"/>`);
 const emblem={star:'<polygon points="0,-46 11,-14 45,-14 18,6 28,40 0,20 -28,40 -18,6 -45,-14 -11,-14"/>',sun:'<circle r="29"/><path d="M-4 -52 H4 V-36 H-4Z M-4 36 H4 V52 H-4Z M36 -4 H52 V4 H36Z M-52 -4 H-36 V4 H-52Z M35 -41 L42 -34 L28 -22 L22 -28Z M-42 34 L-35 41 L-22 28 L-28 22Z M-41 -35 L-35 -41 L-22 -28 L-28 -22Z M35 41 L41 35 L28 22 L22 28Z"/>',shield:'<path d="M-39 -42 H39 L35 18 Q23 37 0 49 Q-23 37 -35 18Z"/>',diamond:'<polygon points="0,-49 43,0 0,49 -43,0"/>',circle:'<circle r="36"/>',globe:'<circle r="40"/><path d="M-40 0 H40 M0 -40 V40 M-30 -25 H30 M-30 25 H30" fill="none" stroke="'+c1+'" stroke-width="6"/>',none:''};
 const count=f.symbol==='none'?0:f.count,centres=count===1?[[f.x*3.6,f.y*2.4]]:count===3?[[f.x*3.6-70,f.y*2.4],[f.x*3.6,f.y*2.4],[f.x*3.6+70,f.y*2.4]]:[[f.x*3.6-85,f.y*2.4-40],[f.x*3.6+85,f.y*2.4-40],[f.x*3.6,f.y*2.4],[f.x*3.6-85,f.y*2.4+40],[f.x*3.6+85,f.y*2.4+40]];
 const scale=f.size/100*(count===1?1:.55);
 for(const [x,y] of centres)shapes.push(`<g transform="translate(${x} ${y}) scale(${scale})" fill="${symbolColor}">${emblem[f.symbol]}</g>`);
 if(f.border)shapes.push('<rect x="3" y="3" width="354" height="234" fill="none" stroke="#f8cb5b" stroke-width="6"/>');
 const ratio={'3:2':240,'2:1':180,'5:3':216}[f.ratio];
 const inner=`<rect width="360" height="240" fill="${c1}"/>${shapes.join('')}`;
 return withSvg?`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240" preserveAspectRatio="none" width="360" height="${ratio}" style="aspect-ratio:360/${ratio};width:100%;height:auto;display:block" role="img" aria-label="National flag">${inner}</svg>`:inner;
}
function drawFlag(el,f){if(el)el.innerHTML=flagSVG(f);}
const v3Totals=totals;
totals=function(){if(!state?.cities?.length)return v3Totals();const c={};Object.keys(TILES).forEach(k=>c[k]=0);for(const city of state.cities){for(const t of city.tiles)if(Object.prototype.hasOwnProperty.call(c,t))c[t]++;}return c;};
const v3Bonuses=bonuses;
bonuses=function(){const b=v3Bonuses();for(const key of ['energy','health','education','research','transport','tourism','environment','sports','safety','reputation']){b[key]=SHOP.reduce((sum,it)=>sum+(it[key]||0)*Number(state.shop[it.id]||0),0);}return b;};
const v3Calc=calc;
calc=function(){const m=v3Calc();if(!m)return m;const b=m.shop||{};const pop=Math.max(1,state.population);const comps=state.companies||[];const companyJobs=comps.reduce((n,c)=>n+(SECTORS[c.sector]?.jobs||0),0);const companyRevenue=comps.reduce((n,c)=>n+(SECTORS[c.sector]?.income||0),0);
 m.jobs+=companyJobs;m.income+=companyRevenue;m.net+=companyRevenue;
 const healthcare=clamp(Math.round(43+state.services*.23+(b.health||0)+m.school*1+(state.policies.healthcare===0?12:state.policies.healthcare===1?5:-7)),0,100);
 const education=clamp(Math.round(43+state.services*.17+(b.education||0)+m.school*4+(state.policies.education===0?12:state.policies.education===1?5:-6)),0,100);
 const housing=clamp(Math.round(100-Math.max(0,(pop-m.capacity)/pop)*93+(b.capacity>0?6:0)),0,100);
 const employment=clamp(Math.round(100-Math.max(0,(pop-m.jobs)/pop)*83),0,100);
 const food=clamp(Math.round(100-Math.max(0,(pop-m.food)/pop)*85),0,100);
 const freedom=clamp(Math.round(72+(state.policies.speech===0?13:state.policies.speech===1?0:-20)+(state.policies.media===0?7:state.policies.media===1?2:-9)+(state.policies.assembly===0?7:state.policies.assembly===1?0:-11)),0,100);
 const affordability=clamp(Math.round(91-Math.max(0,state.tax-12)*1.1-state.salesTax*.95-Math.max(0,(pop-m.capacity)/pop)*15),0,100);
 const energy=clamp(Math.round(52+(b.energy||0)-Math.max(0,m.factory-5)*1.5),0,100);
 const transport=clamp(Math.round(40+(b.transport||0)+(state.shop.rail||0)*8+(state.shop.buses||0)*6),0,100);
 const safety=clamp(Math.round(58+(b.safety||0)+state.services*.14-(state.war?13:0)),0,100);
 const scores={healthcare,education,housing,employment,food,freedom,affordability,energy,transport,safety};m.scores=scores;
 const average=Object.values(scores).reduce((a,c)=>a+c,0)/10;
 m.happy=clamp(Math.round(average*.57+m.happy*.43+(state.leaderTrait==='charismatic'?2:0)),2,99);
 m.growth+=pop*(m.happy-65)*.00010;
 m.privateJobs=companyJobs;m.privateRevenue=companyRevenue;
 m.gdp=Math.max(0,pop*17500+companyRevenue*250+Object.keys(state.territories||{}).length*7500000);
 m.unemployment=clamp(Math.round((1-Math.min(m.jobs,pop)/pop)*100),0,100);
 m.inflation=clamp(Number((1.4+(state.salesTax*.05)+(100-affordability)*.045+(state.money<0?2:0)).toFixed(1)),0,20);
 m.research=Math.round((b.research||0)+m.school*2);m.tourism=Math.round((b.tourism||0)+(state.shop.arts||0)*2);
 m.energy=energy;m.reputation=clamp(45+(b.reputation||0)+(state.clubs.length>3?3:0),0,100);
 return m;
};
// Single authoritative game state, no network calls, saved in browser/local JSON.
const v3Note=note;
note=function(message){v3Note(message);if(state){state.news=state.news||[];state.news.unshift(String(message).slice(0,240));state.news=state.news.slice(0,60);}};
const v3Show=show;
show=function(view){activeView=view;for(const key of ['world','city','shop','laws','nation','sports','leader']){const pane=$(key+'View');if(pane)pane.classList.toggle('hidden',view!==key);const nav=$('nav'+key[0].toUpperCase()+key.slice(1));if(nav)nav.classList.toggle('active',view===key);}if(view==='world')renderCountry();if(view==='city')renderCity();if(view==='shop')renderShop();if(view==='laws')renderLaws();if(view==='nation')renderNation();if(view==='sports')renderSports();if(view==='leader')renderLeader();};
const v3RenderAll=renderAll;
renderAll=function(){v3RenderAll();renderTerritories();renderBanner();if(activeView==='nation')renderNation();if(activeView==='sports')renderSports();if(activeView==='leader')renderLeader();};
const v3RenderCity=renderCity;
renderCity=function(){v3RenderCity();if(!state)return;const c=currentCity();$('cityName').textContent='🏙️ '+c.name;const tabs=$('cityTabs');tabs.replaceChildren();for(const city of state.cities){const btn=document.createElement('button');btn.textContent=city.name;btn.className=city.id===state.activeCity?'selected':'';btn.onclick=()=>selectCity(city.id);tabs.appendChild(btn);}const b=$('addCityBtn');b.disabled=state.cities.length>=12||state.money!==-1&&state.money<95000;b.title='Costs $95,000. Maximum 12 cities.';};
function currentCity(){return state?.cities?.find(c=>c.id===state.activeCity)||state.cities[0];}
function selectCity(id){if(!state||eventBusy)return;const c=state.cities.find(x=>x.id===id);if(!c)return;state.activeCity=c.id;state.tiles=c.tiles;renderAll();saveSilent();}
function addCity(){if(!state||eventBusy)return;if(state.cities.length>=12){toast('Maximum 12 cities in V4.0');return;}if(state.money!==-1&&state.money<95000){toast('You need $95K to found a city');return;}const name=prompt('Name your new city:','New Horizon');if(name===null)return;const clean=name.trim().slice(0,48);if(!clean){toast('Please enter a city name');return;}if(state.cities.some(c=>c.name.toLowerCase()===clean.toLowerCase())){toast('Choose a unique city name');return;}if(state.money!==-1)state.money-=95000;const city={id:'city'+Date.now().toString(36)+Math.floor(Math.random()*10000),name:clean,tiles:Array(256).fill('empty')};state.cities.push(city);state.activeCity=city.id;state.tiles=city.tiles;note('Founded the city of '+clean+' for $95K');renderAll();saveSilent();toast('Welcome to '+clean);}
function renderTerritories(){if(!state)return;const owned=Object.keys(state.territories).filter(id=>COUNTRY_BY_ID.has(id)),names=owned.slice(0,5).map(id=>COUNTRY_BY_ID.get(id).name);$('territoryPanel').innerHTML=`<b>${owned.length} mapped ${owned.length===1?'region':'regions'}</b><p>${safe(names.join(', '))}${owned.length>5?' and '+(owned.length-5)+' more':''}</p><small>Territory is recorded at whole-country map resolution; the scenario is fictional.</small>`;document.querySelectorAll('#countries .country').forEach(el=>el.classList.toggle('owned',!!state.territories[el.dataset.iso]));}
const v3Highlight=highlightCountries;
highlightCountries=function(){v3Highlight();if(state)renderTerritories();};
const v3RenderCountry=renderCountry;
renderCountry=function(){if(!state)return;const c=COUNTRY_BY_ID.get(selectedId);if(c&&state.territories[c.id]){$('selectedCountry').textContent=c.name+' · Your territory';$('countrySummary').textContent='This map region belongs to '+state.name+' in your alternate-history campaign.';$('countryRelation').innerHTML='<b>Owned region</b> · National administration';$('countryActions').innerHTML='<p class="small">Your own territory is part of your national economy. Select another country to negotiate or expand.</p>';highlightCountries();return;}v3RenderCountry();if(!c||state.war?.iso===c.id)return;const panel=$('countryActions');const rel=Number(state.relations[c.id]||0);const btn=document.createElement('button');btn.className='territory-action';btn.innerHTML='<strong>🕊️ Propose peaceful federation</strong><span>Requires +45 relations · $500K · Acceptance is not guaranteed. Successful unions change map ownership.</span>';btn.disabled=rel<45||(state.money!==-1&&state.money<500000);btn.onclick=()=>proposeUnion(c.id);panel.insertBefore(btn,panel.firstChild);};
function proposeUnion(id){if(!state||eventBusy||state.territories[id])return;const c=COUNTRY_BY_ID.get(id);if(!c)return;const score=Number(state.relations[id]||0);if(score<45){toast('Improve relations to +45 first');return;}if(state.money!==-1&&state.money<500000){toast('You need $500K');return;}if(state.money!==-1)state.money-=500000;const accepted=Math.random()<clamp(.3+score/200,.3,.8);if(accepted){state.territories[id]=true;state.relations[id]=90;state.approvalOffset=clamp(state.approvalOffset+3,-70,45);note('Peaceful federation agreement signed with '+c.name+'. Territory added to your nation.');toast(c.name+' joined your federation');}else{state.relations[id]=clamp(score-8,-100,100);note(c.name+' declined a proposed peaceful federation.');toast('Proposal declined this time');}renderAll();saveSilent();}
const v3RenderDashboard=renderDashboard;
renderDashboard=function(){v3RenderDashboard();if(!state)return;$('statHappy').title='Citizens react to education, healthcare, housing, freedom, affordability, electricity, jobs, food and more.';};
function renderBanner(){if(!state)return;drawFlag($('headerFlag'),state.flagDesign);$('headerNation').textContent=state.name;$('headerMotto').textContent=state.motto;drawFlag($('lawsFlag'),state.flagDesign);}
function scoreRow(name,value){return `<div class="score-row"><div><span>${safe(name)}</span><strong>${value}%</strong></div><div class="score-track"><i style="width:${value}%;background:${value>=70?'#5dceac':value>=45?'#a886e9':'#f2a56b'}"></i></div></div>`;}
function renderNation(){if(!state)return;const m=calc();$('wellbeingRows').innerHTML=Object.entries(m.scores).map(([key,value])=>scoreRow(key.replace(/([A-Z])/g,' $1').replace(/^./,x=>x.toUpperCase()),value)).join('');$('economyRows').innerHTML=[['Monthly income',cash(m.income)],['Monthly spending',cash(m.upkeep)],['Net monthly budget',signed(m.net,cash)],['GDP (game estimate)',cash(m.gdp)],['Unemployment',m.unemployment+'%'],['Inflation (simplified)',m.inflation+'%'],['Research rating',m.research],['Tourism rating',m.tourism],['Electricity access',m.energy+'%'],['Trade partners',m.tradeCount]].map(([a,b])=>`<div class="resline"><span>${safe(a)}</span><b>${safe(b)}</b></div>`).join('');
 $('governmentSummary').innerHTML=`<div class="identity-summary"><div>${flagSVG(state.flagDesign)}</div><div><b>${safe(state.gov)}</b><p>${safe(state.title)} ${safe(state.leader)} · ${safe(state.capital)}</p><p>${Object.keys(state.territories).length} Earth regions · ${state.cities.length} cities</p></div></div>`;
 const groups=[['Students',Math.round((m.scores.education*.65+m.scores.freedom*.35))],['Workers',Math.round((m.scores.employment*.50+m.scores.affordability*.35+m.scores.transport*.15))],['Families',Math.round((m.scores.housing*.4+m.scores.healthcare*.3+m.scores.food*.3))],['Entrepreneurs',Math.round((m.scores.energy*.25+m.scores.transport*.3+m.scores.affordability*.45))],['Retirees',Math.round((m.scores.healthcare*.45+m.scores.safety*.35+m.scores.affordability*.2))]];
 $('citizenGroups').innerHTML='<h3 style="margin-top:18px">Public satisfaction by group</h3>'+groups.map(([n,v])=>scoreRow(n,v)).join('');
 $('companiesList').innerHTML=state.companies.length?state.companies.map(c=>`<div class="resline"><span>${SECTORS[c.sector].icon} ${safe(c.name)}</span><b>${safe(c.sector)}</b></div>`).join(''):'<p class="small">No registered private companies yet.</p>';
 $('nationalNews').innerHTML=(state.news.length?state.news:history.slice(0,10)).slice(0,18).map(x=>`<article>${safe(x)}</article>`).join('')||'<p>News appears as you make decisions.</p>';
 renderChart();}
function renderChart(){const svg=$('economyChart'),data=state.financeHistory;svg.replaceChildren();if(!data?.length){svg.innerHTML='<text x="18" y="70" fill="#acb6d0" font-size="14">Advance a month to plot your treasury history.</text>';return;}const min=Math.min(...data.map(p=>p.money)),max=Math.max(...data.map(p=>p.money)),delta=Math.max(1,max-min);const pts=data.map((p,i)=>[18+(i/(Math.max(1,data.length-1)))*386,120-(p.money-min)/delta*96]);svg.innerHTML='<line x1="18" y1="120" x2="403" y2="120" stroke="#53617a"/><line x1="18" y1="16" x2="18" y2="120" stroke="#53617a"/><polyline points="'+pts.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="#ac89ef" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="#63dfb0"/>`).join('')+`<text x="22" y="135" font-size="10" fill="#b3bed0">${safe('Month '+data[0].month)}</text><text x="402" y="135" text-anchor="end" font-size="10" fill="#b3bed0">${safe('Month '+data[data.length-1].month)}</text>`;}
function licenseCompany(){if(!state||eventBusy)return;const name=$('companyName').value.trim().slice(0,40),sector=$('companySector').value;if(!name||!SECTORS[sector]){toast('Enter a company name and sector');return;}if(state.companies.length>=40){toast('Company limit reached');return;}if(state.companies.some(c=>c.name.toLowerCase()===name.toLowerCase())){toast('Company already exists');return;}if(state.money!==-1&&state.money<25000){toast('Licensing programme requires $25K');return;}if(state.money!==-1)state.money-=25000;state.companies.push({name,sector});note('New '+sector+' company '+name+' opened and began hiring.');$('companyName').value='';renderAll();saveSilent();}
function leagueSorted(){return [...state.clubs].sort((a,b)=>(b.p-a.p)||(b.gf-b.ga)-(a.gf-a.ga)||(b.gf-a.gf));}
function renderSports(){if(!state)return;$('leagueName').value=state.leagueName;$('clubCity').innerHTML=state.cities.map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join('');$('clubList').innerHTML=`<p class="small">${state.clubs.length} registered clubs · ${state.matchday} matchdays played.</p>`+state.clubs.map(c=>`<div class="resline"><span>⚽ ${safe(c.name)}</span><b>OVR ${c.rating}</b></div>`).join('');$('leagueTable').innerHTML=`<table><thead><tr><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead><tbody>${leagueSorted().map(c=>`<tr><td>${safe(c.name)}</td><td>${c.w+c.d+c.l}</td><td>${c.w}</td><td>${c.d}</td><td>${c.l}</td><td>${c.p}</td></tr>`).join('')}</tbody></table>`;
 const m=calc();$('nationalTeamInfo').innerHTML=`<div class="resline"><span>National team rating</span><b>${clamp(Math.round(48+state.clubs.length*2+(state.shop.sports||0)*2+(state.shop.stadium||0)*4+(state.shop.games||0)*2),45,94)} / 99</b></div><div class="resline"><span>National sports funding</span><b>${cash((state.shop.sports||0)*145000+(state.shop.stadium||0)*1900000)}</b></div>`;}
function createClub(){if(!state||eventBusy)return;const name=$('clubName').value.trim().slice(0,48),city=$('clubCity').value;if(!name||!state.cities.find(c=>c.id===city)){toast('Enter a club name and home city');return;}if(state.clubs.length>=14){toast('Maximum 14 clubs');return;}if(state.clubs.some(c=>c.name.toLowerCase()===name.toLowerCase())){toast('That club already exists');return;}if(state.money!==-1&&state.money<35000){toast('Club founding costs $35K');return;}if(state.money!==-1)state.money-=35000;state.clubs.push({id:'club'+Date.now(),name,city,rating:rng(50,76),p:0,w:0,d:0,l:0,gf:0,ga:0});$('clubName').value='';note('Founded football club '+name+'.');renderAll();saveSilent();}
function playMatchday(){if(!state||eventBusy)return;const clubs=[...state.clubs];if(clubs.length<2){toast('Add more clubs first');return;}for(let i=clubs.length-1;i>0;i--){const j=rng(0,i);[clubs[i],clubs[j]]=[clubs[j],clubs[i]];}const results=[];for(let i=0;i+1<clubs.length;i+=2){const a=clubs[i],b=clubs[i+1],as=clamp(rng(0,3)+Math.round((a.rating-b.rating)/25),0,7),bs=clamp(rng(0,3)+Math.round((b.rating-a.rating)/25),0,7);a.gf+=as;a.ga+=bs;b.gf+=bs;b.ga+=as;if(as>bs){a.w++;a.p+=3;b.l++;}else if(as<bs){b.w++;b.p+=3;a.l++;}else{a.d++;b.d++;a.p++;b.p++;}results.push(`${a.name} ${as}–${bs} ${b.name}`);}state.matchday++;$('lastMatch').textContent=results.join(' · ');note('Football matchday '+state.matchday+': '+results.slice(0,2).join(' · '));state.approvalOffset=clamp(state.approvalOffset+.15,-70,45);renderAll();saveSilent();}
function nationalFriendly(){if(!state||eventBusy)return;const rivals=COUNTRY_MAP.filter(c=>!state.territories[c[0]]);const rival=rivals[rng(0,rivals.length-1)][1];const rating=48+state.clubs.length*2+(state.shop.stadium||0)*4;const home=clamp(rng(0,3)+Math.round((rating-60)/25),0,6),away=rng(0,4);const outcome=home>away?'won':home<away?'lost':'drew';state.approvalOffset=clamp(state.approvalOffset+(outcome==='won'?2:outcome==='lost'?-1:0),-70,45);note(`National football team ${outcome} against ${rival}, ${home}–${away}.`);toast(`${state.name} ${home}–${away} ${rival}`);renderAll();saveSilent();}
function renderLeader(){if(!state)return;const c=state.constitution;$('leaderAge').value=state.leaderAge;$('leaderTrait').value=state.leaderTrait;$('leaderCard').innerHTML=`<div class="leader-avatar">♛</div><div><strong>${safe(state.title)} ${safe(state.leader)}</strong><p>${state.leaderAge} years old · ${safe(state.leaderTrait)} leader</p><p>Reputation ${Math.round(state.leaderReputation)}% · Elections won ${state.electionsWon}</p></div>`;for(const [id,key]of [['electionYears','electionYears'],['termLimit','termLimit'],['legislature','legislature'],['autonomy','autonomy']])$(id).value=c[key];$('constitutionInfo').textContent=c.electionYears?`Your nation holds scheduled elections every ${c.electionYears} years. Regional authority: ${c.autonomy}.`:'Your constitution does not currently schedule national elections.';$('chronicle').innerHTML=history.slice(0,20).map(x=>`<article>${safe(x)}</article>`).join('')||'<p>National history begins when you found a country.</p>';}
function saveLeader(){if(!state)return;state.leaderAge=clamp(Math.floor(Number($('leaderAge').value)||32),18,99);state.leaderTrait=$('leaderTrait').value;note('Updated head-of-state profile.');renderAll();saveSilent();}
function nationalAddress(){if(!state||eventBusy)return;if(state.money!==-1&&state.money<5000){toast('Requires $5K');return;}if(state.money!==-1)state.money-=5000;state.leaderReputation=clamp(state.leaderReputation+2,0,100);state.approvalOffset=clamp(state.approvalOffset+1,-70,45);note(state.title+' '+state.leader+' delivered a national address.');renderAll();saveSilent();}
function applyConstitution(){if(!state||eventBusy)return;for(const key of ['electionYears','termLimit','legislature','autonomy'])state.constitution[key]=isNaN(Number($(key).value))?$(key).value:Number($(key).value);note('Amended national constitution and government rules.');renderAll();saveSilent();toast('Constitution updated');}
const v3EndMonth=endMonth;
endMonth=function(){if(!state)return;const monthBefore=state.month;v3EndMonth();if(state.month===monthBefore)return;if(state.month%12===1)state.leaderAge=Math.min(99,state.leaderAge+1);const m=calc();state.financeHistory.push({month:state.month,money:state.money===-1?0:Math.round(state.money)});state.financeHistory=state.financeHistory.slice(-24);if(state.constitution.electionYears>0&&state.month-state.lastElectionMonth>=state.constitution.electionYears*12){state.lastElectionMonth=state.month;state.electionsWon++;state.leaderReputation=clamp(state.leaderReputation+(m.happy>=50?5:-7),0,100);note(`National election held. ${state.leader} continues as head of state in this simplified V4 election model.`);}if(m.happy<35&&state.month%4===0)note('Peaceful public demonstrations call for improvements in living conditions.');saveSilent();};
const v3OpenDecision=openDecision;
openDecision=function(){if(!state||eventBusy)return;const ready=state.pendingFollowups.findIndex(e=>e.due<=state.month);if(ready<0||state.popupCount+1>=state.badAt){v3OpenDecision();return;}const follow=state.pendingFollowups.splice(ready,1)[0];const ev={title:'📰 Follow-up: '+follow.topic,text:'Your earlier choice about '+follow.topic.toLowerCase()+' has drawn a reaction. '+follow.outcome,options:[['Invest in the next stage','More public support with budget costs.',{money:-18000,happy:4}],['Seek a balanced compromise','Modest improvements and modest costs.',{money:-7000,happy:2}],['Move on to other issues','Save money but some residents are disappointed.',{happy:-2}]]};activeEvent={...ev,isCrisis:false};eventBusy=true;$('eventKind').textContent='✦ CONSEQUENCE OF YOUR CHOICE';$('eventTitle').textContent=ev.title;$('eventText').textContent=ev.text;const box=$('eventOptions');box.replaceChildren();for(const [title,detail,effects]of ev.options){const b=document.createElement('button');b.className='primary';const strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=title;small.textContent=detail;b.append(strong,small);b.onclick=()=>chooseEvent(title,effects);box.appendChild(b);}$('eventModal').classList.remove('hidden');renderDashboard();};
const v3ChooseEvent=chooseEvent;
chooseEvent=function(choice,effects){if(!state||!activeEvent)return;const topic=activeEvent.title;if(!topic.startsWith('📰 Follow-up')&&!activeEvent.isCrisis&&state.pendingFollowups.length<6){state.pendingFollowups.push({due:state.month+rng(2,5),topic:topic.replace(/^[^\w]*/,''),outcome:`The decision to "${choice}" is still influencing residents and businesses.`});}state.leaderReputation=clamp(state.leaderReputation+(effects.happy>0?1:-2),0,100);v3ChooseEvent(choice,effects);};
const v3MakeNation=makeNation;
makeNation=function(){const selected=foundingMode==='existing'?$('newRealCountry').value:$('newOrigin').value;const country=COUNTRY_BY_ID.get(selected)||COUNTRY_BY_ID.get(V4_COUNTRY_DEFAULT);if(foundingMode==='existing')$('newName').value=country.name;v3MakeNation();state.foundingMode=foundingMode;state.homeCountry=country.id;state.territories={[country.id]:true};state.lon=country.x/1000*360-180;state.lat=90-country.y/500*180;state.currency=($('newCurrency').value||'Dollars').trim().slice(0,24);state.motto=($('newMotto').value||'Our future is ours.').trim().slice(0,85);state.flagDesign=sanitizeFlag(foundingFlag);state.flag=state.flagDesign.c1;state.cities[0].name=state.capital;state.activeCity=state.cities[0].id;state.tiles=state.cities[0].tiles;state.news=[];note((foundingMode==='custom'?'Founded new alternate-history country in ':'Began leading ')+country.name+'.');renderAll();show('nation');saveSilent();};
const v3LoadData=loadData;
loadData=function(data){v3LoadData(data);state=normalizeState(state);renderAll();show('nation');};
const v3SaveSilent=saveSilent;
saveSilent=function(){if(!state)return false;try{localStorage.setItem(SAVE,JSON.stringify({app:'Project Nation',version:'4.0',state,history}));$('resumeBtn').classList.remove('hidden');return true;}catch(e){return false;}};
const v3ExportSave=exportSave;
exportSave=function(){if(!state)return;const blob=new Blob([JSON.stringify({app:'Project Nation',version:'4.0',exported:new Date().toISOString(),state,history},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='ProjectNation_'+state.name.replace(/[^a-z0-9_-]/gi,'_').slice(0,32)+'_V4.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('V4 save exported');};
const v3UpdateIdentity=updateIdentity;
updateIdentity=function(){v3UpdateIdentity();state.flagDesign.c1=state.flag;renderBanner();saveSilent();};
function flagInputsFromDraft(){for(const [input,key]of [['fPattern','pattern'],['fRatio','ratio'],['fC1','c1'],['fC2','c2'],['fC3','c3'],['fSymbol','symbol'],['fSymbolColor','symbolColor'],['fCount','count'],['fSize','size'],['fX','x'],['fY','y'],['fBorder','border']]){if(key==='border')$(input).checked=flagDraft[key];else $(input).value=flagDraft[key];}renderFlagDraft();}
function flagFromInputs(){const f={};for(const [input,key]of [['fPattern','pattern'],['fRatio','ratio'],['fC1','c1'],['fC2','c2'],['fC3','c3'],['fSymbol','symbol'],['fSymbolColor','symbolColor'],['fCount','count'],['fSize','size'],['fX','x'],['fY','y'],['fBorder','border']])f[key]=key==='border'?$(input).checked:$(input).value;return sanitizeFlag(f);}
function renderFlagDraft(){drawFlag($('flagPreview'),flagDraft);for(const id of ['Size','X','Y'])$('f'+id+'Label').textContent=flagDraft[id.toLowerCase()]+'%';}
function openFlag(target){flagTarget=target;flagDraft=sanitizeFlag(target==='founding'?foundingFlag:(state?.flagDesign||foundingFlag));flagInputsFromDraft();$('flagModal').classList.remove('hidden');}
function closeFlag(){$('flagModal').classList.add('hidden');}
function commitFlag(){flagDraft=flagFromInputs();if(flagTarget==='founding'){foundingFlag={...flagDraft};$('newFlag').value=foundingFlag.c1;drawFlag($('creatorFlag'),foundingFlag);}else if(state){state.flagDesign={...flagDraft};state.flag=flagDraft.c1;$('editFlag').value=flagDraft.c1;note('Adopted a new national flag.');renderAll();saveSilent();}closeFlag();toast('Flag design saved!');}
function exportFlag(){const str=flagSVG(flagDraft).replace(/ style="[^"]*"/,'');const url=URL.createObjectURL(new Blob([str],{type:'image/svg+xml'}));const link=document.createElement('a');link.href=url;link.download='ProjectNation_Flag.svg';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function switchFounding(mode){foundingMode=mode;$('chooseCustom').classList.toggle('selected',mode==='custom');$('chooseReal').classList.toggle('selected',mode==='existing');$('originLabel').classList.toggle('hidden',mode!=='custom');$('realCountryLabel').classList.toggle('hidden',mode!=='existing');$('newName').disabled=mode==='existing';$('foundingHelp').textContent=mode==='custom'?'Alternate-history Earth: your nation begins in the selected mapped region.':'Choose an existing country. National statistics and economics are fictional game values, not live real-world data.';if(mode==='existing'){const c=COUNTRY_BY_ID.get($('newRealCountry').value);$('newName').value=c?.name||'Canada';}else{$('newName').value='Republic of Freedom';}}
function initV4Controls(){
 for(const key of ['nation','sports','leader'])$('nav'+key[0].toUpperCase()+key.slice(1)).onclick=()=>{if(state)show(key);};
 const countries=COUNTRY_MAP.map(([id,name])=>`<option value="${safe(id)}">${safe(name)}</option>`).join('');$('newOrigin').innerHTML=countries;$('newRealCountry').innerHTML=countries;$('newOrigin').value=V4_COUNTRY_DEFAULT;$('newRealCountry').value='CAN';$('chooseCustom').onclick=()=>switchFounding('custom');$('chooseReal').onclick=()=>switchFounding('existing');$('newRealCountry').onchange=()=>{if(foundingMode==='existing'){$('newName').value=COUNTRY_BY_ID.get($('newRealCountry').value)?.name||'Country';}};
 $('creatorFlagBtn').onclick=()=>openFlag('founding');$('editFlagBtn').onclick=()=>openFlag('current');$('flagClose').onclick=closeFlag;$('flagSave').onclick=commitFlag;$('flagExport').onclick=exportFlag;
 for(const input of $('flagModal').querySelectorAll('input,select')){input.oninput=()=>{flagDraft=flagFromInputs();renderFlagDraft();};input.onchange=()=>{flagDraft=flagFromInputs();renderFlagDraft();};}
 $('flagRandom').onclick=()=>{const hex=()=>('#'+[0,0,0].map(()=>rng(35,235).toString(16).padStart(2,'0')).join(''));flagDraft={...flagDraft,pattern:FLAG_PATTERNS[rng(0,FLAG_PATTERNS.length-1)],c1:hex(),c2:hex(),c3:hex(),symbol:FLAG_SYMBOLS[rng(0,FLAG_SYMBOLS.length-1)],symbolColor:hex(),size:rng(55,140),x:50,y:50};flagInputsFromDraft();};
 $('newFlag').oninput=()=>{foundingFlag.c1=$('newFlag').value;drawFlag($('creatorFlag'),foundingFlag);};drawFlag($('creatorFlag'),foundingFlag);
 $('addCityBtn').onclick=addCity;$('licenseCompany').onclick=licenseCompany;$('saveLeader').onclick=saveLeader;$('leaderSpeech').onclick=nationalAddress;$('applyConstitution').onclick=applyConstitution;$('createClub').onclick=createClub;$('playMatchday').onclick=playMatchday;$('playFriendly').onclick=nationalFriendly;
 $('saveLeagueName').onclick=()=>{if(!state)return;const n=$('leagueName').value.trim().slice(0,48);if(!n)return;state.leagueName=n;note('Renamed the national league to '+n+'.');saveSilent();toast('League name updated');};
 $('foundBtn').onclick=makeNation;$('exportBtn').onclick=exportSave;$('updateIdentity').onclick=updateIdentity;$('resumeBtn').classList.toggle('hidden',!findSave());switchFounding('custom');
}
initV4Controls();
