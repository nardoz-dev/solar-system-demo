import * as THREE from 'three'
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js";
import { OrbitControls } from 'https://unpkg.com/three@0.140.1/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.140.1/examples/jsm/loaders/GLTFLoader.js'
import { TWEEN } from 'https://unpkg.com/three@0.140.1/examples/jsm/libs/tween.module.min'
import { EffectComposer } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import { LoadingManager } from 'three';
import Stats from 'https://unpkg.com/three@0.140.1/examples/jsm/libs/stats.module';
import { GUI } from 'https://unpkg.com/three@0.140.1/examples/jsm/libs/lil-gui.module.min.js';

// DEFAULT VARIABLES
let scene, scene_2, scene_aux,camera_2,camera_aux;      // Used both for main scene and second scene.
let renderer,canvas; 
let camera = new THREE.PerspectiveCamera();             // To avoid a little bug
let fov, aspect, near,far;                              // camera settings 
let controls, controls_2;                               // controls orbits for the first and second scene
let character;                                          // character (scene 2)
let spotLight;                                          // spotlight (scene 2)

// ANIMATION VARIABLES
let walkForward_l, walkForward_r;

// UI VARIABLES
let main_gui, second_gui, extra_gui;
let controlsButton = [];                                // control gui buttons

// CREATE AND APPLY BLOOM EXPOSURE ON POST PROCESSING 
let renderScene , bloomPass ,bloomComposer;

// DEFAULT FLAG
let flagVolume = false;                     // flag status volume { on : off }
let flagPP = true;                          // flag status PostProcessing set by UI.
let flagShipsAnimation = true;              // flag status for the ships animation (start true)
let flagStop = false;                       // flag status for stop the anim while focus on a specific planet
let flagScene = false;                      // flagScene is used to render the second scene. True : Means the second scene is active False otherwise.

// VARIABLE FOR LOADER
let loadingManager;

// VARIABLE USED FOR THE PHYSIC SCENE
let world,cubeMesh,cubeBody;
let cubeMesh_2,cubeBody_2;
let sphereMesh, sphereMesh_2,sphereMesh_3;
let sphereBody, sphereBody_2,sphereBody_3;

// VARIABLE FOR AUDIO
let listener,sound,audioLoader;

// VARIABLE FOR THE MOUSE PICK INTERACTION
let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();

// SOLAR SYSTEM VARIABLES ********************************************************************************************************************************************************************

// TEXTURES
let sunTexture, mercuryTexture,venusTexture,earthTexture,marsTexture,jupiterTexture,saturnTexture,saturnRingTexture,uranusTexture, uranusRingTexture,neptuneTexture,plutoTexture,orbitTexture;

// PLANET AND MOONS
let sun, mercury,venus,earth,mars,jupiter,saturn,uranus,neptune,pluto;
let moon, phobos,deimos;
let objects = [];           // arrays of our all planets used for the interaction.

// SHIP OR UFO TO SPAWN
let ufo = new THREE.Object3D();
let space_ship = new THREE.Object3D();
let ISS = new THREE.Object3D();
let universeObjects = [];
let jumpAngle = 0;
let jumpHeight = 20;


// ANGLE FOR THE ORBIT
let orbitAngleEarth = - 41.280000000000003;
let orbitAngleMercury = 27.109942114712243;
let orbitAngleVenus =  3.5188146928204262;
let orbitAngleMars = - 1.1648146928204395;
let orbitAngleJupiter = - 4.280000000000003;
let orbitAngleUranus =  4.398814692820427;
let orbitAngleSaturn = - 0;
let orbitAngleNeptune =  4.280000000000003;
let orbitAnglePluto =  1.481629385640862;

// VARIABLE FOR THE ZOOM IN - OUT OF THE PLANET
let size = new THREE.Vector3();
let center = new THREE.Vector3();
let box = new THREE.Box3();





// HANDLE THE EXECUTION WORKFLOW ( START THE DEMO FROM HTML AND OTHER SETTINGS LIKE SOUND )
function handlerMain(){
    document.getElementById('button_view').onclick = () => {
        document.getElementById('container').style.display='none';
        document.getElementById('button_volume').style.display='none';
        document.getElementById('loading-screen').style.display='grid';
        document.getElementById('info').style.display="block";
        init();
    }

    listener = new THREE.AudioListener();
    camera.add(listener);
    sound = new THREE.Audio( listener );
    audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'assets/music/NothingElseMatters.ogg', function ( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop ( true );
        sound.setVolume( 0.5 );    
    })

    document.getElementById('button_volume').onclick = () => {
        if( flagVolume ){
            if(sound.isPlaying){
              sound.pause();
            }
            flagVolume = false;
            document.getElementById('button_volume').innerHTML = '<i class="material-icons" style="color:#000000;font-size: 2.6rem;">volume_off</i>';
          }else{
            flagVolume = true;
            sound.play();
            document.getElementById('button_volume').innerHTML = '<i class="material-icons" style="color:#000000;font-size: 2.6rem;">volume_up</i>';
          }
    }
     
}

function pauseVolumeFromUI(){
    if( flagVolume ){
        if(sound.isPlaying){
          sound.pause();
        }
        flagVolume = false;
      }else{
        flagVolume = true;
        sound.play();
      }
}


// LOADING PART     *****************************************************************************************************************************************************************************
function loadPlanetTextures(loadingManager){
    sunTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/sun.jpg" );
    mercuryTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/mercury.jpg" );
    venusTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/venus.jpg" );
    earthTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/earth.jpg" );
    marsTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/mars.jpg" );
    jupiterTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/jupiter.jpg" );
    saturnTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/saturn.jpg" );
    saturnRingTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/saturn_ring.png" );
    uranusTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/uranus.jpg" );
    uranusRingTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/uranus_ring.png" );
    neptuneTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/neptune.jpg" );
    plutoTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/pluto.jpg" );
    orbitTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/orbitTexture3.jpg" );
}

function loadBackground(loadingManager){
    const loader = new THREE.CubeTextureLoader(loadingManager);
    const texture = loader.load([
        'assets/background/t_neg-x.png',
        'assets/background/t_pos-x.png',    
        'assets/background/t_pos-y.png',
        'assets/background/t_neg-y.png',
        'assets/background/t_pos-z.png',
        'assets/background/t_neg-z.png',
    ]);
    scene.background = texture;
}
// *******************************************************************************************************************************************************************************     LOADING PART END


// CUSTOM UI   ****************************************************************************************************************************************************************************************
//FPS AND OTHER STATS
const stats = Stats()
document.body.appendChild(stats.dom);

function buildGui(flag){

    // FLAG SWITCH ON WHAT KIND OF GUI WE WANT TO BUILD - TRUE : MAIN GUID - FALSE : SECOND GUI 
    if(flag){
        main_gui = new GUI( { width: 410 });
        //const mainpanel = main_gui.addFolder( 'Solar System Settings' );              */          STILL IN DEV            /*
        const panel1 = main_gui.addFolder( 'Planets' );
        const panel2 = main_gui.addFolder( 'Others' );
        const panel3 = main_gui.addFolder( 'Post Processing' );
        const params = {
            'Spawn/Remove Objects' : flagShipsAnimation,
            Mercury : function () { 
                handlerControls(controlsButton,0);
                goInDetails("mercury");
            },
            Venus : function () { 
                handlerControls(controlsButton,1);
                goInDetails("venus");
            },
            Earth : function () { 
                handlerControls(controlsButton,2);
                goInDetails("earth");
            },
            Mars : function () {  
                handlerControls(controlsButton,3);
                goInDetails("mars");
            },
            Jupiter : function () { 
                handlerControls(controlsButton,4);
                goInDetails("jupiter");
            },
            Saturn : function () { 
                handlerControls(controlsButton,5);
                goInDetails("saturn");
            },
            Uranus : function () {
                handlerControls(controlsButton,6);
                goInDetails("uranus");
            },
            Neptune : function () { 
                handlerControls(controlsButton,7);
                goInDetails("neptune");
            },
            Pluto : function () { 
                handlerControls(controlsButton,8);
                goInDetails("pluto");
            },
            GoBack : function(){
                handlerControls(controlsButton,9);
                goInDetails("none");         
            },
            //postprocessing handle
            Enable : true,
            'bloom strenght' : 0,
            'bloom radius' : 0.8,
            'bloom threshold' : 0,
            //sounds
            Sound : flagVolume,
        };
    
        panel2.add(params, 'Spawn/Remove Objects' ).onChange( function( val ) {
            spawnObjects(val);
        });
        controlsButton.push(panel1.add( params, 'Mercury' ) );
        controlsButton.push(panel1.add( params, 'Venus' ) );
        controlsButton.push(panel1.add( params, 'Earth' ) );
        controlsButton.push(panel1.add( params, 'Mars' ) );
        controlsButton.push(panel1.add( params, 'Jupiter' ) );
        controlsButton.push(panel1.add( params, 'Saturn' ) );
        controlsButton.push(panel1.add( params, 'Uranus' ) );
        controlsButton.push(panel1.add( params, 'Neptune' ) );
        controlsButton.push(panel1.add( params, 'Pluto' ) );
        controlsButton.push( panel1.add( params, 'GoBack' ) );
        controlsButton[9].disable();                                  //disable goback button. avaiable only after click.
        panel2.add( params, 'Sound').onChange( function(){
            pauseVolumeFromUI();
        });
    
        panel3.add( params, 'Enable').onChange( function( val ){
            if(val){
                flagPP = val;
            }else{
                flagPP = val;
            }
        });
        panel3.add( params, 'bloom strenght', 0.0, 5, 0.001 ).onChange ( function( val ){
            bloomPass.strength = val;
            bloomComposer.removePass(renderScene);
            bloomComposer.removePass(bloomPass);
            bloomComposer.addPass(renderScene);
            bloomComposer.addPass(bloomPass);
        });
        panel3.add( params, 'bloom radius', 0.0, 3, 0.01 ).onChange ( function( val ){
            bloomPass.radius = val;
            bloomComposer.removePass(renderScene);
            bloomComposer.removePass(bloomPass);
            bloomComposer.addPass(renderScene);
            bloomComposer.addPass(bloomPass);
        });
        panel3.add( params, 'bloom threshold', 0.0, 2, 0.01 ).onChange ( function( val ){
            bloomPass.threshold = val;
            bloomComposer.removePass(renderScene);
            bloomComposer.removePass(bloomPass);
            bloomComposer.addPass(renderScene);
            bloomComposer.addPass(bloomPass);
        });
    
        panel2.close();
        panel3.close(); 
        showGui(true);
    }
    else{
        second_gui = new GUI( { width: 410 });
        const property = {
            'Light Color': spotLight.color.getHex(),
            Intensity: spotLight.intensity,
            Distance: spotLight.distance,
            Angle: spotLight.angle,
            Penumbra: spotLight.penumbra,
            Decay: spotLight.decay,
            Focus: spotLight.shadow.focus,
            Snow : false
        };
    
        second_gui.addColor( property, 'Light Color' ).onChange( function ( val ) {
            spotLight.color.setHex( val );
        } );

        second_gui.add( property, 'Intensity', 0, 2 ).onChange( function ( val ) {
            spotLight.intensity = val;
        } );
    
        second_gui.add( property, 'Distance', 50, 200 ).onChange( function ( val ) {
            spotLight.distance = val;
        } );
    
        second_gui.add( property, 'Angle', 0, Math.PI / 3 ).onChange( function ( val ) {
            spotLight.angle = val;
        } );
    
        second_gui.add( property, 'Penumbra', 0, 1 ).onChange( function ( val ) {
            spotLight.penumbra = val;
        } );
    
        second_gui.add( property, 'Decay', 1, 2 ).onChange( function ( val ) {
            spotLight.decay = val;
        } );
    
        second_gui.add( property, 'Focus', 0, 1 ).onChange( function ( val ) {
            spotLight.shadow.focus = val;
        } );

        extra_gui = new GUI( { autoPlace: false } );
        const params = {
            Back: back,
        }
        extra_gui.add( params, 'Back' );

        const moveGUI = document.getElementById('moveGUI');
        moveGUI.appendChild(extra_gui.domElement);

        showGui(false);
    }

}
function back(){
    document.getElementById('descriptionContainer').style.display='block';
    showGui(true);
    flagScene = false;           //set the flagScene to true, for correct render
    scene = scene_aux;
    scene_aux = scene_2;
    camera = camera_aux;
    camera_aux = camera_2;
}
function handlerControls(buttons, id){
    for( let i = 0; i < buttons.length; i++)
        if( i == id )
            buttons[i].disable();
        else   
            buttons[i].enable();
}
function showGui(flag){
    if(flag){
        main_gui.show();
        if(second_gui && extra_gui){
            second_gui.hide();
            extra_gui.hide();
        }
    }else{
        main_gui.hide();
        second_gui.show();
        extra_gui.show();
    }
}

// *******************************************************************************************************************************************************************************      CUSTOM UI END




// SOLAR SYSTEM CREATION PART      *****************************************************************************************************************************************************************************
function createPlanet(size, texture, position, name, ring) {
    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: texture                });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.name = name;
    mesh.name = name;
    obj.add(mesh);
    if(ring) {
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32);
        const ringMat = new THREE.MeshBasicMaterial({
            map: (ring.texture),
            side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        mesh.add(ringMesh);
        ringMesh.position.x = 0;
        ringMesh.rotation.x = -0.5 * Math.PI;
    }
    
    scene.add(obj);
    objects.push(mesh);
    mesh.position.x = position;

    createEllipseOrbit(position);

    return {mesh, obj}
}
function createMoon(size, texture, position,segmentsW,segmentsH){
    const geo = new THREE.SphereGeometry(size, segmentsW, segmentsH);
    const mat = new THREE.MeshStandardMaterial({
        map: texture                });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    mesh.position.x = position;
    obj.add(mesh);

    return {mesh,obj}

}
function createEllipseOrbit(distance){
    const curve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        distance, (distance/2),           // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );
    
    const points = curve.getPoints( 80 );
    const orbit = new THREE.BufferGeometry().setFromPoints( points );
    
    let orbitMat = new THREE.MeshBasicMaterial({
        map: (orbitTexture),
        side: THREE.DoubleSide
    });
    
    // Create the final object to add to the scene
    const ellipse = new THREE.Line( orbit, orbitMat );
    
    ellipse.rotation.x=-0.5 * Math.PI;
    scene.add(ellipse);
}
// DRAWN PLANET IN A SOLAR SYSTEM POINT OF VIEW ( WITH ORBIT ).
function bigBang(){

    // SUN 
    const sunGeo = new THREE.SphereGeometry(16, 30, 30);
    const sunMat = new THREE.MeshBasicMaterial({
        map: sunTexture
    });
    sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    /* ADDING SPHERE AS PLANET */
    mercury = createPlanet(3.2, mercuryTexture, 56,"mercury");
    venus = createPlanet(5.8, venusTexture, 88,"venus");
    earth = createPlanet(6, earthTexture, 124,"earth");         
    mars = createPlanet(4, marsTexture, 156,"mars");
    jupiter = createPlanet(12, jupiterTexture, 200,"jupiter");
    saturn = createPlanet(10, saturnTexture, 276, "saturn", {
        innerRadius: 10,
        outerRadius: 20,
        texture: saturnRingTexture
    });
    uranus = createPlanet(7, uranusTexture, 352, "uranus", {
        innerRadius: 7,
        outerRadius: 12,
        texture: uranusRingTexture
    });
    neptune = createPlanet(7, neptuneTexture, 400, "neptune");
    pluto = createPlanet(2.8, plutoTexture, 432, "pluto");

    /* ADDING SOME MOON ON THE PLANET */ 
    moon = createMoon(2,plutoTexture,10,20,20);
    earth.mesh.add(moon.mesh);
    phobos = createMoon(1,plutoTexture,6,5,6);
    deimos = createMoon(1.5,plutoTexture,-7,10,10);
    deimos.mesh.position.y=3;
    mars.mesh.add(phobos.mesh);
    mars.mesh.add(deimos.mesh);

    spawnObjects(flagShipsAnimation);

    

}
// *******************************************************************************************************************************************************************************     SOLAR SYSTEM CREATION PART END


// SPAWN OBJECT ON SOLAR SYSTEM          ****************************************************************************************************************************************************************************
function spawnObjects(flag){
    if(flag){
        const loader1 = new GLTFLoader();
        loader1.load( 'assets/models/space_UFO.glb', ( ufos ) =>  {    
            ufos.scene.position.set(0,40,0);
            ufo.add( ufos.scene.clone());
            universeObjects.push(ufo);
        });
        const loader2 = new GLTFLoader();
        loader2.load( 'assets/models/space_SHIP.glb', ( ship ) =>  {    
            ship.scene.position.set(0,40,0);
            space_ship.add(ship.scene.clone());
            universeObjects.push(space_ship);
        });
        const loader3 = new GLTFLoader();
        loader3.load( 'assets/models/space_ISS.glb', ( iss ) =>  {    
            iss.scene.position.set(0,40,0);
            ISS.add(iss.scene.clone());
            universeObjects.push(ISS);
        });

        space_ship.position.set(0,20,0);
        scene.add(space_ship);
        scene.add(ufo);
        ISS.position.set(10,10,0);
        ISS.scale.set(0.025,0.025,0.025);
        earth.mesh.add(ISS);
        flagShipsAnimation = true;
    }
    else{
        universeObjects.forEach( function ( obj ){
            scene.remove(obj);
            earth.mesh.remove(ISS);
        });
        flagShipsAnimation = false;
    }
}
// *******************************************************************************************************************************************************************************        SPAWN OBJECT ON SOLAR SYSTEM END

// CAMERA ZOOM ANIMATION          ****************************************************************************************************************************************************************************
function goInDetails(name){
    flagStop = true;
    let obj_selected = scene.getObjectByName(name);
    if (name == "none"){
        document.getElementById('descriptionContainer').style.display='none';
        fitCameraToSelection(camera, controls, scene, 0.4);
        flagStop = false;
    }
    else{     
        document.getElementById('descriptionContainer').style.display='none'; 
        objects.forEach(function(elem){
            if (elem.name == obj_selected.name)
                obj_selected = elem;
        })
        fitCameraToSelection(camera, controls, obj_selected, 1.5);
    }
    
    
}
function fitCameraToSelection( camera,controls,object,fitOffset){
    box.makeEmpty();
    box.expandByObject(object);
    box.getSize(size);
    box.getCenter(center);
      
    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
    const direction = controls.target.clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);
    let to = {
        x: center.x - direction.x + fitOffset,
        y: center.y - direction.y + fitOffset,
        z: center.z - direction.z + fitOffset
    };
    let zoomAnimation = new TWEEN.Tween(camera.position)
        .to(to, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function(){
            camera.lookAt(center);
            camera.near = distance / 100;
            camera.far = distance * 100;
            controls.maxDistance = distance * 10;
            controls.target.copy(center);
        })
        .onComplete(function () { 
            camera.position.copy(controls.target).sub(direction);
            controls.update()  
            showDetails(object.name);        
        })
        .start()
    ;
}
function showDetails(name){
    if(name){
        let namePlanet = document.querySelector('#namePlanet');
        let descriptionInfo = document.querySelector('#descriptionInfo');
        let description;
        
        //ADDING THE CORRECT NAMED TO HTML TAG 
        namePlanet.innerHTML = name.toUpperCase();
        document.getElementById('descriptionContainer').style.display='block';
        switch(name){
            case 'mercury':
                description = "Mercury is the closest planet to the sun. It rotates slowly and It is the smallest planet in the solar system. It has no moons, no rings, and an atmosphere so thin that scientists classify it as an exosphere."
                break;
            case 'venus':
                description = "Venus is slightly smaller than Earth. Because of its relative proximity to Earth, it is the largest planet seen in the night sky.  The density of its atmosphere makes the air pressure at the surface 90 times that of Earth's. The heat and pressure make the planet decidedly inhospitable to life."
                break;
            case 'earth':
                description = "Earth, the third planet from the sun and the largest terrestrial planet, is the only planet known to host living beings and the only one known to have liquid water on its surface. The atmosphere is crucial to Earth's ability to support life. The surface of the earth is mostly water."
                break;
            case 'mars':
                description = "The red color of the surface comes from iron oxide or rust in the soil. Mars experiences frequent planet-wide wind storms. Some of the surface features of Mars hint to the possibility that water previously existed on the planet and may still flow under the surface."
                break;
            case 'jupiter':
                description = "Is the first of the gas giant planets. Its characteristic colored cloud patterns are caused by enormous, swirling storms in its atmosphere. The largest and most distinctive of the storms, the Great Red Spot, is larger than Earth. Jupiter has 63 moons and a faint ring system."
                break;
            case 'saturn':
                description = "Saturn it's most impressive feature as seen from afar is an extensive and complex ring system. The rings orbit the planet in a thin band about a mile thick. The interior of Saturn, like Jupiter, is made of mostly hydrogen and helium."
                break;
            case 'uranus':
                description = "While most planets spin on their axis with a slight tilt, the ice giant Uranus spins on an axis parallel to its orbit. This cold planet is four times the size of Earth and it has a faint ring system and 27 moons in its orbit."
                break;
            case 'neptune':
                description = "The blue planet Neptune is a very cold place. Because of its distance from the sun and its large orbit, one year on Neptune is 165 Earth years. Like all the outer planets, Neptune, like Uranus, has a diameter roughly four times that of Earth."
                break;
            case 'pluto':
                description = "Once considered the ninth and most distant planet from the sun, is now the largest known dwarf planet in the solar system. In 2006, Pluto was reclassified as a dwarf planet, a change widely thought of as a demotion."
                break;

        }   
        //ADDING THE CORRECT DESCRIPTION INFO TO HTML TAG
        descriptionInfo.innerHTML = description;

        //Enable TestPhysic button - special features !
        
        document.getElementById('testPhysic').onclick = () => {
            document.getElementById('descriptionContainer').style.display='none';           // to leave the box description
            newScene(name);
        }
        
    }
}
// *******************************************************************************************************************************************************************************        CAMERA ZOOM ANIMATION  END

// NEW SCENE ADD-ON FEATURES PHYSIC ******************************************************************************************************************************************************************
let gravity;
function newScene(name){

    //___________________________________________________________________Create new scene and fill it______________________________________________________________________________________
    scene_aux = new THREE.Scene();
    scene_2 = new THREE.Scene();
    scene_2
    {
        const color = 0x333333;
        const intensity = 0.5;
        const light = new THREE.AmbientLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene_2.add(light);
        spotLight = new THREE.SpotLight( 0xffffff, 1.6 );
        spotLight.position.set( -35, 24, -30 );
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.8;
        spotLight.decay = 2;
        spotLight.distance = 200;

        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 512;
        spotLight.shadow.mapSize.height = 512;
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 200;
        spotLight.shadow.focus = 1;
        scene_2.add( spotLight );
    }

    camera_2 = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera_2.position.z = -45;
    camera_2.position.y = 20;
    camera_2.position.x = 0;
    camera_2.lookAt( 0, 0, 0 );

    controls_2 = new OrbitControls(camera_2, canvas);
    controls_2.target.set( 0, 0, 0 );
    controls_2.update();
    //_________________________________________________________________________________________________________________________________________________________________________________________
    
    buildGui(false); //commentato perchè le facciamo costruire insieme dall'init e magari invochiamo la funzione show con il flag.
    //Display the new GUI.
    //showGui(false);

    const loader = new GLTFLoader();
    loader.load( 'assets/models/Character.glb', function ( gltf ){
        character = gltf.scene;
        AnimationManager.primarlySet();
        AnimationManager.idle();
        AnimationManager.greet();
        AnimationManager.walking();
        scene_2.add(character)
    })
    
    //Set the correct gravity based on the type of the focus planet
    switch(name){
        case 'mercury':
            gravity =  3.7;
            break;
        case 'venus':
            gravity = 8.9;
            break;
        case 'earth':
            gravity = 9.8;
            break;
        case 'mars':
            gravity = 3.7;
            break;
        case 'jupiter':
            gravity = 24.8;
            break;
        case 'saturn':
            gravity = 10.4;
            break;
        case 'uranus':
            gravity = 8.9;
            break;
        case 'neptune':
            gravity = 11.2;
            break;
        case 'pluto':
            gravity = 0.62;
            break;
    } 
    spawnPhysicObject(gravity);

    //Save the previus scene to restore it in the future 
    flagScene = true;           //set the flagScene to true, for correct render
    scene_aux = scene;
    scene = scene_2;
    camera_aux = camera;
    camera = camera_2;
}

function spawnPhysicObject(gravity){
    world = new CANNON.World({  gravity: new CANNON.Vec3(0, -gravity, 0)   });

    const normalMaterial = new THREE.MeshNormalMaterial();
    const phongMaterial = new THREE.MeshPhongMaterial();

    const cubeGeometry = new THREE.BoxGeometry( 3, 3, 3 );
    const cubeShape = new CANNON.Box(new CANNON.Vec3( 1.5, 1.5, 1.5 ));

    const sphereGeometry = new THREE.SphereGeometry( 2, 16, 32 );
    const sphereShape = new CANNON.Sphere( 2 );
    let sphereMat1 = new CANNON.Material();
    let sphereMat2 = new CANNON.Material();
    let sphereMat3 = new CANNON.Material();

    // CUBE 1
    cubeMesh = new THREE.Mesh(cubeGeometry, normalMaterial);
    cubeMesh.position.x = 22;
    cubeMesh.position.y = 18;
    cubeMesh.castShadow = true;
    scene_2.add(cubeMesh);
    cubeBody = new CANNON.Body({ mass: 1 });
    cubeBody.addShape(cubeShape);
    cubeBody.position.x = cubeMesh.position.x;
    cubeBody.position.y = cubeMesh.position.y;
    cubeBody.position.z = cubeMesh.position.z;
    world.addBody(cubeBody);

    // CUBE 2
    cubeMesh_2 = new THREE.Mesh(cubeGeometry, normalMaterial);
    cubeMesh_2.position.x = 22;
    cubeMesh_2.position.y = 18;
    cubeMesh_2.castShadow = true;
    scene_2.add(cubeMesh_2);
    cubeBody_2 = new CANNON.Body({ mass: 1 });
    cubeBody_2.addShape(cubeShape);
    cubeBody_2.position.x = cubeMesh_2.position.x;
    cubeBody_2.position.y = cubeMesh_2.position.y;
    cubeBody_2.position.z = cubeMesh_2.position.z;
    world.addBody(cubeBody_2);

    //SPHERE 1
    sphereMesh = new THREE.Mesh(sphereGeometry, normalMaterial);
    sphereMesh.position.x = 20;
    sphereMesh.position.y = 10;
    sphereMesh.position.z = -20;
    sphereMesh.castShadow = true;
    scene_2.add(sphereMesh);

    sphereBody = new CANNON.Body( { mass: 10 } );
    sphereBody.material = sphereMat1;
    sphereBody.addShape(sphereShape);
    sphereBody.linearDamping = 0.01;
    sphereBody.position.x = sphereMesh.position.x;
    sphereBody.position.y = sphereMesh.position.y;
    sphereBody.position.z = sphereMesh.position.z;
    world.addBody(sphereBody);
    //SPHERE 2
    sphereMesh_2 = new THREE.Mesh(sphereGeometry, normalMaterial);
    sphereMesh_2.position.x = 0;
    sphereMesh_2.position.y = 10;
    sphereMesh_2.position.z = -20;
    sphereMesh_2.castShadow = true;
    scene_2.add(sphereMesh_2);

    sphereBody_2 = new CANNON.Body( { mass: 10 } );
    sphereBody_2.material = sphereMat2;
    sphereBody_2.addShape(sphereShape);
    sphereBody_2.linearDamping = 0.01;
    sphereBody_2.position.x = sphereMesh_2.position.x;
    sphereBody_2.position.y = sphereMesh_2.position.y;
    sphereBody_2.position.z = sphereMesh_2.position.z;
    world.addBody(sphereBody_2);
    //SPHERE 3
    sphereMesh_3 = new THREE.Mesh(sphereGeometry, normalMaterial);
    sphereMesh_3.position.x = -20;
    sphereMesh_3.position.y = 10;
    sphereMesh_3.position.z = -20;
    sphereMesh_3.castShadow = true;
    scene_2.add(sphereMesh_3);

    sphereBody_3 = new CANNON.Body( { mass: 10 } );
    sphereBody_3.material = sphereMat3;
    sphereBody_3.addShape(sphereShape);
    sphereBody_3.linearDamping = 0.01;
    sphereBody_3.position.x = sphereMesh_3.position.x;
    sphereBody_3.position.y = sphereMesh_3.position.y;
    sphereBody_3.position.z = sphereMesh_3.position.z;
    world.addBody(sphereBody_3);

    // PLANE DEFINITION
    
    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial);
    planeMesh.rotateX(-Math.PI / 2);
    planeMesh.receiveShadow = true;
    scene_2.add(planeMesh);

    const planeMaterial= new CANNON.Material();
    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body( { mass: 0 , material:planeMaterial } );
    planeBody.addShape(planeShape);
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(planeBody);

    //let mat1_ground = new CANNON.ContactMaterial(planeMaterial, mat1, { friction: 0.1, restitution: 0.9 });
    let mat1_ground = new CANNON.ContactMaterial(planeMaterial, sphereMat1, { friction: 0.2, restitution: 0.2 });
    let mat2_ground = new CANNON.ContactMaterial(planeMaterial, sphereMat2, { friction: 0.2, restitution: 0.4 });
    let mat3_ground = new CANNON.ContactMaterial(planeMaterial, sphereMat3, { friction: 0.2, restitution: 0.6 });
    world.addContactMaterial(mat1_ground);
    world.addContactMaterial(mat2_ground);
    world.addContactMaterial(mat3_ground);

    world.broadphase = new CANNON.NaiveBroadphase();
}

// ************************************************************************************************************************************************************** NEW SCENE ADD-ON FEATURES PHYSIC END


function init(){
    
    // DEFINE SOME PROPERTIES FOR SCENE AND CAMERA
    scene = new THREE.Scene();
    scene
    {
        const color = 0x333333;
        const intensity = 1;
        const light = new THREE.AmbientLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        const pointLight = new THREE.PointLight(0xFFFFFF, 2, 800,2);
        scene.add(pointLight);
    }
    fov = 75;
    aspect = 2;
    near = 0.1;
    far = 100000;
    //camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = -70;
    camera.position.x = 0;
    camera.position.y = 160;
    //camera.position.set(0.8, 1.4, 1.0);

    // Our loading manager - LOAD SOME ASSETS
    loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = function(){
        document.getElementById('loading-screen').style.display='none';
        //Only when all assets are avaiable start rendering the scene
        activeRender();
    }
    loadBackground(loadingManager);
    loadPlanetTextures(loadingManager);

    bigBang();
    buildGui(true);

    // ADD MOUSE EVENT LISTENER
    document.addEventListener('pointermove', onPointerMove );
    document.addEventListener('pointerdown', onPointerDown );

}

// RENDER SCENE WITH PROPERTIES ON HTML BLOCK.
function activeRender(){
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    window.addEventListener( 'resize', onWindowResize, false );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 2, 0 );
    controls.update();
    
    // CREATE POSTPROCESSING EFFECT
    renderScene = new RenderPass( scene, camera );
    bloomPass = new UnrealBloomPass( new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85 );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.8; //intensity of glow
    bloomPass.radius = 0;
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
    
    animate();
      
}

// MAIN ANIMATE FUNCTION ***************************************************************************************************************************************************************
function animate(){
    requestAnimationFrame( animate );
    stats.update()
    TWEEN.update();
    if(!flagScene){
        // Planet self-rotation
        sun.rotateY(0.004);
        mercury.mesh.rotateY(0.004);
        venus.mesh.rotateY(0.002);
        earth.mesh.rotateY(0.02);
        mars.mesh.rotateY(0.018);
        jupiter.mesh.rotateY(0.04);
        saturn.mesh.rotateY(0.038);
        uranus.mesh.rotateY(0.03);
        neptune.mesh.rotateY(0.032);
        pluto.mesh.rotateY(0.008);
        
        if(!flagStop){
            // Planet around sun rotation

            // Earth
            orbitAngleEarth = (orbitAngleEarth - 0.004) % (2 * Math.PI);  
            earth.mesh.position.x = 124 * Math.cos(orbitAngleEarth);
            earth.mesh.position.z = 62 * Math.sin(orbitAngleEarth);

            // Mercury
            orbitAngleMercury = (orbitAngleMercury - 0.016) % (2 * Math.PI);
            mercury.mesh.position.x = 56 * Math.cos(orbitAngleMercury);
            mercury.mesh.position.z = 28 * Math.sin(orbitAngleMercury);

            // Mars
            orbitAngleMars = (orbitAngleMars - 0.012) % (2 * Math.PI);
            mars.mesh.position.x = 156 * Math.cos(orbitAngleMars);
            mars.mesh.position.z = 78 * Math.sin(orbitAngleMars);

            // Venus
            orbitAngleVenus = (orbitAngleVenus - 0.009) % (2 * Math.PI);
            venus.mesh.position.x = 88 * Math.cos(orbitAngleVenus);
            venus.mesh.position.z = 44 * Math.sin(orbitAngleVenus);

            // Jupiter
            orbitAngleJupiter = (orbitAngleJupiter - 0.008) % (2 * Math.PI);
            jupiter.mesh.position.x = 200 * Math.cos(orbitAngleJupiter);
            jupiter.mesh.position.z = 100 * Math.sin(orbitAngleJupiter);

            // Saturn
            orbitAngleSaturn = (orbitAngleSaturn - 0.0024) % (2 * Math.PI);
            saturn.mesh.position.x = 276 * Math.cos(orbitAngleSaturn);
            saturn.mesh.position.z = 138 * Math.sin(orbitAngleSaturn);

            // Uranus
            orbitAngleUranus = (orbitAngleUranus - 0.004) % (2 * Math.PI); 
            uranus.mesh.position.x = 352 * Math.cos(orbitAngleUranus);
            uranus.mesh.position.z = 176 * Math.sin(orbitAngleUranus);

            // Neptune
            orbitAngleNeptune = (orbitAngleNeptune - 0.0099) % (2 * Math.PI); 
            neptune.mesh.position.x = 400 * Math.cos(orbitAngleNeptune);
            neptune.mesh.position.z = 200 * Math.sin(orbitAngleNeptune);

            // Pluto
            orbitAnglePluto = (orbitAnglePluto - 0.0078) % (2 * Math.PI);
            pluto.mesh.position.x = 432 * Math.cos(orbitAnglePluto);
            pluto.mesh.position.z = 216 * Math.sin(orbitAnglePluto);
        }

        if(flagShipsAnimation){
            // Universe Things Animation --------------------------
            // Space-Ship                                                           // USE A DIFFERENT ANGLE BECAUSE WHEN WE STOP THE ANIMATION OF THE PLANE THE ANGLE NEVER CHANGE AND THE SHIP STAY IN THEIR POSITION
            space_ship.position.x = 100 * Math.cos(orbitAngleEarth);
            space_ship.position.z = 100 * Math.sin(orbitAngleEarth);
            space_ship.rotation.y += 0.0025;
            
            // Ufo animation
            ufo.position.x = 100 * Math.cos(-orbitAngleJupiter);
            ufo.position.z = 100 * Math.sin(-orbitAngleJupiter);
            ufo.rotation.y += 0.5;
            jumpAngle = ((jumpAngle + 0.007) % (Math.PI )) -3.14;
            space_ship.position.y = jumpHeight* Math.sin(jumpAngle);
            ufo.position.y = jumpHeight* Math.sin(jumpAngle);
        }

        // Choose by user the PP effect
        if( flagPP && !flagScene )       //flagScene is used to render the second scene. True : Means the second scene is active, so if PP is active &  
            bloomComposer.render();
        else 
            renderer.render ( scene, camera );
    }
    else{
        world.step(1/60);
        // CUBE 1 ANIMATION
        cubeMesh.position.set(cubeBody.position.x, cubeBody.position.y, cubeBody.position.z);
        cubeMesh.quaternion.set(
            cubeBody.quaternion.x,
            cubeBody.quaternion.y,
            cubeBody.quaternion.z,
            cubeBody.quaternion.w
        );

        // CUBE 2 ANIMATION
        cubeMesh_2.position.set(cubeBody_2.position.x, cubeBody_2.position.y, cubeBody_2.position.z);
        cubeMesh_2.quaternion.set(
            cubeBody_2.quaternion.x,
            cubeBody_2.quaternion.y,
            cubeBody_2.quaternion.z,
            cubeBody_2.quaternion.w
        );
        
        // SPHERE 1 ANIMATION
        sphereMesh.position.set(sphereBody.position.x, sphereBody.position.y, sphereBody.position.z);
        sphereMesh.quaternion.set(
            sphereBody.quaternion.x,
            sphereBody.quaternion.y,
            sphereBody.quaternion.z,
            sphereBody.quaternion.w
        );

        // SPHERE 2 ANIMATION
        sphereMesh_2.position.set(sphereBody_2.position.x, sphereBody_2.position.y, sphereBody_2.position.z);
        sphereMesh_2.quaternion.set(
            sphereBody_2.quaternion.x,
            sphereBody_2.quaternion.y,
            sphereBody_2.quaternion.z,
            sphereBody_2.quaternion.w
        );
        // SPHERE 3 ANIMATION
        sphereMesh_3.position.set(sphereBody_3.position.x, sphereBody_3.position.y, sphereBody_3.position.z);
        sphereMesh_3.quaternion.set(
            sphereBody_3.quaternion.x,
            sphereBody_3.quaternion.y,
            sphereBody_3.quaternion.z,
            sphereBody_3.quaternion.w
        );

        renderer.render ( scene, camera );
    }
   
}
// ***************************************************************************************************************************************************************  MAIN ANIMATE FUNCTION END

// CUSTOM LISTENER ****************************************************************************************************************************************************************************

// CALLED EVERYTIME THE WINDOW CHANGES
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onPointerMove( event ){
    pointer.x = ( event.clientX / window.innerWidth )* 2 - 1 ;
    pointer.y = - ( event.clientY / window.innerHeight )* 2 + 1 ;
}
function onPointerDown( event ){
    if( !flagStop ){
        pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
        raycaster.setFromCamera( pointer, camera );
        const intersects = raycaster.intersectObjects( objects, true );
        if (intersects.length > 0 )
            switch( intersects[0].object.name ){
                case 'mercury':
                    handlerControls(controlsButton,0);
                    goInDetails("mercury");
                    break;
                case 'venus':
                    handlerControls(controlsButton,1);
                    goInDetails("venus");
                    break;
                case 'earth':
                    handlerControls(controlsButton,2);
                    goInDetails("earth");
                    break;
                case 'mars':
                    handlerControls(controlsButton,3);
                    goInDetails("mars");
                    break;
                case 'jupiter':
                    handlerControls(controlsButton,4);
                    goInDetails("jupiter");
                    break;
                case 'saturn':
                    handlerControls(controlsButton,5);
                    goInDetails("saturn");
                    break;
                case 'uranus':
                    handlerControls(controlsButton,6);
                    goInDetails("uranus");
                    break;
                case 'neptune':
                    handlerControls(controlsButton,7);
                    goInDetails("neptune");
                    break;
                case 'pluto':
                    handlerControls(controlsButton,8);
                    goInDetails("pluto");
                    break;
            }
    }
}
// ****************************************************************************************************************************************************************************  CUSTOM LISTENER END

handlerMain();

// CLASS THAT HANDLE THE ANIMATION.
class AnimationManager{
    constructor() {}
    static primarlySet(){
        character.scale.set(6,6,6);
        character.rotation.y += 9.8;
        character.position.set(30,0.35,80);

        let arm_r = character.getObjectByName('armr_06');
        let arm_l = character.getObjectByName('arml_017');
        let forearm_r = character.getObjectByName('forearmr_07');
        let forearm_l = character.getObjectByName('forearml_018');
        arm_r.rotation.z = 2.6;
        arm_l.rotation.z = -2.6;
        forearm_r.rotation.z = 0.5;
        forearm_l.rotation.z = -0.5;
        let tigh_r = character.getObjectByName('tighr_028');
        let tigh_l = character.getObjectByName('tighl_031');
        tigh_r.position.z = 1.43;
        tigh_l.position.z = 1.07;
        let leg_r = character.getObjectByName('legr_029');
        let leg_l = character.getObjectByName('legl_032');
        leg_r.rotation.y = -0.2;   
    }
//Not a very idle
    static idle(){
        let head = character.getObjectByName('head_05');
        let chest = character.getObjectByName('chest_03');
        let idleAnimation = new TWEEN.Tween(chest.rotation)
            .to( {x:-0.24},4000)
            .yoyo(true)
            .repeat(Infinity)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
        ;
        let headAnimation = new TWEEN.Tween(head.rotation)
            .to( {x:3.1},4000)
            .yoyo(true)
            .repeat(Infinity)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
        ;
    }
    static greet(){
        let arm_r = character.getObjectByName('armr_06');
        let arm_Animation = new TWEEN.Tween(arm_r.rotation)
            .to( { x:-1.5, z:1.84,}, 2000)
            .delay(10000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onStart(function(){
                walkForward_r.stop();
                walkForward_l.stop();
            })
        ;
        let forearm_r = character.getObjectByName('forearmr_07');
        let greetAnimation = new TWEEN.Tween(forearm_r.rotation)
            .to( { x:1.44}, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
        ; 
        let greetAnimationReverse = new TWEEN.Tween(forearm_r.rotation)
            .to( { x:0.5}, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
        ;

        arm_Animation.chain(greetAnimation);
        greetAnimation.chain(greetAnimationReverse);
        greetAnimationReverse.chain(greetAnimation);
        arm_Animation.start();
    }
    static walking(){
        let walkingAnimation = new TWEEN.Tween(character.position)
            .to({x:0,z:20}, 10000)
            .easing(TWEEN.Easing.Linear.None)
            .start()
        ;
        let leg_r = character.getObjectByName('tighr_028');
        let leg_l = character.getObjectByName('tighl_031');
        walkForward_r = new TWEEN.Tween(leg_r.rotation)
            .to( {x:-3.2}, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
        ;
        walkForward_l = new TWEEN.Tween(leg_l.rotation)
            .to( {x:-2.4}, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
        ;
        let walkForward_r_Reverse = new TWEEN.Tween(leg_r.rotation)
            .to( {x:-2.4}, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
        ;
        let walkForward_l_Reverse = new TWEEN.Tween(leg_l.rotation)
            .to( {x:-3.2}, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
        ;

        walkForward_r.chain(walkForward_r_Reverse);
        walkForward_l.chain(walkForward_l_Reverse);
        walkForward_r_Reverse.chain(walkForward_r);
        walkForward_l_Reverse.chain(walkForward_l);
        walkForward_r.start();
        walkForward_l.start();

        let forearm_l = character.getObjectByName('forearml_018');
        let forearmAnimation = new TWEEN.Tween(forearm_l.rotation)
            .to({x:0.5}, 2000)
            .yoyo(true)
            .repeat(Infinity)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
        ;
    }
}

