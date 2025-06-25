# ChessCraftServer

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:3333
npm run dev

# project build 
npm run build
```

## Test scripts
Due to sensitive data, scripts are not available on git, if you need them, please contact this email `pedja@mensch.rs`

First install dependencies for artillery with command (global installation is optional):
```npm install -g artillery```

Run test automatic with command:
``` bash
chmod +x run-complete-test.sh
./run-complete-test.sh
```

Run test manual with command:
``` bash
# Terminal 1: Capture server logs
npm start 2>&1 | tee test-logs/server-output.txt

# Terminal 2: Run Node.js test
node test-api-with-logging.js

# Terminal 3: Run Artillery test
artillery run artillery-test.yml 2>&1 | tee test-logs/artillery-output.txt
```