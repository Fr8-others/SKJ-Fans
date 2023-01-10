 /* ゲーム画面の構築 */
 function isSmartPhone() {
  if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
    return true;
  } else {
    return false;
  }
}

 const canvas = document.createElement('canvas');
 const ctx = canvas.getContext('2d');
 
 let mobile = isSmartPhone();
 if(mobile){
  canvas.width = 450;
 canvas.height = 450;
 }
 else{
  canvas.width = 600;
 canvas.height = 600;
 }

 
 let mainID = null;

 var face = new Image();
 face.src = 'picture/yabao_tile.png';
 var candy = new Image();
 candy.src = 'picture/nodoame.jpg';
 var enemyFace = new Image();
 enemyFace.src = 'picture/sai_tile.png';
 var trapFace = new Image();
 trapFace.src = 'picture/sin_tile.png';

 var audio = [];
 for(i=0;i<8;i++){audio[i] = new Audio();}
 audio[0].src = 'mp3/sa2_damage.mp3';
 audio[1].src = 'mp3/sa2_die.mp3';
 audio[2].src = 'mp3/sa2_eat.mp3';
 audio[3].src = 'mp3/sa2_self.mp3';
 audio[4].src = 'mp3/sai_die.mp3';
 audio[5].src = 'mp3/sai_eat.mp3';
 audio[6].src = 'mp3/sai_kill.mp3';
 audio[7].src = 'mp3/sin_kill.mp3';
 
 let screams = [];

 canvas.setAttribute('style', 'display:block;margin:auto;background-color: #aaa');
 
 document.body.appendChild(canvas);
 
 
 /*
 // ★ここからスネークゲームのプログラム★
 */
 let GRID = null;
 if(mobile){
  GRID = 15; //グリッドの1マス（お好みで調整可能）
 }
 else {GRID = 20;} //グリッドの1マス（お好みで調整可能）
 const STAGE = canvas.width / GRID;
 let scoreBoard;
 const snake = {
   x: null,
   y: null,
   dx: 1,
   dy: 0,
   tail: null,
   score: 0,
   life:3,

   update: function() {
     this.body.push({x: this.x, y: this.y});
     this.x += this.dx;
     this.y += this.dy;
     
     if(this.life === 3)ctx.fillStyle = 'rgb(0,0,255,255)';
     else if(this.life === 2)ctx.fillStyle = 'rgb(32,32,176,255)';
     else if(this.life === 1)ctx.fillStyle = 'rgb(64,64,96,255)';
     else ctx.fillStyle = 'rgb(0,0,0,255)';
     this.body.forEach(obj => {
       if(this.body.length >= 2 && this.body[this.body.length-1].x === obj.x && this.body[this.body.length-1].y === obj.y)ctx.drawImage(face,obj.x*GRID,obj.y*GRID,GRID,GRID);
       else ctx.fillRect(obj.x*GRID, obj.y*GRID, GRID-2, GRID-2);
       if(this.x === obj.x && this.y === obj.y)damage(true); //自分自身に接触したら最初に戻る
     })
     
     //ヘビが設定した長さ以上にならないように制限
     if(this.body.length >= this.tail) this.body.shift();
   }
 }
 const item = {
   x: null,
   y: null,
   
   update: function() {
     ctx.drawImage(candy,this.x*GRID, this.y*GRID, GRID, GRID);
   }
 }

 let trap = [];

 const enemy = {
   x: null,
   y: null,
   dx: null,
   dy: null,
   tail: 10,
   update: function(){
     this.body.push({x: this.x, y: this.y});
     let value = Math.random();
     if(value < 0.10){
       if(value<0.025){this.dx=1;this.dy=0;}
       else if(value >= 0.025 && value < 0.05){this.dx=0;this.dy=1;}
       else if(value >= 0.05 && value < 0.075){this.dx=-1;this.dy=0;}
       else {this.dx=0;this.dy=-1;}
     }
     this.x += this.dx;
     this.y += this.dy;
     
     ctx.fillStyle = 'red';
     this.body.forEach(obj => {
       if(this.body[this.body.length-1].x === obj.x && this.body[this.body.length-1].y === obj.y)ctx.drawImage(enemyFace,obj.x*GRID,obj.y*GRID,GRID,GRID);
       else ctx.fillRect(obj.x*GRID, obj.y*GRID, GRID-2, GRID-2);
        //自分自身に接触したら最初に戻る
     })
     
     //ヘビが設定した長さ以上にならないように制限
     if(this.body.length >= this.tail) this.body.shift();

     this.body.forEach(obj => {
       if(snake.x === obj.x && snake.y === obj.y){damage(false);audio[6].play()}
     })
     snake.body.forEach(obj => {
       if(enemy.x === obj.x && enemy.y === obj.y){snake.score += 10; enemy.tail++; instantiateEnemy();audio[4].play();}
     })
   }
 }
 
 // 初期化処理
 const init = () => {
  clearInterval(mainID);
   snake.x = STAGE / 2;
   snake.y = STAGE / 2;
   snake.tail = 4;
   snake.life = 3;
   snake.body = [];
   enemy.body = [];
   enemy.tail = 10;
   snake.score = 0;
   trap.length = 0;
    instantiateTrap();
   scoreBoard = document.getElementById("score"); 
   instantiateEnemy();
   item.x = Math.floor(Math.random() * STAGE);
   item.y = Math.floor(Math.random() * STAGE);
    mainID = setInterval(loop, 1000/15); //15フレームでゲームを描画（お好みで調整可能）    
 }
 
 //メインの繰り返し処理
 const loop = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    snake.update();
    item.update();
    trap.forEach(function(obj,i){
        obj.update(); 
        if(obj.x === snake.x && obj.y === snake.y){damage(false);audio[7].play();}
        if(obj.x === enemy.x && obj.y === enemy.y){trap.splice(i,1);enemy.tail++;audio[5].play();}
    });
    enemy.update();
    scoreBoard.innerHTML = "スコア:"+snake.score+"　sa2長さ:"+snake.tail+"　サイカツ長さ:"+enemy.tail+"　シンカ数:"+trap.length;
   
    //ヘビが画面外に消えないように制御
    if(snake.x < 0)       snake.x = STAGE-1;
    if(snake.y < 0)       snake.y = STAGE-1;
    if(snake.x > STAGE-1) snake.x = 0;
    if(snake.y > STAGE-1) snake.y = 0;

    if(enemy.x < 0)       enemy.x = STAGE-1;
    if(enemy.y < 0)       enemy.y = STAGE-1;
    if(enemy.x > STAGE-1) enemy.x = 0;
    if(enemy.y > STAGE-1) enemy.y = 0;
   
    //アイテムを食べれるようにする
    if(snake.x === item.x && snake.y === item.y) {
     snake.tail++;
     snake.score += 5;
     audio[2].play();
     moveItem();
    }
    if(enemy.x === item.x && enemy.y === item.y) {
     enemy.tail++;
     audio[5].play();
     moveItem();
    }
    
    if(snake.life <= 0){
        clearInterval(mainID);
        ctx.fillStyle = 'green';
        ctx.font = 'bold 60pt sans-serif';
        ctx.textAlign = "center";
        ctx.fillText("GameOver",STAGE/2*GRID,STAGE/2*GRID);
        ctx.fillStyle = 'red';
        ctx.strokeText("GameOver",STAGE/2*GRID,STAGE/2*GRID)
    }
 }
 
 init();
 
 function instantiateEnemy(){
   let x=Math.floor(Math.random() * STAGE);
   let y=Math.floor(Math.random() * STAGE);
   while(!(Math.abs(x-snake.x) > 5 && Math.abs(y-snake.y) > 5)){
     x=Math.floor(Math.random() * STAGE);
     y=Math.floor(Math.random() * STAGE);
   }
   enemy.x = x;
   enemy.y = y;
   enemy.dx = 1;
   enemy.dy = 0;
   enemy.body.length = 0;
}//敵生成

function moveItem(){
    let flag = true;
    while(flag){
        item.x = Math.floor(Math.random() * STAGE);
        item.y = Math.floor(Math.random() * STAGE);
        flag = false;
        trap.forEach(obj => {
            if(obj.x === item.x && obj.y === item.y){
                flag = true;
            }
        })   
    }
    instantiateTrap();
}

function instantiateTrap(){
    let preX=Math.floor(Math.random() * STAGE);
    let preY=Math.floor(Math.random() * STAGE);
    while(!(Math.abs(preX-snake.x) > 5 && Math.abs(preY-snake.y) > 5)){
    preX=Math.floor(Math.random() * STAGE);
    preY=Math.floor(Math.random() * STAGE);
    }
    trap.push({
        x:preX,
        y:preY,
    
        update: function() {
        ctx.drawImage(trapFace,this.x*GRID, this.y*GRID, GRID, GRID);
      }
    })
}

function damage(isSelf){
  if(snake.life===1)audio[1].play();
  else if(isSelf)audio[3].play();
  else audio[0].play();
  snake.life--;
}

 document.addEventListener('keydown', e => {
   switch(e.key) {
     case 'ArrowLeft':
       if(!(snake.dx == 1 && snake.dy == 0)){snake.dx = -1;snake.dy = 0;}
       break;
     case 'ArrowRight':
        if(!(snake.dx == -1 && snake.dy == 0)){snake.dx = 1;snake.dy = 0;}
       break;
     case 'ArrowUp':
        if(!(snake.dx == 0 && snake.dy == 1)){snake.dx = 0;snake.dy = -1;}
       break;
     case 'ArrowDown':
        if(!(snake.dx == 0 && snake.dy == -1)){snake.dx = 0;snake.dy = 1;}
       break;
     case 'Escape':
        ctx.clearRect(0,0,canvas.width,canvas.height);
        clearInterval(mainID);
        init();
        break;
   }
 });

 canvas.addEventListener('touchstart',function(event){
  while(event.changedTouches.length>1)event.changedTouches.shift();
  let x = event.changedTouches[0].clientX-canvas.getBoundingClientRect().left;
  let y = event.changedTouches[0].clientY-canvas.getBoundingClientRect().top;
  if(snake.dx === 0 && x < snake.x*GRID){snake.dx = -1;snake.dy = 0;}
  else if(snake.dx === 0 && x >= snake.x*GRID){snake.dx = 1;snake.dy = 0;}
  else if(snake.dy === 0 && y < snake.y*GRID){snake.dx = 0;snake.dy = -1;}
  else if(snake.dy === 0 && y >= snake.y*GRID){snake.dx = 0;snake.dy = 1;}
  console.log(snake.dy/*event.changedTouches[0].clientX-canvas.getBoundingClientRect().left*/);
  //console.log(event.changedTouches[0].clientY-canvas.getBoundingClientRect().top);
 })
 document.addEventListener("dblclick", function(e){ e.preventDefault();}, { passive: false });