import Phaser from "phaser";

const config = {
  // WebGL (Web graphics library) JS Api for rendering 2D and 3D graphics
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    // Arcade physics plugin, manages physics simulation
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const PIPES_TO_RENDER = 4;

let bird = null;
let upperPipe = null;
let lowerPipe = null;
let pipeHorizontalDistance = 0;

const pipeVerticalDistanceRange = [150, 250];

const flapVelocity = 300;
const initialBirdPosition = {
  x: config.width * 0.1,
  y: config.height / 2,
};

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("bird", "assets/bird.png");
  this.load.image("pipe", "assets/pipe.png");
}

function create() {
  this.add.image(0, 0, "sky").setOrigin(0);

  bird = this.physics.add
    .sprite(initialBirdPosition.x, initialBirdPosition.y, "bird")
    .setOrigin(0);
  bird.body.gravity.y = 400;

  for (let i = 0; i < PIPES_TO_RENDER; i++) {
    pipeHorizontalDistance += 400;
    let pipeVerticalDistance = Phaser.Math.Between(
      ...pipeVerticalDistanceRange
    );
    let pipeVerticalPosition = Phaser.Math.Between(
      0 + 20,
      config.height - 20 - pipeVerticalDistance
    );
    upperPipe = this.physics.add
      .sprite(pipeHorizontalDistance, pipeVerticalPosition, "pipe")
      .setOrigin(0, 1);
    lowerPipe = this.physics.add
      .sprite(upperPipe.x, upperPipe.y + pipeVerticalDistance, "pipe")
      .setOrigin(0, 0);

    upperPipe.body.velocity.x = -200;
    lowerPipe.body.velocity.x = -200;
  }

  this.input.on("pointerdown", function () {
    console.log("pressing mouse button");
  });

  this.input.keyboard.on("keydown-SPACE", flap);
}

function update(time, delta) {
  if (bird.y > config.height || bird.y < 0 - bird.height) {
    restartBirdPosition();
  }
}

function restartBirdPosition() {
  bird.x = initialBirdPosition.x;
  bird.y = initialBirdPosition.y;
  bird.body.velocity.y = 0;
}

function flap() {
  bird.body.velocity.y = -flapVelocity;
}

new Phaser.Game(config);
