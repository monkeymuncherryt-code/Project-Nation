'use strict';
/* Project Nation V5 — World & Legacy. Everything is fictional and runs offline. */
const V5_VERSION='5.0';
const V5_RESOURCES={
 food:{icon:'🌾',name:'Food',price:85},energy:{icon:'⚡',name:'Energy',price:155},
 materials:{icon:'🧱',name:'Materials',price:185},technology:{icon:'💻',name:'Technology',price:490}
};
const V5_TECH={
 cleanGrid:{icon:'☀️',name:'Smart electricity network',cost:150000,months:5,desc:'Improve energy supply, lower shortages, and boost electricity access.'},
 highSpeed:{icon:'🚄',name:'High-speed transportation',cost:230000,months:6,desc:'Improve revenue from railways and transport networks.'},
 biotech:{icon:'🧬',name:'Medical research',cost:205000,months:5,desc:'Improve healthcare and population satisfaction.'},
 agri:{icon:'🌱',name:'Advanced agriculture',cost:170000,months:4,desc:'Increase food production.'},
 aero:{icon:'🚀',name:'Satellite technology',cost:410000,months:8,desc:'Unlock a national satellite launch for international prestige.'},
 education:{icon:'🎓',name:'Digital classrooms',cost:125000,months:4,desc:'Improve education and technology output.'}
};
const V5_NEW_EVENTS=[
 ['A Wave of New Startups','Young founders request simpler registration procedures.','Set up a startup fund','Create a mentorship scheme','Keep current business rules'],
 ['National Science Fair','University researchers request funding for an international science exhibition.','Sponsor the fair','Invite business sponsors','Cancel public support'],
 ['Air Travel Expansion','Airlines want to connect your capital to additional cities.','Offer route subsidies','Approve private routes','Delay airport expansion'],
 ['Rising Train Ridership','Commuters want a more frequent railway service.','Expand railway schedules','Test a limited service','Reject expansion'],
 ['Local Museum Preservation','An old museum requests help preserving cultural exhibits.','Fund restoration','Offer a smaller grant','Seek private funding'],
 ['National Football Academy','Football coaches request support for young players.','Open a public academy','Seek sponsorship','Decline funding'],
 ['Historic Anniversary','Citizens want to celebrate an important national milestone.','Plan a national festival','Offer small local events','Skip the celebration'],
 ['Debate on School Hours','Parents disagree over proposed changes to school schedules.','Let schools choose','Run a national consultation','Keep the old schedule'],
 ['New Renewable-Energy Proposal','A clean-energy cooperative wants development approval.','Offer investment grants','Approve without subsidy','Delay the project'],
 ['Tourism Advertising Campaign','Local hotels want international tourism promotion.','Fund an international campaign','Promote regional travel','Save the budget'],
 ['Citizen-Led Community Gardens','Residents propose turning unused land into garden plots.','Fund city gardens','Offer volunteer support','Decline the request'],
 ['A Regional Technology Expo','Technology companies propose an event to showcase homegrown inventions.','Sponsor the expo','Support a low-cost version','Let companies handle it'],
 ['The Future of Libraries','Libraries want to expand their digital lending collections.','Buy more digital books','Upgrade one main library','Defer the upgrade'],
 ['Sports Broadcasting Deal','Broadcasters want to air the national football league.','Approve broad access','Negotiate a public channel','Delay the contract'],
 ['Local Elections Debate','Mayors want more control over municipal projects.','Give cities more power','Create an advisory council','Keep all decisions central'],
 ['Winter Energy Planning','Power operators request funding for additional energy reserves.','Create a public reserve','Contract private producers','Keep reserves unchanged'],
 ['Research Exchange Programme','Universities want to exchange students with neighboring nations.','Fully fund exchanges','Pilot with one university','Decline the plan'],
 ['Better City Bus Stops','Residents request shelters, route information and accessible transport.','Modernize the network','Upgrade key stops','Keep the old stops'],
 ['National Park Volunteers','A group of citizens proposes a large conservation programme.','Expand public funding','Organize a volunteer programme','Avoid new commitments'],
 ['Workplace Skills Programme','Factories report a shortage of trained workers.','Fund vocational training','Offer employer tax credits','Let employers recruit'],
 ['Affordable Internet Request','Rural families want cheaper internet connections.','Subsidize rural broadband','Offer targeted grants','Leave prices unchanged'],
 ['Young Entrepreneurs Forum','Students want a national youth business competition.','Sponsor new businesses','Support mentors and prizes','Reject government funding'],
 ['Public Health Research','Health researchers propose a nationwide prevention campaign.','Fully finance the campaign','Launch a regional pilot','Postpone the campaign'],
 ['A New Railway Museum','Local historians want to preserve railway heritage.','Build the museum','Support a small exhibition','Decline the project']
];
V5_NEW_EVENTS.forEach(([title,text,a,b,c],i)=>{
 const cost=24000+(i%5)*8000;
 DECISIONS.push({title,text,options:[
  [a,'Public investment with a strong community benefit.',{money:-cost,happy:5}],
  [b,'A balanced compromise with more modest effects.',{money:-Math.round(cost*.35),happy:2}],
  [c,'Lower spending, but a less popular decision.',{happy:-3}]
 ]});
});
const v5BaseNormalize=normalizeState;
normalizeState=function(raw){
 const s=v5BaseNormalize(raw);
 const legacy=raw?.territoryShares;
 s.territoryShares={};
 if(legacy&&typeof legacy==='object'){
  for(const [id,value] of Object.entries(legacy))if(COUNTRY_BY_ID.has(id)){
   const pct=clamp(Number(value)||0,0,100);if(pct>0)s.territoryShares[id]=pct;
  }
 }else{
  for(const id of Object.keys(s.territories||{}))if(s.territories[id])s.territoryShares[id]=100;
 }
 if(!Object.keys(s.territoryShares).length)s.territoryShares[s.homeCountry]=100;
 s.territories=Object.fromEntries(Object.entries(s.territoryShares).filter(([,n])=>n>=99.999).map(([id])=>[id,true]));
 s.leaderSince=Math.max(1,Number(s.leaderSince)||1);
 s.generations=clamp(Math.floor(Number(s.generations)||1),1,999);
 s.termCount=Math.max(0,Math.floor(Number(s.termCount)||1));
 s.leaderArchive=Array.isArray(s.leaderArchive)?s.leaderArchive.slice(-80).filter(x=>x&&typeof x.name==='string'):[];
 s.timeline=Array.isArray(s.timeline)?s.timeline.filter(x=>typeof x==='string').slice(0,150):[];
 s.social=Array.isArray(s.social)?s.social.filter(x=>typeof x==='string').slice(0,35):[];
 s.resources={};for(const [id,value] of Object.entries(V5_RESOURCES))s.resources[id]=clamp(Number(raw?.resources?.[id]??({food:600,energy:430,materials:330,technology:80}[id])),0,1e8);
 s.routes=Array.isArray(s.routes)?s.routes.filter(x=>x&&['air','rail'].includes(x.kind)&&typeof x.from==='string'&&typeof x.to==='string').slice(0,30):[];
 s.researchDone=Array.isArray(s.researchDone)?s.researchDone.filter(id=>V5_TECH[id]):[];
 s.researchTask=s.researchTask&&V5_TECH[s.researchTask.id]?{id:s.researchTask.id,remaining:clamp(Number(s.researchTask.remaining)||1,1,100)}:null;
 s.alliances=s.alliances&&typeof s.alliances==='object'?Object.fromEntries(Object.entries(s.alliances).filter(([id,value])=>COUNTRY_BY_ID.has(id)&&!!value)):{};
 s.organization=String(s.organization||'').slice(0,48);
 s.organizationMembers=Array.isArray(s.organizationMembers)?s.organizationMembers.filter(id=>COUNTRY_BY_ID.has(id)).slice(0,50):[];
 s.seasonNumber=Math.max(1,Math.floor(Number(s.seasonNumber)||1));
 s.seasonRound=Math.max(0,Math.floor(Number(s.seasonRound)||0));
 s.seasonSchedule=Array.isArray(s.seasonSchedule)?s.seasonSchedule:[];
 s.champions=Array.isArray(s.champions)?s.champions.slice(-20):[];
 s.pendingSuccession=typeof s.pendingSuccession==='string'?s.pendingSuccession:null;
 s.sportsHistory=Array.isArray(s.sportsHistory)?s.sportsHistory.slice(-30):[];
 s.satellites=Math.max(0,Math.floor(Number(s.satellites)||0));
 s.presidentWealth=clamp(Number(s.presidentWealth)||45000,0,1e10);
 s.leaderMentoring=clamp(Number(s.leaderMentoring)||0,0,10);
 // Legacy V4 wars never transferred territory. Close them when upgrading.
 s.war=null;
 return s;
};
function v5TerritoryCount(){return Object.values(state?.territoryShares||{}).reduce((sum,n)=>sum+n/100,0);}
function v5Percent(id){return clamp(Number(state?.territoryShares?.[id])||0,0,100);}
function v5SyncTerritories(){
 state.territories=Object.fromEntries(Object.entries(state.territoryShares).filter(([,n])=>n>=99.999).map(([id])=>[id,true]));
}
const v5BaseCalc=calc;
calc=function(){const m=v5BaseCalc();if(!m||!state)return m;
 const shares=v5TerritoryCount(),routes=state.routes||[];
 const air=routes.filter(x=>x.kind==='air').length,rail=routes.length-air;
 const transportIncome=air*7000+rail*3900+(state.researchDone?.includes('highSpeed')?routes.length*800:0);
 const transportUpkeep=air*2400+rail*1300;
 const territoryIncome=Math.round(Math.max(0,shares-1)*3100);
 m.income+=transportIncome+territoryIncome;m.upkeep+=transportUpkeep;m.net+=transportIncome+territoryIncome-transportUpkeep;
 m.gdp+=Math.round(shares*12000000+routes.length*1800000);
 m.happy=clamp(m.happy+(state.researchDone?.includes('biotech')?2:0)+(state.researchDone?.includes('education')?1:0),1,99);
 m.research+=state.researchDone?.length*6||0;
 m.energy=clamp(m.energy+(state.researchDone?.includes('cleanGrid')?12:0),0,100);
 m.routes=routes.length;
 m.ownedLand=Number(shares.toFixed(2));
 return m;
};
const v5BaseNote=note;
note=function(message){v5BaseNote(message);if(!state)return;
 const line=String(message).slice(0,260);
 state.social=state.social||[];state.social.unshift('💬 Citizen forum · '+(calc()?.happy>=65?'Mostly optimistic: ':'Mixed reactions: ')+line);
 state.social=state.social.slice(0,35);
 if(/war |victory|defeat|treaty|federation|research|successor|president|retir|election|league|champion|route|organization|founded the city|new nation/i.test(line)){
  state.timeline=state.timeline||[];state.timeline.unshift('Month '+state.month+' · '+line);state.timeline=state.timeline.slice(0,150);
 }
};
// A region has a partial, visual purple overlay matching its actual percentage.
function v5RenderOverlay(){
 const svg=$('earth');let defs=$('v5ClipDefs'),layer=$('v5OwnershipLayer');if(!defs){defs=document.createElementNS(SVG_NS,'defs');defs.id='v5ClipDefs';svg.insertBefore(defs,svg.firstChild);}if(!layer){layer=document.createElementNS(SVG_NS,'g');layer.id='v5OwnershipLayer';layer.setAttribute('pointer-events','none');svg.insertBefore(layer,$('capitalMarker'));}
 defs.replaceChildren();layer.replaceChildren();
 document.querySelectorAll('#countries .country').forEach(el=>el.classList.toggle('owned',v5Percent(el.dataset.iso)>=99.999));
 for(const [id,pct] of Object.entries(state.territoryShares)){
  if(pct<=0||pct>=99.999)continue;const base=document.querySelector('#countries .country[data-iso="'+id+'"]');if(!base)continue;
  let bounds;try{bounds=base.getBBox();}catch(e){continue;}if(!bounds.width||!bounds.height)continue;
  const clip=document.createElementNS(SVG_NS,'clipPath');clip.id='v5-land-'+id;clip.setAttribute('clipPathUnits','userSpaceOnUse');
  const shape=document.createElementNS(SVG_NS,'path');shape.setAttribute('d',COUNTRY_BY_ID.get(id).path);shape.setAttribute('fill-rule','evenodd');clip.appendChild(shape);defs.appendChild(clip);
  const rect=document.createElementNS(SVG_NS,'rect');rect.setAttribute('x',bounds.x);rect.setAttribute('y',bounds.y);rect.setAttribute('width',bounds.width*pct/100);rect.setAttribute('height',bounds.height);rect.setAttribute('fill','#a477e8');rect.setAttribute('stroke','#ead5ff');rect.setAttribute('stroke-width','0.5');rect.setAttribute('clip-path','url(#'+clip.id+')');layer.appendChild(rect);
  // A visible marker shows the exact saved fraction even for tiny or multipart country shapes.
  const country=COUNTRY_BY_ID.get(id);
  if(country){
   const ring=document.createElementNS(SVG_NS,'circle');ring.setAttribute('cx',country.x);ring.setAttribute('cy',country.y);ring.setAttribute('r','6');ring.setAttribute('fill','#b38af8');ring.setAttribute('stroke','#ffecb6');ring.setAttribute('stroke-width','1.2');ring.setAttribute('opacity','.92');layer.appendChild(ring);
   const label=document.createElementNS(SVG_NS,'text');label.setAttribute('x',country.x+8);label.setAttribute('y',country.y-8);label.setAttribute('fill','#fff1ff');label.setAttribute('stroke','#13223b');label.setAttribute('stroke-width','2.5');label.setAttribute('paint-order','stroke');label.setAttribute('font-size','10');label.setAttribute('font-weight','700');label.textContent=Math.round(pct)+'%';layer.appendChild(label);
  }

 }
}
const v5BaseRenderTerritories=renderTerritories;
renderTerritories=function(){if(!state)return;v5SyncTerritories();v5RenderOverlay();
 const owned=Object.entries(state.territoryShares).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]);
 $('territoryPanel').innerHTML=`<b>${v5TerritoryCount().toFixed(2)} equivalent regions · ${owned.length} areas</b><p>${owned.slice(0,5).map(([id,n])=>safe(COUNTRY_BY_ID.get(id)?.name||id)+' '+Math.round(n)+'%').join(' · ')}${owned.length>5?' · more':''}</p><small>Partial ownership is shown by purple shading across each approximate map shape. All territory outcomes are fictional.</small>`;
};
function v5WarProbability(id){
 const c=COUNTRY_BY_ID.get(id),m=calc(),score=Number(state.relations[id]||0);
 const own=clamp(45+Math.log10(Math.max(1,Math.abs(state.money===-1?1000000000:state.money)+1))*2+(m.research||0)*.07+(m.happy-50)*.12+(state.alliances&&Object.values(state.alliances).filter(Boolean).length||0)*1.3,35,85);
 const opponent=42+((id.charCodeAt(0)*13+id.charCodeAt(1)*7+id.charCodeAt(2))%34);
 return clamp(Math.round(50+(own-opponent)*1.1+score*.06),23,78);
}
function v5WarTarget(){const eligible=Object.entries(state.territoryShares).filter(([,pct])=>pct>5);
 if(!eligible.length)return null;
 // Prefer land gained in earlier conflicts, then the founding region.
 eligible.sort((a,b)=>a[1]-b[1]);return eligible[0][0];}
const v5BaseRenderCountry=renderCountry;
renderCountry=function(){if(!state)return;const c=COUNTRY_BY_ID.get(selectedId);
 const panel=$('countryActions'),rel=$('countryRelation');panel.replaceChildren();rel.replaceChildren();
 if(!c){$('selectedCountry').textContent='Choose a country';$('countrySummary').textContent='Select a region to negotiate, establish an alliance, or resolve an instant war.';highlightCountries();return;}
 const pct=v5Percent(c.id),relationship=clamp(Number(state.relations[c.id]||0),-100,100);
 $('selectedCountry').textContent=c.name+(pct>0?' · '+Math.round(pct)+'% owned':'');
 $('countrySummary').textContent=pct>=99.999?'This mapped region is fully part of '+state.name+'.':pct>0?'Your nation currently owns '+Math.round(pct)+'% of this map region.':'You currently own no territory in '+c.name+'.';
 rel.innerHTML=`<b>Relations ${relationship>=0?'+':''}${relationship}/100</b> · ${state.alliances[c.id]?'🤝 Allied':relationship>=45?'Friendly':relationship<=-40?'Hostile':'Neutral'}${state.trades[c.id]?' · 📦 Trade partner':''}<br><b>Territorial control: ${pct.toFixed(1)}%</b>`;
 function action(title,detail,fn,disabled=false,cls=''){const b=document.createElement('button');b.className=cls;b.disabled=disabled;const strong=document.createElement('strong');strong.textContent=title;const small=document.createElement('span');small.textContent=detail;b.append(strong,small);b.onclick=fn;panel.appendChild(b);}
 if(pct>=99.999){action('✅ Fully administered','Your national government controls this entire mapped region.',()=>{},true);highlightCountries();return;}
 const canSpend=n=>state.money===-1||state.money>=n;
 action('🤝 Improve relations','Diplomatic mission · $10K',()=>diplomacy(c.id,'mission'),!canSpend(10000));
 action('📦 Trade agreement','Commercial partnership · $18K',()=>diplomacy(c.id,'trade'),!canSpend(18000)||!!state.trades[c.id]);
 if(!state.alliances[c.id])action('🕊️ Form alliance','Requires +35 relations · $45K · shared world reputation',()=>v5FormAlliance(c.id),relationship<35||!canSpend(45000));
 else action('🕊️ End alliance','Return to a neutral diplomatic partnership',()=>v5EndAlliance(c.id));
 if(!state.territories[c.id]&&pct===0)action('🌿 Peaceful federation','Requires +45 relations · $500K · chance to gain region',()=>v5ProposeFederation(c.id),relationship<45||!canSpend(500000),'territory-action');
 if(state.organization&&state.organizationMembers&&!state.organizationMembers.includes(c.id))action('🌐 Invite to organization','Requires +30 relations · $10K',()=>v5InviteOrg(c.id),relationship<30||!canSpend(10000));
 action('⚔️ Instant war resolution','Outcome occurs immediately · '+v5WarProbability(c.id)+'% estimated win chance · borders will change',()=>openWarConfirm(c.id),!!state.alliances[c.id],'danger');
 highlightCountries();
};
function v5ProposeFederation(id){
 const c=COUNTRY_BY_ID.get(id),r=Number(state.relations[id]||0);
 if(!c||v5Percent(id)>0||r<45||!v5Spend(500000))return;
 if(Math.random()<clamp(.3+r/200,.3,.8)){
  state.territoryShares[id]=100;v5SyncTerritories();state.relations[id]=90;
  state.approvalOffset=clamp(state.approvalOffset+3,-70,45);
  note('Peaceful federation treaty signed: '+c.name+' joined '+state.name+'.');
 }else{state.relations[id]=clamp(r-8,-100,100);note(c.name+' declined a peaceful federation proposal.');}
 renderAll();saveSilent();
}
function v5FormAlliance(id){if(!state||eventBusy||v5Percent(id)>=100)return;const r=Number(state.relations[id]||0);if(r<35){toast('Improve relations first');return;}if(!v5Spend(45000))return;state.alliances[id]=true;state.relations[id]=clamp(r+12,-100,100);note('Alliance treaty signed with '+COUNTRY_BY_ID.get(id).name+'.');renderAll();saveSilent();}
function v5EndAlliance(id){delete state.alliances[id];state.relations[id]=Math.max(-100,Number(state.relations[id]||0)-15);note('Alliance with '+COUNTRY_BY_ID.get(id).name+' ended.');renderAll();saveSilent();}
function v5InviteOrg(id){if(!state.organization||state.organizationMembers.includes(id)||Number(state.relations[id]||0)<30||!v5Spend(10000))return;state.organizationMembers.push(id);state.relations[id]=clamp((state.relations[id]||0)+8,-100,100);note(COUNTRY_BY_ID.get(id).name+' joined '+state.organization+'.');renderAll();saveSilent();}
openWarConfirm=function(id){if(!state||eventBusy||v5Percent(id)>=100||state.alliances[id])return;
 const c=COUNTRY_BY_ID.get(id);if(!c)return;
 $('confirmTitle').textContent='Instant war decision: '+c.name;
 $('confirmText').textContent='In this fictional strategy game, war resolves IMMEDIATELY on confirmation. Estimated victory chance: '+v5WarProbability(id)+'%. A victory gains 12–28 percentage points of '+c.name+' on the map; a defeat loses 8–20 points from one of your own regions. Treasury and happiness are also affected. No battles or waiting.';
 $('confirmGo').textContent='Resolve war instantly';$('confirmGo').onclick=()=>declareWar(id);
 $('confirmModal').classList.remove('hidden');
};
declareWar=function(id){$('confirmModal').classList.add('hidden');if(!state||eventBusy||v5Percent(id)>=100||state.alliances[id])return;
 const c=COUNTRY_BY_ID.get(id);if(!c)return;
 if(state.money!==-1)state.money-=35000;
 const win=Math.random()*100<v5WarProbability(id);
 let change=0,changedId=id;
 if(win){change=Math.min(100-v5Percent(id),rng(12,28));state.territoryShares[id]=Math.min(100,v5Percent(id)+change);state.approvalOffset=clamp(state.approvalOffset+3,-70,45);}
 else {changedId=v5WarTarget();if(changedId){change=Math.min(Math.max(0,v5Percent(changedId)-1),rng(8,20));state.territoryShares[changedId]=Math.max(1,v5Percent(changedId)-change);}state.approvalOffset=clamp(state.approvalOffset-8,-70,45);if(state.money!==-1)state.money-=45000;}
 state.relations[id]=-90;state.trades[id]=false;state.war=null;v5SyncTerritories();
 const where=COUNTRY_BY_ID.get(changedId)?.name||'home territory';
 const text=win?`VICTORY over ${c.name}! You gained ${change.toFixed(1)}% of its mapped region.`:`DEFEAT against ${c.name}. You lost ${change.toFixed(1)}% of the ${where} mapped region.`;
 note(text);
 $('v5WarOutcomeKicker').textContent=win?'🏆 INSTANT VICTORY':'⚠ INSTANT DEFEAT';
 $('v5WarOutcomeTitle').textContent=win?'Victory — Territory Acquired':'Defeat — Territory Lost';
 $('v5WarOutcomeText').textContent=text;
 $('v5WarOutcomeStats').textContent=`${win?'+':'−'}${change.toFixed(1)}% territory in ${where} · ${win?'−$35K':'−$80K'} treasury (unless unlimited) · ${win?'+3':'−8'} public approval offset.`;
 $('v5WarOutcomeModal').classList.remove('hidden');
 selectedId=changedId||id;$('countrySelect').value=selectedId;renderAll();saveSilent();
};
const v5BaseShow=show;
show=function(view){v5BaseShow(view);$('hubView').classList.toggle('hidden',view!=='hub');$('navHub').classList.toggle('active',view==='hub');if(view==='hub')renderHub();if(view==='sports'){v5RenderSeason();v5RenderOtherSports();}if(view==='leader')v5RenderLeaderExtras();};
const v5BaseRenderAll=renderAll;
renderAll=function(){if(!state)return;v5BaseRenderAll();if(activeView==='hub')renderHub();if(activeView==='sports'){v5RenderSeason();v5RenderOtherSports();}if(activeView==='leader')v5RenderLeaderExtras();};
function v5Spend(cost){if(!state||eventBusy)return false;if(state.money!==-1&&state.money<cost){toast('Not enough money: need '+cash(cost));return false;}if(state.money!==-1)state.money-=cost;return true;}
function v5CitizenStats(){const m=calc(),p=state.population;
 const cohorts=[
  {icon:'🎒',name:'Students',share:.22,score:Math.round((m.scores.education*2+m.scores.housing+m.scores.freedom)/4)},
  {icon:'🧰',name:'Workers',share:.46,score:Math.round((m.scores.employment*2+m.scores.affordability+m.scores.transport)/4)},
  {icon:'🏡',name:'Families',share:.22,score:Math.round((m.scores.housing+m.scores.healthcare+m.scores.food+m.scores.safety)/4)},
  {icon:'🌳',name:'Retirees',share:.10,score:Math.round((m.scores.healthcare*2+m.scores.affordability+m.scores.safety)/4)}
 ];return cohorts.map((x,i)=>({...x,pop:Math.round(p*x.share),score:clamp(x.score,0,100)}));
}
function v5Price(id){const seed=Object.keys(V5_RESOURCES).indexOf(id)+1;return Math.max(10,Math.round(V5_RESOURCES[id].price*(1+Math.sin(state.month*.37+seed)*.13)));}
function v5TradeResource(id,dir){if(!V5_RESOURCES[id]||!state||eventBusy)return;const amount=25,price=v5Price(id)*amount;
 if(dir==='buy'){if(!v5Spend(price))return;state.resources[id]+=amount;note('Purchased '+amount+' units of '+id+' for '+cash(price)+'.');}
 else{if(state.resources[id]<amount){toast('You need '+amount+' units to sell');return;}state.resources[id]-=amount;if(state.money!==-1)state.money+=price;note('Sold '+amount+' units of '+id+' for '+cash(price)+'.');}
 renderAll();saveSilent();
}
function v5Route(){const from=$('v5RouteFrom').value,to=$('v5RouteTo').value,kind=$('v5RouteType').value,cost=kind==='air'?260000:120000;
 if(!from||!to||from===to){toast('Choose two different cities');return;}
 if(state.routes.some(r=>r.from===from&&r.to===to&&r.kind===kind||r.from===to&&r.to===from&&r.kind===kind)){toast('This transport route already exists');return;}
 if(state.routes.length>=30){toast('Maximum 30 transport routes');return;}
 if(!v5Spend(cost))return;
 state.routes.push({from,to,kind});const src=state.cities.find(c=>c.id===from)?.name||from,dst=state.cities.find(c=>c.id===to)?.name||to;
 note((kind==='air'?'New airline route':'New railway route')+' opened between '+src+' and '+dst+'.');renderAll();saveSilent();
}
function v5StartResearch(id){const item=V5_TECH[id];if(!item||state.researchTask||state.researchDone.includes(id))return;if(!v5Spend(item.cost))return;state.researchTask={id,remaining:item.months};note('Research started: '+item.name+'.');renderAll();saveSilent();}
function v5LaunchSatellite(){
 if(!state.researchDone.includes('aero')){toast('Complete Satellite technology research first');return;}
 if(!v5Spend(280000))return;
 const success=Math.random()<.82;if(success){state.satellites++;state.approvalOffset=clamp(state.approvalOffset+2,-70,45);note('National space agency launched satellite number '+state.satellites+' into orbit (fictional programme).');}
 else{note('An uncrewed satellite mission did not reach orbit. Researchers will review the results.');}
 renderAll();saveSilent();
}
function v5OtherSport(type){
 if(!state||eventBusy)return;
 const typeInfo={basketball:{name:'National Basketball Cup',cost:35000},motorsport:{name:'Motorsport Championship',cost:60000}}[type];if(!typeInfo)return;
 if(!v5Spend(typeInfo.cost))return;
 const strength=clamp(55+(state.shop.sports||0)*2+(state.shop.stadium||0)*2+state.clubs.length+Math.round(state.services/20),40,95);
 const winners=type==='basketball'?['Capital Hoops','Northern Stars','United Athletics','Freedom Flyers']:['Aurora Racing','City Motors','Velocity Team','Coastal GP'];
 const champion=winners[rng(0,winners.length-1)],revenue=type==='basketball'?rng(7000,30000):rng(15000,50000);
 if(state.money!==-1)state.money+=revenue;
 state.sportsHistory.unshift({month:state.month,type,champion});state.sportsHistory=state.sportsHistory.slice(0,30);
 state.approvalOffset=clamp(state.approvalOffset+Math.max(1,Math.round(strength/35)),-70,45);
 note(typeInfo.name+' hosted by '+state.name+'. Champion: '+champion+'. Festival revenue '+cash(revenue)+'.');renderAll();saveSilent();
}
function v5RenderOtherSports(){
 $('v5OtherSports').innerHTML=state.sportsHistory.length?state.sportsHistory.slice(0,5).map(x=>`<div class="resline"><span>${x.type==='basketball'?'🏀':'🏎️'} ${safe(x.champion)}</span><b>Month ${x.month}</b></div>`).join(''):'<p class="muted">No national tournaments held yet.</p>';
}
function v5FoundOrg(){if(state.organization){toast('You already lead an organization');return;}
 const name=$('v5OrgName').value.trim().slice(0,48);if(!name){toast('Enter an organization name');return;}if(!v5Spend(150000))return;
 state.organization=name;state.organizationMembers=[];note('Founded international organization '+name+'.');renderAll();saveSilent();}
function renderHub(){if(!state)return;const m=calc(),groups=v5CitizenStats();
 $('v5Summary').innerHTML=[['🌍','Mapped land',v5TerritoryCount().toFixed(2)+' regions'],['🏛️','Generation',String(state.generations)],['💹','Monthly net',cash(m.net)],['🤝','Allies',String(Object.values(state.alliances).filter(Boolean).length)],['🏙️','Cities',String(state.cities.length)]].map(([icon,label,value])=>`<div class="v5-stat"><small>${icon} ${label}</small><b>${safe(value)}</b></div>`).join('');
 $('v5CitizenGroups').innerHTML=groups.map(x=>`<div class="v5-person"><span>${x.icon} <b>${x.name}</b> · ${fmt.format(x.pop)} people</span><strong>${x.score}% happy</strong><div class="v5-bar"><i style="width:${x.score}%"></i></div></div>`).join('');
 $('v5Markets').innerHTML=Object.entries(V5_RESOURCES).map(([id,it])=>`<div class="v5-market"><div><b>${it.icon} ${it.name}</b><small>${Math.floor(state.resources[id])} units · ${cash(v5Price(id))} / unit</small></div><div><button data-v5-market="${id}" data-dir="buy">Buy 25</button><button data-v5-market="${id}" data-dir="sell">Sell 25</button></div></div>`).join('');
 $('v5Markets').querySelectorAll('[data-v5-market]').forEach(btn=>btn.onclick=()=>v5TradeResource(btn.dataset.v5Market,btn.dataset.dir));
 $('v5MarketNotice').textContent='Resource stocks grow through farms, power projects and technology companies. Prices fluctuate in this fictional economy.';
 for(const id of ['v5RouteFrom','v5RouteTo']){const el=$(id),selected=el.value;el.innerHTML=state.cities.map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join('');if(state.cities.some(c=>c.id===selected))el.value=selected;}
 if(state.cities.length>1&&$('v5RouteFrom').value===$('v5RouteTo').value)$('v5RouteTo').selectedIndex=1;
 $('v5Routes').innerHTML=state.routes.length?state.routes.map(x=>`<div class="resline"><span>${x.kind==='air'?'✈️':'🚆'} ${safe(state.cities.find(c=>c.id===x.from)?.name||'City')} ↔ ${safe(state.cities.find(c=>c.id===x.to)?.name||'City')}</span><b>${cash(x.kind==='air'?4600:2600)} net/mo</b></div>`).join(''):'<p class="small">Found another city to unlock routes.</p>';
 $('v5ResearchStatus').textContent=state.researchTask?'Active project: '+V5_TECH[state.researchTask.id].name+' · '+state.researchTask.remaining+' months remaining':'No active research project. Completed '+state.researchDone.length+' / '+Object.keys(V5_TECH).length+'.';
 $('v5ResearchProjects').innerHTML=Object.entries(V5_TECH).map(([id,x])=>`<div class="v5-tech"><div><b>${x.icon} ${x.name}</b><p>${x.desc}</p></div><button data-research="${id}" ${state.researchDone.includes(id)||state.researchTask?'disabled':''}>${state.researchDone.includes(id)?'✓ Complete':cash(x.cost)+' · '+x.months+' mo'}</button></div>`).join('');
 $('v5ResearchProjects').querySelectorAll('[data-research]').forEach(btn=>btn.onclick=()=>v5StartResearch(btn.dataset.research));
 $('v5SpaceStatus').textContent=state.researchDone.includes('aero')?`${state.satellites} satellites successfully launched. Your space programme is ready.`:'Complete Satellite technology research to unlock satellite launches.';
 $('v5LaunchSatellite').disabled=!state.researchDone.includes('aero');
 $('v5OrgInfo').innerHTML=state.organization?`<b>🌐 ${safe(state.organization)}</b><p>${state.organizationMembers.length} other member nations</p><p>${safe(state.organizationMembers.slice(0,8).map(id=>COUNTRY_BY_ID.get(id)?.name||id).join(', ')||'Select friendly countries on the Earth map to invite them.')}</p>`:'<p class="muted">Create an organization and invite friendly countries from the Earth map.</p>';
 $('v5Social').innerHTML=state.social.length?state.social.slice(0,9).map(x=>`<article>${safe(x)}</article>`).join(''):'<article>Your citizens are ready for the next national story.</article>';
 $('v5Timeline').innerHTML=state.timeline.length?state.timeline.slice(0,40).map(x=>`<div class="v5-history-line">${safe(x)}</div>`).join(''):'<p class="muted">Found your nation to begin its history.</p>';
}
function v5Year(){return 2027+Math.floor((state.month-1)/12)}
let v5SuccessionMandatory=false;
function v5OpenSuccession(reason,mandatory=false){if(!state)return;if(eventBusy){state.pendingSuccession=reason;return;}
 v5SuccessionMandatory=mandatory;eventBusy=true;if(mandatory)state.pendingSuccession=reason;$('v5SuccessionReason').textContent=reason+'. Your next leader takes office immediately. All national progress, territory, cities, money, companies, sports, and diplomacy are preserved.';
 $('v5SuccessionCancel').classList.toggle('hidden',mandatory);
 $('v5SuccessorName').value='';$('v5SuccessorAge').value=40;
 $('v5SuccessionModal').classList.remove('hidden');
}
function v5ConfirmSuccession(){if(!state)return;
 const next=$('v5SuccessorName').value.trim().slice(0,48);if(!next){toast('Please name your next leader');return;}
 const archive={name:state.leader,title:state.title,from:state.leaderSince,to:state.month,age:state.leaderAge,reputation:Math.round(state.leaderReputation),reason:$('v5SuccessionReason').textContent.split('.')[0]};
 state.leaderArchive.push(archive);state.leaderArchive=state.leaderArchive.slice(-80);
 state.generations++;state.leader=next;state.leaderAge=clamp(Math.round(Number($('v5SuccessorAge').value)||40),18,85);state.leaderTrait=$('v5SuccessorTrait').value;
 state.leaderReputation=clamp(Math.round(49+state.leaderMentoring*3),35,85);state.leaderSince=state.month;
 state.electionsWon=0;state.termCount=1;state.lastElectionMonth=state.month;state.pendingSuccession=null;
 $('v5SuccessionModal').classList.add('hidden');v5SuccessionMandatory=false;eventBusy=false;
 note('A new president takes office: '+state.title+' '+next+'. Generation '+state.generations+' begins. National progress was preserved.');renderAll();saveSilent();toast('Generation '+state.generations+' begins!');
}
function v5RenderLeaderExtras(){if(!state)return;
 $('v5LeaderHistory').innerHTML=`<p><b>Generation ${state.generations}</b> · Incumbent since year ${2027+Math.floor((state.leaderSince-1)/12)}</p><p>${safe(state.leader)} · Age ${state.leaderAge} · Personal wealth ${cash(state.presidentWealth)}</p><p>${state.leaderArchive.length} former leaders recorded</p>`;
 $('v5LeaderLife').innerHTML='<p>Mentoring level: '+state.leaderMentoring+'/10 · Reputation '+Math.round(state.leaderReputation)+'%</p><p>Leader traits and actions affect citizen trust. Changes to presidents never reset the nation.</p>';
}
function v5LeaderVisit(){if(!v5Spend(7000))return;state.leaderReputation=clamp(state.leaderReputation+3,0,100);state.approvalOffset=clamp(state.approvalOffset+1,-70,45);note('President '+state.leader+' visited local communities and listened to residents.');renderAll();saveSilent();}
function v5Mentor(){if(state.leaderMentoring>=10){toast('Mentoring programme is already fully developed');return;}if(!v5Spend(15000))return;state.leaderMentoring++;note('A leadership mentoring programme prepared the next generation of public servants.');renderAll();saveSilent();}
function v5MonthlyResources(){const t=totals();
 const prod={food:Math.round(45+(t.farm||0)*52+(state.shop.food||0)*55+(state.researchDone.includes('agri')?130:0)),
 energy:Math.round(28+(state.shop.solar||0)*95+(state.shop.power||0)*100+(state.shop.energy||0)*80+(state.researchDone.includes('cleanGrid')?115:0)),
 materials:Math.round(18+(t.factory||0)*30+(state.companies.filter(c=>c.sector==='energy').length)*15),
 technology:Math.round(5+(state.companies.filter(c=>c.sector==='technology').length)*15+(state.researchDone.includes('education')?18:0))};
 const demand={food:Math.round(state.population/100),energy:Math.round(state.population/170),materials:Math.round((t.factory||0)*3),technology:0};
 for(const id of Object.keys(V5_RESOURCES))state.resources[id]=clamp(state.resources[id]+prod[id]-demand[id],0,1e8);
 if(state.resources.food===0||state.resources.energy===0)state.approvalOffset=clamp(state.approvalOffset-.5,-70,45);
 if(state.researchTask){state.researchTask.remaining--;if(state.researchTask.remaining<=0){const research=V5_TECH[state.researchTask.id];state.researchDone.push(state.researchTask.id);note('Research completed: '+research.name+'.');state.researchTask=null;}}
 state.presidentWealth=clamp(state.presidentWealth+3800,0,1e10);
}
function v5ElectionCheck(){const yrs=state.constitution.electionYears;if(!yrs||state.month-state.lastElectionMonth<yrs*12)return;
 state.lastElectionMonth=state.month;const m=calc();
 if(state.constitution.termLimit>0&&state.termCount>=state.constitution.termLimit){note('Term limit reached. National election requires a new leader.');v5OpenSuccession('Election: the constitutional term limit was reached',true);return;}
 const winChance=clamp(Math.round(40+(m.happy-50)*.8+(state.leaderReputation-50)*.33),16,83);
 if(Math.random()*100<winChance){state.electionsWon++;state.termCount++;state.leaderReputation=clamp(state.leaderReputation+3,0,100);note('Election result: '+state.leader+' wins another term with '+Math.round(winChance)+'% estimated reelection support.');}
 else{note('Election result: voters choose a new national leader.');v5OpenSuccession('Election: voters selected new leadership',true);}
}
const v5BaseEndMonth=endMonth;
endMonth=function(){if(!state)return;
 // V4 assumed the incumbent always wins. V5 handles election results and succession here instead.
 const electionYears=state.constitution.electionYears;state.constitution.electionYears=0;
 const before=state.month;
 try{v5BaseEndMonth();}finally{state.constitution.electionYears=electionYears;}
 if(state.month===before)return;
 v5MonthlyResources();v5ElectionCheck();
 if(state.leaderAge>=85&&!state.pendingSuccession){note('The president is considering retirement after a long career.');state.pendingSuccession='Retirement: leadership transition';}
 if(state.pendingSuccession&&!eventBusy){const why=state.pendingSuccession;state.pendingSuccession=null;v5OpenSuccession(why,true);}
 saveSilent();
};
const v5BaseChooseEvent=chooseEvent;
chooseEvent=function(choice,effects){v5BaseChooseEvent(choice,effects);
 if(state?.pendingSuccession&&!eventBusy){const why=state.pendingSuccession;state.pendingSuccession=null;v5OpenSuccession(why,true);}
};
function v5BuildSchedule(){const ids=state.clubs.map(c=>c.id);if(ids.length%2)ids.push('BYE');if(ids.length<2)return[];
 const rounds=[];const teams=[...ids];for(let r=0;r<teams.length-1;r++){
  const pairs=[];for(let i=0;i<teams.length/2;i++){const a=teams[i],b=teams[teams.length-1-i];if(a!=='BYE'&&b!=='BYE')pairs.push([a,b]);}
  rounds.push(pairs);teams.splice(1,0,teams.pop());
 }
 return rounds;
}
function v5Season(){if(!state.seasonSchedule.length){state.seasonSchedule=v5BuildSchedule();state.seasonRound=0;}
 if(state.seasonRound>=state.seasonSchedule.length){state.seasonNumber++;state.seasonRound=0;state.seasonSchedule=v5BuildSchedule();state.clubs.forEach(c=>Object.assign(c,{p:0,w:0,d:0,l:0,gf:0,ga:0}));note('A new national football season began: Season '+state.seasonNumber+'.');}
}
playMatchday=function(){if(!state||eventBusy||state.clubs.length<2)return;v5Season();const games=state.seasonSchedule[state.seasonRound];if(!games)return;
 const results=[];for(const [ida,idb] of games){const a=state.clubs.find(c=>c.id===ida),b=state.clubs.find(c=>c.id===idb);if(!a||!b)continue;
 const as=clamp(rng(0,3)+Math.round((a.rating-b.rating)/24),0,7),bs=clamp(rng(0,3)+Math.round((b.rating-a.rating)/24),0,7);
 a.gf+=as;a.ga+=bs;b.gf+=bs;b.ga+=as;
 if(as>bs){a.w++;a.p+=3;b.l++;}else if(as<bs){b.w++;b.p+=3;a.l++;}else{a.d++;b.d++;a.p++;b.p++;}
 results.push(`${a.name} ${as}–${bs} ${b.name}`);
 }
 state.seasonRound++;state.matchday++;$('lastMatch').textContent=results.join(' · ');
 note('Football season '+state.seasonNumber+', round '+state.seasonRound+': '+results.slice(0,2).join(' · '));
 if(state.seasonRound>=state.seasonSchedule.length){const champion=leagueSorted()[0];if(champion){state.champions.push({season:state.seasonNumber,name:champion.name});state.champions=state.champions.slice(-20);state.approvalOffset=clamp(state.approvalOffset+1,-70,45);note('National football champions: '+champion.name+' wins Season '+state.seasonNumber+'!');}}
 renderAll();saveSilent();
};
function v5RenderSeason(){if(!state)return;const remaining=state.seasonSchedule.length-state.seasonRound;
 $('v5SeasonDetails').innerHTML=`<p><b>Season ${state.seasonNumber}</b> · ${state.seasonRound} rounds played · ${Math.max(0,remaining)} remaining</p><p>Last champion: ${safe(state.champions.at(-1)?.name||'None yet')}</p><p>Club ratings are used to simulate scheduled matches, not actual football games.</p>`;
 const el=$('v5TrainingClub'),selected=el.value;el.innerHTML=state.clubs.map(c=>`<option value="${safe(c.id)}">${safe(c.name)} (OVR ${c.rating})</option>`).join('');if(state.clubs.some(c=>c.id===selected))el.value=selected;
}
function v5TrainClub(){const c=state.clubs.find(x=>x.id===$('v5TrainingClub').value);if(!c||c.rating>=95){toast('Choose a trainable club');return;}if(!v5Spend(40000))return;c.rating=Math.min(95,c.rating+2);note('Football club '+c.name+' improved to OVR '+c.rating+' through youth training.');renderAll();saveSilent();}
const v5BaseCreateClub=createClub;
createClub=function(){const before=state?.clubs.length||0;v5BaseCreateClub();if(state?.clubs.length>before){state.seasonSchedule=[];state.seasonRound=0;state.seasonNumber++;note('The league schedule was refreshed after a new club joined.');renderAll();saveSilent();}};
const v5BaseMakeNation=makeNation;
makeNation=function(){v5BaseMakeNation();if(!state)return;
 state.territoryShares={[state.homeCountry]:100};v5SyncTerritories();state.timeline=[];state.social=[];state.generations=1;state.leaderSince=1;state.termCount=1;state.seasonSchedule=[];
 note('Project Nation V5 begins: '+state.name+' founded under '+state.title+' '+state.leader+'.');renderAll();show('nation');saveSilent();};
const v5BaseLoadData=loadData;
loadData=function(payload){v5BaseLoadData(payload);state=normalizeState(state);v5SyncTerritories();renderAll();show('nation');if(state.pendingSuccession&&!eventBusy)v5OpenSuccession(state.pendingSuccession,true);saveSilent();};
saveSilent=function(){if(!state)return false;try{localStorage.setItem(SAVE,JSON.stringify({app:'Project Nation',version:V5_VERSION,state,history}));$('resumeBtn').classList.remove('hidden');return true;}catch(e){return false;}};
exportSave=function(){if(!state){toast('Create your country first');return;}
 const blob=new Blob([JSON.stringify({app:'Project Nation',version:V5_VERSION,exported:new Date().toISOString(),state,history},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='ProjectNation_'+state.name.replace(/[^a-z0-9_-]/gi,'_').slice(0,32)+'_V5.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('V5 nation exported');
};
function v5Init(){
 $('navHub').onclick=()=>{if(state)show('hub');};
 $('foundBtn').onclick=makeNation;$('playMatchday').onclick=playMatchday;
 $('v5WarOutcomeClose').onclick=()=>$('v5WarOutcomeModal').classList.add('hidden');
 $('v5SuccessionConfirm').onclick=v5ConfirmSuccession;
 $('v5SuccessionCancel').onclick=()=>{if(!v5SuccessionMandatory){$('v5SuccessionModal').classList.add('hidden');eventBusy=false;}};
 $('v5Retire').onclick=()=>v5OpenSuccession('Voluntary retirement',false);
 $('v5CitizenVisit').onclick=v5LeaderVisit;$('v5Mentor').onclick=v5Mentor;
 $('v5CreateRoute').onclick=v5Route;$('v5FoundOrg').onclick=v5FoundOrg;
 $('v5ClubTraining').onclick=v5TrainClub;
 $('v5Basketball').onclick=()=>v5OtherSport('basketball');$('v5Motorsport').onclick=()=>v5OtherSport('motorsport');$('v5LaunchSatellite').onclick=v5LaunchSatellite;
 $('playMatchday').textContent='⚽ Simulate scheduled round';
 $('exportBtn').onclick=exportSave;
 $('resumeBtn').onclick=()=>{const save=findSave();if(!save){toast('No saved country found.');return;}try{loadData(JSON.parse(save.text));toast('Nation restored from '+save.key);}catch(e){toast('Save loading failed: '+e.message)}};
 $('importFile').onchange=e=>{importSave(e.target.files[0]);e.target.value='';};
 document.addEventListener('keydown',e=>{if(e.key==='Escape')$('v5WarOutcomeModal').classList.add('hidden');});
 $('countryActions').title='Wars resolve immediately after confirmation. Territory changes are persistent fictional game outcomes.';
}
v5Init();
