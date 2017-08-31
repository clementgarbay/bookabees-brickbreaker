import Phaser from 'phaser'
import config, { baseStyle } from '../config'
import figures from '../figures'
import { gameOver } from '../main'

class Game {
  constructor (game) {
    this.game = game
  }

  preload () {
    this.game.load.image('ball', 'assets/images/ball.png')
    this.game.load.image('brick', 'assets/images/brick.png')
    this.game.load.image('paddle', 'assets/images/paddle.png')
    this.game.load.image('live', 'assets/images/live.png')
    this.game.load.image('background', 'assets/images/bg.png')
  }

  create () {
    // Game configuration
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true
    this.game.stage.backgroundColor = '#fff'
    this.game.add.sprite(0, 0, 'background').scale.set(0.5)
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

    // Init paddle configuration
    this.paddle = this.game.add.sprite(this.game.world.centerX, 500, 'paddle')
    this.paddle.anchor.set(0.5)
    this.game.physics.enable(this.paddle, Phaser.Physics.ARCADE)
    this.paddle.body.collideWorldBounds = true // collide against the World bounds automatically and rebound back
    this.paddle.body.bounce.set(1)
    this.paddle.body.immovable = true

    // Init ball configuration
    this.ball = this.game.add.sprite(this.game.world.centerX, this.paddle.y - 22, 'ball')
    this.ball.anchor.set(0.5)
    this.ball.checkWorldBounds = true // checks if it is within the World bounds each frame
    this.game.physics.enable(this.ball, Phaser.Physics.ARCADE)
    this.ball.body.collideWorldBounds = true // collide against the World bounds automatically and rebound back
    this.ball.body.bounce.set(1)

    // Init bricks configuration
    this.bricks = this.game.add.group()
    this.bricks.enableBody = true
    this.bricks.physicsBodyType = Phaser.Physics.ARCADE

    // Init shared variables
    this.isRunning = false
    this.score = 0
    this.level = 1
    this.lives = config.lives

    // Add bricks to the board game
    this.addBricks()

    // Draw texts
    this.drawScore()
    this.drawLives()
    this.drawIntroText()

    // Add events handlers
    this.game.input.onDown.add(this.startBall, this)
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.startBall, this)
  }

  update () {
    const ballWidth = this.game.cache.getImage('ball').width

    this.movePaddle()

    if (!this.isRunning) {
      this.ball.body.x = this.paddle.x - (ballWidth / 2)
    } else if (this.game.world.height - this.ball.y < 10) { // ball lost (bottom of board game)
      this.ballLost()
    } else { // detect collisions
      this.game.physics.arcade.collide(this.ball, this.paddle, this.ballHitPaddle, null, this)
      this.game.physics.arcade.collide(this.ball, this.bricks, this.ballHitBrick, null, this)
    }
  }

  drawScore () {
    this.scoreText = this.game.add.text(30, this.game.world.height - 60, `Score: ${this.score}`,
      Object.assign({}, baseStyle, {
        font: '20px Arial',
        align: 'left'
      })
    )
  }

  updateScore (scoreIncrement = 1) {
    this.score += scoreIncrement
    this.scoreText.text = `Score: ${this.score}`
  }

  drawLives () {
    this.game.add.sprite(this.game.world.width - 60, this.game.world.height - 59, 'live').scale.set(0.4)
    this.livesText = this.game.add.text(this.game.world.width - 80, this.game.world.height - 60, this.lives,
      Object.assign({}, baseStyle, {
        font: '20px Arial',
        align: 'left'
      })
    )
  }

  updateLives (livesDecrement = 1) {
    this.lives -= livesDecrement
    this.livesText.text = this.lives
  }

  drawIntroText (text = 'Click to start') {
    this.introText = this.game.add.text(this.game.world.centerX, 320, text,
      Object.assign({}, baseStyle, {
        font: '40px Arial'
      })
    )
    this.introText.anchor.set(0.5)
  }

  addBricks () {
    // use the desired figure
    if (this.level === 1) {
      this.addBricksFigure(figures.figure1)
    } else {
      this.addBricksFigure(figures.figure2)
    }
  }

  /**
   * Add bricks from a figure array (15x7)
   *
   * Works with:
   *  - 800px for the width of the board game
   *  - 32px for the width of the brick
   *  - 17px for margin between bricks
   */
  addBricksFigure (figure) {
    const brickMargin = 17
    const brickWidth = 32
    const brickHeight = 16

    if (figure) {
      figure.forEach((line, j) => {
        line.forEach((elem, i) => {
          const x = i * brickWidth + (brickMargin * (i + 1))
          const y = 40 + j * brickHeight + (brickMargin * (j + 1))

          if (elem) {
            const brick = this.bricks.create(x, y, 'brick')
            brick.body.bounce.set(1)
            brick.body.immovable = true
          }
        })
      })
    }
  }

  /**
   * Add bricks to the board game automatically, depending on game width, bricks size, margin
   */
  addBricksAuto () {
    const brickImg = this.game.cache.getImage('brick')
    const nbBricks = Math.floor((this.game.world.width) / (brickImg.width + config.autoBrickMargin))

    Array.from(Array(config.autoNbBrickLines).keys()).forEach(j => {
      Array.from(Array(nbBricks).keys()).forEach(i => {
        const x = i * brickImg.width + (config.autoBrickMargin * (i + 1))
        const y = 40 + j * brickImg.height + (config.autoBrickMargin * (j + 1))
        const brick = this.bricks.create(x, y, 'brick')
        brick.body.bounce.set(1)
        brick.body.immovable = true
      })
    })
  }

  movePaddle () {
    // Use the mouse position
    this.paddle.x = this.game.input.x

    if (this.paddle.x < 40) this.paddle.x = 40
    if (this.paddle.x > this.game.world.width - 40) this.paddle.x = this.game.world.width - 40
  }

  startBall () {
    if (!this.isRunning) {
      this.isRunning = true
      this.ball.body.velocity.x = 0  // ball starting velocity
      this.ball.body.velocity.y = -300
      this.ball.animations.play('spin')
      this.introText.visible = false
    }
  }

  ballHitPaddle (ball, paddle) {
    if (ball.x < paddle.x) {
      // Ball is on the left-hand side of the paddle
      const diff = paddle.x - ball.x
      ball.body.velocity.x = (-10 * diff)
    } else if (ball.x > paddle.x) {
      // Ball is on the right-hand side of the paddle
      const diff = ball.x - paddle.x
      ball.body.velocity.x = (10 * diff)
    } else {
      // Ball is perfectly in the middle
      ball.body.velocity.x = 2 + Math.random() * 8
    }
  }

  ballHitBrick (ball, brick) {
    // Remove the brick
    brick.kill()

    // Increment the score
    this.updateScore()

    if (this.bricks.countLiving() === 0) {
      // Update score (+100 for each level)
      this.updateScore(100)

      // Update intro text
      this.drawIntroText('Next Level')

      // Move the ball back to the paddle
      this.ball.body.velocity.set(0)
      this.resetBall()

      this.isRunning = false
      this.level++ // next level

      // Add new bricks
      this.addBricks()

      // Bring the bricks back
      // this.bricks.callAll('revive')
    }
  }

  ballLost () {
    // Decrement lives counter
    this.updateLives()

    if (this.lives === 0) {
      gameOver(this.score)
    } else {
      this.resetBall()
      this.isRunning = false
    }
  }

  resetBall () {
    const paddleImg = this.game.cache.getImage('paddle')
    this.ball.reset(this.paddle.x + paddleImg.width / 2, this.paddle.y - 22)
    this.ball.animations.stop()
  }
}

export default Game
