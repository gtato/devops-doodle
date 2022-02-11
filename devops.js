var instruction;
var engine;
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Composites = Matter.Composites,
    Events = Matter.Events,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Composite = Matter.Composite,
    Common = Matter.Common,
    Bodies = Matter.Bodies;

var engine = Engine.create();
var world = engine.world;

var intervalID;
var tools;
var walls;
// var imgPath = 'custom_js/img/';
var imgPath = './img/'

var canvasWidth = 500
var canvasHeight = 400 
var platformHeight = 380
var zoom = 1.3


var renderWidth = zoom * canvasWidth
var renderHeight = zoom * canvasHeight

function devops() {
    
    // create renderer
    var render = Render.create({
        element: document.getElementById('here'),
        engine: engine,
        options: {
            id: 'mycanvas',
            width: canvasWidth,
            height: canvasHeight,
            // showVelocity: true,
            wireframes: false,
            background: '#161616'
        },        
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var gcp = Bodies.rectangle(renderWidth/2, platformHeight, 360, 52, { isStatic: true, chamfer: 10, 
        render: {  strokeStyle: 'blue', fillStyle: 'red', sprite: { texture: imgPath+'gcp.png'}} }),
        size = 50,
        counter = -1;

    var k8s = Bodies.polygon(getRandomX(), 30, 7, 51, { render:{sprite: { texture: imgPath+'kubernetes.png'}}});

    var nginx = Bodies.polygon(getRandomX(), 30, 6, 35, { render:{sprite: { texture: imgPath+'nginx.png'}}});
    var redis = Bodies.polygon(getRandomX(), 30, 6, 30, { render:{sprite: { texture: imgPath+'redis.png'}}});
    
    var istio = Bodies.rectangle(getRandomX(), 60, 60, 60, { render:{sprite: { texture: imgPath+'istio.png'}}});
    var rke = Bodies.rectangle(getRandomX(), 60, 70, 57, { render:{sprite: { texture: imgPath+'rke.png'}}});
    var rancher = Bodies.rectangle(getRandomX(), 60, 70, 70, { render:{sprite: { texture: imgPath+'rancher.png'}}});
    var rabbit = Bodies.rectangle(getRandomX(), 60, 30, 30, { render:{sprite: { texture: imgPath+'rabbitmq.png'}}});
    var kafka = Bodies.rectangle(getRandomX(), 60, 40, 40, { render:{sprite: { texture: imgPath+'kafka.png'}}});
    var docker = Bodies.rectangle(getRandomX(), 60, 60, 50, { render:{sprite: { texture: imgPath+'docker.png'}}});
    var jenkins = Bodies.rectangle(getRandomX(), 80, 44, 70, { render:{sprite: { texture: imgPath+'jenkins.png'}}});
    var terraform = Bodies.rectangle(getRandomX(), 80, 50, 45, { render:{sprite: { texture: imgPath+'terraform.png'}}});
    var fluentd = Bodies.rectangle(getRandomX(), 80, 60, 50, { render:{sprite: { texture: imgPath+'fluentd.png'}}});
                        
    var prometheus = Bodies.circle(getRandomX(), 60, 20, { render:{sprite: { texture: imgPath+'prometheus.png'}}});
    var harbor = Bodies.circle(getRandomX(), 100, 30, { render:{sprite: { texture: imgPath+'harbor.png'}}});
    var elastic = Bodies.circle(getRandomX(), 100, 30, { render:{sprite: { texture: imgPath+'elastic.png'}}});
    
    var vue = Bodies.polygon(getRandomX(), 60, 3, 40, { render:{sprite: { texture: imgPath+'vue.png'}}});         
    var vault = Bodies.polygon(getRandomX(), 60, 3, 30, { render:{sprite: { texture: imgPath+'vault.png'}}});
    

    tools = [
        k8s,
        nginx,
        istio,
        prometheus,
        vue,
        vault,
        rke,
        redis,
        rancher,
        rabbit,
        kafka,
        docker,
        jenkins,
        terraform,
        harbor,
        fluentd,
        elastic,
    ]

    instruction = Bodies.rectangle(renderWidth/2, 100, 100, 30, 
        { isStatic: true, isSensor: true, render:{ visible: false, sprite: { texture: ''}}})

    borderWidth = 10
    borderLength = renderWidth+120
    opts = {isStatic: true, render: {fillStyle: 'white', strokeStyle: 'white', lineWidth: 3}}
    walls = [
        Bodies.rectangle(renderWidth/2, renderHeight, borderLength, borderWidth, opts), //floor
        Bodies.rectangle(renderWidth/2, 0, borderLength, borderWidth, opts), //ceiling
        Bodies.rectangle(renderWidth, renderWidth/2, borderWidth, borderLength, opts), //right
        Bodies.rectangle(0, renderWidth/2, borderWidth, borderLength, opts) //left
    ]

    var objs = [gcp, instruction].concat(tools).concat(walls)
    
    Composite.add(world, objs);

    Events.on(engine, 'beforeUpdate', function(event) {
        counter += 0.015;
        if (counter < 0) 
            return;
        var px = renderWidth/2 + 100 * Math.sin(counter);

        // gcp is static so must manually update velocity for friction to work
        Body.setVelocity(gcp, { x: px - gcp.position.x, y: 0 });
        Body.setPosition(gcp, { x: px, y: gcp.position.y });
    });
  

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Composite.add(world, mouseConstraint);
    Events.on(mouseConstraint, 'enddrag', function(event) {
        if(isTool(event.body) && isFloorEmpty()){
            startCounter();
        }
        console.log(event.body.position)
    });

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {min: {x: 0, y: 0}, max: {x: renderWidth, y: renderHeight}});

    bringToolBackLoop();


    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

var count = 10
function startCounter()
{
    stopCounter();
    intervalID = setInterval(function(){
        if(count >= 0){
            countTxt = count
            if(count == 0) countTxt = 'congrats'
             
            instruction.render.visible = true
            instruction.render.sprite.texture = imgPath+countTxt+'.png'
            count --
            if(!isFloorEmpty()){
                stopCounter()
            }
        }else{
            stopCounter();
            shakeScene();
        }

    }, 1000);
       
}

function stopCounter(){
    clearInterval(intervalID);
    instruction.render.visible = false
    count = 10
}

function shakeScene() {
    var bodies = Composite.allBodies(engine.world);

    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];

        if (!body.isStatic) {
            var forceMagnitude = 0.04 * body.mass;

            Body.applyForce(body, body.position, { 
                x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
                y: -forceMagnitude + Common.random() * -forceMagnitude
            });
        }
    }
}

function isFloorEmpty(){
    empty = true
    tools.forEach(element => {
        if(element.position.y > platformHeight+10){
            empty = false
            return
        }
    });
    return empty;
}

function isTool(drag){
    tool = false
    tools.forEach(element => {
        if(element.id == drag.id){
            tool = true
            return
        }
    });
    return tool;
}

function bringToolBackLoop(){
    var tolerance = 30;   
    setInterval(function(){
        tools.forEach(element => {
            if(element.position.y > renderHeight  + tolerance||
               element.position.y < 0  - tolerance ||
               element.position.x > renderWidth + tolerance||
               element.position.x < 0 - tolerance
               ){
                Body.setPosition(element, { x: 50, y: 50 });
                Body.setVelocity(element, { x: 0, y: 0 });
            }
        });
    }, 2000)
}

function getRandomX() {
  return Math.floor(Math.random() * canvasWidth);
}

devops();
