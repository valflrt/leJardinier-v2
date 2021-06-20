const exec = require("child_process").exec;

let gitClone = exec("git clone https://github.com/valflrt/leJardinier-v2.git ./leJardinier/");

gitClone.on("close", (code) => {
	console.log(`process exited (code ${code})`);

	let cdFolder = exec("cd ./leJardinier");
	cdFolder.on("close", (code) => {
		console.log(`process exited (code ${code})`);

		let rsync = exec("rsync -a ./leJardinier/ ../");
		rsync.on("close", () => console.log(`process exited (code ${code})`));
	});
});