import { ref, onBeforeUnmount } from 'vue'
export function useRecording(onTranscript) {
  const recording=ref(false),busy=ref(false),error=ref(''),audioUrl=ref(''),transcript=ref('');let stream,recorder,recognition,timer,expectedStop=false,buffer=[],disposed=false,request=0
  function clean(){clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());stream=null}
  function stop(){expectedStop=true;if(recorder?.state==='recording')recorder.stop();try{recognition?.stop()}catch{};recording.value=false;clearTimeout(timer)}
  function reset(){stop();if(audioUrl.value)URL.revokeObjectURL(audioUrl.value);audioUrl.value='';transcript.value='';error.value='';buffer=[]}
  async function start(){
    if(recording.value)return stop()
    if(busy.value)return
    if(!navigator.mediaDevices?.getUserMedia||!globalThis.MediaRecorder){error.value='当前浏览器不支持录音。请用HTTPS或本机地址，在Chrome/Safari打开。';return}
    reset();busy.value=true;const id=++request
    try{const s=await navigator.mediaDevices.getUserMedia({audio:true});if(disposed||id!==request){s.getTracks().forEach(t=>t.stop());return}stream=s;buffer=[];const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{if(audioUrl.value)URL.revokeObjectURL(audioUrl.value);audioUrl.value=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));recording.value=false;clean();if(!transcript.value&&!error.value)error.value='录音已保存可回听。未取得识别文本，暂时没有匹配分。'};recorder.start();recording.value=true;expectedStop=false
    const SR=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition
    if(SR){recognition=new SR();recognition.lang='en-US';recognition.continuous=true;recognition.interimResults=true;recognition.onresult=e=>{buffer=Array.from(e.results).map(r=>({text:r[0].transcript,final:r.isFinal}));transcript.value=buffer.map(r=>r.text).join(' ');const final=buffer.filter(r=>r.final).map(r=>r.text).join(' ');if(final)onTranscript(final)};recognition.onerror=()=>{error.value='设备语音识别没有成功，录音仍可回听；没有识别文本时不会显示分数。'};recognition.onend=()=>{if(!expectedStop&&recording.value)stop()};try{recognition.start()}catch{error.value='设备语音识别未启动，录音仍可回听。'}}else error.value='当前浏览器可录音，但不支持语音识别。专业发音评分服务尚未连接。'
    timer=setTimeout(stop,120000)
    }catch{error.value='未获得麦克风权限，请在浏览器设置中允许后重试。';clean()}finally{busy.value=false}
  }
  onBeforeUnmount(()=>{disposed=true;request++;stop();clean();if(audioUrl.value)URL.revokeObjectURL(audioUrl.value)})
  return{recording,busy,error,audioUrl,transcript,start,stop,reset}
}
