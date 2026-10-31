import { arabic } from './translations-ar.js';
export function enhance({React:R, runtime, useApp, events}) {
  let language = 'en';
  try { language = localStorage.getItem('360-language') === 'ar' ? 'ar' : 'en'; } catch {}
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = value => {
    if (language !== 'ar' || typeof value !== 'string') return value;
    const trimmed=value.trim();
    if(arabic[trimmed]) return value.replace(trimmed,arabic[trimmed]);
    const patterns = [
      [/^(.+) · Every step is progress$/,m=>`${t(m[1])} · كل خطوة تقدم`],
      [/^STEP (\d+) OF (\d+)$/,m=>`الخطوة ${m[1]} من ${m[2]}`],
      [/^(\d+) opportunities$/,m=>`${m[1]} فرصة`],
      [/^(\d+) of (\d+) lessons completed$/,m=>`أكملت ${m[1]} من ${m[2]} دروس`],
      [/^(.+) · 90 minutes$/,m=>`${m[1]} · ٩٠ دقيقة`],
      [/^(\d+) SAR$/,m=>`${m[1]} ر.س`],
      [/^With (.+)$/,m=>`مع ${t(m[1])}`],
      [/^(\d+) to your next level$/,m=>`${m[1]} نقطة للمستوى التالي`],
      [/^Hey (.+), ready to play\?$/,m=>`أهلًا ${t(m[1])}، مستعد للعب؟`],
      [/^(\d+) spots left$/,m=>`متبقي ${m[1]} أماكن`],
      [/^(\d+) (player spots|court) available$/,m=>`${m[1]} أماكن متاحة`],
      [/^(\d+) points$/,m=>`${m[1]} نقطة`],
      [/^By (.+)$/,m=>`بواسطة ${t(m[1])}`],
      [/^Notifications, (\d+) unread$/,m=>`الإشعارات، ${m[1]} غير مقروءة`],
      [/^(\d+) lessons$/,m=>`${m[1]} دروس`],
      [/^Team for (.+)$/,m=>`فريق ${m[1]}`],
      [/^(.+) unavailable$/,m=>`${m[1]} غير متاح`],
    ];
    for(const [pattern,render] of patterns){const match=trimmed.match(pattern);if(match)return render(match);}
    if(trimmed.includes('\n'))return value.split('\n').map(t).join('\n');
    return value;
  };
  // Translate presentation strings only. IDs, form values and stored records stay stable.
  for(const key of ['jsx','jsxs']) {
    const original=runtime[key];
    runtime[key]=(type,props,...args)=>{
      if(typeof type==='string' && props) {
        props={...props};
        if(type==='option' && props.value===undefined && typeof props.children==='string')props.value=props.children;
        const translateChildren=c=>Array.isArray(c)?c.map(translateChildren):typeof c==='string'?t(c):c;
        props.children=translateChildren(props.children);
        for(const attr of ['placeholder','aria-label','title','alt'])if(props[attr])props[attr]=t(props[attr]);
      }
      return original(type,props,...args);
    };
  }
  const h=(type,props,...children)=>runtime.jsxs(type,children.length?{...props,children}:props||{});
  const uid=prefix=>`${prefix}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  const stamp=()=>new Date().toISOString();
  function audit(previous,next) {
    const changes=[];
    const log=(eventId,subject,action,role)=>changes.push({id:uid('LOG'),eventId,subject,action,role,at:stamp(),actor:next.profile.name});
    next={...next,bookings:next.bookings.map(b=>{
      const old=previous.bookings.find(x=>x.id===b.id);
      if(!old){log(b.eventId,b.id,'Booking confirmed',b.type);return {...b,holderName:next.profile.name,createdAt:stamp()};}
      if(old.status!==b.status)log(b.eventId,b.id,b.status==='Canceled'?'Booking canceled':'Booking updated',b.type);
      return b;
    })};
    for(const e of next.created){const old=previous.created.find(x=>x.id===e.id);if(!old)log(e.id,e.id,'Event published','Organizer');else if(!old.canceled&&e.canceled)log(e.id,e.id,'Event canceled','Organizer');else if(['title','description','date','time'].some(k=>old[k]!==e[k]))log(e.id,e.id,'Event details updated','Organizer');}
    for(const q of next.requests){const old=previous.requests.find(x=>x.id===q.id);if(!old)log(q.eventId,q.id,'Request received','Player');else if(old.status!==q.status)log(q.eventId,q.id,q.status==='Approved'?'Request approved':'Request rejected','Player');else if(old.team!==q.team)log(q.eventId,q.id,'Team assigned','Player');}
    return {...next,traceLog:[...changes,...(next.traceLog||[])]};
  }
  function LanguageSwitcher(){return h('button',{className:'language-switch',type:'button',lang:language==='ar'?'en':'ar','aria-label':language==='ar'?'Switch to English':'التبديل إلى العربية',onClick:()=>{try{localStorage.setItem('360-language',language==='ar'?'en':'ar');location.reload();}catch{alert(t('Browser storage is unavailable.'));}}},language==='ar'?'English':'العربية');}
  function EventTraceLink({route,id}){
    const {state}=useApp();
    const eventId=route==='ticket'?state.bookings.find(b=>b.id===id)?.eventId:id;
    if(!['event','manage','ticket'].includes(route)||!eventId)return null;
    return h('section',{className:'panel trace-entry'},h('div',{},h('h2',{},'Know your event'),h('p',{},'Follow the organizer, registrations, tickets, and attendance in one place.')),h('a',{className:'trace-button',href:`#/trace?event=${encodeURIComponent(eventId)}`},'View event activity'));
  }
  function Credibility({event,all,owned}) {
    const {state,update}=useApp();
    const [message,setMessage]=R.useState('');const [notice,setNotice]=R.useState('');const [review,setReview]=R.useState('');const [rating,setRating]=R.useState('5');
    const organizerId=event.organizer;
    const related=all.filter(e=>e.organizer===organizerId);
    const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Riyadh'});
    const past=related.filter(e=>e.date<today);const upcoming=related.filter(e=>e.date>=today);
    const inquiries=(state.organizerInquiries||[]).filter(q=>q.organizer===organizerId);
    const verification=state.organizerVerification?.[organizerId];
    const reviews=(state.organizerReviews||[]).filter(r=>r.organizer===organizerId);
    const registered=state.bookings.some(b=>related.some(e=>e.id===b.eventId)&&b.status==='Confirmed');
    const eventList=list=>list.map(e=>h('p',{key:e.id},h('a',{href:`#/event/${e.id}`},e.title),h('small',{},' · ',e.date)));
    return h('section',{className:'panel'},h('h2',{},'Organizer credibility'),
      h('div',{className:'credibility-grid'},
        h('div',{className:'credibility-card'},h('h3',{},'Profile & verification'),h('span',{className:'trace-demo'},verification?'Verification request submitted · Demo':'Not verified'),h('p',{},'No real identity or business checks have been performed.'),h('h4',{},'Organization details'),h('p',{},event.organizer),h('p',{},'Community sports organizer'),h('p',{},t(event.city),' · ',t(event.sport)),owned&&h('div',{},h('button',{className:'trace-button secondary',disabled:!!verification,onClick:()=>update(s=>({...s,organizerVerification:{...s.organizerVerification,[organizerId]:{submittedAt:stamp()}}}))},'Request verification'),h('p',{className:'fine-print'},'This submits a local demo request only. It does not verify an identity.'))),
        h('div',{className:'credibility-card'},h('h3',{},'Past events'),past.length?eventList(past):h('p',{},'No past events recorded for this organizer.'),h('h3',{},'Upcoming events'),...eventList(upcoming)),
        h('div',{className:'credibility-card'},h('h3',{},'Reviews'),h('p',{className:'fine-print'},'Illustrative reviews · Fictional examples, not verified feedback.'),...[[5,'A welcoming team and clear event instructions.','Sample player'],[4,'Easy arrival and a friendly atmosphere.','Sample spectator']].map(([stars,text,name])=>h('article',{className:'credibility-review',key:name},h('strong',{'aria-label':`${stars}/5`},'★'.repeat(stars)+'☆'.repeat(5-stars)),h('p',{},text),h('small',{},name))),...reviews.map(r=>h('article',{className:'credibility-review',key:r.id},h('strong',{},'★'.repeat(Number(r.rating))),h('p',{},r.body),h('small',{},r.name,' · ',t('Local demo review')))),registered&&h('form',{onSubmit:e=>{e.preventDefault();if(!review.trim())return;update(s=>({...s,organizerReviews:[{id:uid('REV'),organizer:organizerId,name:s.profile.name,rating:Number(rating),body:review.trim(),at:stamp()},...(s.organizerReviews||[])]}));setReview('');}},h('label',{},'Rating',h('select',{value:rating,onChange:e=>setRating(e.target.value)},...[5,4,3,2,1].map(n=>h('option',{key:n,value:String(n)},`${n}/5`)))),h('label',{},'Your review',h('textarea',{value:review,maxLength:1000,required:true,onChange:e=>setReview(e.target.value)})),h('button',{className:'trace-button secondary',type:'submit',disabled:!review.trim()},'Save demo review')),h('p',{className:'fine-print'},'Reviews saved here are local prototype feedback, not verified attendance reviews.')),
        h('div',{className:'credibility-card credibility-contact'},h('h3',{},'Contact organizer'),h('p',{className:'fine-print'},'Demo inbox · Messages stay in this browser and are not delivered.'),h('form',{onSubmit:e=>{e.preventDefault();if(!message.trim())return;update(s=>({...s,organizerInquiries:[{id:uid('MSG'),organizer:organizerId,eventId:event.id,name:s.profile.name,body:message.trim(),at:stamp()},...(s.organizerInquiries||[])]}));setMessage('');setNotice('Inquiry saved locally. No message was sent.');}},h('label',{},'Your message',h('textarea',{required:true,maxLength:1000,value:message,onChange:e=>setMessage(e.target.value)})),h('button',{className:'trace-button',type:'submit',disabled:!message.trim()},'Save demo inquiry')),notice&&h('p',{role:'status'},notice),h('h4',{},'Local inquiries'),inquiries.length?inquiries.map(q=>h('article',{key:q.id},h('strong',{},q.name),h('p',{},q.body))):h('p',{},'No inquiries yet'))));
  }
  function Trace(){
    const {state,update}=useApp();
    const all=[...events,...state.created];
    const initial=new URLSearchParams(location.hash.split('?')[1]||'').get('event');
    const [eventId,setEvent]=R.useState(all.some(e=>e.id===initial)?initial:all[0]?.id);
    const [role,setRole]=R.useState('All');const [query,setQuery]=R.useState('');const [notice,setNotice]=R.useState('');
    const event=all.find(e=>e.id===eventId);if(!event)return h('p',{},'No events yet');
    const owned=state.created.some(e=>e.id===eventId);
    const bookings=state.bookings.filter(b=>b.eventId===eventId);
    const requests=state.requests.filter(q=>q.eventId===eventId);
    const roster=[...bookings.flatMap(b=>b.seats.map(seat=>({key:`${b.id}:${seat}`,ref:b.id,name:b.holderName||'Demo account holder',role:b.type,seat,status:b.status}))),...requests.map(q=>({key:q.id,ref:q.id,name:q.name,role:'Player',seat:q.team||'Unassigned',status:q.status,request:true}))];
    const visible=roster.filter(r=>(role==='All'||r.role===role)&&`${r.name} ${r.ref} ${r.seat}`.toLowerCase().includes(query.toLowerCase()));
    const attendance=state.traceAttendance||{};
    const valid=r=>['Confirmed','Approved'].includes(r.status)&&!event.canceled;
    const active=roster.filter(valid);
    const logs=(state.traceLog||[]).filter(l=>l.eventId===eventId);
    const date=at=>new Intl.DateTimeFormat(language==='ar'?'ar-SA':'en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Riyadh'}).format(new Date(at));
    const checkIn=r=>update(s=>{
      const existing=s.traceAttendance?.[r.key];if(existing||!valid(r))return s;
      const at=stamp();return {...s,traceAttendance:{...s.traceAttendance,[r.key]:{at,actor:s.profile.name}},traceLog:[{id:uid('LOG'),eventId,subject:r.ref,seat:r.seat,action:'Checked in',role:r.role,at,actor:s.profile.name},...(s.traceLog||[])]};
    });
    const exportData=()=>{
      const data={demo:true,event:{id:event.id,title:event.title,organizer:event.organizer},exportedAt:stamp(),records:roster.map(r=>({...r,attendance:attendance[r.key]||null})),activity:logs};
      const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`360-event-${event.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Activity report downloaded');
    };
    return h('div',{className:'trace-page'},
      h('div',{className:'trace-heading'},h('div',{},h('span',{className:'eyebrow'},'EVERY EVENT. EVERY CONNECTION.'),h('h1',{},'Organizer credibility'),h('p',{},'A clear view of who organizes, plays, and cheers.')),h('span',{className:'trace-demo'},'Local demo')),
      h('div',{className:'trace-disclaimer'},'Prototype records are stored in this browser only. Identity checks, attendance, and history are simulated; this is not a verified or tamper-proof record.'),
      h('label',{className:'trace-event-label'},'Select event',h('select',{value:eventId,onChange:e=>{setEvent(e.target.value);setNotice('');history.replaceState(null,'',`#/trace?event=${encodeURIComponent(e.target.value)}`);}},...all.map(e=>h('option',{key:e.id,value:e.id},e.title)))),
      h('section',{className:'panel trace-organizer'},h('div',{className:'trace-avatar'},event.organizer.slice(0,1)),h('div',{},h('span',{className:'eyebrow'},'EVENT ORGANIZER'),h('h2',{},event.organizer),h('p',{},event.venue,' · ',event.city),h('small',{},'Identity: not verified · Demo profile')),h('div',{className:'trace-organizer-meta'},h('span',{className:'trace-status'},event.canceled?'Canceled':'Published · Demo'),h('code',{},event.id),h('a',{href:`#/event/${event.id}`},'View event'))),
      h(Credibility,{event,all,owned,key:event.organizer}),
      h('div',{className:'trace-stats'},...[['Players',active.filter(r=>r.role==='Player').length],['Spectators',active.filter(r=>r.role==='Spectator').length],['Checked in',active.filter(r=>attendance[r.key]).length],['Pending requests',requests.filter(q=>q.status==='Pending').length]].map(([label,value])=>h('div',{key:label},h('strong',{},value),h('span',{},label)))),
      h('section',{className:'panel'},h('div',{className:'trace-section-head'},h('div',{},h('h2',{},'People & tickets'),h('p',{},'Only records in this browser are shown. Group tickets show one row per place; individual guest names are not collected.')),h('button',{className:'trace-button secondary',onClick:exportData},'Export activity')),
        h('div',{className:'trace-filters'},h('div',{className:'trace-tabs',role:'group','aria-label':'Filter by role'},...['All','Player','Spectator','Court'].map(r=>h('button',{key:r,type:'button','aria-pressed':r===role,onClick:()=>setRole(r)},r))),h('input',{type:'search',value:query,onChange:e=>setQuery(e.target.value),placeholder:'Search name or booking ID','aria-label':'Search name or booking ID'})),
        h('p',{className:'fine-print'},owned?'Organizer demo mode · Check in confirmed tickets or approved players.':'Participant view · Check-in is available only for events you organize in this demo.'),
        visible.length?h('div',{className:'trace-roster'},...visible.map(r=>h('article',{className:'trace-person',key:r.key},h('div',{},h('strong',{},r.name),h('small',{},t(r.role),' · ',r.seat),h('code',{},r.ref)),h('div',{className:'trace-person-status'},h('span',{className:'trace-status'},r.status),attendance[r.key]?h('small',{},t('Checked in'),' · ',date(attendance[r.key].at)):h('small',{},'Not checked in')),owned&&h('button',{className:'trace-button secondary',disabled:!valid(r)||!!attendance[r.key],onClick:()=>checkIn(r)},attendance[r.key]?'Checked in':'Check in')))):h('div',{className:'trace-empty'},h('h3',{},'No matching records'),h('p',{},'Register for this event or approve a player request to see the connection here.'),h('a',{href:`#/event/${event.id}`},'View event'))),
      h('section',{className:'panel'},h('h2',{},'Activity timeline'),h('p',{className:'fine-print'},'New actions are timestamped from this update onward. Existing records have no invented history. Times shown in Riyadh.'),logs.length?h('ol',{className:'trace-timeline'},...logs.map(l=>h('li',{key:l.id},h('strong',{},l.action),h('p',{},t(l.role),' · ',l.actor),h('code',{},l.subject,l.seat?` · ${l.seat}`:''),h('time',{dateTime:l.at},date(l.at))))):h('p',{className:'trace-empty'},'No activity recorded yet')),
      notice&&h('p',{role:'status'},notice));
  }
  return {audit,LanguageSwitcher,Trace,EventTraceLink};
}
