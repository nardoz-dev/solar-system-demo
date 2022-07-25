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

