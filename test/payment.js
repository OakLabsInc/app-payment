const { exec } = require('child_process')
console.log(process.env)
let data = `{"cart":{"total":"40.4","tax":"3.434","taxRate":"0.085","grandTotal":"43.833999999999996"},"terminalIp":"${process.env.TERMINAL_IP}"}`

async function sendCart(payload) {
	await exec(`curl --header "Content-Type: application/json" --request POST --data '${data}' localhost:8003` (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      console.log(`Error: ${err}`);
      return;
    }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  })
}