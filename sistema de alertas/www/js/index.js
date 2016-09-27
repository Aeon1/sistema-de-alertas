document.addEventListener("deviceready", onDeviceReady, false);
var db=null;
function onDeviceReady() {   
        db = window.openDatabase("Database", "1.0", "datos de acceso", 1000000);        
        db.transaction(populateDB);

        //checkConnection();
        aviso()
}


 // Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});
//saber que reporte es
myApp.onPageInit('reporte', function (page) {
  console.log('reporte page initialized');
  console.log(page);
});

 var online;
 function checkConnection() {
        var networkState = navigator.network.connection.type;
        var states = {};
    states[Connection.UNKNOWN]  = '1';
    states[Connection.ETHERNET] = '1';
    states[Connection.WIFI]     = '1';
    states[Connection.CELL_2G]  = '1';
    states[Connection.CELL_3G]  = '1';
    states[Connection.CELL_4G]  = '1';
    states[Connection.NONE]     = '0';
    online=states[networkState];
    if (online=='0'){showAlert();}
    }
        
function showAlert() {
    navigator.notification.alert(
    'Algunas caracteristicas no estaran disponibles',     // mensaje (message)
    'Sin internet',            // titulo (title)
    'Cerrar'                // nombre del botón (buttonName)
    );
    }


function transaction_error(tx, error) {
    console.log("Database Error: " + error);
}

function populateDB(tx) { 
    tx.executeSql('DROP TABLE IF EXISTS datos');
    tx.executeSql('DROP TABLE IF EXISTS contactos');
    tx.executeSql('DROP TABLE IF EXISTS aviso'); 
    tx.executeSql('DROP TABLE IF EXISTS direccion'); 
    tx.executeSql('CREATE TABLE IF NOT EXISTS aviso(id INTEGER PRIMARY KEY AUTOINCREMENT,acepto)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,apellido_p,apellido_m,sexo,telefono,nacimiento,enfermedad,sangre,email)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS direccion(id INTEGER PRIMARY KEY AUTOINCREMENT,calle,numero,colonia,municipio)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS contactos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,telefono)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS acceso(id INTEGER PRIMARY KEY AUTOINCREMENT,contacto,confirmacion)');

}
function aviso(){
        db.transaction(
        function(tx) {
        tx.executeSql('SELECT * FROM aviso',[],checkAviso);
    });            
}
//si no se ha registrado le muestra la pantalla de registro
function checkAviso(tx, results){
    var len = results.rows.length;
        if(len==0){
            myApp.popup('.popup-aviso');            
        }else{
          checkDatos();  
        }
        //for (var i=0; i<len; i++){
//            console.log(results.rows.item(i).nombre);         
//        }
}
function aceptAviso(){
   db.transaction(
        function(tx) {              
        tx.executeSql('INSERT INTO aviso(acepto) VALUES(?)',['si']);
    });             
      
        checkDatos();
        myApp.closeModal('.popup-aviso')
}
function checkDatos(){
        db.transaction(
        function(tx) {
        tx.executeSql('SELECT * FROM datos',[],showDatos);
    });
}
//si no se ha registrado le muestra la pantalla de registro
function showDatos(tx, results){
    var len = results.rows.length;
        if(len==0){
            mainView.router.loadPage('personalDates.html');            
        }else{
            checkDireccion();           
        }

}
//checar si ya tiene direccion guardada
function checkDireccion(){
    db.transaction(
        function(tx) {
        tx.executeSql('SELECT * FROM direccion',[],showDatosDireccion);
    });
}
//si no se ha registrado le muestra la pantalla de registro
function showDatosDireccion(tx, results){
    var len = results.rows.length;
        if(len==0){
            mainView.router.loadPage('direccion.html');            
        }else{
            //obtener posicion
           navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
             
        }

}
//lleva a pantalla de direccion
function direction(){
    var nombre=$$("input[name='name']").val();
    var apellido_p=$$("input[name='s_name']").val();
    var apellido_m=$$("input[name='t_name']").val();
    var sexo=$$("select[name='sex']").val();
    var nacimiento=$$("input[name='born']").val();
    var telefono=$$("input[name='tel']").val();
    var mail=$$("input[name='mail']").val();
    var enfermedad=$$("input[name='enfermedad']").val();
    var sangre=$$("select[name='blood']").val();
    
    if(nombre==""){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar su nombre',
        closeOnClick:true      
        });
        $$("input[name='name']").focus();
    }else if(apellido_p==""){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar su apellido paterno',
        closeOnClick:true 
        });
        $$("input[name='s_name']").focus();
    }else if(nacimiento==""){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar su fecha de nacimiento',
        closeOnClick:true 
        });
    }else if(telefono=="" || telefono.length!=10){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar su numero celular a 10 digitos',
        closeOnClick:true 
        });
        $$("input[name='tel']").focus();
    }else if(mail==""){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar su correo electronico',
        closeOnClick:true 
        });
    $$("input[name='mail']").focus();
       
    }else{
        
        db.transaction(
        function(tx) {              
        tx.executeSql('INSERT INTO datos(nombre,apellido_p,apellido_m,sexo,telefono,nacimiento,enfermedad,sangre,email) VALUES(?,?,?,?,?,?,?,?,?)',[nombre,apellido_p,apellido_m,sexo,telefono,nacimiento,enfermedad,sangre,mail]);
        });
        myApp.closeNotification(".notifications"); 
     mainView.router.loadPage('direccion.html');
      }
      
}

//lleva a pantalla de contactos de emergencia
function contactos(){
    var calle=$$("input[name='calle']").val();
    var numero=$$("input[name='numero']").val();
    var colonia=$$("input[name='colonia']").val();
    var municipio=$$("select[name='municipio']").val();
    if(calle==""){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar el nombre de la calle',
        closeOnClick:true      
        });
        $$("input[name='calle']").focus();
    }else if(colonia==""){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar el nombre de la colonia',
        closeOnClick:true      
        });
        $$("input[name='colonia']").focus();
    }else{
        db.transaction(
        function(tx) {              
        tx.executeSql('INSERT INTO direccion(calle,numero,colonia,municipio) VALUES(?,?,?,?)',[calle,numero,colonia,municipio]);
        });
    myApp.closeNotification(".notifications"); 
    mainView.router.loadPage('contactos.html');
    navigator.contacts.find(
    ['displayName', 'name','phoneNumbers'],
    function(contacts){
        var contact_name;
        var contact_phone;
        for( i = 0; i < contacts.length; i++) {
            if(i==0){
                $$("#contacts").html("");
            }
            if(contacts[i].name.formatted != null && contacts[i].name.formatted != undefined ) {
                contact_name = contacts[i].name.formatted;
                contact_name = contact_name.replace(/'/g,"''");
                if(contacts[i].phoneNumbers != null && contacts[i].phoneNumbers.length > 0 && contacts[i].phoneNumbers[0].value != null && contacts[i].phoneNumbers[0].value != undefined ) {
                    $$("#contacts").append("<li><label class='label-checkbox item-content'><input type='checkbox' name='my-checkbox-"+i+"' value='"+contacts[i].phoneNumbers[0].value+"' nombre='"+contact_name+"'><div class='item-media'><i class='icon icon-form-checkbox'></i></div><div class='item-inner'><div class='item-title'>"+contact_name+"</div></div></label></li>");
                } else {
                    contact_phone = "";
                }
            }
        }
    },function(error){
        alert(error);
    },{ filter:"", multiple:true }
); 
}
}
//guardar contactos y enviar datos al server
function registrar(){
    var checkboxes = $$("#contacts input[type='checkbox']");
    var cont = 0; 
    for (var x=0; x < checkboxes.length; x++) {
 if (checkboxes[x].checked) {
    cont = cont + 1;
    var nombre=checkboxes[x].getAttribute('nombre');
    var telefono=checkboxes[x].value;
  db.transaction(
        function(tx) {              
        tx.executeSql('INSERT INTO contactos(nombre,telefono) VALUES(?,?)',[nombre,telefono]);
    });
 }
 
 }
 if(cont>=1){
 myApp.modal({
    title:  'Importante',
    text: 'Favor de confirmar y verificar sus datos, una vez enviada la informaci&oacute;n el registros no podra ser cancelado. para confirmar el registro ingrese el codigo de confirmaci&oacute;n que se enviara al correo registrado.',
    buttons: [
      {
        text: 'Cancelar',
        onClick: function() {
          myApp.closeModal();
        }
      },
      {
        text: 'Aceptar',
        onClick: function() {
           myApp.showPreloader('Enviando registro');
           sendDatesServer();
            
        }
      },
    ]
  })
}else{
     myApp.modal({
    title:  'Importante',
    text: 'Debe seleccionar al menos una persona como contacto de emergencia',
    buttons: [
      {
        text: 'Aceptar',
        onClick: function() {
          myApp.closeModal();
        }
      },
    ]
  })
}
}
function sendDatesServer(){
    db.transaction(
        function(tx) {              
        tx.executeSql('SELECT nombre,apellido_p,apellido_m,sexo,telefono,nacimiento,enfermedad,sangre,email,calle,numero,colonia,municipio FROM datos left join direccion where datos.id=? and direccion.id=?',[1,1],datosFin);
    });    
    }
function datosFin(tx, results){
    var len = results.rows.length;
            console.log('nombre: '+results.rows.item(0).nombre);
            console.log('apellido: '+results.rows.item(0).apellido_p);
            console.log('apellido c: '+results.rows.item(0).apellido_m);
            console.log('sexo: '+results.rows.item(0).sexo);
            console.log('telefono: '+results.rows.item(0).telefono);            
            //console.log('nacimiento: '+results.rows.item(0).nacimiento);
            var fecha=results.rows.item(0).nacimiento.split("-");
            var nacimiento=fecha[2]+"/"+fecha[1]+"/"+fecha[0];
            console.log(nacimiento);
            console.log('enfermedad: '+results.rows.item(0).enfermedad);
            console.log('sangre: '+results.rows.item(0).sangre);
            console.log('mail: '+results.rows.item(0).email);
            console.log('calle: '+results.rows.item(0).calle);
            console.log('numero: '+results.rows.item(0).numero);
            console.log('colonia: '+results.rows.item(0).colonia);
            console.log('municipio: '+results.rows.item(0).municipio);
            $$.ajax({
                        url:"https://uniformesyutilesescolares.sinaloa.gob.mx/BackEnd911WebService/Servicio.aspx",
                        method: "POST", 
                        data: {
                            op:'rc',
                            Nombre:results.rows.item(0).nombre,
                            PrimerApellido:results.rows.item(0).apellido_p,
                            SegundoApellido:results.rows.item(0).apellido_m,
                            FechaNacimiento:nacimiento,
                            EnfermedadesCronicas:results.rows.item(0).enfermedad,
                            TipoSangre:results.rows.item(0).sangre,
                            Calle:results.rows.item(0).calle,
                            Numero:results.rows.item(0).numero,
                            Colonia:results.rows.item(0).colonia,
                            Municipio:results.rows.item(0).municipio,
                            Email:results.rows.item(0).email,
                            TelefonoFijo:'',
                            TelefonoMovil:results.rows.item(0).telefono
                            },
                        beforeSend:Onbefore,
                        success: OnSuccess, 
                        error: OnError
                    });
}
//=SOTO&=21/08/1983&&=joel.diaz@sinaloa.gob.mx&=7587000&TelefonoMovil=6671185976
function OnSuccess(data, status, xhr){
    var json = JSON.parse(data);
    console.log(json.ContactoID);
//        myApp.hidePreloader();        
//        mainView.router.loadPage('index.html');
//        navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    db.transaction(
        function(tx) {              
        tx.executeSql('INSERT INTO acceso(contacto,confirmacion) VALUES(?,?)',[json.ContactoID,json.CodigoConfirmacion]);
    });
    enviocontactos(json.ContactoID,json.CodigoConfirmacion);
    }
//se envian los contactos al servidor
function enviocontactos(id,verificacion){
    db.transaction(
        function(tx) {              
        tx.executeSql('select * from contactos',[],function(tx, results){
            var len = results.rows.length;
            for (var i=0; i<len; i++){
                   $$.ajax({
                        url:"https://uniformesyutilesescolares.sinaloa.gob.mx/BackEnd911WebService/Servicio.aspx",
                        method: "POST", 
                        data: {op:'rce',IdContacto:id,CodigoConfirmacion:verificacion,Nombre:results.rows.item(i).nombre,PrimerApellido:'',SegundoApellido:'',TelefonoMovil:results.rows.item(i).telefono},
                        success: function(result){
                            console.log("respuesta contactos: "+result);
                            myApp.hidePreloader();        
                            mainView.router.loadPage('registro.html');
                           // navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
                        }, 
                        error: function(result){ 
                            myApp.alert('Ocurrio un error al registrar el contacto de emergencia '+results.rows.item(i).nombre, 'Error');
                            myApp.hidePreloader();
                        }
                        });  
            }
        });
    });
}
//finalizar el registro envio de codigo de confirmacion
function finalizar(){
    myApp.showPreloader('validando');
    db.transaction(
        function(tx) {
    tx.executeSql('select * from acceso',[],function(tx, results){
        var contacto=results.rows.item(0).contacto;
        var verificacion=$$("#codigo_confirmacion").val();
        console.log(contacto+" "+verificacion);
            $$.ajax({
                        url:"https://uniformesyutilesescolares.sinaloa.gob.mx/BackEnd911WebService/Servicio.aspx",
                        method: "POST", 
                        data: {op:'cr',IdContacto:contacto,CodigoConfirmacion:verificacion},
                        success: function(result){
                            var json = JSON.parse(result);
                            if(json.OcurrioError!=0){
                                myApp.hidePreloader();        
                            mainView.router.loadPage('index.html');
                            }else{
                               myApp.alert(json.MensajeError, 'Error'); 
                            }
                            console.log("respuesta confirmacion "+result);
                            
                           // navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
                        }, 
                        error: function(result){ 
                            myApp.alert('Ocurrio un error al intentar la verificacion', 'Error');
                            myApp.hidePreloader();
                        }
                        });
    });
});
}
function OnError(xhr, status){
        console.log('Error');
}
function Onbefore(xhr){
    console.log("enviando mensaje");
}


//mensajes de funcion de botones
$$('.robo').on('click', function () {
    var buttons = [
        {
            text: 'Robo habitacion',
            onClick: function () {
                mainView.router.loadPage('reporte.html');
                }
        },
        {
            text: 'Robo a comercio',
            onClick: function () {
                mainView.router.loadPage('reporte.html');
            }
        },
        {
            text: 'Robo de auto',
            onClick: function () {
                mainView.router.loadPage('reporte.html');
            }
        },
    ];
    myApp.actions(buttons);
}); 
function audio(){
    navigator.device.capture.captureAudio(captureSuccess, captureError, {limit:1});
}
function foto(){
    navigator.device.capture.captureImage(captureSuccess, captureError, {limit:1,quality: 0});
}
function video(){
    navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1,quality: 0});
}
// captura de audio exitosa
var captureSuccessaudio = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
        console.log(mediaFiles[i].size);
    }
};
// captura de audio con error
var captureErroraudio = function(error) {
    console.log(error);
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
};
// captura de foto exitosa
var captureSuccessfoto = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
        console.log(mediaFiles[i].size);
    }
};
// captura de foto con error
var captureErrorfoto = function(error) {
    console.log(error);
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
};
// captura de video exitosa
var captureSuccessvideo = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
        console.log(mediaFiles[i].size);
    }
};
// captura de video con error
var captureErrorvideo = function(error) {
    console.log(error);
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
};

//obtencion de las coordenadas exitosa
function onSuccessC(position) {
    latitud=position.coords.latitude;

}

// obtencion de las coordenadas error
function onErrorC(error) {
    myApp.alert('Asegurese que tiene habilitada la geolocalizacion', 'Ubicacion no encontrada', function () {
        cordova.plugins.settings.open(function(){
            console.log("opened settings")
        },
        function(){
            console.log("failed to open settings")
        });
    });
}
//boton llamada al 911
function onSuccesscall(result){
  console.log("Success:"+result);
}
function onErrorcall(result) {
 console.log("Error:"+result);
}
function callNumber(number){
  console.log("Launching Calling Service for number "+number);
  window.plugins.CallNumber.callNumber(onSuccesscall, onErrorcall, number, false);
}
