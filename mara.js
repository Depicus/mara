const express = require('express')
const fetch = require("node-fetch");
const mailer = require('nodemailer');
const https = require('https');
const sqlite = require("better-sqlite3");
const fs = require('fs')

const app = express()
const port = 4343
const interval = 1000 * 60 * 5; // 5 min
const path = 'settings.db'
const db = new sqlite("settings.db");

// database create if needed stuff
fs.access(path, fs.F_OK, (err) => {
    if (err) {
        console.debug("file does not exist so create it.")
        const db = new sqlite("settings.db");
        db.prepare("CREATE TABLE IF NOT EXISTS sites (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, lastcontact TIMESTAMP, currentstatus INTEGER)").run();
        db.prepare("CREATE TABLE IF NOT EXISTS mail (id INTEGER PRIMARY KEY AUTOINCREMENT, host TEXT, efrom TEXT, eto TEXT, cc TEXT)").run();
        db.prepare("INSERT INTO mail (host, efrom, eto) VALUES ('127.0.0.1', 'alerts@example.com', 'me@example.com' )").run();
        return
    }
});



app.use(express.json());

app.get('/hi', (req, res) => {
    //var db = new sqlite("settings.db");
    var rows = db.prepare("SELECT url, lastcontact, currentstatus FROM sites").all();
    res.send(JSON.stringify(rows))
})

app.get('/get/:settings', (req, res) => {
    var rows = db.prepare("SELECT host, efrom, eto FROM mail").all();
    res.send(JSON.stringify(rows))
})

app.post('/setmail', function (req, res) {
    let update = req.body;
    const info = db.prepare("UPDATE mail SET host = ?, efrom = ?, eto = ?").run(update.host, update.efrom, update.eto);
    const data = { errormsg: info.changes };
    res.send(JSON.stringify(data));
})

app.post('/addhost', function (req, res) {
    let addition = req.body;
    const info = db.prepare("INSERT INTO sites (url) VALUES (?)").run(addition.host);
    console.info("host added was " + addition.host);
    const data = { errormsg: info.changes };
    res.send(JSON.stringify(data));
})

app.use(express.static('public'))

fs.access('ssl/cert.pem', fs.F_OK, (err) => {
    if (err) {
        app.listen(port, () => {
            console.log(`Mara is guarding the web at http://localhost:${port}`)
        })
    } else {
        https.createServer({
            key: fs.readFileSync('ssl/key.pem'),
            cert: fs.readFileSync('ssl/cert.pem'),
            passphrase: 'mara'
        }, app).listen(port, () => {
            console.log(`Mara is guarding the web at https://localhost:${port}`)
        });
    }
});

// timer 
var expected = Date.now() + interval;
setTimeout(step, interval);
function step() {
    var dt = Date.now() - expected;
    if (dt > interval) {
        // something really bad happened.
    }
    let newDate = new Date(Date.now());
    var db = new sqlite("settings.db");
    var rows = db.prepare("SELECT url FROM sites").all();
    rows.forEach(function (obj) {
        checkSite(obj.url);
    });
    expected += interval;
    setTimeout(step, Math.max(0, interval - dt));
}


// check sites
function updateDB(currentstatus, url, savedate) {
    try {
        var db = new sqlite("settings.db");
        //console.info(datetime('now'));
        if (savedate) {
            const info = db.prepare("UPDATE sites SET currentstatus = ? , lastcontact = datetime('now', 'localtime') WHERE url = ?").run(currentstatus, url);
        } else {
            const info = db.prepare("UPDATE sites SET currentstatus = ? WHERE url = ?").run(currentstatus, url);
        }
    } catch (error) {
        console.log(error.message);
    }
}

function checkSite(url) {
    fetch(url)
        .then(
            function (response) {
                const currentstatus = response.status;
                var laststatus = getLastStatus(url);
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    //sendAlert('Looks like there was a problem. Status Code: ' + response.status);
                    updateDB(currentstatus, url, true);
                    if (response.status !== laststatus) {
                        sendAlert(url, `These was a ${response.status} error`);
                    }
                    //sendAlert(url, `These was a ${response.status} error`);
                    return;
                }
                //console.log(response.status);
                //console.log(response.url);
                if (response.status !== laststatus) {
                    sendAlert(url, `These was a ${response.status} back online`);
                }
                updateDB(currentstatus, url, true);
            }
        )
        .catch(function (err) {
            //console.log('Fetch Error :-S', err);
            updateDB(500, url, false);
        });
}

// get last status code
function getLastStatus(url) {
    var db = new sqlite("settings.db");
    var laststatus = db.prepare("SELECT currentstatus FROM sites WHERE url = ?").get(url);
    return laststatus.currentstatus;
}

// send email alert(s)
function sendAlert(url, msg) {
    var db = new sqlite("settings.db");
    var mailsettings = db.prepare("SELECT host, efrom, eto FROM mail").get();
    let transport = mailer.createTransport({
        host: mailsettings.host,
        port: 25,
        tls: {
            rejectUnauthorized: false
        }
    });

    const message = {
        from: mailsettings.efrom,
        to: mailsettings.eto,
        subject: `Mara Missing Site Alert ${url} | Site Unguarded`, // Subject line
        html: `<body style='background-color:red;'>${msg}</body>`
    };
    transport.sendMail(message, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log(info);
        }
    });
}

