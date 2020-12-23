const express = require('express');
const session = require('express-session');
const app =  express();

//Hacemos las configuraiones dela aplicacion
app.set("nombre" , "NodeChat"); //nombre de la app, autoreferencia
app.set("views" , __dirname + "/views"); //la carpeta de las vistas queda definida
app.set("view engine" , "ejs"); // el render de vistas sera ejs

app.use(express.static(__dirname+'/public')); // la ruta estatica publica de express

//configuramos los aspectos de la sesion y lo usamos cmo servicio
app.use(session({
  secret            : 'paranguruquitimiricuaro',
  resave            : false,
  saveUninitialized : false
})); 

var server    = require('http').createServer(app);  // create server for the app
var io        = require('socket.io')(server);     // charge library on server

 var adminSocket = {};  // socket admin
 var userConectados = {}; /// users socket

app.get('/panel', (req,res)=>{
    res.render( 'panel.ejs');
});

app.get('/', (req,res)=>{
   res.render('visitor.ejs');
});

//  on socket conection  event
 io.on("connection", function(socket){ 
     // e caso de pedir administracion
     socket.on('user-admin', function(data){
                switch( data )  // test data
                {
                   case 'asd' :  // comparamoscon el pass
                     adminSocket = socket; // parseamos
                     adminSocket.emit('exito-admin'); // respuesta
                      break;
                      default:
                          console.log('admin bloqueado'); // de otra manera
                }
     });

      // nuevo usuario online
        socket.on("user-online", function(nombre){
           userConectados[nombre] = socket;  // parseamos
           console.log('Nuw socket under name :: ' + nombre);

            // test
            switch(adminSocket) { // if error
                        case undefined:
                        case '':
                        case false:
                           console.log('el admin esta offline');
                        break;
                        default: // if good ,send to admin
                           adminSocket.emit('user-online', nombre);  // notificamos al admin de un nuevo usuario
            }
          });


          // para mensaje privado al admin
          socket.on('mensaje' , function(data)  {
            switch(adminSocket) {
               case undefined:
               case '':
                  userConectados[data.nombre].emit('no_admin'); // si esta offline
               break;
               default:
                  adminSocket.emit('mensaje' , data);  // si esta online
            }
          });

 }); // fin del evento de conexxion


// launch server
server.listen(3000, () => { console.log("Servidor cargada y listo!"); }); // inciamos




