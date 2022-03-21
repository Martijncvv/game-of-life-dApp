const main = async () => {
	const [owner, randomPerson2, randomPerson3, randomPerson4] =
		await hre.ethers.getSigners()

	const gameofLifeContractFactory = await hre.ethers.getContractFactory(
		'GameOfLife'
	)
	const GOLContract = await gameofLifeContractFactory.deploy()
	await GOLContract.deployed()
	console.log('Contract addy:', GOLContract.address)

	let contractBalance = await hre.ethers.provider.getBalance(
		GOLContract.address
	)
	console.log(
		'Contract balance:',
		hre.ethers.utils.formatEther(contractBalance)
	)

	/*
	 * Let's try two waves now
	 */
	const GOLTx1 = await GOLContract.connect(randomPerson2).submitGameSetup(
		3,
		6,
		8,
		[0, 2, 4],
		[1, 3, 5],
		'Message deploy 1'
	)
	console.log('Submit game 1')
	await GOLTx1.wait()

	const GOLTx2 = await GOLContract.connect(randomPerson3).submitGameSetup(
		4,
		15,
		27,
		[10, 12, 14, 16],
		[11, 13, 15, 17],
		'Message deploy 22'
	)
	console.log('Submit game 2')
	await GOLTx2.wait()

	// let allSetups = await GOLContract.getAllSetups()
	// console.log('allSetups')
	// console.log(allSetups)

	const GOLTx3 = await GOLContract.connect(randomPerson2).likeSetup(2)
	console.log('1. Like setup 2')
	await GOLTx3.wait()
	console.log('1. Liked game 2')

	const GOLTx4 = await GOLContract.connect(randomPerson3).likeSetup(2)
	console.log('2. Like setup 2')
	await GOLTx4.wait()
	console.log('2. Liked game 2')

	// setupById = await GOLContract.getSetupById(2)
	// console.log('getsetup by id')
	// console.log(setupById)
	allSetups = await GOLContract.getAllSetups()
	console.log('allSetups')
	console.log(allSetups)
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
