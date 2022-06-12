module.exports = {
    webDialerStatus: {
        registered: "registered",
        connected: "connected",
        disconnected: "disconnected",
        invite: "invite",
        accepted: "accepted"
    },

    webSocketConnectionStatus: {
        disconnected: 0,
        connected: 1,
        notAuthenticated: 2,
        authenticated: 3,
        duplicateUser: 4,
    },

    endCallStatus: {
        success: 0,
        getBack: 1,
        language: 2,
        answeringMachine: 3,
        gotMarried: 4,
        changedAddress: 5,
        faxTone: 6,
        hangedUp: 7,
        wrongNumber: 8,
        nonCooperative: 9,
        busy: 10,
        disconnectedNumber: 11,
        unanswerd: 12
    },

    phoneTypes: {
        home: 1,
        mobile: 2
    },

    webDialerConfig: {
        uri: 'dialer1.shass.co.il',
        wsServers: 'wss://dialer1.shass.co.il:7443/ws'
    },

    previewableFiles: {
        gif: true,
        png: true,
        jpg: true,
        jpeg: true,
        txt: true,
        pdf: true
    }
};