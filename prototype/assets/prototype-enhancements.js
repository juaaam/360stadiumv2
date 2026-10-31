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
  function LanguageSwitcher(){return h('button',{className:'language-switch',type:'button',lang:language==='ar'?'en':'ar','aria-label':language==='ar'?'Switch to English':'التبديل إلى العربية',onClick:()=>{try{localStorage.setItem('360-language',language==='ar'?'en':'ar');location.reload();}catch{alert(t('Browser storage is unavailable.'));}}},language==='ar'?'English':'العربية');}
  function detailsValid(details,seats,role) {
    const digits=details.phone.replace(/\D/g,'');
    return details.name.trim().length>=2 && details.name.trim().length<=80 && /^\+?[\d ()-]+$/.test(details.phone) && digits.length>=8 && digits.length<=15 && details.consent && (role==='Court'||seats.slice(1).every(seat=>(details.guests[seat]||'').trim().length>=2));
  }
  function BookingDetails({details,onChange,seats,role,organizer}) {
    const set=(key,value)=>onChange({...details,[key]:value});
    return h('div',{className:'booking-contact'},
      h('p',{},'A few details to help your organizer confirm your booking and welcome you on arrival.'),
      h('p',{className:'fine-print'},t('Organized by'),' ',t(organizer)),
      h('label',{},role==='Court'?'Booking contact name':'Your full name',h('input',{type:'text',autoComplete:'name',required:true,maxLength:80,value:details.name,onChange:e=>set('name',e.target.value)})),
      h('label',{},'Mobile number',h('input',{type:'tel',autoComplete:'tel',dir:'ltr',required:true,maxLength:24,placeholder:'+966 50 000 0000',value:details.phone,onChange:e=>set('phone',e.target.value)})),
      h('small',{className:'fine-print'},'Use 8–15 digits, including the country code where needed.'),
      role!=='Court'&&seats.length>1&&h('fieldset',{},h('legend',{},'Other participants'),h('p',{className:'fine-print'},'Your name is used for the first place. Add a name for each additional place.'),...seats.slice(1).map(seat=>h('label',{key:seat},t('Participant name'),' · ',seat,h('input',{type:'text',required:true,maxLength:80,value:details.guests[seat]||'',onChange:e=>set('guests',{...details.guests,[seat]:e.target.value})})))),
      h('label',{className:'checkbox-label booking-consent'},h('input',{type:'checkbox',required:true,checked:details.consent,onChange:e=>set('consent',e.target.checked)}),'I confirm these details are correct and may be used by the organizer for this booking and check-in.'),
      h('p',{className:'fine-print'},'Demo only: use sample contact details. Information stays in this browser and is not sent to the organizer.'));
  }
  return {LanguageSwitcher,BookingDetails,detailsValid};
}
