const config = require('./config');
const { spawn } = require('child_process')
const EventEmmiter = require('events');
const gameDig = require('gamedig');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const zipperClass = require('./zipper');

const Zip = new zipperClass();


const RCON = require('./rcon');

class HLTV extends EventEmmiter{

    constructor(){

        super();
        this.process_list = [];
        this.rcon = new RCON(config);
        this.gameDig = gameDig;
        this.logger_list = [];
        this.server_state = [];
        this.zip = Zip;

        
        for (let i = 0; i < config.servers.length; i++) {

            // server state name and num players online every x seconds
            this.logger_list.push(
                {
                    name: '',
                    players: null
                }
            );

            // server local state 
            this.server_state.push(
                {
                    recording: false,
                    connected: false,
                    halfTime: false,
                    matchId: null,
                    dirName: ''
                }
            );

        }

        // update server name state
        this.rcon.on('hltv_servername', name =>{

            return this.logger_list[name[0]].name = name[1];
        }) 
        
        // update num players state
        this.rcon.on('hltv_numplayers', (number) =>{
        
            return this.logger_list[number[0]].players = number[1];
            
        })

        // listen for new demos
        this.on('demoDone', srwId => {  

            // read cs dir and check for demo files
            fs.readdir(path.join(config.cwd + `/cstrike`), (err, files) => {

                // filter out files 
                const filesList = files.filter((e) =>{
                    return path.extname(e).toLowerCase() === '.dem'
                });

                // loop trough files
                filesList.forEach(demo =>{
 
                    // split demo name by -
                    const demoNameParsed = demo.split('-');

                    // split demo name by _
                    const demoInfo = demoNameParsed[0].split('_');
    
                    // try to create folder if doesnt exists for demos
                    fs.mkdir(path.join(config.cwd + `/cstrike/${this.server_state[srwId].dirName}`), err => { 

                        if (err && err.code !== 'EEXIST') {
                            console.log('already exists');
                        }

                        // function to check if file exists
                        const moveFile = () =>{
                            
                            if(demoInfo[2] === this.server_state[srwId].dirName){

                                fs.rename(path.join(config.cwd + `/cstrike/${demo}`), path.join(config.cwd + `/cstrike/${this.server_state[srwId].dirName}/${demo}`), (err) =>{
                                    
                                    if (err && err.code === 'EBUSY'){

                                        //do nothing till next loop

                                    } else if (err && err.code === 'ENOENT'){

                                        clearInterval(checkInterval);

                                    } else {

                                        // all good move file
                                        fs.rename(path.join(config.cwd + `/cstrike/${demo}`), path.join(config.cwd + `/cstrike/${this.server_state[srwId].dirName}/${demo}`), (err) =>{

                                            if(!err){
                                                clearInterval(checkInterval);
                                            }

                                        });
                                    }
                                });
                            }
                        } 
                        
                        // set interval possible busy demp state so repeat needed
                        const checkInterval = setInterval(() => moveFile(), 1000);
                    })             
                })
            });
        })

        // start zipping demos
        this.on('matchDone', srw =>{

            // function check if demos can be zipped
            const checkFilesNumber = () => {

                // check number of files in demo dir
                fs.readdir(path.join(config.cwd + `/cstrike/${this.server_state[srw].dirName}`), (err, files) => {
                    
                    // check if there are 2 demos
                    if(files.length === 2) {

                        // all good we can continue with procedure
                        // call our function from class 
                        this.zip.createZip(path.join(config.cwd + `/cstrike/${this.server_state[srw].dirName}`), this.server_state[srw].dirName);

                        // clear interval for checking if there are 2 files
                        clearInterval(checkZipFilesInterval);
                    }
                });
            }

            // set interval of checking
            const checkZipFilesInterval = setInterval(() => checkFilesNumber(), 1000);
           
        })

        // zipping done, transfer file to the public directory
        this.zip.on('zipDone', (zipDir, demoName) =>{

            // move zip when event emits
            const moveFile = () =>{
                            
                fs.rename(zipDir, path.join(__dirname + `/demos/${demoName}`), (err) =>{
                    
                    if (err && err.code === 'EBUSY'){

                        //do nothing till next loop

                    } else if (err && err.code === 'ENOENT'){

                        // files doesnt exists skip
                        clearInterval(checkMoveInterval);

                    } else {

                        // zip file can be moved to demos 
                        fs.rename(zipDir, path.join(process.cwd + `/demos/${demoName}}`), (err) =>{
                            if(!err){
                               
                                clearInterval(checkMoveInterval);

                                this.emit('deleteDir', zipDir);
                            }
                        });
                    }
                });
            } 
            
            const checkMoveInterval = setInterval(() => moveFile(), 1000);

        });

        this.on('deleteDir', (zipDir) =>{
            fs.rmdir(zipDir , err =>{
                if(!err){
                    console.log('dir deleted');
                }else{
                    console.error(err, ' dir was not deleted');
                }
            })
        });

    }

    // main function for hltv 
    init(){

        // Start with servers scan to check if any action is needed every x seconds
        setInterval(() =>{
            
            // Check if we have any servers?
            if(config.servers){
           
                // Pass every server
                for (let i = 0; i < config.servers.length; i++) {

                    // send rcon request to check server info
                    this.rcon.getData(i, 'hltv_servername', true);
                    this.rcon.getData(i, 'hltv_numplayers', true);

                    // heartbeat, check if helps in prodction - problem sudden freeze of hltv 
                    this.rcon.sendCommand(i, 'players');
                   
                    // check if server didnt bugged out or rcon
                    if(this.logger_list[i].name !== '' && this.logger_list[i].players !== null){

                        // parse name, it depends on server name what is gonna happen
                        const parseName = this.logger_list[i].name.toString().match(/\((.*?)\)/g);

                        // check if regex didnt failed
                        if(parseName){                          
                            
                            // idle match (match not started)
                            if(!parseName === !config.regexValues.notStarted && parseInt(this.logger_list[i].players.replace(/[\r\n]+/gm, "" )) < config.minPlayers){
                                
                                // continue on servers scan, nothing to do here
                               continue;
                            }
                            
                            // prepare state (match not started, but enough players on server)
                            if(this.server_state[i].connected !== true && !parseName === !config.regexValues.notStarted && parseInt(this.logger_list[i].players.replace(/[\r\n]+/gm, "" )) >= config.minPlayers){
                                
                                this.rcon.sendCommand(i, `connect ${config.servers[i].ip}`);

                                this.server_state[i].connected = true;
                            }


                            // final state match started and max players start record
                            if(parseName == config.regexValues.firstRound && parseInt(this.logger_list[i].players.replace(/[\r\n]+/gm, "" )) >= config.minPlayers){

                                // check if server is not already recording
                                if(this.server_state[i].recording !== true){
                                    
                                    // demo name formatter
                                    const format = config.demoNameFormat.toString().split('_');

                                    let demoNameParts = [];

                                    // generate random string
                                    const random =  this._randomString();

                                    for (let loop = 0; loop < format.length; loop++) {

                    
                                        switch (format[loop]) {
                                            case 'id':
                                                
                                                demoNameParts.push(i);
                                                break;
                                        
                                            case 'half':
                                                demoNameParts.push('_', 'FirstHalf');
                                                break;

                                            case 'match':
                                                demoNameParts.push('_', random);
                                                break;
                                        
                                            default:
                                                break;
                                        }
                                    }


                                    // join parts for recording
                                    const demoName = demoNameParts.join('');

                                    console.log(demoName)

                                    // send stoprecording since hltv can be bugged with mathc before if rcon failed
                                    this.rcon.sendCommand(i, `stoprecording`);

                                    // send new record command
                                    this.rcon.sendCommand(i, `record ${demoName}`);

                                    // send message but with little of delay
                                    setTimeout(() =>{
                                        this.rcon.sendCommand(i, `say HLTV RECORDING!`, true) 
                                    }, 5000);
                                        
                                    // save random directory 
                                    this.server_state[i].dirName = random;

                                    // recording state started
                                    return this.server_state[i].recording = true; 
                                        
                                }
                            }

                            // half logic split
                            if(parseName){

                                // check if half didnt already started
                                if(this.server_state[i].halfTime !== true){

                                    // split scores
                                    const splitResponses = parseName.toString().split(' ');
                                    const scores = splitResponses[1].toString().split(':');

                                    // sum up rounds
                                    const score = parseInt(scores[0]) + parseInt(scores[1]);

                                    // check if round number is not equal to 15
                                    if(score === 15){

                                        // if yes emit event for first demo
                                    
                                        this.rcon.sendCommand(i, `stoprecording`);

                                        this.emit('demoDone', i);

                                        const format = config.demoNameFormat.toString().split('_');let demoNameParts = [];

                                        for (let loop = 0; loop < format.length; loop++) {              

                                            switch (format[loop]) {
                                                case 'id':
                                                    
                                                    demoNameParts.push(i);
                                                    break;
                                            
                                
                                                case 'half':
                                                    demoNameParts.push('_', 'SecondHalf');
                                                    break;

                                                case 'match':
                                                    demoNameParts.push('_', this.server_state[i].dirName);
                                                    break;
                                            
                                                default:
                                                    break;
                                            }
                                        }


                                        const demoName = demoNameParts.join('');

                                        console.log(demoName)

                                        // start recording second half
                                        this.rcon.sendCommand(i, `record ${demoName}`);

                                        // send message that hltv is recording
                                        setTimeout(() =>{
                                            this.rcon.sendCommand(i, `say HLTV recording 2nd half!`, true);
                                        }, 15000);

                                        // set local state half time started
                                        this.server_state[i].halfTime = true;
    
                                    }
                                }

                            }

                            // end of match logic 
                            if(parseName){
                                
                                // check if we are in half time
                                if(this.server_state[i].halfTime === true){

                                    // split scores
                                    const splitResponses = parseName.toString().split(' ');
                                    const scores = splitResponses[1].toString().split(':');

                                    // get scores
                                    const scoreA = parseInt(scores[0]);
                                    const scoreB = parseInt(scores[1]);

                                    // check if any team has gotten 16 rounds
                                    if(scoreA === 16 || scoreB === 16){

                                        // stop recording
                                        this.rcon.sendCommand(i, `stoprecording`);
                                        
                                        // demo done continue with moving
                                        this.emit('demoDone', i);

                                        // mathc done continue to zipping
                                        this.emit('matchDone', i);

                                        // disconnect hltv
                                        this.rcon.sendCommand(i, `disconnect`);

                                        // message to players
                                        this.rcon.sendCommand(i, `say Match over, thanks 4 playing!`, true);
                                        this.rcon.sendCommand(i, `say Demo will soon available on our site.`, true);

                                        // reset app state
                                        this.server_state[i].halfTime = false;
                                        this.server_state[i].connected= false;
                                        this.server_state[i].recording = false;
                                    }
                                }
                            }
                        }

                    }

                    
                }
            }
                
          
        }, config.scanInterval)

    }

    // procces launch
    startHLTV(){

        // check if we have any of the servers
        if(config.servers.length){
            
            // set temp procces array
            let p_tmp = [];
    
            // parse trough servers
            for (let i = 0; i < config.servers.length; i++) {
                
                // decalre anonymous function since we need to spawn procces, without this step its not gonna wait to spawn procces
                (function(i){

                    // spawn process nodejs function with our arguments
                    const child = spawn(config.hltvName, [ config.servers[i].hltvPort, config.servers[i].hltvName, config.servers[i].hltvAdminPassword, '+heartbeat', '-highpriority'], {
                        cwd: config.cwd, 
                        shell: true,
                        windowsVerbatimArguments: true,   
                    });

                    // child stderr gonna pop if there is alreay hltv running
                    child.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });

                    // Add the child process to the list for tracking
                    p_tmp.push({
                        process:child,
                        started: true
                    });
            
    
                    // Listen for any errors:
                    child.stderr.on('data', function (data) {
                        console.log(child.pid, data);
                        p_tmp[i].content += data;

                        //this.emit('stdErr', data)
                    }); 
            
                    // Listen if the process closed
                    child.on('close', (exit_code) => {
                        console.log('Closed before stop: Closing code: ', exit_code);
                        //this.emit('stdErr', exit_code)
                    });
                    
               
                })(i)
               
                
            }
            
            // return processs list
            return this.process_list = p_tmp;
        }
    }

    // generate random dir string
    _randomString(){

        const r = Math.random().toString(36).substring(7);

        return r;
    }
  
}
    

module.exports = {
    HLTV
}