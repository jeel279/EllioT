const express = require('express');
const app = express();
const http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const ip = require('ip');
const { connect } = require('http2');
var QRCode = require('qrcode');
const { join } = require('path');
const os = require('os');
const atr = ip.address();

var authA = false;

console.log(join("files","a"));

const homeDir = os.homedir();

var dirF = join(homeDir,'Ellio-T');
        if (!fs.existsSync(dirF)){
            fs.mkdirSync(dirF);
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        var str = req.headers["user-agent"];
        str = str.substring(
            str.indexOf("(") + 1, 
            str.indexOf(")")
        );
        var arL = str.split("; ");
        var aip = req.ip.split(":");
        var dir = join(dirF,arL[arL.length-1]);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }        
        if(list_a.includes(aip[aip.length-1])){
             cb(null, dir);
        }else{
            io.emit("UnAc",{device:arL[arL.length-1],ip:aip[aip.length-1]});
        }
    },
    filename: (req, file, cb) => {
        var aip = req.ip.split(":");
        if(list_a.includes(aip[aip.length-1])){
            cb(null, `${file.originalname}`);
        }else{
            io.emit("UnAc",{device:arL[arL.length-1],ip:aip[aip.length-1]});
        }
    }
});

const upload = multer({storage});


app.use('*/css',express.static(__dirname+'/public/css'));
app.use('*/js',express.static(__dirname+'/public/js'));
app.use('*/manifest',express.static(__dirname+'/public/manifest'));
app.use('*/icons',express.static(__dirname+'/public/icons'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 

var allowed = ["127.0.0.1","localhost"];
var PIN = 0000;
var prdl = Object();

var curSock;

var list_a = Array();
var detLog = Object();
app.get("/",(req,res)=>{
    //console.log(req.headers);
    var aip = req.ip.split(":");
    //console.log(list_a);
    if(allowed.includes(aip[aip.length-1])){
        res.sendFile(__dirname+"/public/index.html");
    }else if(list_a.includes(aip[aip.length-1])){
        res.sendFile(__dirname+"/public/logged-index.html");
    }else{
        res.sendFile(__dirname+"/public/client-index.html");
    }
})

app.get('/qr',(req,res)=>{
    QRCode.toDataURL("http://"+atr+":5000", function (err, url) {
        res.send(url);
      })
})

app.post("/reciever/*",upload.single('file'),(req,res)=>{
    var aip = req.ip.split(":");
    if(list_a.includes(aip[aip.length-1])){
    }else{
        res.send("Unauthorized Access");
        res.end();
    }
})

app.get("/auth",(req,res)=>{
    var aip = req.ip.split(":");
    //console.log(new Date().getTime());
    if(!list_a.includes(aip[aip.length-1])){
        var ip = aip[aip.length-1];
        var dO = Object();
        var tkn = new Date().getTime();
        prdl[ip] = tkn;
        res.sendFile(__dirname+"/public/q.html");
        PIN = Math.floor(Math.random(0,.9)*10000);
        while(PIN.toString().length!=4) PIN = Math.floor(Math.random(0,.9)*10000);
        io.emit('newPIN',{pin:PIN});
        
        setTimeout(function(){ io.to(curSock).emit('newToken',{token:tkn}); },1750);
    }else{
    res.writeHead(302, {
        'Location': '..'
      });
      res.end();
    }
})



app.get("/t",(req,res)=>{
    res.sendFile(__dirname+"/public/try.html");
})

app.get("/f",(req,res)=>{
        res.download(__dirname+"/files/abc.tar.xz");
})

app.post("/disconnect",(req,res)=>{
    const index = parseInt(req.body.i);
    if (index > -1) {
      delete detLog[list_a[index]];
      list_a.splice(index, 1);
      io.emit("strict-5",{id:index});
      io.emit('NewDevice', { list: list_a,devObj: detLog });
    }
    res.send(true);
})

app.post("/auth",(req,res)=>{
    var str = req.headers["user-agent"];
    str = str.substring(
        str.indexOf("(") + 1, 
        str.indexOf(")")
    );
    var aip = req.ip.split(":");
    var ip = aip[aip.length-1];
    var arL = str.split("; ");
    if(prdl[ip]==req.body.token){    
    if(parseInt(req.body.pin)==PIN){
        var arw = Array();
        if(!list_a.includes(aip[aip.length-1])){
            list_a.push(aip[aip.length-1]);
            detLog[aip[aip.length-1]] = arL[arL.length-1];
        }
        io.emit('NewDevice', { list: list_a,devObj: detLog });
        var ar = Array();
        ar.push(true);
        ar.push(list_a.length-1);
        delete prdl[ip];
        res.send(ar);
    }else{
        res.send(false);
    }
    }else{
        io.emit("UnAcJ",{device:str,ip:aip[aip.length-1]});
        res.send("Bad Request");
}
})

app.get("/home",(req,res)=>{
    //console.log(req.headers);
    res.sendFile(__dirname+"/public/home.html");
});

app.post("/avail",(req,res)=>{
    res.sendStatus(200);
})

io.on("removeDevice",function(data){
    
})

function saveByteArray(reportName, byte) {
    var blob = new Blob([byte], {type: "application/pdf"});
    //console.log(URL.createObjectURL(blob));
};

io.on('connection', function(socket) {
    //console.log("S "+new Date().getTime());
    curSock = socket.id;


    socket.on('removeDevice',function(data){
        const index = data.i;
if (index > -1) {
  delete detLog[list_a[data.i]];
  list_a.splice(index, 1);
  io.emit("strict-5",{id:parseInt(index)});
  io.emit('NewDevice', { list: list_a,devObj: detLog });
}

})
var q=0;
socket.on('fileR',function(data){
    //console.log("Q");
    fs.appendFile(__dirname+"/public/files/"+(new Date().getTime())+"."+data.ext, Buffer.from(data.e), function (err) {
        if (err) {
          //console.log(err);
        } else {
          //console.log((data.e).length);
        }
    });
})
socket.on('connPr',function(data){
    //console.log(data.perm);
})
});
http.listen(5000);
