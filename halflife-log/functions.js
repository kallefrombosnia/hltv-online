const dgram = require("dgram");
const server = dgram.createSocket("udp4");
const EventEmitter = require("events");
const regexInput = require("./types/regex");
const helper = require("./helpers/helper");

class HL_Log extends EventEmitter {
    
  constructor(port, raw = false) {
    super();
    this.raw = raw;
    this.port = port;
    this.cvarList = [];
  }

  start() {
    this.onError();

    this.messageParser();

    this.listenSocket();

    this.bindPort(this.port);
  }

  onError() {
    server.on("error", err => {
      console.log(`server error:\n${err.stack}`);
      server.close();
    });

   
  }

  messageParser() {
    server.on("message", (msg, info) => {
        console.log(`${msg.toString("ascii")}`);

        const message = msg.toString("ascii").replace(/[\n\t\r]/g, "");

        // fire 'hlds_connect' on first message
        this.emit("hlds_connect", info);

        this.on('cvar', info =>{
            this.setCvars(info.cvarName, info.cvarValue)
            //console.log(info)
        })

        helper.raw(this.raw);

        this.regexSearch(message.split(" "), message);
    });
  }

  listenSocket() {
    server.on("listening", () => {
      const address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });
  }

  regexSearch(array, line) {
    //sconsole.log(array)
    regexInput.forEach(parameter => {
      if (array.includes(parameter)) {
        //console.log(parameter)
        const type = helper[parameter.replace(/\0.*$/g, "")](line);
        this.emit(type.event, type);
      }
    });
  }

  setCvars(cvarName, cvarValue){
    return this.cvarList.push([cvarName, cvarValue]);
  }

  bindPort(port) {
    server.bind(port);
  }
}

module.exports = {
  HL_Log
};
