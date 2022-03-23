import './App.css'
import Game from './Components/Game'
import Game2 from './Components/Game2'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import CONTRACT_JSON from './utils/GameOfLife.json'
const CONTRACT_ADDRESS = '0xA973bEd86C1152Dbbc1873F3D2B25b79566f52D4'

export default function App() {
	const [totalLiving, setTotalLiving] = useState(0)
	const [totalLivingRecord, setTotalLivingRecord] = useState(0)
	const [generationsAlive, setGenerationsAlive] = useState(0)
	const [startAmount, setStartAmount] = useState(0)
	const [userCoordinates, setUserCoordinates] = useState([])
	const [userCoordinates_x, setUserCoordinates_x] = useState([])
	const [userCoordinates_y, setUserCoordinates_y] = useState([])
	const [userMessage, setUserMessage] = useState('')

	const [feedbackMessage, setFeedbackMessage] = useState('Choose or make setup')

	const [startCoordinates, setStartCoordinates] = useState([])
	const [currentAccount, setCurrentAccount] = useState('')
	const [allSetups, setAllSetups] = useState([])

	const contractABI = CONTRACT_JSON.abi

	useEffect(() => {
		checkIfWalletIsConnected()
	}, [])

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window

			if (!ethereum) {
				console.log('Make sure you have metamask!')
				return
			} else {
				console.log('We have the ethereum object', ethereum)
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' })

			if (accounts.length !== 0) {
				const account = accounts[0]
				console.log('Found an authorized account:', account)
				setCurrentAccount(account)
				getAllSetups()
			} else {
				console.log('No authorized account found')
			}
		} catch (error) {
			console.log(error)
		}
	}

	const getAllSetups = async () => {
		try {
			const { ethereum } = window
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum)

				const { chainId } = await provider.getNetwork()

				if (chainId !== 4) {
					alert('Connect to Rinkeby test network')
					setFeedbackMessage('Connect to Rinkeby test network and refresh')
				}

				const signer = provider.getSigner()
				const gameOfLifeContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					contractABI,
					signer
				)
				const setups = await gameOfLifeContract.getAllSetups()

				let setupsCleaned = []
				setups.forEach((setup) => {
					setupsCleaned.push({
						user: setup.user,
						startNodeAmount: setup.startNodeAmount.toNumber(),
						generationsAlive: setup.generationsAlive.toNumber(),
						maxLivingNodesRecord: setup.maxLivingNodesRecord.toNumber(),
						x_coordinates: setup.x_coordinates,
						y_coordinates: setup.y_coordinates,
						timestamp: new Date(setup.timestamp * 1000),
						setupId: setup.setupId.toNumber(),
						likes: setup.likes.toNumber(),
						message: setup.message,
					})
				})

				setAllSetups(setupsCleaned.sort(compare))
			} else {
				console.log("Ethereum object doesn't exist!")
			}
		} catch (error) {
			console.log(error)
		}
	}

	const compare = (a, b) => {
		if (a.likes > b.likes) {
			return -1
		}
		if (a.likes < b.likes) {
			return 1
		}

		if (a.maxLivingNodesRecord > b.maxLivingNodesRecord) {
			return -1
		}
		if (a.maxLivingNodesRecord < b.maxLivingNodesRecord) {
			return 1
		}

		return 0
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window

			if (!ethereum) {
				alert('Get MetaMask!')
				return
			}

			const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

			console.log('Connected', accounts[0])
			setCurrentAccount(accounts[0])
		} catch (error) {
			console.log(error)
		}
	}
	const handleChooseSetupButton = async (index) => {
		let setupCoordinates = []
		for (let i = 0; i < allSetups[index].x_coordinates.length; i++) {
			setupCoordinates.push([
				allSetups[index].x_coordinates[i].toNumber(),
				allSetups[index].y_coordinates[i].toNumber(),
			])
		}
		console.log('chosen setup Coordinates ', setupCoordinates)
		setStartCoordinates(setupCoordinates)
	}

	const handleSubmitSetupButton = async () => {
		console.log('Submit setup')
		setFeedbackMessage('Confirm transaction; setup submit ')
		try {
			const { ethereum } = window
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum)
				const signer = provider.getSigner()
				const gameOfLifeContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					contractABI,
					signer
				)

				console.log(
					`StartAmount: ${startAmount} \n generationsAlive: ${generationsAlive}\nTotalLivingRecord ${totalLivingRecord}\n userCoordinates_x ${userCoordinates_x} \n userCoordinates_y ${userCoordinates_y}\n User message: ${userMessage}`
				)
				const submitTxn = await gameOfLifeContract.submitGameSetup(
					startAmount,
					generationsAlive,
					totalLivingRecord,
					userCoordinates_x,
					userCoordinates_y,
					userMessage
				)

				console.log('Mining...', submitTxn.hash)
				setFeedbackMessage('Submitting setup...')

				await submitTxn.wait()
				console.log('Mined -- ', submitTxn.hash)
				setFeedbackMessage('Setup submitted!')
				getAllSetups()
			} else {
				console.log("Ethereum object doesn't exist!")
			}
		} catch (error) {
			console.log(error)
		}
	}

	const handleLikeSetupButton = async (setupId) => {
		setFeedbackMessage(`Confirm transaction; like setup ${setupId}`)
		try {
			const { ethereum } = window
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum)
				const signer = provider.getSigner()
				const gameOfLifeContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					contractABI,
					signer
				)

				const submitTxn = await gameOfLifeContract.likeSetup(setupId)

				console.log('Mining...', submitTxn.hash)
				setFeedbackMessage(`Like setup... ${setupId}`)

				await submitTxn.wait()
				console.log('Mined -- ', submitTxn.hash)
				setFeedbackMessage(`Like on ${setupId} submitted!`)
				getAllSetups()
			} else {
				console.log("Ethereum object doesn't exist!")
			}
		} catch (error) {
			console.log(error)
		}
	}

	function gameInfoCallback(
		totalLiving,
		totalLivingRecord,
		generationsAlive,
		userCoordinates,
		startAmount,
		feedbackMessage
	) {
		setTotalLiving(totalLiving)
		setTotalLivingRecord(totalLivingRecord)
		setGenerationsAlive(generationsAlive)
		setUserCoordinates(userCoordinates)
		setStartAmount(startAmount)
		setFeedbackMessage(feedbackMessage)

		let x_coordinates = []
		let y_coordinates = []
		for (let i = 0; i < userCoordinates.length; i++) {
			x_coordinates.push(userCoordinates[i][0][0])
			y_coordinates.push(userCoordinates[i][1][0])
		}

		setUserCoordinates_x(x_coordinates)
		setUserCoordinates_y(y_coordinates)
	}

	function resetGame() {
		console.log('ResetGame')
		window.location.reload()
	}

	function renderCoordinates(x_coordinates, y_coordinates) {
		let setupCoordinates = []
		for (let i = 0; i < x_coordinates.length; i++) {
			setupCoordinates.push([
				x_coordinates[i].toNumber(),
				y_coordinates[i].toNumber(),
			])
		}
		return setupCoordinates.join(' ')
	}
	function renderUserCoordinates(coordinates) {
		if (coordinates.length > 0) {
			let setupCoordinates = []
			for (let i = 0; i < coordinates.length; i++) {
				setupCoordinates.push([coordinates[i]])
			}
			return setupCoordinates.join(' ')
		}
	}

	return (
		<div className="App">
			<div id="game-setup-options">
				{!currentAccount ? (
					<div>
						<h2>GM</h2>
						<button className="connectButton" onClick={connectWallet}>
							Connect Wallet
						</button>
						<p>
							Connect wallet to be able to choose, submit and like setups of
							others.
						</p>
					</div>
				) : (
					<div>
						<div id="account-info-field">
							<h2>User Info</h2>
							<p>{currentAccount}</p>
							<h2>Game State</h2>
							<p>{feedbackMessage}</p>

							<button className="game-button" onClick={() => resetGame()}>
								New Game
							</button>
						</div>

						<div id="submit-setup-field">
							<h2>Submit Setup</h2>
							<div id="submit-setup-input-field">
								<div className="setup-info-field">
									<p className="setup-info-attribute">Start Coordinates</p>
									<p className="setup-info-value">
										{renderUserCoordinates(userCoordinates)}
									</p>
								</div>

								<div className="setup-info-field">
									<p className="setup-info-attribute">Start amount</p>
									<p className="setup-info-value">{userCoordinates.length}</p>
								</div>
								<div className="setup-info-field">
									<p className="setup-info-attribute">Current living nodes</p>
									<p className="setup-info-value">{totalLiving}</p>
								</div>
								<div className="setup-info-field">
									<p className="setup-info-attribute">Living nodes record</p>
									<p className="setup-info-value">{totalLivingRecord}</p>
								</div>
								<div className="setup-info-field">
									<p className="setup-info-attribute">Generations alive</p>
									<p className="setup-info-value">{generationsAlive}</p>
								</div>
								<div className="setup-info-field">
									<input
										id="message-input"
										placeholder="Message"
										autoComplete="off"
										value={userMessage}
										onChange={(event) => setUserMessage(event.target.value)}
										onClick={() => setUserMessage('')}
									/>
								</div>

								<button
									className="game-button"
									onClick={() => handleSubmitSetupButton()}
									disabled={
										startAmount === 0 ||
										totalLivingRecord === 0 ||
										userMessage.length === 0
											? true
											: false
									}
								>
									Submit Setup
								</button>
							</div>
						</div>

						<h2>Choose Setup</h2>
						<div id="user-setups">
							{allSetups.length > 0 &&
								allSetups.map((setup, index) => (
									<div key={index} className="setup-option-box">
										<p className="setup-id">ID {setup.setupId}</p>
										<p className="setup-user-name">{setup.user}</p>

										<div className="setup-info-field">
											<p className="setup-info-attribute">Likes</p>
											<p className="setup-info-value">{setup.likes}</p>
										</div>
										<div className="setup-info-field">
											<p className="setup-info-attribute">
												Generations survived
											</p>
											<p className="setup-info-value">
												{setup.generationsAlive}
											</p>
										</div>
										<div className="setup-info-field">
											<p className="setup-info-attribute">Start amount </p>
											<p className="setup-info-value">
												{setup.startNodeAmount}
											</p>
										</div>

										<div className="setup-info-field">
											<p className="setup-info-attribute">
												Living nodes record
											</p>
											<p className="setup-info-value">
												{setup.maxLivingNodesRecord}
											</p>
										</div>

										<div className="setup-info-field">
											<p className="setup-info-attribute">Coordinates</p>
											<p className="setup-info-value">
												{renderCoordinates(
													setup.x_coordinates,
													setup.y_coordinates
												)}
											</p>
											<div></div>
										</div>
										<div className="setup-info-field">
											<p className="setup-info-attribute">Message</p>
											<p className="setup-info-message">{setup.message}</p>
										</div>

										<button
											className="game-button"
											onClick={() => handleChooseSetupButton(index)}
											disabled={totalLiving === 0 ? false : true}
										>
											Load Setup
										</button>
										<button
											className="game-button like-setup"
											onClick={() => handleLikeSetupButton(setup.setupId)}
										>
											Like
										</button>
									</div>
								))}
						</div>
					</div>
				)}
				<div>
					<h3>The history of Life by John Conway</h3>
					<iframe
						width="350"
						height="200"
						src="https://www.youtube.com/embed/R9Plq-D1gEk"
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
				<p></p>
			</div>

			<div id="game">
				{startCoordinates.length > 0 && (
					<Game
						gameInfoCallback={gameInfoCallback}
						startCoordinates={startCoordinates}
					/>
				)}
				{startCoordinates.length === 0 && (
					<Game2
						gameInfoCallback={gameInfoCallback}
						startCoordinates={startCoordinates}
					/>
				)}
			</div>
		</div>
	)
}
