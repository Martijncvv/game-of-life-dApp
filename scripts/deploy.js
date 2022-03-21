const main = async () => {
	const gameofLifeContractFactory = await hre.ethers.getContractFactory(
		'GameOfLife'
	)
	const GOLContract = await gameofLifeContractFactory.deploy()

	await GOLContract.deployed()
	console.log('Game of Life Contract address:', GOLContract.address)

	const GOLTx1 = await GOLContract.submitGameSetup(
		5,
		1,
		1,
		[0, 1, 2, 2, 2],
		[1, 2, 0, 1, 2],
		'Slider, GM'
	)
	await GOLTx1.wait()
	console.log('Submitted 1st setup')
}

const runMain = async () => {
	try {
		await main()
		process.exit(0)
	} catch (error) {
		console.log(error)
		process.exit(1)
	}
}

runMain()
