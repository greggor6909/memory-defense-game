
let gold=0,lives=20,wave=1;
function updateUI(){
goldEl.textContent=gold;waveEl.textContent=wave;livesEl.textContent=lives;
}
const goldEl=document.getElementById('gold');
const waveEl=document.getElementById('wave');
const livesEl=document.getElementById('lives');

// MEMORY
const imgs=[];
for(let i=1;i<=32;i++) imgs.push(`images/photo${String(i).padStart(2,'0')}.jpg`);
let cards=[...imgs,...imgs].sort(()=>Math.random()-0.5);
const mem=document.getElementById('memory');
let first=null,lock=false,matches=0;
cards.forEach(src=>{
 const d=document.createElement('div');
 d.className='card';
 d.onclick=()=>{
   if(lock||d.classList.contains('matched')) return;
   d.style.backgroundImage=`url(${src})`;
   if(!first){first={d,src};return;}
   if(first.src===src && first.d!==d){
      d.classList.add('matched'); first.d.classList.add('matched');
      gold+=10; matches++;
      if(matches===32) gold+=100;
      updateUI();
   } else {
      lock=true;
      setTimeout(()=>{
        d.style.backgroundImage='';
        first.d.style.backgroundImage='';
        lock=false;
      },700);
   }
   first=null;
 };
 mem.appendChild(d);
});

// ARITHMETIC
let currentAnswer=0;
function newQ(){
 let mult=Math.random()<0.5;
 let a=1+Math.floor(Math.random()*9);
 let b=1+Math.floor(Math.random()*9);
 currentAnswer=mult?a*b:a+b;
 question.textContent=`${a} ${mult?'×':'+'} ${b} = ?`;
}
window.checkAnswer=function(){
 let v=parseInt(answer.value);
 if(v===currentAnswer){
   gold += currentAnswer>18?10:5;
   feedback.textContent="Correct!";
 }else feedback.textContent="Try again";
 answer.value='';
 newQ(); updateUI();
};
newQ();

// TOWER DEFENSE
const canvas=document.getElementById('td');
const ctx=canvas.getContext('2d');
const path=[
[20,20],[330,20],[330,140],[20,140],[20,260],[330,260],[330,380],[20,380],[20,500],[330,500],[330,650]
];
let towers=[],enemies=[],placing=false;

window.buyTower=function(){
 if(gold<50) return alert("Need 50 gold");
 gold-=50; placing=true; updateUI();
};

canvas.onclick=e=>{
 if(!placing) return;
 const r=canvas.getBoundingClientRect();
 towers.push({x:e.clientX-r.left,y:e.clientY-r.top});
 placing=false;
};

function spawnEnemy(){
 enemies.push({seg:0,t:0,hp:10+wave*2});
}

setInterval(()=>spawnEnemy(),2000);

function updateEnemies(){
 enemies.forEach(en=>{
   let a=path[en.seg], b=path[en.seg+1];
   if(!b){ lives--; en.dead=true; return; }
   en.t+=0.005+wave*0.0005;
   if(en.t>=1){ en.seg++; en.t=0; }
 });
 enemies=enemies.filter(e=>!e.dead && e.hp>0);
}

function towersFire(){
 towers.forEach(t=>{
   enemies.forEach(e=>{
      let a=path[e.seg], b=path[e.seg+1];
      if(!b) return;
      let x=a[0]+(b[0]-a[0])*e.t;
      let y=a[1]+(b[1]-a[1])*e.t;
      let d=Math.hypot(t.x-x,t.y-y);
      if(d<80){ e.hp-=0.2; if(e.hp<=0) gold+=1; }
   });
 });
}

function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.beginPath();
 ctx.moveTo(path[0][0],path[0][1]);
 path.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));
 ctx.stroke();

 towers.forEach(t=>{
   ctx.beginPath(); ctx.arc(t.x,t.y,10,0,Math.PI*2); ctx.fill();
 });

 enemies.forEach(e=>{
   let a=path[e.seg], b=path[e.seg+1];
   if(!b) return;
   let x=a[0]+(b[0]-a[0])*e.t;
   let y=a[1]+(b[1]-a[1])*e.t;
   ctx.beginPath(); ctx.arc(x,y,8,0,Math.PI*2); ctx.fill();
 });
}

function loop(){
 updateEnemies();
 towersFire();
 draw();
 if(gold>0 && gold%25===0) wave=Math.max(wave,1+Math.floor(gold/100));
 updateUI();
 requestAnimationFrame(loop);
}
loop();
