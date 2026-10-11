import test from 'node:test'
import assert from 'node:assert/strict'
import bank from '../src/data/scene850.json' with {type:'json'}
import {createSession,nextQuestion,submitAnswer,placementResult} from '../src/domain/placement.mjs'
import {compareText,progression} from '../src/domain/progress.mjs'
import {handleApi} from '../server/api.mjs'

test('850 graph is complete, unique and reviewed',()=>{assert.equal(bank.rows.length,850);assert.equal(new Set(bank.rows.map(r=>r.lookup)).size,850);assert.equal(bank.rows.filter(r=>r.meaning==='待校对').length,0);assert.equal(Object.keys(bank.meta.source_structure).length,10)})
test('placement samples five words without repetition',()=>{const s=createSession();while(!s.done){const q=nextQuestion(s,bank.rows,()=>.42);assert(q);submitAnswer(s,q.id,q.item.item_id)}assert.equal(s.responses.length,5);assert.equal(new Set(s.responses.map(r=>r.item_id)).size,5);assert.equal(new Set(s.responses.map(r=>r.category)).size,5);const r=placementResult(s);assert(r.summary.median<=850);assert.equal(r.breakdown.untested,845)})
test('stale item id cannot be graded',()=>{const s=createSession(),q=nextQuestion(s,bank.rows,()=>.2);assert.equal(submitAnswer(s,'wrong-id',q.item.item_id),null);assert.equal(s.responses.length,0)})
test('matching and progression require three unique whole lessons',()=>{assert.equal(compareText('This is my home.','this is my home').score,100);const same={type:'lesson',lessonId:'a',level:300,wholePractice:true,comprehension:'easy',textScore:95,supportRatio:0,scene:'family'};assert.equal(progression([same,same,{...same,scene:'school'}],300).ready,false);assert.equal(progression([same,{...same,lessonId:'b',scene:'school'},{...same,lessonId:'c'}],300).ready,true)})
test('api reports disconnected honestly and rejects cross-site requests',async()=>{let r=await handleApi(new Request('http://local/api/status'));assert.deepEqual(await r.json(),{articleConnected:false,coachConnected:false,realtimeConnected:false,pronunciationConnected:false});r=await handleApi(new Request('http://local/api/coach',{method:'POST',headers:{origin:'https://evil.test'},body:'{}'}));assert.equal(r.status,403)})
test('voice coach still needs the configured model',async()=>{const r=await handleApi(new Request('http://local/api/coach',{method:'POST',body:JSON.stringify({voice:true,messages:[{role:'user',content:'Hello'}]})}));assert.equal(r.status,503);assert.match((await r.json()).error,/DeepSeek/)})
