const randomItem = (...array) => array[Math.floor(Math.random() * array.length)];

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const randomPercentage = (bonus = false) => {
	let bonusValue;
	if (bonus !== false && Math.floor(Math.random() * 100) === 1) {
		bonusValue = 20 + Math.floor(Math.random() * 200);
	};
	return !bonusValue ? (Math.floor(Math.random() * 100)) : 100 + bonusValue;
};

const actionRate = (times, total) => {

	let rate = times / total * 100; // action rate (as percentage)
	let random = Math.floor(Math.random() * 100);

	console.log(rate, random, random === rate);

	if (random === rate) return { action: (fn) => fn() };
	else return { action: () => { } };
};

module.exports = { randomItem, randomNumber, randomPercentage, actionRate };