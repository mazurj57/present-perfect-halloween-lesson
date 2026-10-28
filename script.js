const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const storageKey='ppHalloweenStateV2';
const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');
const state={found:saved.found||[],markers:saved.markers||{},understand:saved.understand||{},understandIndex:0,apply:saved.apply||{},analyse:saved.analyse||{},top:saved.top||[],checks:saved.checks||[],complete:saved.complete||false,speak:0};

const markerItems=[
 ['Have you e_____ visited a haunted house?','ever'],['I have n_____ seen a ghost.','never'],['She has a_____ chosen her costume.','already'],['We haven’t bought Halloween sweets y_____.','yet'],['I’ve j_____ made a Halloween lantern.','just'],['Have you worn a witch costume b_____?','before'],['I’ve r_____ watched a horror film.','recently'],['S_ f_____, I’ve been to two Halloween parties.','so far']
];
const understandItems=[
 ['Maya has just made a Halloween lantern.',['She made it a very short time ago.','She plans to make it tomorrow.','She makes one every year.'],0],
 ['She has already decorated the house.',['The decorating is still only a plan.','She finished it before now, perhaps earlier than expected.','She decorated it at a stated past time.'],1],
 ['Maya has never visited a haunted house.',['She has no experience of it up to now.','She visited one a long time ago.','She does not want to visit one.'],0],
 ["She hasn’t chosen a costume yet.",['The choice is still unfinished.','She chose it yesterday.','She will never choose one.'],0],
 ['Have you ever seen a ghost?',['It asks about one specific night.','It asks about your life experience up to now.','It asks what you are seeing now.'],1],
 ['So far, Maya has watched two horror films.',['She watched exactly two last year.','She will watch two later.','Up to this point, the total is two.'],2],
 ['Last Saturday, Maya bought orange paper.',['A finished action at a finished past time.','An unfinished experience connected to now.','A repeated future action.'],0],
 ['She has recently watched videos about haunted places.',['She watched them not long ago, and the information matters now.','She always watches them on Saturdays.','She watched them at an exact stated time.'],0]
];
const applyItems=[
 {before:'Maya ',after:' her house.',hint:'already · decorate → decorated',answers:['has already decorated']},
 {before:'She ',after:' a Halloween lantern.',hint:'just · make → made',answers:['has just made']},
 {before:'She ',after:' a pumpkin yet.',hint:'not · carve → carved',answers:["hasn't carved",'has not carved']},
 {before:'Her friend ',after:' her costume.',hint:'already · choose → chosen',answers:['has already chosen']},
 {before:'',after:' as a witch before?',hint:'Maya · ever · dress up → dressed up',answers:['has maya ever dressed up']},
 {before:'She ',after:' a ghost.',hint:'never · see → seen',answers:['has never seen']},
 {before:'She ',after:' several videos about haunted houses.',hint:'recently · watch → watched',answers:['has recently watched']},
 {before:'So far, she ',after:' two horror films.',hint:'watch → watched',answers:['has watched']}
];
const analysisItems=[
 ['Have you ever wear a Halloween costume?',false,'Have you ever worn a Halloween costume?','wrong past participle'],['I have never seen a ghost.',true,'Correct.','—'],['She hasn’t carved a pumpkin already.',false,'She hasn’t carved a pumpkin yet.','wrong marker'],['We have just decorated the house.',true,'Correct.','—'],['She has already went to a Halloween party.',false,'She has already gone to a Halloween party.','wrong past participle'],['Have you seen a horror film ever?',false,'Have you ever seen a horror film?','wrong marker position'],['My friends has bought Halloween sweets.',false,'My friends have bought Halloween sweets.','wrong auxiliary: have/has'],['He hasn’t never dressed up as a witch.',false,'He has never dressed up as a witch.','double negative']
];
const speakPrompts=[
 {q:'Which Halloween tradition have you never tried but would like to?',frame:'I’ve never…, but I’d like to because…'},
 {q:'What is the most creative costume you have seen in real life or online?',frame:'The most creative costume I’ve seen was…'},
 {q:'How have Halloween celebrations changed since you were a child?',frame:'They have become…, whereas in the past…'},
 {q:'Your friend has planned a Halloween party. What has gone well, and what has gone wrong?',frame:'They’ve successfully…, but they haven’t… yet.'},
 {q:'Which three things have made a film genuinely frightening for you?',frame:'… have made films frightening because…'},
 {q:'What is the strangest unexplained story you have heard?',frame:'I’ve heard a story about… It was strange because…'},
 {q:'Imagine you have just heard a noise downstairs at midnight. What has probably happened?',frame:'Someone or something has probably…'},
 {q:'You are judging a costume contest. Who has made the strongest impression, and why?',frame:'… has made the strongest impression because…'},
 {q:'What seasonal activity has become more popular where you live?',frame:'… has become more popular recently. People have…'},
 {q:'Which scary place from a book, film, or game have you wanted to explore?',frame:'I’ve wanted to explore… because…'},
 {q:'Your friend says, “Nothing has frightened me.” How would you challenge that claim?',frame:'Surely you’ve… Have you never…?'},
 {q:'What has someone done to surprise or scare you successfully?',frame:'Someone has surprised me by…'},
 {q:'You have opened a mysterious box. What have you found inside?',frame:'I’ve found… It has…'},
 {q:'Which Halloween rule have people ignored too often?',frame:'People have often ignored the rule that…'},
 {q:'What have you learned about another country’s autumn or remembrance traditions?',frame:'I’ve learned that… They have traditionally…'},
 {q:'Complete a spooky news update: what has happened in your neighbourhood tonight?',frame:'Tonight, … has disappeared / appeared / changed…'},
];
const experiences=['Carve a pumpkin','Wear a costume','Visit a haunted house','Tell a scary story','Go trick-or-treating','Make a Halloween lantern'];
const checks=['I used have/has + past participle.','I included affirmative, negative and question forms.','I used at least five marker words.','I put yet and before at the end.','I used ever in a question.','I contrasted my update with a Past Simple detail.'];

function save(){localStorage.setItem(storageKey,JSON.stringify({...state,speak:undefined,understandIndex:undefined}))}
function normalize(v){return v.trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ')}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1500)}
function showStage(id){$$('.stage').forEach(p=>p.classList.toggle('active',p.dataset.panel===String(id)));$$('.stage-nav button').forEach(b=>b.classList.toggle('active',b.dataset.stage===String(id)));if(id==='results')renderResults();window.scrollTo({top:$('.stage-nav').offsetTop,behavior:'smooth'})}
$$('[data-stage]').forEach(b=>b.addEventListener('click',()=>showStage(b.dataset.stage)));
$$('[data-next]').forEach(b=>b.addEventListener('click',()=>showStage(b.dataset.next)));

function renderFind(){const total=$$('.target').length;const found=$$('.target.found').length;$('#findCount').textContent=`Found ${found} / ${total}`;$('#findBar').style.width=`${found/total*100}%`;if(found===total)toast(`All ${total} phrases found!`)}
$$('.target').forEach((el,i)=>{if(state.found.includes(i))el.classList.add('found');el.addEventListener('click',()=>{if(el.classList.contains('found'))return;el.classList.remove('missed');el.classList.add('found');state.found.push(i);save();renderFind()})});
$('#showMissed').onclick=()=>{$$('.target:not(.found)').forEach(x=>x.classList.add('missed'));$('#showMissed').textContent='Missed phrases are outlined';};
renderFind();

function renderMarkers(){
 $('#markerGrid').innerHTML=markerItems.map(([q],i)=>`<article class="marker-card ${state.markers[i]?.status||''}" data-marker="${i}"><p>${i+1}. ${q}</p><div class="answer-row"><input aria-label="Marker ${i+1}" value="${state.markers[i]?.value||''}" placeholder="Complete the marker"><button>Check</button></div><div class="feedback">${state.markers[i]?.message||''}</div></article>`).join('');
 $$('.marker-card').forEach(card=>{const i=+card.dataset.marker,input=$('input',card),check=()=>{const value=normalize(input.value),correct=markerItems[i][1];const ok=value===correct;state.markers[i]={value:input.value,status:ok?'correct':'wrong',message:ok?'Correct!':`Try again. Starts: ${correct.split(' ').map(w=>w[0]+'…').join(' ')}`};save();renderMarkers()};$('button',card).onclick=check;input.onkeydown=e=>{if(e.key==='Enter')check()}});
 const score=Object.values(state.markers).filter(x=>x.status==='correct').length;$('#markerCount').textContent=`${score} / ${markerItems.length} correct`;$('#markerBar').style.width=`${score/markerItems.length*100}%`;
}
renderMarkers();

function renderUnderstand(){
 const i=state.understandIndex,item=understandItems[i],chosen=state.understand[i];
 $('#understandCount').textContent=`${i+1} / ${understandItems.length}`;$('#understandBar').style.width=`${(i+1)/understandItems.length*100}%`;
 $('#understandCard').innerHTML=`<article class="understand-card"><p class="meaning-sentence">${item[0]}</p><div class="meaning-options">${item[1].map((o,n)=>`<button class="meaning-option ${chosen===n?'selected ':''}${chosen===n?(n===item[2]?'good':'bad'):''}" data-meaning="${n}">${o}</button>`).join('')}</div><p class="feedback">${chosen===undefined?'Choose the closest meaning.':chosen===item[2]?'Exactly — the time clue and form match.':'Look again at the time marker and connection to now.'}</p></article>`;
 $$('[data-meaning]').forEach(b=>b.onclick=()=>{state.understand[i]=+b.dataset.meaning;save();renderUnderstand()});
 $('#prevUnderstand').disabled=i===0;$('#nextUnderstand').textContent=i===understandItems.length-1?'Back to question 1':'Next →';
}
$('#prevUnderstand').onclick=()=>{state.understandIndex=Math.max(0,state.understandIndex-1);renderUnderstand()};
$('#nextUnderstand').onclick=()=>{state.understandIndex=(state.understandIndex+1)%understandItems.length;renderUnderstand()};
renderUnderstand();

function renderApply(){
 $('#applyForm').innerHTML=applyItems.map((x,i)=>{const item=state.apply[i]||{};return `<article class="apply-item ${item.status||''}"><p class="apply-sentence"><span>${i+1}. ${x.before}</span><input data-apply="${i}" value="${item.value||''}" aria-label="Answer ${i+1}"><span>${x.after}</span></p><p class="apply-hint">Third form hint: ${x.hint}</p><p class="apply-feedback">${item.message||''}</p></article>`}).join('');
 $$('[data-apply]').forEach(input=>{input.oninput=()=>{const i=+input.dataset.apply;state.apply[i]={value:input.value};save()};input.onkeydown=e=>{if(e.key==='Enter')checkApply()}});
}
function checkApply(){
 $$('[data-apply]').forEach(input=>{const i=+input.dataset.apply,value=normalize(input.value),ok=applyItems[i].answers.some(a=>normalize(a)===value);state.apply[i]={value:input.value,status:ok?'correct':'wrong',message:ok?'Correct — auxiliary + third form.':'Check have/has, the marker, and the third form.'}});save();renderApply();
 const score=Object.values(state.apply).filter(x=>x.status==='correct').length;toast(`${score} / ${applyItems.length} correct`);
}
$('#checkApply').onclick=checkApply;
$('#showApplyAnswers').onclick=()=>{applyItems.forEach((x,i)=>state.apply[i]={value:x.answers[0],status:'correct',message:'Model answer shown.'});save();renderApply()};
renderApply();

function renderAnalyse(){
 $('#analysisQuiz').innerHTML=analysisItems.map((x,i)=>{const chosen=state.analyse[i];return `<article class="analysis-card"><header><span class="number">${i+1}</span><p class="sentence">${x[0]}</p></header><div class="decision-row"><button class="decision ${chosen===true?'chosen '+(x[1]?'good':'bad'):''}" data-i="${i}" data-v="true">Correct</button><button class="decision ${chosen===false?'chosen '+(!x[1]?'good':'bad'):''}" data-i="${i}" data-v="false">Incorrect</button></div><div class="repair ${chosen===undefined?'':'show'}"><strong>${x[2]}</strong><br><small>Reason: ${x[3]}</small></div></article>`}).join('');
 $$('.decision').forEach(b=>b.onclick=()=>{state.analyse[b.dataset.i]=b.dataset.v==='true';save();renderAnalyse()});
}
renderAnalyse();

function renderSpeak(){const i=state.speak,prompt=speakPrompts[i];$('#speakNumber').textContent=`Question ${i+1} / ${speakPrompts.length}`;$('#speakPrompt').textContent=prompt.q;$('#speakFrame').textContent=prompt.frame}
$('#prevSpeak').onclick=()=>{state.speak=(state.speak+speakPrompts.length-1)%speakPrompts.length;renderSpeak()};$('#nextSpeak').onclick=()=>{state.speak=(state.speak+1)%speakPrompts.length;renderSpeak()};$('#randomSpeak').onclick=()=>{let n;do n=Math.floor(Math.random()*speakPrompts.length);while(n===state.speak);state.speak=n;renderSpeak()};renderSpeak();
function renderChoices(){$('#topChoices').innerHTML=experiences.map((x,i)=>`<button class="${state.top.includes(i)?'selected':''}" data-choice="${i}">${x}</button>`).join('');$$('[data-choice]').forEach(b=>b.onclick=()=>{const i=+b.dataset.choice;if(state.top.includes(i))state.top=state.top.filter(x=>x!==i);else if(state.top.length<3)state.top.push(i);else return toast('Choose three only.');save();renderChoices()});$('#choiceCount').textContent=`${state.top.length} / 3 selected`}renderChoices();
function renderChecklist(){$('#finalChecklist').innerHTML=checks.map((x,i)=>`<label><input type="checkbox" data-check="${i}" ${state.checks.includes(i)?'checked':''}><span>${x}</span></label>`).join('');$$('[data-check]').forEach(c=>c.onchange=()=>{const i=+c.dataset.check;if(c.checked&&!state.checks.includes(i))state.checks.push(i);if(!c.checked)state.checks=state.checks.filter(x=>x!==i);save()})}renderChecklist();
$('#completeLesson').onclick=()=>{state.complete=true;save();toast('Lesson complete — opening results.');setTimeout(()=>showStage('results'),500)};

function renderResults(){const markerScore=Object.values(state.markers).filter(x=>x.status==='correct').length,understandScore=understandItems.filter((x,i)=>state.understand[i]===x[2]).length,applyScore=Object.values(state.apply).filter(x=>x.status==='correct').length,analysisScore=analysisItems.filter((x,i)=>state.analyse[i]===x[1]).length;$('#resultsMessage').textContent=state.complete?'You have completed the lesson. Nice work noticing, checking and speaking.':'Keep going — your progress is saved in this browser.';$('#resultGrid').innerHTML=`<article class="result-card"><span>Phrases found</span><strong>${state.found.length}/${$$('.target').length}</strong></article><article class="result-card"><span>Markers</span><strong>${markerScore}/${markerItems.length}</strong></article><article class="result-card"><span>Understand</span><strong>${understandScore}/${understandItems.length}</strong></article><article class="result-card"><span>Apply</span><strong>${applyScore}/${applyItems.length}</strong></article><article class="result-card"><span>Analyse</span><strong>${analysisScore}/${analysisItems.length}</strong></article>`}

$$('[data-reset]').forEach(b=>b.onclick=()=>{const k=b.dataset.reset;if(k==='find'){state.found=[];$$('.target').forEach(x=>x.classList.remove('found','missed'));$('#showMissed').textContent='Show the ones I missed';renderFind()}if(k==='markers'){state.markers={};renderMarkers()}if(k==='understand'){state.understand={};state.understandIndex=0;renderUnderstand()}if(k==='apply'){state.apply={};renderApply()}if(k==='analyse'){state.analyse={};renderAnalyse()}if(k==='speak'){state.top=[];renderChoices()}save()});
$('#resetAll').onclick=()=>{if(!confirm('Reset all lesson progress?'))return;localStorage.removeItem(storageKey);location.reload()};
