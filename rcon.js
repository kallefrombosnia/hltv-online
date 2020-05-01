const rcon = require('rcon');
const EventEmmiter = require('events').EventEmitter;

class RCON extends EventEmmiter{

    constructor(serverListInfo){
        super();
        
        this._servers = [];
        this._parseServers(serverListInfo)
        this.rcon = rcon

    }


    sendCommand(id, command, server = false){

        if(this._servers){
           
            // init rcon 
            if(server){

                // game server rcon
                const rconConn = new this.rcon(this._servers[id].rconServerAddress, this._servers[id].rconServerPort, this._servers[id].rconServerPassword, { tcp: false, challenge: true});

                // try to connect with rcon 
                rconConn.connect();

                // wait for auth event to fire
                rconConn.on('auth', () => {
        
                    // try to send command
                    rconConn.send(command)
                })

                // listen for response event
               
                // Not supposed to happen before command send
                rconConn.on('end', () => {
                    console.log('rcon socket closed connection')
                    return false;
                });

            }else{

                // hltv rcon
                const rconConn = new this.rcon(this._servers[id].rconHltvAddress, this._servers[id].rconHltvPort, this._servers[id].rconHltvPassword, { tcp: false, challenge: true});

                // try to connect with rcon 
                rconConn.connect();

                // wait for auth event to fire
                rconConn.on('auth', () => {
        
                    // try to send command
                    rconConn.send(command)

                    
                })


                // Not supposed to happen before command send
                rconConn.on('end', () => {
                    console.log('rcon socket closed connection')
                    return false;
                });
            }
        }
    }

    getData(id, command, server = false){

        if(this._servers){
           
            // init rcon 
            if(server){

                // game server rcon
                const rconConn = new this.rcon(this._servers[id].rconServerAddress, this._servers[id].rconServerPort, this._servers[id].rconServerPassword, { tcp: false, challenge: true});

                // try to connect with rcon 
                rconConn.connect();

                // wait for auth event to fire
                rconConn.on('auth', () => {
        
                    // try to send command
                    rconConn.send(command)
                })

                // listen for response event
                rconConn.on('response', async (data) => {
                    
                    //return requested data trough event
                    this.emit(command, [id, data]);

                })

                // Not supposed to happen before command send
                rconConn.on('end', () => {
                    console.log('rcon socket closed connection')
                    return false;
                });

            }else{

                // hltv rcon
                const rconConn = new this.rcon(this._servers[id].rconHltvAddress, this._servers[id].rconHltvPort, this._servers[id].rconHltvPassword, { tcp: false, challenge: true});

                // try to connect with rcon 
                rconConn.connect();

                // wait for auth event to fire
                rconConn.on('auth', () => {
        
                    // try to send command
                    rconConn.send(command)
                })

                // listen for response event
                rconConn.on('response', async (data) => {
                    
                    //return requested data trough event
                    this.emit(command, [id, data]);
                    
                })

                // Not supposed to happen before command send
                rconConn.on('end', () => {
                    console.log('rcon socket closed connection')
                    return false;
                });
            }    
        }
    }

    // Parse initial server list for rcon usage
    _parseServers(configListParse){

        if(configListParse){
            
            for (let i = 0; i < configListParse.servers.length; i++) {
             
                this._servers.push({
                    rconHltvAddress: configListParse.hltvIp,
                    rconHltvPort: configListParse.servers[i].hltvPort.toString().split(' ')[1],
                    rconHltvPassword: configListParse.servers[i].hltvAdminPassword.toString().split(' ')[1],
                    rconServerAddress: configListParse.servers[i].ip.toString().split(':')[0],
                    rconServerPort: configListParse.servers[i].ip.toString().split(':')[1],
                    rconServerPassword: configListParse.servers[i].serverRconPassword
                }) 
            }

            return this._servers;

        }      
    }
  
}


module.exports = RCON;