import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    this.bird = null;
    this.pipes = null;

    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = "";

    this.isPaused = false;

    this.currentDifficulty = "easy";
    this.difficulties = {
      easy: {
        pipeVerticalDistanceRange: [150, 200],
        pipeHorizontalDistanceRange: [300, 350],
      },
      normal: {
        pipeVerticalDistanceRange: [140, 190],
        pipeHorizontalDistanceRange: [280, 330],
      },
      hard: {
        pipeVerticalDistanceRange: [120, 170],
        pipeHorizontalDistanceRange: [250, 310],
      },
    };
  }

  create() {
    this.currentDifficulty = "easy";
    super.create();
    this.isGameOver = false;
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();

    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("bird", { start: 8, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });

    this.bird.play("fly");
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }

    this.pauseEvent = this.events.on("resume", () => {
      if (this.isGameOver) {
        return;
      }

      if (this.countdownTimedEvent) {
        this.countDownText.setText("");
        this.countdownTimedEvent.remove();
      }

      this.initialTime = 3;
      this.countDownText = this.add
        .text(
          this.screenCenter[0],
          this.screenCenter[1],
          "Fly in: " + String(this.initialTime),
          this.fontOptions,
        )
        .setOrigin(0.5);

      this.countdownTimedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText("Fly in: " + String(this.initialTime));
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText("");
      this.physics.resume();
      this.countdownTimedEvent.remove();
    }
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, "bird")
      .setFlipX(true)
      .setScale(3)
      .setOrigin(0);

    this.bird.setBodySize(this.bird.width, this.bird.height - 8);
    this.bird.body.gravity.y = 600;
    this.bird.setCollideWorldBounds();
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem("bestScore");
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, {
      fontSize: "32px",
      fill: "#000",
    });
    this.add.text(16, 52, `Best Score: ${bestScore || 0}`, {
      fontSize: "18px",
      fill: "#000",
    });
  }

  createPause() {
    this.isPaused = false;
    this.pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setInteractive()
      .setScale(3)
      .setOrigin(1);

    this.pauseButton.on("pointerdown", () => this.launchPauseScene());
  }

  launchPauseScene() {
    this.isPaused = true;
    this.physics.pause();
    this.scene.pause();
    this.scene.launch("PauseScene");
  }

  handleInputs() {
    this.input.on("pointerdown", this.flap, this);
    this.input.keyboard.on("keydown-SPACE", this.flap, this);
  }

  checkGameStatus() {
    if (this.isGameOver) {
      return;
    }

    if (
      this.bird.getBounds().bottom >= this.config.height ||
      this.bird.y <= 0
    ) {
      this.gameOver();
    }
  }

  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(
      ...difficulty.pipeVerticalDistanceRange,
    );
    const pipeVerticalPosition = Phaser.Math.Between(
      20,
      this.config.height - 20 - pipeVerticalDistance,
    );
    const pipeHorizontalDistance = Phaser.Math.Between(
      ...difficulty.pipeHorizontalDistanceRange,
    );

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
  }

  recyclePipes() {
    const tempPipe = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right <= 0) {
        tempPipe.push(pipe);
        if (tempPipe.length === 2) {
          this.placePipe(...tempPipe);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score === 30) {
      this.currentDifficulty = "normal";
    }

    if (this.score === 60) {
      this.currentDifficulty = "hard";
    }
  }

  getRightMostPipe() {
    let rightMostX = 0;

    this.pipes.getChildren().forEach(function (pipe) {
      rightMostX = Math.max(pipe.x, rightMostX);
    });

    return rightMostX;
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem("bestScore");
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem("bestScore", this.score);
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.physics.pause();
    this.bird.setTint(0xe01414);

    this.saveBestScore();

    this.initialTime = 3;
    this.gameOverText = this.add
      .text(
        this.screenCenter[0],
        this.screenCenter[1] - 40,
        "Game Over",
        this.fontOptions,
      )
      .setOrigin(0.5);
    this.countDownText = this.add
      .text(
        this.screenCenter[0],
        this.screenCenter[1],
        "Fly in: " + String(this.initialTime),
        this.fontOptions,
      )
      .setOrigin(0.5);

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.initialTime--;
        this.countDownText.setText("Fly in: " + String(this.initialTime));
        if (this.initialTime <= 0) {
          this.gameOverText.setText("");
          this.countDownText.setText("");
          this.scene.restart();
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  flap() {
    if (this.isPaused) {
      return;
    }
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;
