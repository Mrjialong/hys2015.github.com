/*
 *数据模型
 */

 var noShape 		= 0;
 var zShape 		= 1;
 var sShape			= 2;
 var lineShape 		= 3;
 var tShape			= 4;
 var squarShape		= 5;
 var lShape 		= 6;
 var mirrorShape	= 7;

 var shapesData = [
 		[[0,0],[0,0],[0,0],[0,0]],
 		[[-1,0],[0,0],[0,-1],[1,-1]],
 		[[1,0],[0,0],[0,-1],[-1,-1]],
 		[[-1,0],[0,0],[1,0],[2,0]],
 		[[-1,0],[0,0],[1,0],[0,-1]],
 		[[-1,0],[0,0],[-1,-1],[0,-1]],
 		[[0,2],[0,1],[0,0],[1,0]],
 		[[0,2],[0,1],[0,0],[-1,0]],
 		];
 var colors = ["white","blue","red","yellow","black","brown","purple","pink"];

 var canvas = document.getElementById('mycanvas');
 var ctx = canvas.getContext('2d');
 var precanvas = document.getElementById('preview');
 var ctx2 = precanvas.getContext('2d');

/*
 *工具函数
 */
 //将小坐标系映射到全局坐标系
 function translate(data,row,col){
 	var tranData = [];
 	for(var i = 0;i < 4;i++){
 		var temp = {};
 		temp.row = data[i][1] + row;
 		temp.col = data[i][0] + col;
 		tranData.push(temp);
 	}
 	return tranData;
 }

 //以小坐标系原点为中心，顺时针旋转图形90°
 function rotate(data){
 	var rotaData = [[],[],[],[]];
 	for(var i = 0;i<4;i++){
 		rotaData[i][0] = -data[i][1];
 		rotaData[i][1] = data[i][0];
 	}
 	return rotaData;
 }

 var Map = function(w,h){
 	this.width  = w;
 	this.height = h;
 	this.lines  = [];
 	for(var row = 0;row < this.height;row++){
 		this.lines[row] = this.newLine();
 	}
 } 
 //利用prototype绑定成员函数，js特性之一
 Map.prototype.newLine = function(){
 	var singleLine = [];
 	for(var col = 0;col < this.width;col++){
 		singleLine.push(noShape);
 	}
 	return singleLine;
 }
 //碰撞检测
 Map.prototype.isCollide = function(data){
 	for(var i = 0;i<4;i++){
 		var row = data[i].row;
 		var col = data[i].col;
 		if(col < 0 || col == this.width) return true;
 		if(row == this.height) return true;
 		if(row < 0) continue;
 		else if (this.lines[row][col]!=noShape) return true;
 	}
 }
 //判断满行
 Map.prototype.isFullLine = function(row){
 	var line = this.lines[row];
 	for(var col=0;col<this.width;col++){
 		if(line[col]==noShape) return false;
 	}
 	return true;
 }
 //消除满行
 Map.prototype.appendShape = function(shapeID,data){
 	for(var i = 0;i<4;i++){
 		var row = data[i].row;
 		var col = data[i].col;
 		this.lines[row][col] = shapeID;
 	}
 	var count = 0;	//计一次清算中消除了多少行
 	for(var row = 0;row < this.height;row++){
 		if(this.isFullLine(row)){
 			this.lines.splice(row,1);
 			this.lines.unshift(this.newLine());
 			count++;
 			genCanvas(this,ctx);
 		}
 	}
 	score++; //落地即加分
	//单次结算
	if(count!=0){
		score += count*5;
		switch(count){
			case 2:
				score += 3;break;
			case 3:
				score += 6;break;
			case 4:
				score += 10;
			default:break;
		}
	}
	update_score();  //更新到UI
 }

 //绘制图形
 var spacing = 20;
 //画小方块
 function drawRect(color,ctx,x,y){
 	ctx.save();
 	ctx.fillStyle = color;
 	ctx.fillRect(x,y,spacing-2,spacing-2);   //后两个参数是width和height
 	ctx.restore();
 }
 //渲染Canvas
 function genCanvas(map,ctx){
 	var cwidth = map.width * spacing;
 	var cheight = map.height * spacing;
 	ctx.clearRect(0,0,cwidth,cheight);
 	var lines = map.lines;
 	for(var row = 0;row < map.height;row++){
 		for(var col = 0;col < map.width;col++){
 			var shapeID = lines[row][col];
 			if(shapeID!=noShape){
 				var x = col*spacing;
 				var y = row*spacing;
 				drawRect(colors[shapeID],ctx,x,y);
 			}
 		}
 	}
 }
 //绘制单个图形
 function drawSquare(shapeID,map,ctx,data){
 	genCanvas(map,ctx);
 	var color = colors[shapeID];
 	for(var i = 0 ;i<4;i++){
 		var x = data[i].col*spacing;
 		var y = data[i].row*spacing;
 		drawRect(color,ctx,x,y);
  	}
 }

 /*
  *GameModel游戏模型
  */
var GameModel = function(w,h){
	this.map = new Map(w,h);
	this.nextmap = new Map(4,6);
	this.IDqueue = new Array();
	this.born();
}

GameModel.prototype.born = function(){
	while(this.IDqueue.length<2){
		this.IDqueue.push(Math.floor(Math.random()*7)+1);
	}
	var prevID = this.IDqueue[1];
	var prevData = shapesData[prevID];
	drawSquare(prevID,this.nextmap,ctx2,translate(prevData,1,1));

	this.shapeID = this.IDqueue.shift();  //1-7
	this.data = shapesData[this.shapeID];
	this.row = -1;
	this.col = Math.floor(this.map.width/2);
	drawSquare(this.shapeID,this.map,ctx,translate(this.data,this.row,this.rol));
}

GameModel.prototype.left = function(){
	this.col--;
	var temp = translate(this.data,this.row,this.col);
	if(this.map.isCollide(temp)) this.col++;
	else drawSquare(this.shapeID,this.map,ctx,temp);
}

GameModel.prototype.right = function(){
	this.col++;
	var temp = translate(this.data,this.row,this.col);
	if(this.map.isCollide(temp)) this.col--;
	else drawSquare(this.shapeID,this.map,ctx,temp);
}

GameModel.prototype.down = function(){
	var old = translate(this.data,this.row,this.col);
	this.row++;
	var temp = translate(this.data,this.row,this.col);
	if(this.map.isCollide(temp)) {
		this.row--;
		if(this.row <= 0){
			gameOver = true;
			alert("GAME OVER!");
			location.reload();
			return;
		}
		this.map.appendShape(this.shapeID,old);
		this.born();
	}else{
		drawSquare(this.shapeID,this.map,ctx,temp);
	} 
}

GameModel.prototype.rotate = function(){
	if(this.shapeID == squarShape) return ;
	var rotatedata = rotate(this.data);
	var temp = translate(rotatedata,this.row,this.col);
	if(this.map.isCollide(temp)) return ;
	this.data = rotatedata;
	drawSquare(this.shapeID,this.map,ctx,temp);
}

function keybind(e){ //按键绑定
	if(e.keyCode == 37) model.left();
	if(e.keyCode == 38) model.rotate();
	if(e.keyCode == 39) model.right();
	if(e.keyCode == 40) model.down();
}

function animate(){
	if(!gameOver&&!gamePause){
		setTimeout(function(){animate()},delay - score > 200 ? delay - score * 10 : 200);
		model.down();
	}
}

function update_score(){
	score_txt.innerHTML = score;
}

//游戏初始化
var gameInit = function(){
	model = new GameModel(13,20);
	score = 0;
	gameOver = false;
	gamePause = true;
	delay = 800;
	VirtualCtrlsInit();
}

//虚拟控制器
var VControls = new Array();
var VirtualCtrlsInit = function(){
	var LCtrl = document.getElementById("left");
	LCtrl.onclick = function(){
		model.left();
	}
	VControls.push(LCtrl);
	LCtrl = document.getElementById("right");
	LCtrl.onclick = function(){
		model.right();
	}
	VControls.push(LCtrl);
	LCtrl = document.getElementById("up");
	LCtrl.onclick = function(){
		model.rotate();
	}
	VControls.push(LCtrl);
	LCtrl = document.getElementById("down");
	LCtrl.onclick = function(){
		model.down();
	}
	VControls.push(LCtrl);

	DisabledVCtrls();
}

var EnableVCtrls = function(){
	for(var i = 0; i < 4; ++i)
	{
		VControls[i].disabled = false;
	}
}

var DisabledVCtrls = function(){
	for(var i = 0; i < 4; ++i)
	{
		VControls[i].disabled = true;
	}
}


//游戏开始
var model;
var score;
var delay;
var gamePause;
var gameOver;
gameInit();

var score_txt = document.getElementById("score");

var start = document.getElementById("startGame");
start.onclick = function(){
	document.onkeydown = keybind;
	gamePause = false;
	animate();
	pause.disabled = false;
	restart.disabled = true;
	this.disabled = true;

	EnableVCtrls();
}
//暂停
var pause = document.getElementById("pause");
pause.onclick = function(){
	document.onkeydown = null;
	//clearTimeout();
	gamePause = true;
	this.disabled = true;
	restart.disabled = false;
	start.disabled = false;

	DisabledVCtrls();
}

var restart = document.getElementById("restart");
restart.disabled = true;
restart.onclick = function(){
	if(window.confirm("确定要重新开始吗？")){
		gameInit();
		score_txt.innerHTML = score;
		//start.click();
	}else{
		return false;
	}
}
