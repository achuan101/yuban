// Random samples from each source module; source order is NOT calibrated difficulty.
const shuffle=(rows,rng)=>{const copy=[...rows];for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
export function createSession(start=100){return {start,queue:null,current:null,responses:[],used:new Set(),done:false,total:5}}
export function nextQuestion(session,rows,rng=Math.random){
 if(session.current)return session.current
 if(session.done)return null
 if(!session.queue){const modules=[...new Set(rows.map(r=>r.source_category))];session.population=Object.fromEntries(modules.map(m=>[m,rows.filter(r=>r.source_category===m).length]));session.queue=shuffle(modules,rng).slice(0,session.total).map(m=>shuffle(rows.filter(r=>r.source_category===m),rng).slice(0,8).sort((a,b)=>(b.source_frequency_count||0)-(a.source_frequency_count||0))[0]).filter(Boolean);session.total=session.queue.length}
 const item=session.queue[session.responses.length];if(!item){session.done=true;return null}
 const pool=shuffle(rows.filter(r=>r.source_category===item.source_category&&r.meaning!==item.meaning),rng),meanings=new Set([item.meaning]),distractors=[]
 for(const r of pool){if(meanings.has(r.meaning))continue;meanings.add(r.meaning);distractors.push(r);if(distractors.length===3)break}
 if(distractors.length!==3)throw new Error('题目缺少有效释义选项')
 session.current={id:item.item_id,item,options:shuffle([item,...distractors].map(r=>({id:r.item_id,text:r.meaning})),rng)};session.used.add(item.item_id);return session.current
}
export function submitAnswer(session,id,answer){
 const q=session.current;if(!q||q.id!==id||(!q.options.some(o=>o.id===answer)&&answer!=='unknown'))return null
 const outcome=answer==='unknown'?'unknown':answer===q.item.item_id?'correct':'wrong',response={item_id:id,word:q.item.lookup,category:q.item.source_category,outcome,answer}
 session.responses.push(response);session.current=null;session.done=session.responses.length===session.total;return response
}
export function placementResult(session){
 const observed={correct:0,wrong:0,unknown:0};let estimate=0,variance=0;const modules=[]
 for(const [category,size] of Object.entries(session.population||{})){
  const answers=session.responses.filter(r=>r.category===category),grid=Array.from({length:101},(_,i)=>i/100)
  const weights=grid.map(p=>answers.reduce((w,r)=>w*(r.outcome==='correct'?(.25+.75*p):r.outcome==='unknown'?(1-p):.75*(1-p)),1)),norm=weights.reduce((a,b)=>a+b,0)
  const mean=weights.reduce((s,w,i)=>s+w*grid[i],0)/norm,v=weights.reduce((s,w,i)=>s+w*(grid[i]-mean)**2,0)/norm
  estimate+=size*mean;variance+=size**2*v;modules.push({category,size,tested:answers.length,correct:answers.filter(r=>r.outcome==='correct').length,estimatedPercent:Math.round(mean*100)})
 }
 for(const r of session.responses)observed[r.outcome]++
 const median=Math.round(estimate/10)*10,margin=1.645*Math.sqrt(variance),low=Math.max(observed.correct,Math.floor((estimate-margin)/10)*10),high=Math.min(850-observed.unknown,Math.ceil((estimate+margin)/10)*10)
 const summary={low,median:Math.min(850,median),high,method:'原表10模块随机抽样，考虑四选一猜测的初步模型',calibrated:false}
 return {summary,responses:[...session.responses],modules,breakdown:{observed,untested:850-session.responses.length,knownPercent:Math.round(summary.median/850*100),unknownPercent:100-Math.round(summary.median/850*100)}}
}
