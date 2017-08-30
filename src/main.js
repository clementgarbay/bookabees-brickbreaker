import Phaser from 'phaser'
import config from './config'
import GameState from './states/game'
import GameOverState from './states/gameover'

// Create Phaser game instance
const game = new Phaser.Game(config.screen.width, config.screen.height, Phaser.AUTO, 'game')

// Add game states
game.state.add('game', GameState)
game.state.add('gameOver', GameOverState)

// Starting state
game.state.start('game')

// Utility functions
export function restartGame () {
  game.state.start('game')
}
export function gameOver (score) {
  game.state.start('gameOver', true, false, { score })
}
