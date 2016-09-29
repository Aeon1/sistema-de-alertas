document.addEventListener("deviceready", onDeviceReady, false);
var db=null;
var id_contacto="";
var codigo_confirmacion="";
var latitud="";
var longitude="";
var id_reporte="";
var path_audio="";
var path_foto="";
var path_video="";
var mimeType_xa="";
var mimeType_xf="";
var mimeType_xv="";
function onDeviceReady() {   
        db = window.openDatabase("Database", "1.0", "datos de acceso", 1000000);        
        db.transaction(populateDB);
        //checkConnection();
        verificado();
         navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
}


 // Initialize your app
var myApp = new Framework7({swipePanel:'left'});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true,
    swipeBackPage:false
});
//saber si el gps esta funcionando
myApp.onPageInit('index', function (page) {
  navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
});
//comprobar nuevamente que el gps este activo
myApp.onPageBeforeInit('reporte', function (page) {
    var path_audio="";
    var path_foto="";
    var path_video="";
    $$(page.navbarInnerContainer).find('#title_reporte').html(page.query.title);
    id_reporte=page.query.id;
    if(latitud=="" || longitude==""){
  navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    }
    
});
function iniciar(){
     mainView.router.loadPage('iniciar.html');
}
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
    'Cerrar'                // nombre del bot�n (buttonName)
    );
    }


function transaction_error(tx, error) {
    console.log("Database Error: " + error);
}
function vaciar(){
    db.transaction(
        function(tx) {
    tx.executeSql('DROP TABLE IF EXISTS datos');
    tx.executeSql('DROP TABLE IF EXISTS contactos');
    tx.executeSql('DROP TABLE IF EXISTS aviso'); 
    tx.executeSql('DROP TABLE IF EXISTS direccion'); 
    tx.executeSql('DROP TABLE IF EXISTS acceso'); 
    tx.executeSql('CREATE TABLE IF NOT EXISTS aviso(id INTEGER PRIMARY KEY AUTOINCREMENT,acepto)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,apellido_p,apellido_m,sexo,telefono,nacimiento,enfermedad,sangre,email)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS direccion(id INTEGER PRIMARY KEY AUTOINCREMENT,calle,numero,colonia,municipio)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS contactos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,telefono)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS acceso(id INTEGER PRIMARY KEY AUTOINCREMENT,contacto,confirmacion,verificado)');
        });
        verificado();
}
function populateDB(tx) {  
//    tx.executeSql('DROP TABLE IF EXISTS datos');
//    tx.executeSql('DROP TABLE IF EXISTS contactos');
//    tx.executeSql('DROP TABLE IF EXISTS aviso'); 
//    tx.executeSql('DROP TABLE IF EXISTS direccion'); 
//    tx.executeSql('DROP TABLE IF EXISTS acceso'); 
    tx.executeSql('CREATE TABLE IF NOT EXISTS aviso(id INTEGER PRIMARY KEY AUTOINCREMENT,acepto)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,apellido_p,apellido_m,sexo,telefono,nacimiento,enfermedad,sangre,email)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS direccion(id INTEGER PRIMARY KEY AUTOINCREMENT,calle,numero,colonia,municipio)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS contactos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,telefono)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS acceso(id INTEGER PRIMARY KEY AUTOINCREMENT,contacto,confirmacion,verificado)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS mensaje(id INTEGER PRIMARY KEY AUTOINCREMENT,mensaje)');
    tx.executeSql('INSERT INTO mensaje(mensaje) VALUES(?)',['Tuve un incidente, estoy bien, estoy en:']);

}
function verificado(){
    myApp.showPreloader('Verificando estado del registro');
        db.transaction(
        function(tx) {
        tx.executeSql('SELECT * FROM acceso',[],function(tx, results){
            myApp.hidePreloader();
            console.log("iniciado");            
            var len = results.rows.length;
            console.log(len);
            if(len==1){
                id_contacto=results.rows.item(0).contacto;
                codigo_confirmacion=results.rows.item(0).confirmacion;
                if(results.rows.item(0).verificado==1){ 
                  mainView.router.loadPage('iniciar.html');  
                }                        
            }else{
              aviso();  
            }
        });
    });            
}

function aviso(){
        db.transaction(
        function(tx) {
            tx.executeSql('SELECT * FROM aviso',[],function(tx, results){
            var len = results.rows.length;
            if(len==0){
                myApp.popup('.popup-aviso');            
            }else{
              checkDatos();  
            }
        });
    });            
}
function aceptAviso(){
   db.transaction(
        function(tx) {  
        tx.executeSql('DELETE FROM aviso',[]);
        tx.executeSql('INSERT INTO aviso(acepto) VALUES(?)',['si']);
    });        
        checkDatos();
        myApp.closeModal('.popup-aviso')
}
function checkDatos(){
        db.transaction(
        function(tx) {
        tx.executeSql('SELECT * FROM datos',[],function(tx, results){
            var len = results.rows.length;
                if(len==0){
                    mainView.router.loadPage('personalDates.html');            
                }else{
                    checkDireccion();           
                }
        });
    });
}

//checar si ya tiene direccion guardada
function checkDireccion(){
    db.transaction(
        function(tx) {
        tx.executeSql('SELECT * FROM direccion',[],function(tx, results){
            var len = results.rows.length;
                if(len==0){
                    mainView.router.loadPage('direccion.html');            
                }else{
                    checkcontacts();
                    }
        });
    });
}
//checar si hay contactos registrados ya
function checkcontacts(){
    db.transaction(
        function(tx) {
        tx.executeSql('SELECT * FROM contactos',[],function(tx, results){
            var len = results.rows.length;
                if(len==0){
                    mainView.router.loadPage('contactos.html');            
                }else{
                     myApp.modal({
                    title:  'Importante',
                    text: 'Parece que tuviste problemas con el registro, los datos estan listos para ser enviados',
                    buttons: [
                      {
                        text: 'Cancelar',
                        onClick: function() {
                          myApp.closeModal();
                          vaciar();
                          verificado();
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
                    }
        });
    });
}
//si no se ha registrado le muestra la pantalla de registro
//function showDatosDireccion(tx, results){
//    var len = results.rows.length;
//        if(len==0){
//            mainView.router.loadPage('direccion.html');            
//        }else{
//            //obtener posicion
//           //navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
//         }
//}
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
        tx.executeSql('DELETE FROM datos',[]);
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
        tx.executeSql('DELETE FROM direccion',[]);
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
    var telefono="";
function datosFin(tx, results){
    startWatch();
    console.log("iniciado correctamente");
    var len = results.rows.length;            
            telefono=results.rows.item(0).telefono;
            var fecha=results.rows.item(0).nacimiento.split("-");
            var nacimiento=fecha[2]+"/"+fecha[1]+"/"+fecha[0];
            
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
function OnError(xhr, status){
    myApp.hidePreloader();
        myApp.alert("ocurrio un error, intente de nuevo","Error");
}
function Onbefore(xhr){
    console.log("enviando mensaje");
}
function OnSuccess(data, status, xhr){
    var json = JSON.parse(data);
    id_contacto=json.ContactoID;
    codigo_confirmacion=json.CodigoConfirmacion;
    db.transaction(
        function(tx) {
        tx.executeSql('DELETE FROM acceso',[]);
        tx.executeSql('INSERT INTO acceso(contacto,confirmacion) VALUES(?,?)',[id_contacto,codigo_confirmacion]);
    });
    $$.post("http://quody.co/sms.php",{To:telefono,Body:json.CodigoConfirmacion},function(vd){});
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
function finalizar(verify){
    stopWatch();
    myApp.showPreloader('validando');
    var verificacion
    if(verify==""){
    if($$(".codigo_confirmaciona").val()!=""){
            verificacion=$$(".codigo_confirmaciona").val();
        }
    if($$(".codigo_confirmacion").val()!=""){
            verificacion=$$(".codigo_confirmacion").val();
        }
    }else{
        verificacion=verify;
    }
        console.log(id_contacto+" "+verificacion);
            $$.ajax({
                        url:"https://uniformesyutilesescolares.sinaloa.gob.mx/BackEnd911WebService/Servicio.aspx",
                        method: "POST",
                        data: {op:'cr',IdContacto:id_contacto,CodigoConfirmacion:verificacion},
                        success: function(result){
                            myApp.hidePreloader();
                            var json = JSON.parse(result);
                            if(json.OcurrioError==0){   
                                db.transaction(
                                function(tx) {              
                                    tx.executeSql('UPDATE acceso SET verificado=?',[1]);
                                }); 
                                mainView.router.loadPage('iniciar.html');
                            }else{
                                myApp.alert(json.MensajeError, 'Error');
                            }
                            console.log("respuesta confirmacion "+result);
                        }, 
                        error: function(result){ 
                            myApp.alert('Ocurrio un error al intentar la verificacion', 'Error');
                            myApp.hidePreloader();
                        }
                        });
//    });
//});
}

//mensajes de funcion de botones
function robo() {
    var buttons = [
        {
            text: 'Robo habitacion',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Robo casa habitacion&id=1');
                }
        },
        {
            text: 'Robo a comercio',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Robo a comercio&id=2');
                
            }
        },
        {
            text: 'Robo de auto',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Robo de auto&id=3');
            }
        },
    ];
    myApp.actions(buttons);
} 
function abuso_autoridad(){
    mainView.router.loadPage('reporte.html?title=Abuso de autoridad&id=4');
}
function incendio(){
    mainView.router.loadPage('reporte.html?title=Incendio&id=5');
}
function violencia_mujeres(){
    var buttons = [
        {
            text: 'Violencia fisica mujeres',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Violencia fisica mujeres&id=6');
                }
        },
        {
            text: 'Violencia Psicologica mujeres',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Violencia Psicologica mujeres&id=7');
                
            }
        },
    ];
    myApp.actions(buttons);
}
function accidente(){
    mainView.router.loadPage('reporte.html?title=Accidente veicular&id=8');
}
function emergencia(){
    mainView.router.loadPage('reporte.html?title=Emergencia medica&id=9');
}
//funciones de captura de archivos
function audio(){
    navigator.device.capture.captureAudio(captureSuccessaudio, captureErroraudio, {limit:1});
}
function foto(){
    navigator.device.capture.captureImage(captureSuccessfoto, captureErrorfoto, {limit:1,quality: 0});
}
function video(){
    navigator.device.capture.captureVideo(captureSuccessvideo, captureErrorvideo, {limit:1,quality: 0});
}
// captura de audio exitosa
var captureSuccessaudio = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
        console.log(mediaFiles[i].size);
        mimeType=mediaFiles[i].type;
    }
    mimeType_xa=mimeType;
    path_audio=path;
    $$(".audio").removeClass('active').addClass('button-green');
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
    mimeType=mediaFiles[i].type;
    }
    mimeType_xf=mimeType;
   path_foto=path ;
   $$(".foto").removeClass('active').addClass('button-green');
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
    mimeType=mediaFiles[i].type;
    }
    mimeType_xv=mimeType;
path_video=path;
$$(".video").removeClass('active').addClass('button-green');
};

// captura de video con error
var captureErrorvideo = function(error) {
    console.log(error);
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
};
//obtencion de las coordenadas exitosa
function onSuccessC(position) {
    latitud=position.coords.latitude;
    longitude=position.coords.longitude;    
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
    mainView.router.loadPage('iniciar.html'); 
}
//activar gps del celular
function activar_gps(){
    cordova.plugins.settings.open(function(){
            console.log("opened settings")
        },
        function(){
            console.log("failed to open settings")
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

//envio del reporte
var totalx=0;
function sendserver(){
    $$("#aviso_importante").css('display', 'none');
    $$("#enviando_todo").css('display', 'block');
    $$.ajax({
        url:"https://uniformesyutilesescolares.sinaloa.gob.mx/BackEnd911WebService/Servicio.aspx",
        method: "POST",
        data: {op:'ri',IdContacto:id_contacto,CodigoConfirmacion:codigo_confirmacion,IdIncidente:id_reporte,Latitud:latitud,Longitud:longitude},
            success: function(result){
                var json = JSON.parse(result);
                if(json.OcurrioError==0){
                        folio=json.FolioIncidente;
                        if(path_audio!=""){
                            totalx+=1;
                            sendfiles(path_audio,folio,mimeType_xa);                                                        
                        }
                        if(path_foto!=""){                            
                            totalx+=1;
                            sendfiles(path_foto,folio,mimeType_xf);                            
                        }
                        if(path_video!=""){
                            totalx+=1;
                            sendfiles(path_video,folio,mimeType_xv);                            
                        }     
                        $$("#preload_reporte").html("<span style='color:#00FF00'>Enviado</span>");                   
                        if(totalx==0){                            
                            mainView.router.loadPage('final.html');
                            console.log("sin archivos a enviar finalizado");
                        }else{
                            $$("#enviando_todo").append("<h2 class=text-center>Enviado Foto</h2>"+
                            "<div class='progressbar pgrs1' data-progress='0'><span></span>");
                        }
                            }else{
                                myApp.alert(json.MensajeError, 'Error');
                                $$("#aviso_importante").css('display', 'block');
                                $$("#enviando_todo").css('display', 'none');
                            }
                        }, 
                        error: function(result){ 
                            myApp.alert('Ocurrio un error al intentar la verificacion', 'Error');
                            $$("#aviso_importante").css('display', 'block');
                            $$("#enviando_todo").css('display', 'none');
                        }
    });
    
}
//cancelar reporte
function cancelar_reporte(){
    mainView.router.loadPage('iniciar.html');
}


//envio de foto
function win(r) {
    totalx=totalx-1;
    console.log("total "+totalx);
    if(totalx==0){
         mainView.router.loadPage('final.html');
        console.log("enviandos los archivos finalizado");
    }
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
} 
function fail(error) {
    totalx=totalx-1;
    console.log("total "+totalx);
    if(totalx==0){
        mainView.router.loadPage('final.html');
        console.log("no se pudo enviar el archivo");
    }
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}
//enviar los archivos
function sendfiles(fileURL,folio,mime){
    var uri = encodeURI("https://uniformesyutilesescolares.sinaloa.gob.mx/BackEnd911WebService/Servicio.aspx");
 console.log(fileURL);
var options = new FileUploadOptions();
options.fileKey="archivos";
options.fileName=fileURL.substr(fileURL.lastIndexOf('/')+1);
options.mimeType=mime;
var params = new Object();
    params.FolioIncidente = folio ;
    params.op = "sa" ;
options.params = params;
var headers={'headerParam':'headerValue'};
 
options.headers = headers;
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
        if (progressEvent.lengthComputable) {
                var progressbar= $$('.pgrs1');
                var total= Math.floor(progressEvent.loaded / progressEvent.total* 100);
                myApp.setProgressbar(progressbar,total);
        }
    };
    ft.upload(fileURL, uri, win, fail, options);
}


//funciones de sms
function sendSMS() {
    var sendto="6672244900";
    var textmsg="Sufri un incidente, me encuentro en:";
    //db.transaction(
//        function(tx) {              
//        tx.executeSql('select * from contactos',[],function(tx, results){
//            var len = results.rows.length;            
//            for (var i=0; i<len; i++){
//                sendto += results.rows.item(i).telefono+";";                    
//            }
//        });
//    });
    db.transaction(
        function(tx) {              
        tx.executeSql('select * from mensaje',[],function(tx, results){
                textmsg = results.rows.item(0).mensaje;
        });
    });        	 
    textmsg+=" https://www.google.com.co/maps/place/"+latitud+","+longitude;
    myApp.alert(textmsg);
        	if(sendto.indexOf(";") >=0) {
        	   sendto=sendto.substr(0,sendto.length-1)
        		sendto = sendto.split(";");
        		for(i in sendto) {
        			sendto[i] = sendto[i].trim();
        		}
        	}
        	//if(SMS){
//        	   SMS.sendSMS(sendto, textmsg, function(){myApp.alert("Se ha enviado el mensaje");}, function(str){myApp.alert(str);});
//            }
        }
function startWatch() {
        	if(SMS) SMS.startWatch(function(){
        		myApp.alert('Esperando SMS', 'watching started');
        	}, function(){
        		myApp.alert('Error iniciar watching');
        	});
            initApp();
        }
        function stopWatch() {
        	if(SMS) SMS.stopWatch(function(){
        		myApp.alert('Se dejo de esperar SMS', 'watching stopped');
        	}, function(){
        		myApp.alert('failed to stop watching');
        	});
        }
function initApp() {
            document.addEventListener('onSMSArrive', function(e){
            	var data = e.data;
            	var datos=JSON.stringify( data );
                 var jsonobject = JSON.parse(datos);
            	if(jsonobject.address=="5549998687"){
            	   finalizar(jsonobject.body);
            	   //myApp.alert( jsonobject.body);
            	}    	
            	
            });
        }
function prueba(){
    $$.post("http://quody.co/sms.php",{To:'6672244900',Body:'mensaje prueba salida desde app'},function(vd){});
}