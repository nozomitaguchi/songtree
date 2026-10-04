'use strict';
const $=s=>document.querySelector(s);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
let tracks=[],events=[],selected=null,selectedDetail=null,localAudioUrl=null;
const audio=$('#audio');
function releaseAudio(){audio.pause();audio.removeAttribute('src');audio.load();if(localAudioUrl){URL.revokeObjectURL(localAudioUrl);localAudioUrl=null;}$('#audio-file').value='';}
function setAudioStatus(message){const status=$('#audio-status');status.textContent=message;status.hidden=!message;}
function selectTrack(t){
 if(selected?.id!==t.id){releaseAudio();selected=t;audio.hidden=!t.audioSrc;if(t.audioSrc)audio.src=t.audioSrc;setAudioStatus(t.audioSrc?'':'音源未登録 · 手元の音源で試せます');}
 const registered=Boolean(t.audioSrc);
 $('#player').dataset.audioMode=registered?'registered':'local';
 $('.audio-upload').hidden=registered;
 $('.upload-note').hidden=registered;
 $('#playing-title').textContent=t.title;
 $('#player').hidden=false;
 document.body.classList.add('has-player');
}
async function playSelected(t){
 try{await audio.play();if(selected?.id===t.id)setAudioStatus('');}
 catch(error){if(selected?.id===t.id&&error.name!=='AbortError')setAudioStatus('再生を開始できませんでした。プレイヤーの再生ボタンでお試しください。');}
}
function setPanel(panel){if(panel==='lyrics'&&!selectedDetail?.lyricsByOwner)return;$('#notes-panel').hidden=panel!=='notes';$('#lyrics-panel').hidden=panel!=='lyrics';document.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.panel===panel)));}
function openDetail(t){
 selectedDetail=t;
 const hasLyrics=Boolean(t.lyricsByOwner&&t.lyrics);
 const notes=[t.notesThen,t.notesNow].filter(Boolean).join('\n\n');
 $('#detail').dataset.branch=branchFor(events.find(e=>e.id===t.historyEventId)||{});
 $('#detail-title').textContent=t.title;
 $('#credits').replaceChildren();
 for(const tag of t.creatorCreditTags||[])$('#credits').append(el('span',tag,'credit-tag'));
 $('#notes-then').textContent=notes;
 $('#detail-source').hidden=!t.sourceUrl;
 if(t.sourceUrl)$('#detail-source').href=t.sourceUrl;
 $('#detail-play').hidden=!t.audioSrc;
 $('.detail-actions').hidden=!t.sourceUrl&&!t.audioSrc;
 $('[data-panel="notes"]').hidden=!notes;
 $('[data-panel="lyrics"]').hidden=!hasLyrics;
 $('#detail-tabs').hidden=!(notes&&hasLyrics);
 $('#lyrics').textContent=hasLyrics?t.lyrics:'';
 setPanel(hasLyrics?'lyrics':'notes');
 $('#notes-panel').hidden=!notes||hasLyrics;
 $('#detail').showModal();
}
$('#detail-play').addEventListener('click',()=>{const track=selectedDetail;selectTrack(track);$('#detail').close();if(track.audioSrc){audio.focus();void playSelected(track);}else $('#audio-file').focus();});
$('#close-detail').addEventListener('click',()=>$('#detail').close());
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=$('#detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#detail').close();}});
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>setPanel(b.dataset.panel)));
$('#close-player').addEventListener('click',()=>{releaseAudio();selected=null;$('#player').hidden=true;document.body.classList.remove('has-player');});
$('#audio-file').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('audio/')){setAudioStatus('音声ファイルを選んでください');return;}audio.pause();if(localAudioUrl)URL.revokeObjectURL(localAudioUrl);localAudioUrl=URL.createObjectURL(f);audio.src=localAudioUrl;audio.hidden=false;setAudioStatus('端末内の試聴：'+f.name);});
audio.addEventListener('error',()=>setAudioStatus('音源を読み込めませんでした。接続を確認して再度お試しください。'));
window.addEventListener('pagehide',()=>{if(localAudioUrl)URL.revokeObjectURL(localAudioUrl);});
const branchFor=e=>e.id==='felice'?'felice':e.id==='patalp'?'patalp':'main';
let renderedRows=[];
function eventRow(e){const branch=branchFor(e);return {kind:'event',key:e.id,branch,event:e};}
function songRows(e){return(e.trackIds||[]).map(id=>tracks.find(t=>t.id===id)).filter(Boolean).map(track=>({kind:'song',key:'song-'+track.id,branch:branchFor(e),track,event:e}));}
function makeRows(){const rows=[];for(const e of events){if(e.id==='patalp')continue;if(e.id==='felice'){const p=events.find(x=>x.id==='patalp');rows.push(eventRow(e));if(p)rows.push(eventRow(p));const fSongs=songRows(e),pSongs=p?songRows(p):[];for(let i=0;i<Math.max(fSongs.length,pSongs.length);i++){if(fSongs[i])rows.push(fSongs[i]);if(pSongs[i])rows.push(pSongs[i]);}}else{if(e.displayMilestone!==false)rows.push(eventRow(e));rows.push(...songRows(e));}}return rows.reverse();}
function render(){const list=$('#history-list');list.replaceChildren();renderedRows=makeRows();for(const row of renderedRows){const li=el('li',undefined,'log-row '+row.kind+'-row '+row.branch);li.dataset.key=row.key;li.dataset.branch=row.branch;if(row.kind==='song'){const b=el('button',undefined,'song-commit');b.setAttribute('aria-label',row.track.title+'の音源・歌詞・Production notesを開く');b.append(el('span',row.track.title,'commit-title'));if(row.track.creatorCreditTags?.length){const tags=el('span',undefined,'credit-tags');for(const value of row.track.creatorCreditTags)tags.append(el('span',value,'credit-tag'));b.append(tags);}b.addEventListener('click',()=>openDetail(row.track));li.append(b);}else{const e=row.event;const label=el('div',undefined,'event-line');const value=e.displayYear||e.year;const year=value?String(value):'—';label.append(el('span',year,'log-year'),el('span',e.shortLabel||e.title,'event-label'));li.append(label);}list.append(li);}requestAnimationFrame(drawGraph);}
function drawGraph(){const svg=$('#graph');svg.replaceChildren();if(!renderedRows.length)return;const height=$('#tree').offsetHeight;const width=svg.getBoundingClientRect().width;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);const x={main:width*.17,felice:width*.50,patalp:width*.83};const domRows=[...$('#history-list').children];const coords=renderedRows.map((row,i)=>({...row,y:domRows[i].offsetTop+domRows[i].firstElementChild.offsetTop+domRows[i].firstElementChild.offsetHeight/2}));const colors={main:'#6d8173',felice:'#976522',patalp:'#506ca5'};const ns='http://www.w3.org/2000/svg';const path=(d,color)=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('stroke',color);p.setAttribute('stroke-width','1.8');p.setAttribute('fill','none');svg.append(p);};const mainRows=coords.filter(r=>r.branch==='main');path(`M ${x.main} ${mainRows[0].y} L ${x.main} ${mainRows.at(-1).y}`,colors.main);const oldestBranch=coords.findLastIndex(r=>r.branch!=='main');const origin=coords.slice(oldestBranch+1).find(r=>r.branch==='main');for(const branch of ['felice','patalp']){const branchRows=coords.filter(r=>r.branch===branch);if(!origin||!branchRows.length)continue;const first=branchRows.at(-1).y,last=branchRows[0].y;const bend=-Math.min(30,(origin.y-first)/2);path(`M ${x.main} ${origin.y} C ${x.main} ${origin.y+bend}, ${x[branch]} ${origin.y+bend}, ${x[branch]} ${first} L ${x[branch]} ${last}`,colors[branch]);}for(const row of coords){const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',String(x[row.branch]));circle.setAttribute('cy',String(row.y));circle.setAttribute('r',row.kind==='song'?'5.5':'3');circle.setAttribute('fill',row.kind==='song'?colors[row.branch]:'#fafaf7');circle.setAttribute('stroke',colors[row.branch]);circle.setAttribute('stroke-width','1.8');svg.append(circle);if(row.kind==='song'){const hit=document.createElementNS(ns,'circle');hit.setAttribute('cx',String(x[row.branch]));hit.setAttribute('cy',String(row.y));hit.setAttribute('r','12');hit.setAttribute('fill','transparent');hit.style.pointerEvents='all';hit.style.cursor='pointer';hit.addEventListener('click',()=>openDetail(row.track));svg.append(hit);}}}
const observer=new ResizeObserver(()=>requestAnimationFrame(drawGraph));observer.observe($('#tree'));window.addEventListener('resize',()=>requestAnimationFrame(drawGraph));
async function init(){try{const responses=await Promise.all([fetch('tracks.json',{cache:'no-store'}),fetch('history.json',{cache:'no-store'})]);if(responses.some(r=>!r.ok))throw Error('data');[tracks,events]=await Promise.all(responses.map(r=>r.json()));render();}catch{$('#error').hidden=false;$('#error').textContent='履歴を読み込めませんでした。ページを再読み込みしてください。';}}
init();
