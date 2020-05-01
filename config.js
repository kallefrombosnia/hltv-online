module.exports = {
    servers: [

        {
            ip: '134.255.254.158:27021',
            //launchCommand: '+connect 134.255.254.158:27017 +delay 35',
            hltvName: '+name "K4F-HLTV"',
            hltvPort: '-port 27022',
            hltvAdminPassword: '+adminpassword hltv2',
            serverRconPassword: 'kalletest'
        }, 

        /*
        {
            ip: '109.230.232.23:27030',
            launchCommand: '+connect 109.230.232.23:27030 +delay 35',
            hltvName: '+name "K4F-HLTV"',
            hltvPort: '-port 27020',
            hltvAdminPassword: '+adminpassword hltv1',
            serverRconPassword: 'H11SDAY3BGA2DNS'
        },
        {
            ip: '109.230.232.23:27031',
            launchCommand: '+connect 109.230.232.23:27031 +delay 35',
            hltvName: '+name "K4F-HLTV"',
            hltvPort: '-port 27021',
            hltvAdminPassword: '+adminpassword hltv2',
            serverRconPassword: 'H11SDAY3BGA2DNSs3s'
        },
        {
            ip: '134.255.254.158:27015',
            launchCommand: '+connect 134.255.254.158:27015 +delay 35',
            hltvName: '+name "K4F-HLTV"',
            hltvPort: '-port 27023',
            hltvAdminPassword: '+adminpassword hltv2',
            serverRconPassword: 'H11SDAY3BGA2DNSs3s'
        },

        */
                   
    ],

    hltvName: 'hltv.exe', // ime hltv fajla zavisno linux/ win

    cwd: 'C:/Games/Counter-Strike WaRzOnE',  // folder gdje se nalazi hltv

    showViewersCount: false, // Prikaz broja spectatora u imenu hltv,

    hltvIp: '10.0.75.1', // ip od hltva, moze biti lokalni ili externalni jer vrtimo rcon client na lokalnom serveru

    scanInterval: 3000, // interval skeniranja servera

    minPlayers: 2, // min potrebni igraci da bi hltv poceo da snima demoe

    demoNameFormat: 'id_half_match',

    regexValues: {
        notStarted: '(Match Not Started)',
        firstRound: '(A 0:0 B)'
    }
    
}