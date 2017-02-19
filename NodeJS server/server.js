var express = require('express');
var app = express();
var port = process.env.PORT || 1337;

var io = require('socket.io').listen(app.listen(port));
console.log('Running on port ' + port);

var index = '<h1>iPet Server</h1><hr>';
function printHtml(text) { index += text + '<br>'; return text; }

var pg = require('pg');
var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock();


var DatabaseURL = 'postgres://rdebzkdboixdao:gSukrACy2yRvwJnm29Mlna7JuN@ec2-54-225-79-232.compute-1.amazonaws.com:5432/d4r49b74js7oji';
pg.defaults.ssl = true;

    // Call Database
function DB(SQLscript, CallbackFunction) {
		// lock if another proccess is using
    lock.readLock(function (release) {
        pg.connect(DatabaseURL, function (err, client, done) {
            if (err) { CallbackFunction('Database error'); done(); release(); return; }
            client.query(SQLscript, function (err, result) {
                if (err) {
                    CallbackFunction('SQL Command error'); done(); release(); return;
                }
                if (result.rows[0]) {
                    CallbackFunction(result.rows); done(); release(); return;
                }
                CallbackFunction('No results'); done(); release(); return;
            });
        });
    });
}

	// example check if Database is connected
DB("SELECT * FROM public.ownerusers WHERE userName = 'admin'", function (result) {
    if (result == 'Database error' || result == 'SQL Command error' || result == 'No results')
    { console.log(printHtml(result)); return; }
    console.log(printHtml('Connected to the Database Port : '+port));
});

app.get('/', function (req, res, next)
{
		// update status table while(has status=online pet rows)
    if (updaterWorking == false) {
        updaterWorking = true;
        setTimeout(startUpdater, 30000);
    }
		// get server html page
    if (!req.query.command) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(index); next(); return;
    }
    var answer = new Object();
    switch (req.query.command) {
        case 'Connection':
            res.send('Connected!!'); next(); break;
        case 'OwnerLogin':
            OwnerLogin(req, res, answer, next); break;
        case 'OwnerSignup':
            OwnerSignup(req, res, answer, next); break;
        case 'AddPetToOwner':
            addPetToOwner(req, res, answer, next); break;
        case 'Petlogin':
            Petlogin(req, res, answer, next); break;
        case 'GetPetsList':
            GetsPetsList(req, res, answer, next); break;
        case 'GetFriendsList':
            GetFriendsList(req, res, answer, next); break;
        case 'AddFriend':
            AddFriend(req, res, answer, next); break;
        case 'GetFriendPets':
            GetFriendPets(req, res, answer, next); break;
        case 'GetPetsNearMe':
            GetPetsNearMe(req, res, answer, next); break;
        case 'GetMyPetLocation':
            GetMyPetLocation(req, res, answer, next); break;
        case 'GetNewMessagesNotice':
            GetNewMessagesNotice(req, res, answer, next); break;
        case 'GetMessages':
            GetMessages(req, res, answer, next); break;
        case 'PetSetLocation':
            PetSetLocation(req, res, answer, next); break;
        case 'ConnectAllPets':
            ConnectAllPets(req, res, answer, next); break;
        case 'GetSymptoms':
            GetSymptoms(req, res, answer, next); break;
        case 'getIllnessDesc':
            getIllnessDesc(req, res, answer, next); break;
        case 'getIllnessAnlyz':
            getIllnessAnlyz(req, res, answer, next); break;
        case 'putBPM':
            putBPM(req, res, answer, next); break;
        case 'getBPM':
            getBPM(req, res, answer, next); break;
    }
});

	// for map demo presentation only
app.get('/all', function (req, res, next) {
    var SQL = "SELECT connect_ALL_userPets('all')";
    DB(SQL, function (result) {
        console.log(result);
        res.send(result); next();
    });
});

io.on('connection', function (socket) {
    console.log('new user');
		// tests
    socket.on('disconnect', function () {
        console.log('user been dissconnected');
    });
    socket.on('forceDisconnect', function () { socket.disconnect(); });

    socket.on('Server', function (msg) {
        console.log(msg);
        io.emit('Client', 'From server');
    });

    socket.on('sendMessage', function (msg) {
        var Messg = JSON.parse(msg);
        io.emit('RecievedMessage' + Messg.from, 'Message sent');
        io.emit('RecievedMessage' + Messg.to, 'New Message : <br>' + Messg.message);
        insertToMessages(Messg.to, Messg.message);
    });


    //____________________Image__________________________________//

    socket.on('sendImage', function (targetUser,ImageBase64) {
        console.log('Send pic to ' + targetUser);
        io.emit('RecievedImage' + targetUser, ImageBase64);
    });

    socket.on('RequestImage', function (request) {
        var Messg = JSON.parse(request);
        console.log('Take a pic from ' + Messg.to);
        io.emit('TakePic' + Messg.to, Messg.from);
    });


    //______________Location__________________________//
		// Android to server
    socket.on('GetLocation', function (from,to) {
        console.log('get pet location ' + to);
        io.emit('sendLocation' + to, from);
    });
		// Raspberry to server to android
    socket.on('GiveLocation', function (to,lat,lon) {
        console.log('give location to ' + to);
        io.emit('takeLocation' + to, lat,lon);
    });

    //________________Heart___________________________________//
		// Android to server
    socket.on('GetPulse', function (from, to) {
        console.log('get heart bit from ' + to);
        io.emit('sendHeartBit' + to, from);
    });
		// Raspberry to server to android
    socket.on('GivePulse', function (to, array, avgBit) {
        console.log('send bit array + avg bit to ' + to);
        io.emit('takeHeartBit' + to, array, avgBit);
    });

    //______________Light____________________________________//
    socket.on('LightSwitch', function (number, value_) {
        console.log('LightSwitch ' + number + ' , ' + value_);
        io.emit('Light' + number, value_);
    });
});

function insertToMessages(userName, message)
{
    var SQL = "SELECT messageInserter('"+userName+"','"+message+"')";
    DB(SQL, function (result) {
        console.log(result);
    });
}

    // ?command=OwnerLogin&userName=USER
function OwnerLogin(req, res, answer, next) {
    var SQL = "SELECT * FROM public.ownerusers WHERE userName = '" + req.query.userName + "'  ; ";
    SQL += "UPDATE public.ownerusers SET status='on' WHERE username = '" + req.query.userName + "'";
    DB(SQL, function (result) {
        if (checkForError(res,answer,next,result,"User doesn't exists","User already logged in")) { return; }
        answer.title = "login"; answer.user = req.query.userName;
        console.log(printHtml('Owner login :' + req.query.userName));
        res.send(answer); next();
    });
}

    //  ?command=OwnerSignup&userName=USER&password=PASSWORD&phone=0543944989
function OwnerSignup(req, res, answer, next) {
    var SQL = "INSERT INTO public.ownerusers(username, status, password, phonenumber) VALUES";
    SQL += "('" + req.query.userName + "', 'off', '" + req.query.password + "', '" + req.query.phone + "')";
    DB(SQL, function (result) {
        if (checkForError(res,answer,next,result,"","User already exists")) { return; }
        OwnerLogin(req, res, answer, next);
    });
}
    //  ?command=AddPetToOwner&OwnerName=USER&petName=PET&petNumber=0543944989&petIcon=5
function addPetToOwner(req, res, answer, next) {
    var SQL = "INSERT INTO public.ownerspetslink(ownername, petname, petnumber, icon, age, size) ";
    SQL += "VALUES ('" + req.query.OwnerName + "', '" + req.query.petName + "', '" +
        req.query.petNumber + "' , '" + req.query.petIcon + "' , '" + req.query.age + "' , '" + req.query.size + "')";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "", "pet number is not register or already on your list")) { return; }
        answer.title = "add"; answer.log = req.query.petName + " was add to your list";
        console.log(printHtml(answer.log));
        res.send(answer); next();
    });
}

    //  ?command=Petlogin&petNumber=0543944989
function Petlogin(req, res, answer, next) {
    SQL = "SELECT loginInserter('" + req.query.petNumber + "')";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "Database error", "database crashed...", true)) { return; }
        res.send(result[0].logininserter); next();
    });
}

    //  ?command=GetPetsList&userName=USER
function GetsPetsList(req, res, answer, next) {
    var SQL = "SELECT * FROM public.ownerspetslink WHERE ownername = '" + req.query.userName + "' ";
    SQL += " AND petnumber IN ( SELECT petnumber FROM public.petsnumbers WHERE status = 'on' )";
    DB(SQL, function (result) {
        var errorString = "No online pets to display \nAdd or connect them to the server";
        if (checkForError(res,answer,next,result,errorString,"User is not register")) { return; }
        answer.title = "list"; answer.log = result;
        console.log(printHtml('List request for ' + req.query.userName));
        res.send(answer); next();
    });
}

    // ?command=GetFriendsList&userName=USER
function GetFriendsList(req, res, answer, next) {
    var SQL = "SELECT * FROM public.friendslist WHERE username = '" + req.query.userName + "'";
    DB(SQL, function (result) {
        if (checkForError(res,answer,next,result,"List is empty","User is not register")) { return; }
        answer.title = "list"; answer.log = result;
        console.log(printHtml('Friends List for ' + req.query.userName));
        res.send(answer); next();
    });
}

    // ?command=AddFriend&userName=USER&friendName=FRIEND
function AddFriend(req, res, answer, next) {
    var SQL = "INSERT INTO public.friendslist(username, friendname) VALUES ('" + req.query.userName + "', '" + req.query.friendName + "')";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "", "User doesn't exists, or already in your list")) { return; }
        answer.title = "add"; answer.log = req.query.friendName + " was add to your FriendsList";
        console.log(printHtml(answer.log));
        res.send(answer); next();
    });
}

    // ?command=GetFriendPets&friendName=USER
function GetFriendPets(req, res, answer, next) {
    var SQL = "SELECT * FROM public.ownerspetslink JOIN public.petslocation ON public.ownerspetslink.petnumber = public.petslocation.petnumber ";
    SQL += " WHERE public.ownerspetslink.ownername = '" + req.query.friendName + "'";
    SQL += " AND public.ownerspetslink.petnumber IN (SELECT petnumber FROM public.petslocation)";
    SQL += " AND public.ownerspetslink.petnumber IN (SELECT petnumber FROM public.petsnumbers WHERE status = 'on')";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result,"Friend has no active pets at the moment","invalid friend username")) { return; }
        answer.title = "list"; answer.log = result;
        console.log(printHtml('Friend pets Location ' + req.query.friendName));
        res.send(answer); next();
    });
}

    // ?command=GetPetsNearMe&lat=LAT&lon=LON
function GetPetsNearMe(req, res, answer, next) {
    var SQL = "SELECT * FROM public.petslocation JOIN public.petsnumbers ON public.petslocation.petnumber = public.petsnumbers.petnumber ";
    SQL += " WHERE (lat > (" + req.query.lat + "-1) AND lat < (" + req.query.lat + "+1)) ";
    SQL += " AND (lon > (" + req.query.lon + "-1) AND lon < (" + req.query.lon + "+1)) AND status = 'on'";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result,"No pets near you","Location Table error")) { return; }
        answer.title = "list"; answer.log = result;
        console.log(printHtml('Pets withthin ' + req.query.lat + "," + req.query.lon));
        res.send(answer); next();
    });
}

    // ?command=GetMyPetLocation&myPetNumber=NUMBER
function GetMyPetLocation(req, res, answer, next) {
    var SQL = "SELECT * FROM public.petslocation WHERE petnumber = '" + req.query.myPetNumber + "'";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "Your pet's location is not listed", "Location Table error")) { return; }
        answer.title = "location"; answer.log = result;
        console.log(printHtml('Get pet location ' + req.query.myPetNumber));
        res.send(answer); next();
    });
}

    // ?command=GetNewMessagesNotice&userName=USER
function GetNewMessagesNotice(req, res, answer, next)
{
    var SQL = "SELECT * FROM public.newmessages WHERE username = '" + req.query.userName + "'";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "No new messages", "User is not register")) { return; }
        answer.title = "newMSG"; answer.log = "NEW messages**";
        console.log(printHtml('Notice for user : ' + req.query.userName));
        res.send(answer); next();
    });
}

    // ?command=GetMessages&userName=USER
function GetMessages(req, res, answer, next) {
    SQL = "SELECT * FROM messageSender('" + req.query.userName + "')";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "No messages", "User is not register")) { return; }
        answer.title = "MSG"; answer.log = result;
        console.log(printHtml('Message list request ' + req.query.userName));
        res.send(answer); next();
    });
}

    // ?command=PetSetLocation&number=NUMBER&lat=LAT&lon=LON
function PetSetLocation(req, res, answer, next) {
    var SQL = "SELECT locationInserter('" + req.query.number + "'," + req.query.lat + "," + req.query.lon + ")";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "Number is not Register", "Number is not register", true)) { return; }
        console.log('updated location for ' + req.query.number);
        res.send(result[0].locationinserter); next();
    });
}

// ?command=ConnectAllPets&userName=USER 
function ConnectAllPets(req, res, answer, next) {
    var SQL = "SELECT connect_ALL_userPets('" + req.query.userName + "')";
    DB(SQL, function (result) {
        console.log(result);
        res.send(result); next();
    });
}

// ?command=GetSymptoms
function GetSymptoms(req, res, answer, next) {
    var SQL = "SELECT * FROM public.symptoms";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "No symptonms found", "No symptonms found")) { return; }
        answer.log = result; answer.title = 'symptoms';
        console.log(printHtml('Send symptoms'));
        res.send(answer); next();
    });
}

// ?command=getIllnessDesc&illName=ILLNAME
function getIllnessDesc(req, res, answer, next) {
    var SQL = "SELECT * FROM public.illness JOIN " +
              "(SELECT * FROM public.illnessymptons JOIN public.symptoms " +
              "ON public.illnessymptons.symname = public.symptoms.symname) AS aa " +
              "ON public.illness.illname = aa.illname " +
              "WHERE public.illness.illname = '" + req.query.illName + "'";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "illness doesn't exists", "Database problems...")) { return; }
        answer.log = result; answer.title = 'ilness';
        console.log(printHtml('Send illness'));
        res.send(answer); next();
    });
}

// ?command=getIllnessAnlyz&symtms={"syms":["a","b","c"]}
function getIllnessAnlyz(req, res, answer, next) {
    var temp = JSON.parse(req.query.symtms);
    var syms = temp.syms;
    var SQL = "SELECT illname,count(illname) AS c FROM public.illnessymptons WHERE ";
    for (var i = 0; i < syms.length; i++) {
        if (i != 0) { SQL += " OR "; }
        SQL += "symname = '" + syms[i] + "' ";
    }
    SQL += "GROUP BY illname ORDER BY c DESC";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "no illnesses found for these symptoms", "Database problems...")) { return; }
        answer.title = 'illnessList'; answer.log = result;
        res.send(answer); next();
    });
}

// ?command=putBPM&putNum=NUMBER&bpm=BPM
function putBPM(req, res, answer, next) {
    var SQL = "INSERT INTO public.bpmlist(petnum, bpm, timestmp) " +
              "VALUES ('" + req.query.putNum + "' , '" + req.query.bpm + "', current_timestamp)";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "inserted", "SQL command wrong...", true)) { return; }
        res.send('inserted'); next();
    });
}

// ?command=getBPM&putNum=NUMBER
function getBPM(req, res, answer, next) {
    var SQL = "SELECT * FROM public.bpmlist " +
                "WHERE ((current_timestamp-timestmp)<time'00:11:00') " +
                    "AND petnum = '" + req.query.putNum + "' " +
                        "ORDER BY timestmp DESC";
    DB(SQL, function (result) {
        if (checkForError(res, answer, next, result, "No recent BPM record found", "Database error...")) { return; }
        answer.title = 'BPMlist'; answer.log = result;
        res.send(answer); next();
    });
}


function sendError(text, res, answer, next) {
    answer.title = "error"; answer.log = text;
    console.log(printHtml(text));
    res.send(answer); next();
}

function checkForError(res, answer, next, result, NotFoundComment, CommandErrComment, python) {
    switch (result) {
        case 'Database error':
            sendError(result, res, answer, next); return true; break;
        case 'SQL Command error':
            if (python != null) {
                console.log(CommandErrComment);
                res.send(CommandErrComment); return true;
            }
            if (CommandErrComment != ""){ sendError(CommandErrComment, res, answer, next); return true; }
            return false; break;
        case 'No results':
            if (python != null) {
                console.log(NotFoundComment);
                res.send(NotFoundComment); return true;
            }
            if(NotFoundComment != "")
            { sendError(NotFoundComment, res, answer, next); return true; }
            return false; break;
    }
    return false;
}

//__________________Start server_______________________//

var updaterWorking = false;
function startUpdater()
{		// update status table while(has status="online" pet rows)
    updateStatus(function (result) {
        if (result == 'online') {
            updaterWorking = true;
            setTimeout(startUpdater, 300000);
        }
        else {
            updaterWorking = false;
        }
    });
}

function updateStatus(callbackFunction)
{		// returns online or not if there are pets online ^
    var SQL = "SELECT updateStatus()";
    DB(SQL, function (result) {
        console.log(result[0].updatestatus);
        callbackFunction(result[0].updatestatus);
        SQL = "DELETE FROM public.bpmlist " +
                " WHERE ((current_timestamp-timestmp)>time'00:02:00')";
        DB(SQL, function (result) {
            console.log('BPM list : ' + result);
        });
    });
}

process.on('uncaughtException', function (err) {
    console.log(err);
});
