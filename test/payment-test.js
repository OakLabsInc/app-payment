const { exec } = require('child_process')

let data = '{"cart":{"total":"40.4","tax":"3.434","taxRate":"0.085","grandTotal":"43.833999999999996"},"terminalIp":"192.168.86.43"}'

async function sendCart(payload) {
	await exec(`curl -X POST -H "Content-Type: application/json" -d ${payload} localhost:8003` (err, stdout, stderr) => {
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