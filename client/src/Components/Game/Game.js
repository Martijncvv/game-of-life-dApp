import React from 'react'
import p5 from 'p5'
import '../Game.css'

let size = 50
let square_size = 25

let canvas_size = size * (square_size + 5) + 20
let grid = []
let game_state = false

let gameInfoCallback
let startCoordinates = []
let userCoordinates = []

let startAmount = 0
let totalLivingRecord = 0
let generationsAlive = 0
let totalLiving = 0
let feedbackMessage = 'Setup chosen'
// let feedbackMessage = 'Choose or make setup'

let nodeCoordinates = []
let nodeCoordinatesGrandParent = [[]]
let evenGeneration = true

class Node {
	constructor() {
		this.state = false
		this.new_state = false
		this.neighbours = []
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props)
		this.myRef = React.createRef()
		gameInfoCallback = props.gameInfoCallback
		startCoordinates = props.startCoordinates

		console.log(props)
	}

	Sketch = (p) => {
		p.setup = () => {
			p.background(255)
			p.createCanvas(canvas_size, canvas_size)
			/*
    		Set game settings and create game grid
    		*/
			make_grid()
			// Run draw function with a speed of 5 iterations/sec
			p.frameRate(5)
			console.log('GAME startCoordinates', startCoordinates)

			// Set start pattern
			if (startCoordinates.length > 0) {
				for (let coordinate of startCoordinates) {
					grid[coordinate[0]][coordinate[1]].new_state = true
				}
			}

			startAmount = startCoordinates.length

			change_node_colour()
			p.noLoop()
		}

		p.draw = () => {
			change_states()
			change_node_colour()
			generationsAlive++
		}

		p.mousePressed = () => {
			/*
			Pause/Play game or change node states when user pressed mouse
			*/

			// Get node of mousepress position
			let x_coord = p.round((p.mouseX + 15) / (square_size + 5)) - 1
			let y_coord = p.round((p.mouseY + 15) / (square_size + 5)) - 1

			// Check if user clicked outside grid
			if (
				x_coord > size ||
				(y_coord > size && x_coord > 0) ||
				(y_coord < 0 && x_coord > 0)
			) {
				startAmount = startCoordinates.length

				// Pause game
				if (game_state) {
					feedbackMessage = 'Paused'
					console.log('GAME PAUSE')
					p.noLoop()
				}
				// Play game
				else {
					userCoordinates = nodeCoordinates
					generationsAlive = 0

					feedbackMessage = 'Playing'
					console.log('GAME START')
					p.loop()
				}
				game_state = !game_state
			}

			// Change state of clicked node
			if (x_coord < size && y_coord < size && y_coord >= 0 && x_coord >= 0) {
				let node = grid[x_coord][y_coord]
				if (node !== undefined) {
					if (node.state) {
						node.state = false
						node.new_state = false
					} else {
						node.state = true
						node.new_state = true
					}
				}

				totalLivingRecord = 0
				generationsAlive = 0
			}

			change_node_colour()

			gameInfoCallback(
				totalLiving,
				totalLivingRecord,
				generationsAlive,
				userCoordinates,
				startAmount,
				feedbackMessage
			)
		}

		function make_grid() {
			/*
			Create 2d grid with node objects
			*/
			// Create rectangular grid with node objects
			grid = []
			for (let x = 0; x < size; x++) {
				let row = []
				for (let y = 0; y < size; y++) {
					row.push(new Node())
				}
				grid.push(row)
			}

			// Add neigbours to nodes
			for (let x = 0; x < size; x++) {
				for (let y = 0; y < size; y++) {
					// Horizontal neigbours
					if (x + 1 < size) {
						grid[x][y].neighbours.push(grid[x + 1][y])
					}
					if (x - 1 >= 0) {
						grid[x][y].neighbours.push(grid[x - 1][y])
					}
					// Vertical neigbours
					if (y + 1 < size) {
						grid[x][y].neighbours.push(grid[x][y + 1])
					}
					if (y - 1 >= 0) {
						grid[x][y].neighbours.push(grid[x][y - 1])
					}
					// Diagonal neigbours
					if (x + 1 < size && y + 1 < size) {
						grid[x][y].neighbours.push(grid[x + 1][y + 1])
					}
					if (x + 1 < size && y - 1 >= 0) {
						grid[x][y].neighbours.push(grid[x + 1][y - 1])
					}
					if (x - 1 >= 0 && y - 1 >= 0) {
						grid[x][y].neighbours.push(grid[x - 1][y - 1])
					}
					if (x - 1 >= 0 && y + 1 < size) {
						grid[x][y].neighbours.push(grid[x - 1][y + 1])
					}
				}
			}
		}

		function change_states() {
			/*
			Change state of all nodes according to the game rules
			*/
			// Loop over every node

			for (let x = 0; x < size; x++) {
				for (let y = 0; y < size; y++) {
					// Counts nr of living neighbours
					let neighbour_counter = 0
					grid[x][y].neighbours.forEach(function (neighbour) {
						if (neighbour.state) {
							neighbour_counter++
						}
					})
					// Living node
					if (grid[x][y].state) {
						if (neighbour_counter !== 2 && neighbour_counter !== 3) {
							grid[x][y].new_state = false
						}
					}
					// Dead node
					else {
						if (neighbour_counter === 3) {
							grid[x][y].new_state = true
						}
					}
				}
			}
			// Refresh all node states
			for (let x = 0; x < size; x++) {
				for (let y = 0; y < size; y++) {
					grid[x][y].state = grid[x][y].new_state
				}
			}
		}

		function change_node_colour() {
			/*
			Check node states and change colour according to the state of the node
			*/
			totalLiving = 0
			nodeCoordinates = []

			for (let x = 0; x < size; x++) {
				for (let y = 0; y < size; y++) {
					let size_x = x * (square_size + 5) + 10
					let size_y = y * (square_size + 5) + 10

					// Check node state and define colour
					let colour = p.color(241, 241, 241)
					if (grid[x][y].state) {
						colour = p.color(20, 172, 230)

						nodeCoordinates.push([[x], [y]])

						totalLiving = totalLiving + 1
						if (totalLiving > totalLivingRecord) {
							totalLivingRecord = totalLiving
						}
					}

					p.fill(colour)
					p.rect(size_x, size_y, square_size, square_size)
				}
			}
			// check if new coordinates are the same as 2 generations ago; looping
			if (!evenGeneration) {
				if (
					JSON.stringify(nodeCoordinatesGrandParent) ===
					JSON.stringify(nodeCoordinates)
				) {
					p.noLoop()

					feedbackMessage =
						'Extinct or stuck in looping generations. Submit setup or start new game and choose or make a new setup.'
					game_state = !game_state
				}

				nodeCoordinatesGrandParent = nodeCoordinates
			}
			evenGeneration = !evenGeneration

			gameInfoCallback(
				totalLiving,
				totalLivingRecord,
				generationsAlive,
				userCoordinates,
				startAmount,
				feedbackMessage
			)
		}
	}

	componentDidMount() {
		this.myP5 = new p5(this.Sketch, this.myRef.current)
	}

	render() {
		return (
			<div>
				<div id="game-info-field">
					<h1>Conway's Game of Life</h1>
					<p>
						The Game of Life is a cellular automaton devised by the British
						mathematician John Horton Conway in 1970. It is a zero-player game,
						meaning that its evolution is determined by its initial state,
						requiring no further input. One interacts with the Game of Life by
						creating an initial configuration and observing how it evolves. It
						is Turing complete and can simulate a universal constructor or any
						other Turing machine.
					</p>

					<ul>
						<li>Rules</li>
						<li>
							Any living cell with two or three living neighbours survives.
						</li>
						<li>
							Any dead cell with three living neighbours becomes a living cell.
						</li>
						<li>All other living cells die in the next generation.</li>
						<li>Similarly, all other dead cells stay dead.</li>
					</ul>
					<p>
						<a href="https://faucets.chain.link/rinkeby" target="_blank">
							Claim free Rinkeby testnet ETH to play the game
						</a>
					</p>

					<button id="game-start-button">
						{game_state ? 'Pauze' : 'Start'}
					</button>
				</div>

				<div ref={this.myRef}></div>
			</div>
		)
	}
}
export default Game
