// module aliases
document.getElementById("canvas").style.display="none";
document.getElementById("score").style.display="none";


const bgm = new Audio('./src/music/whiteBell_short.mp3');
const whistle = new Audio('./src/music/whistle.mp3');
const result = new Audio('./src/music/happyChanmery.mp3');
const hide=new Audio("./src/music/hide.mp3")
bgm.load();
whistle.load();
result.load();
hide.load();

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events,
    Mouse = Matter.Mouse;
    Query = Matter.Query;

// create an engine
var engine = Engine.create();

var width =  window.innerHeight*0.6;
var height =  window.innerHeight;

// create a renderer
var render = Render.create({
    element: document.getElementById("canvas"),
    options: {
      width: width,
      height: height,
      pixelRatio: 2, //Pixel比; スマホ用に2にする
      wireframes: false,
      background: '#f5c242'
    },
    engine: engine
});

var bodies=[];
var textures=["./src/img/hedge1.png","./src/img/hedge2.png","./src/img/daruma.png","./src/img/mouse1.png","./src/img/mouse2.png"]
var floar=Bodies.rectangle(0, height, width*2 + 10, 30, {render:{fillStyle: "#cc543a",strokeStyle: "#000"}, isStatic: true })
bodies.push(floar);
//bodies.push(Bodies.rectangle(0, 0, width*2, 80,{render:{fillStyle: "#cc543a",strokeStyle: "#000"}, isStatic: true}));
bodies.push(Bodies.rectangle(0, 0, 40, height*2, {render:{fillStyle: "#cc543a",strokeStyle: "#000"}, isStatic: true }));
bodies.push(Bodies.rectangle(width, 0, 40, height*2, {render:{fillStyle: "#cc543a",strokeStyle: "#000"}, isStatic: true }));
World.add(engine.world, bodies);


// add all of the bodies to the world
  // run the engine
  Engine.run(engine);
  // run the renderer
  Render.run(render);

  var target=""
  var lastPoint=[0,0];
  var rmObj=[];
  var total=0;
  var chain=0;

  const chainDistance=90
  const mouse = Mouse.create(document.getElementById("canvas"));

function addChum(times){
  let Chum=[]
  for(var i = 0; i < times; i++) {
    let textureNum=Math.floor(Math.random()*textures.length)
    Chum.push(
      Bodies.circle(
        (Math.random()*0.8+0.1) * (window.innerHeight*0.6) , //x座標
        0, //y座標
        30, //半径
        {
          density: 0.0005, //密度
          frictionAir: 0.02, //空気抵抗
          restitution: 0.8, //反発
          friction: 0.1, //摩擦
          label:textureNum,
          render: {
            sprite: {
              texture: textures[textureNum]
            }

          }
        }
      )
    );
  }
  World.add(engine.world, Chum);
}


function RadeyGame(){
  document.getElementById("Message").style.display="none";
  document.getElementById("canvas").style.display="block";
  let start= new Audio('./src/music/start.wav');
  start.play();
  addChum(50);
  setTimeout("startGame()", "1500")
}

function startGame(){
  bgm.play()

  document.getElementById("canvas").addEventListener('mousedown', () => {
    const query = Query.point(Composite.allBodies(engine.world), mouse.position)
    console.log(query);
    if(query.length==1){
      lastPoint=query[0].position;
      target=query[0].label;
      rmObj.push(query[0]);
      console.log(lastPoint.x)
    }
  });

  document.getElementById("canvas").addEventListener('touchstart', () => {
    const query = Query.point(Composite.allBodies(engine.world), mouse.position)
    console.log(query);
    if(query.length==1){
      lastPoint=query[0].position;
      target=query[0].label;
      rmObj.push(query[0]);
      console.log(lastPoint.x)
    }
  });

  document.getElementById("canvas").addEventListener('mousemove', () => {
    if(target!==""){
      const query = Query.point(Composite.allBodies(engine.world), mouse.position)
      console.log(query);
      if(query.length==1){
        console.log(lastPoint);
        let x=lastPoint.x-query[0].position.x;
        let y=lastPoint.y-query[0].position.y;
        console.log(x,y);
        if(query[0]["label"]==target && x*x+y*y< chainDistance*chainDistance){
          lastPoint=query[0].position;
          if(rmObj.indexOf(query[0])===-1){
            rmObj.push(query[0]);
          }
        }
      }
    }
  });

  document.getElementById("canvas").addEventListener('touchmove', () => {
    if(target!==""){
      const query = Query.point(Composite.allBodies(engine.world), mouse.position)
      console.log(query);
      if(query.length==1){
        console.log(lastPoint);
        let x=lastPoint.x-query[0].position.x;
        let y=lastPoint.y-query[0].position.y;
        console.log(x,y);
        if(query[0]["label"]==target && x*x+y*y< chainDistance*chainDistance){
          lastPoint=query[0].position;
          if(rmObj.indexOf(query[0])===-1){
            rmObj.push(query[0]);
          }
        }
      }
    }
  });

  document.getElementById("canvas").addEventListener('mouseup', () => {
    const query = Query.point(Composite.allBodies(engine.world), mouse.position)
    console.log(query);
    //console.log(query[0]["label"]);
    target=""
    addChum(rmObj.length);
    World.remove(engine.world, rmObj);
    total+=rmObj.length
    if(chain<rmObj.length){
      chain=rmObj.length;
    }
    hide.play()
    rmObj=[];
  });
  document.getElementById("canvas").addEventListener('touchend', () => {
    const query = Query.point(Composite.allBodies(engine.world), mouse.position)
    console.log(query);
    //console.log(query[0]["label"]);
    target=""
    addChum(rmObj.length);
    World.remove(engine.world, rmObj);
    total+=rmObj.length
    if(chain<rmObj.length){
      chain=rmObj.length;
    }
    hide.play()
    rmObj=[];
  });

  setTimeout("finishGame()", "30000")
  setTimeout("World.remove(engine.world, floar)", "32000")
  setTimeout("result.play()", "34000")
  setTimeout("showScore()", "36000")
}



function finishGame(){
  console.log("finish")
  bgm.pause()
  whistle.play()
  addChum(75)
}

function showScore(){

//  document.getElementById("canvas").style.display="none";
  document.getElementById("score").style.display="flex";

  document.getElementById("total").innerHTML=total;
  document.getElementById("maxChain").innerHTML=chain;
  var luck=["大吉","中吉","小吉","吉"]
  document.getElementById("luck").innerHTML=luck[Math.floor(luck.length*Math.random())];

}

function Howto(){

  document.getElementById("hide").style.visibility="hidden";
  Array.from(document.getElementsByClassName("movie")).forEach(function( elem ) {
    elem.style.display="flex";
  });
  document.getElementById("howto").style.display="flex";
  var elems=document.getElementsByClassName("popupHide")
  Array.from( elems ).forEach(function( elem ) {
    elem.style.display="none";
  });
}
