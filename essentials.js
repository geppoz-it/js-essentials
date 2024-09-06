
// esegue la join tra due array in base all'uguaglianza di chiavi calcolate come si vuole
// -> ritorna object con: key=chiaveCalcolata value=[arrElems1,arrElems2]
function joinArrays(arr1,arr2,fKey1,fKey2){ // arrays e relative funzioni che estraggono la chiave dall'elemento
  let res={};
  for (let a of arr1){
    let k1=fKey1(a);
    if (res[k1]==undefined) res[k1]=[[a],[]]; else res[k1][0].push(a);
  }
  for (let a of arr2){
    let k1=fKey2(a);
    if (res[k1]==undefined) res[k1]=[[],[a]]; else res[k1][1].push(a);
  }
  return res;
}

function groupArray(arr,fKey,fValue){ // ritorna oggetti con chiave calcolata tramite funct e valore calcolato tramite funct
  if (!fValue) fValue=(x=>x);
  let res={};
  for (let a of arr){
    let k1=fKey(a);
    if (res[k1]==undefined) res[k1]=[fValue(a)]; else res[k1].push(fValue(a));
  }
  return res;
}




// execute "asyncFunct" for each element of "argArray", launching "numParallel" threads at time
// (example: you need to call an API for every element of a 1000 sized array, but you want to execute 5 parallel request)
// initDelayMs    = delay between first launch of each thread
// reusingDelayMs = delay between response and new request on each thread
// returns array same size of the input one with elements: [duration , resultObject , 0=resolve 1=reject]
async function parallelAsyncArray(asyncFunct,argArray,numParallel,initDelayMs,reusingDelayMs,logFlag){
  let results=[];
  let nextToLaunch=0,nCompleted=0,running=[],runningTs=[];
  for (let ix=0;(ix<numParallel)&&(ix<argArray.length);ix++){
    running.push(new Promise(res=>{ setTimeout(()=>res([ix,-1]),initDelayMs*ix); } ) );
  }
  while (nCompleted!=argArray.length){
    let completed=await Promise.race(running).then(v=>v.concat(0),e=>e.concat(1));  // awaits the first completion
    if (completed[1]!=-1){
      let duration=Date.now()-runningTs[completed[0]];
      if (logFlag) console.log((new Date()).toISOString()+" completed #"+completed[1]+" in "+duration+" ms");
      results[completed[1]]=[duration,completed[2],completed[3]];
      nCompleted+=1;
    }
    if ((completed[1]!=-1)&&(reusingDelayMs>0)){
      let ix=completed[0];
      running[ix]=new Promise(res=>{ setTimeout(function(){ res([ix,-1]) },reusingDelayMs); } );
    } else {
      if (nextToLaunch<argArray.length){
        let ix=completed[0];
        let ixarr=nextToLaunch;
        let obj=argArray[nextToLaunch];
        running[ix]=new Promise( (res,rej)=>{ asyncFunct(obj).then( x=>res([ix,ixarr,x]) ).catch( x=>rej([ix,ixarr,x]) ); } );
        runningTs[ix]=Date.now();
        if (logFlag) console.log((new Date()).toISOString()+" launched #"+nextToLaunch+" in thread #"+ix);
        nextToLaunch+=1;
      } else {
        running[completed[0]]=new Promise( res=>{} ); // tappabuchi finale, promise mai risolte
      }
    }
  }
  return results;
}

// esempio di funzione che resolve o reject a caso dopo un tempo a caso
// async function busyFunction(id) { return new Promise( (resolve,reject) =>{
//   let delay=Math.round(1000+Math.random()*2000);
//   setTimeout(function(){
//     if (Math.random()<0.3){ console.log("failed "+id);reject(id+":"+(-delay)); }
//     else { console.log("completed "+id);resolve(id+":"+delay); }
//   },delay);
//   console.log("launched "+id); 
// }); }

// esempio di funzione che chiama una API
// let arr=['06972060823', '97284520828','01123880468', '01765530488','00802100149', '03773050137','00802100149', '03773050137','80041150584','08936640963'];
// let r=await parallelAsyncArray(id=>fetch("https://www.geppoz.eu/pub/checkcfpi.php?pi="+id).then(x=>x.text()),arr,4,100,100,true);




