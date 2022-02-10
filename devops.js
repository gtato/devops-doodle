


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
var imgPath = './img/'

function devops() {
    
    // create renderer
    var render = Render.create({
        element: document.getElementById('here'),
        engine: engine,
        options: {
            id: 'mycanvas',
            width: 500,
            height: 400,
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
    var gcp = Bodies.rectangle(400, 500, 360, 52, { isStatic: true, chamfer: 10, 
        render: {  strokeStyle: 'blue', fillStyle: 'red', sprite: { texture: imgPath+'gcp.png'}} }),
        size = 50,
        counter = -1;

    var k8s = Bodies.polygon(50, 30, 7, 51, { render:{sprite: { texture: imgPath+'kubernetes.png'}}});

    var nginx = Bodies.polygon(50, 30, 6, 35, { render:{sprite: { texture: imgPath+'nginx.png'}}});
    var redis = Bodies.polygon(100, 30, 6, 30, { render:{sprite: { texture: imgPath+'redis.png'}}});
    
    var istio = Bodies.rectangle(100, 60, 60, 60, { render:{sprite: { texture: imgPath+'istio.png'}}});
    var rke = Bodies.rectangle(150, 60, 70, 57, { render:{sprite: { texture: imgPath+'rke.png'}}});
    var rancher = Bodies.rectangle(150, 60, 70, 70, { render:{sprite: { texture: imgPath+'rancher.png'}}});
    var rabbit = Bodies.rectangle(650, 60, 30, 30, { render:{sprite: { texture: imgPath+'rabbitmq.png'}}});
    var kafka = Bodies.rectangle(700, 60, 40, 40, { render:{sprite: { texture: imgPath+'kafka.png'}}});
    var docker = Bodies.rectangle(750, 60, 60, 50, { render:{sprite: { texture: imgPath+'docker.png'}}});
    var jenkins = Bodies.rectangle(700, 80, 44, 70, { render:{sprite: { texture: imgPath+'jenkins.png'}}});
    var terraform = Bodies.rectangle(750, 80, 50, 45, { render:{sprite: { texture: imgPath+'terraform.png'}}});
    var fluentd = Bodies.rectangle(700, 80, 60, 50, { render:{sprite: { texture: imgPath+'fluentd.png'}}});
                        

    var prometheus = Bodies.circle(650, 60, 20, { render:{sprite: { texture: imgPath+'prometheus.png'}}});
    var harbor = Bodies.circle(700, 100, 30, { render:{sprite: { texture: imgPath+'harbor.png'}}});
    var elastic = Bodies.circle(750, 100, 30, { render:{sprite: { texture: imgPath+'elastic.png'}}});
    

    // var prometheus = Bodies.circle(20, 60, 20);
    
    var vue = Bodies.polygon(750, 60, 3, 40, { render:{sprite: { texture: imgPath+'vue.png'}}});
            
    var vault = Bodies.polygon(740, 60, 3, 30, { render:{sprite: { texture: imgPath+'vault.png'}}});
    // var vaultf = Bodies.polygon(20, 60, 3, 30);
    

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

    instruction = Bodies.rectangle(400, 140, 100, 30, 
        { isStatic: true, isSensor: true, render:{ visible: false, sprite: { texture: ''}}})

    borderWidth = 10
    borderLength = 850
    opts = {isStatic: true, render: {fillStyle: 'white', strokeStyle: 'white', lineWidth: 3}}
    var floor = Bodies.rectangle(400, 620, borderLength, borderWidth, opts)
    var objs = [gcp,
        instruction,
        // walls
        floor,
        Bodies.rectangle(400, -20, borderLength, borderWidth, opts),
        // Bodies.rectangle(400, 600, 800, 20, { isStatic: true }),
        Bodies.rectangle(800, 300, borderWidth, borderLength, opts),
        Bodies.rectangle(0, 300, borderWidth, borderLength, opts)
    ]
    objs = objs.concat(tools)

    Composite.add(world, objs);

    Events.on(engine, 'beforeUpdate', function(event) {
        counter += 0.01;

        if (counter < 0) {
            return;
        }

        var px = 400 + 100 * Math.sin(counter);

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
    mouseConstraint.element = devops;
    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'enddrag', function(event) {
        // var mousePosition = event.mouse.position;
        // console.log('mouseup at ' + mousePosition.x + ' ' + mousePosition.y);
        

        if(isTool(event.body) && isFloorEmpty()){
            console.log('start counter') 
            startCounter();
        }
        // shakeScene(engine);
        console.log('dragend')
    });

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

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
        if(element.position.y > 500){
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


devops();
