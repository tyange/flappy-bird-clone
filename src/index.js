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
let pipes = null;

const pipeVerticalDistanceRange = [150, 250];
const pipeHorizontalDistanceRange = [500, 550];

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

  pipes = this.physics.add.group();

  for (let i = 0; i < PIPES_TO_RENDER; i++) {
    const upperPipe = pipes.create(0, 0, "pipe").setOrigin(0, 1);
    const lowerPipe = pipes.create(0, 0, "pipe").setOrigin(0, 0);

    placePipe(upperPipe, lowerPipe);
  }

  pipes.setVelocityX(-200);

  this.input.on("pointerdown", function () {
    console.log("pressing mouse button");
  });

  this.input.keyboard.on("keydown-SPACE", flap);
}

function update(time, delta) {
  if (bird.y > config.height || bird.y < 0 - bird.height) {
    restartBirdPosition();
  }

  recyclePipes();
}

function placePipe(uPipe, lPipe) {
  const rightMostX = getRightMostPipe();
  const pipeVerticalDistance = Phaser.Math.Between(
    ...pipeVerticalDistanceRange
  );
  const pipeVerticalPosition = Phaser.Math.Between(
    0 + 20,
    config.height - 20 - pipeVerticalDistance
  );
  const pipeHorizontalDistance = Phaser.Math.Between(
    ...pipeHorizontalDistanceRange
  );

  uPipe.x = rightMostX + pipeHorizontalDistance;
  uPipe.y = pipeVerticalPosition;

  lPipe.x = uPipe.x;
  lPipe.y = uPipe.y + pipeVerticalDistance;
}

function recyclePipes() {
  const tempPipe = [];
  pipes.getChildren().forEach((pipe) => {
    if (pipe.getBounds().right <= 0) {
      tempPipe.push(pipe);
      if (tempPipe.length === 2) {
        placePipe(...tempPipe);
      }
    }
  });
}

// pipes 중에서 x 값이 가장 큰 pipe의 x 값을 추출
// 위의 placePipe 함수에서 rightMostX, 즉 x의 최대값, 제일 마지막에 배치된 pipe의 x 값을 가리킴
function getRightMostPipe() {
  let rightMostX = 0;

  pipes.getChildren().forEach(function (pipe) {
    rightMostX = Math.max(pipe.x, rightMostX);
  });

  return rightMostX;
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
