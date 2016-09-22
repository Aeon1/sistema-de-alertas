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
//    tx.executeSql('DROP TABLE IF EXISTS datos');
//    tx.executeSql('DROP TABLE IF EXISTS contactos');
//    tx.executeSql('DROP TABLE IF EXISTS aviso'); 
//    tx.executeSql('DROP TABLE IF EXISTS direccion'); 
    tx.executeSql('CREATE TABLE IF NOT EXISTS aviso(id INTEGER PRIMARY KEY AUTOINCREMENT,acepto)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,apellido_p,apellido_m,sexo,telefono,nacimiento,enfermedad,sangre,email)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS direccion(id INTEGER PRIMARY KEY AUTOINCREMENT,calle,numero,colonia,municipio)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS contactos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,telefono)');

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
           myApp.showPreloader('Enviando al servidor');
           sendDatesServer();
            setTimeout(function () {
                myApp.hidePreloader();
                mainView.router.loadPage('index.html');
                navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
            }, 2000);
            
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
            console.log('nacimiento: '+results.rows.item(0).nacimiento);
            console.log('enfermedad: '+results.rows.item(0).enfermedad);
            console.log('sangre: '+results.rows.item(0).sangre);
            console.log('mail: '+results.rows.item(0).email);
            console.log('calle: '+results.rows.item(0).calle);
            console.log('numero: '+results.rows.item(0).numero);
            console.log('colonia: '+results.rows.item(0).colonia);
            console.log('municipio: '+results.rows.item(0).municipio);
        //    webServiceURL="https://uniformesyutilesescolares.sinaloa.gob.mx/BackEnd911WebService/Service.asmx";
//            var soapMessage = "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>"+
//                  "<soap:Body>"+
//                    "<RegistrarContacto xmlns='http://tempuri.org/'>"+
//                      "<pNombre>"+results.rows.item(i).nombre+"</pNombre>"+
//                      "<pPrimerApelido>"+results.rows.item(0).apellido_p+"</pPrimerApelido>"+
//                      "<pSegundoApelido>"+results.rows.item(0).apellido_m+"</pSegundoApelido>"+
//                      "<pFechaNacimiento>"+results.rows.item(0).nacimiento+"</pFechaNacimiento>"+
//                      "<pEnfermedadesCronicas>"+results.rows.item(0).enfermedad+"</pEnfermedadesCronicas>"+
//                      "<pTipoSangre>"+results.rows.item(0).sangre+"</pTipoSangre>"+
//                      "<pCalle>"+results.rows.item(0).calle+"</pCalle>"+
//                      "<pNumero>"+results.rows.item(0).numero+"</pNumero>"+
//                      "<pColonia>"+results.rows.item(0).colonia+"</pColonia>"+
//                      "<pMunicipio>"+results.rows.item(0).municipio+"</pMunicipio>"+
//                      "<pEmail>"+results.rows.item(0).email+"</pEmail>"+
//                      "<pTelefonoFijo></pTelefonoFijo>"+
//                      "<pTelefonoMovil>"+results.rows.item(0).telefono+"</pTelefonoMovil>"+
//                      "<pEstatus></pEstatus>"+
//                    "</RegistrarContacto>"+
//                  "</soap:Body></soap:Envelope>";
//                  $$.ajax({
//                        url: webServiceURL,
//                        method: "POST",
//                        dataType: "xml", 
//                        data: soapMessage, 
//                        processData: false,
//                        contentType: "text/xml; charset=\"utf-8\"",
//                        beforeSend:Onbefore,
//                        success: OnSuccess, 
//                        error: OnError
//                    });
//
//     function OnSuccess(data, status, xhr)
//    {
//        console.log(data);
//    }
//
//    function OnError(xhr, status)
//    {
//        console.log('error');
//    }
//function Onbefore(xhr){
//    console.log(xhr);
//}

            $$.ajax({
                        url:"http://quody.co/sms.php",
                        method: "POST", 
                        data: {To:'6672244900',Body:'mensaje de prueba'},
                        beforeSend:Onbefore,
                        success: OnSuccess, 
                        error: OnError
                    });
}
     function OnSuccess(data, status, xhr)
    {
        myApp.hidePreloader();        
        mainView.router.loadPage('index.html');
        navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    }

    function OnError(xhr, status)
    {
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
                mainView.router.loadPage('robo.html');
                }
        },
        {
            text: 'Robo a comercio',
            onClick: function () {
                mainView.router.loadPage('robo.html');
            }
        },
        {
            text: 'Robo de auto',
            onClick: function () {
                mainView.router.loadPage('robo.html');
            }
        },
    ];
    myApp.actions(buttons);
}); 
function roboaudio(){
    navigator.device.capture.captureAudio(captureSuccess, captureError, {limit:1});
}
function robofoto(){
    navigator.device.capture.captureImage(captureSuccess, captureError, {limit:1,quality: 0});
}
function robovideo(){
    navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1,quality: 0});
}
// capture callback
var captureSuccess = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
        console.log(mediaFiles[i].size);
    }

};
// capture error callback
var captureError = function(error) {
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
};
function onSuccessC(position) {
    latitud=position.coords.latitude;
    longitud=position.coords.longitude;
    //myApp.alert('Latitude: ' + position.coords.latitude+'<br /> Longitude: ' + position.coords.longitude, 'Ubicacion encontrada', function () {
//        //myApp.alert('Button clicked!')
//    });
}

// onError Callback receives a PositionError object
function onErrorC(error) {
    myApp.alert('Asegurese que tiene habilitada la geolocalizacion', 'Ubicacion no encontrada', function () {
        cordova.plugins.settings.open(function(){
            console.log("opened settings")
        },
        function(){
            console.log("failed to open settings")
        });
    });
    $$("#locacion").html("<span style='color:red'>Asegurese que tiene habilitada la geolocalizacion<span>");
}


