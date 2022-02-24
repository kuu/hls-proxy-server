# hls-proxy-server
A server that pulls an external HLS stream and serve it from the local storage

## Install

```
$ git clone https://github.com/kuu/hls-proxy-server.git
$ cd hls-proxy-server
$ npm install
```

## Run

* Start (default port = 8080)
```
$ PORT=3000 npm start http://{your-hls-origin}.m3u8
```

* Check the current status
```
$ npm run status
```

* See logs
```
$ npm run logs
```

* Stop
```
$ npm stop
```

* Remove logs and local files
```
$ npm run reset
```

