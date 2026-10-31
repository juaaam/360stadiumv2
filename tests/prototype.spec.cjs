const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const url=process.env.PROTOTYPE_URL||'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];const failures=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))failures.push(r.url())});
 await page.goto(url);await page.getByRole('button',{name:'التبديل إلى العربية'}).click();await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
 for(const route of ['/','/trace','/explore','/create','/academy','/coach','/event/volley-social','/book/volley-social']){
  await page.goto(url+'/#'+route);await page.locator('main').waitFor();assert((await page.locator('main').innerText()).length>50);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${route}`);
 }
 await page.goto(url+'/#/trace');await page.getByLabel('رسالتك').fill('هل تتوفر معدات للاعبين؟');await page.getByRole('button',{name:'حفظ الاستفسار التجريبي'}).click();await page.reload();assert((await page.locator('main').innerText()).includes('هل تتوفر معدات للاعبين؟'));
 await page.getByRole('button',{name:'Switch to English'}).click();await page.waitForLoadState('networkidle');assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
 // Seed a local organizer scenario, including separate player and spectator tickets.
 await page.evaluate(()=>{
 const state=JSON.parse(localStorage.getItem('360-stadium-demo-v1'));
 const event={id:'test-event',title:'Community test match',sport:'Volleyball',venue:'Palm Courts',area:'Al Nakheel',city:'Riyadh',date:'2026-12-01',time:'18:00',price:20,places:10,capacity:12,audience:'Mixed',level:'All levels',organizer:state.profile.name,type:'Match',spectators:true,description:'Test community event',teamFormat:'Teams',private:false};
 state.created=[event];state.requests=[{id:'REQ-TEST',eventId:event.id,name:'Demo Player',status:'Pending',team:'Unassigned'}];
 state.bookings=[...state.bookings,{id:'TEST-P',eventId:event.id,title:event.title,date:event.date,time:event.time,venue:event.venue,type:'Player',seats:['P01'],status:'Confirmed',points:20,total:20,holderName:'Player Example'},{id:'TEST-S',eventId:event.id,title:event.title,date:event.date,time:event.time,venue:event.venue,type:'Spectator',seats:['S01','S02'],status:'Confirmed',points:30,total:30,holderName:'Spectator Example'}];
 localStorage.setItem('360-stadium-demo-v1',JSON.stringify(state));
 });
 await page.goto(url+'/#/manage/test-event');await page.reload();await page.getByRole('button',{name:'Approve',exact:true}).click();
 await page.goto(url+'/#/trace?event=test-event');await page.getByRole('button',{name:'Request verification',exact:true}).click();await page.getByRole('button',{name:'Check in',exact:true}).first().click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('360-stadium-demo-v1')));
 assert(saved.traceLog.some(l=>l.action==='Request approved'));assert(saved.traceLog.some(l=>l.action==='Checked in'));assert.equal(Object.keys(saved.traceAttendance).length,1);
 await page.getByRole('button',{name:'Spectator',exact:true}).click();assert.equal(await page.locator('.trace-person').count(),2);
 await page.getByRole('searchbox',{name:'Search name or booking ID'}).fill('no-match');assert(await page.getByText('No matching records',{exact:true}).isVisible());await page.getByRole('searchbox').fill('');
 await page.getByLabel('Your review',{exact:true}).fill('Well organized local demo.');await page.getByRole('button',{name:'Save demo review'}).click();await page.reload();assert(await page.getByText('Well organized local demo.',{exact:true}).isVisible());assert(await page.getByText('Verification request submitted · Demo',{exact:true}).isVisible());
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export activity'}).click();const artifact=await download;const fs=require('fs');const exported=JSON.parse(fs.readFileSync(await artifact.path(),'utf8'));assert.equal(exported.event.id,'test-event');assert.equal(exported.records.filter(r=>r.role==='Spectator').length,2);
 // Cancellation propagates to the roster and activity history.
 await page.goto(url+'/#/manage/test-event');await page.getByRole('button',{name:'Cancel event',exact:true}).click();await page.getByRole('button',{name:'Confirm event cancellation'}).click();await page.goto(url+'/#/trace?event=test-event');assert.equal(await page.getByRole('button',{name:'Check in',exact:true}).filter({visible:true}).count(),3);for(const button of await page.getByRole('button',{name:'Check in',exact:true}).all())assert(await button.isDisabled());
 assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('360-stadium-demo-v1')).traceLog)).some(l=>l.action==='Event canceled'));
 // A built-in organizer never offers organizer check-in controls.
 await page.goto(url+'/#/trace?event=volley-camp');assert.equal(await page.getByRole('button',{name:'Check in',exact:true}).count(),0);
 await page.setViewportSize({width:1440,height:1000});await page.getByRole('button',{name:'التبديل إلى العربية'}).click();await page.waitForLoadState('networkidle');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/workspace/arabic-organizer-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);console.log('PASS: Arabic/English, 8 routes, mobile/desktop layout, contact/review persistence, organizer verification request, approval audit, player check-in, spectator filter, search, export, cancellation, participant restrictions.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
