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
      gravity: {
        y: 400,
      },
      debug: true,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("bird", "assets/bird.png");
}

let bird = null;
let flapVelocity = 300;
let totalDelta = null;

function create() {
  this.add.image(0, 0, "sky").setOrigin(0);

  bird = this.physics.add
    .sprite(config.width * 0.1, config.height / 2, "bird")
    .setOrigin(0);

  this.input.on("pointerdown", function () {
    console.log("pressing mouse button");
  });

  this.input.keyboard.on("keydown-SPACE", flap);
}

function update(time, delta) {}

function flap() {
  bird.body.velocity.y = -flapVelocity;
}

new Phaser.Game(config);
