const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const url=process.env.PROTOTYPE_URL||'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 for(const scenario of [{id:'volley-social',role:'Player',group:true},{id:'football-five',role:'Spectator',group:true},{id:'venue-palm',role:'Court'},{id:'volley-social',role:'Spectator',ar:true}]){
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);assert.equal(await page.locator('.bottom-nav a').count(),5);assert.equal(await page.locator('a[href*="/trace"]').count(),0);assert.equal(await page.getByText('Organizer credibility',{exact:true}).count(),0);
  if(scenario.ar){await page.getByRole('button',{name:'التبديل إلى العربية'}).click();await page.waitForLoadState('networkidle');}
  await page.goto(url+'/#/book/'+scenario.id);
  const go=()=>page.getByRole('button',{name:scenario.ar?'متابعة':'Continue',exact:true});
  const roleLabel=scenario.ar?'متفرج':scenario.role;
  await page.locator('.selection-card').filter({has:page.getByRole('heading',{name:roleLabel,exact:true})}).click();await go().click();
  const seats=page.locator('.seat-grid button:not([disabled])');await seats.nth(0).click();if(scenario.group)await seats.nth(1).click();await go().click();
  if(await page.getByRole('heading',{name:scenario.ar?'المواقف':'Parking',exact:true}).isVisible())await go().click();
  assert(await page.getByRole('heading',{name:scenario.ar?'بياناتك':'Your details',exact:true}).isVisible());assert(await go().isDisabled());
  const nameLabel=scenario.ar?'اسمك الكامل':scenario.role==='Court'?'Booking contact name':'Your full name';
  await page.getByLabel(nameLabel,{exact:true}).fill('Demo Guest');
  const phone=page.getByLabel(scenario.ar?'رقم الجوال':'Mobile number',{exact:true});await phone.fill('abc');await page.locator('.booking-consent input').check();assert(await go().isDisabled());
  await phone.fill('+966 50 000 0000');
  if(scenario.group){assert(await go().isDisabled());await page.getByLabel(/Participant name/).fill('Second Demo Guest');}
  assert(await go().isEnabled());await go().click();assert(await page.getByRole('heading',{name:scenario.ar?'المراجعة والتأكيد':'Review & confirm',exact:true}).isVisible());
  // Returning to details preserves the form; removing consent blocks forward navigation.
  await page.getByRole('button',{name:scenario.ar?'رجوع':'Back',exact:true}).click();assert.equal(await phone.inputValue(),'+966 50 000 0000');await page.locator('.booking-consent input').uncheck();assert(await go().isDisabled());await page.locator('.booking-consent input').check();await go().click();
  await page.getByRole('button',{name:scenario.ar?'تأكيد الحجز التجريبي':'Confirm demo booking',exact:true}).click();await page.waitForURL(/#\/ticket\//);
  const booking=await page.evaluate(()=>JSON.parse(localStorage.getItem('360-stadium-demo-v1')).bookings[0]);assert.equal(booking.type,scenario.role);assert.equal(booking.contact.name,'Demo Guest');assert.equal(booking.contact.phone,'+966 50 000 0000');assert.equal(booking.contactConsent,true);assert(booking.organizer);assert(booking.createdAt);assert.equal(booking.attendees.length,scenario.role==='Court'?0:scenario.group?2:1);if(scenario.group)assert.equal(booking.attendees[1].name,'Second Demo Guest');
  assert.equal(await page.locator('a[href*="/trace"]').count(),0);assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await context.close();console.log('PASS',scenario);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
