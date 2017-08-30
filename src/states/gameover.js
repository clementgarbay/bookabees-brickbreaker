import Phaser from 'phaser'
import { baseStyle } from '../config'
import { restartGame } from '../main'

class GameOver {
  constructor (game) {
    this.game = game
  }

  init (params) {
    this.score = (params && params.score) || 0
  }

  preload () {
    this.game.load.image('background', 'assets/images/bg.png')
  }

  create () {
    // Game configuration
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true
    this.game.stage.backgroundColor = '#fff'
    this.game.add.sprite(0, 0, 'background').scale.set(0.5)

    // Add score label
    this.game.add.text(this.game.world.centerX, 80, 'Score', baseStyle).anchor.set(0.5)

    this.game.add.text(this.game.world.centerX, 140, this.score, Object.assign({}, baseStyle, {
      font: '50px Arial'
    })).anchor.set(0.5)

    this.game.add.text(this.game.world.centerX, 300, 'Game over!', Object.assign({}, baseStyle, {
      font: '80px Arial'
    })).anchor.set(0.5)

    this.game.add.text(this.game.world.centerX, 370, 'Click to try again', baseStyle).anchor.set(0.5)

    this.game.input.onDown.add(restartGame, this)
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(restartGame, this)
  }
}

export default GameOver
