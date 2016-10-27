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
var promad="";
var instrucciones="";
var map;
 var online=0;
function onDeviceReady() {   
        db = window.openDatabase("Database", "1.0", "datos de acceso", 1000000);        
        db.transaction(populateDB);
        verificado(); 
        
    
}
document.addEventListener("offline", checkConnection, false);
document.addEventListener("online", checkConnection, false);
 // Initialize your app
var myApp = new Framework7({});

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
    //var watchId = navigator.geolocation.watchPosition(onSuccessC, onErrorC, {timeout: 5000});
    navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC, {timeout: 10000});
    var myApp = new Framework7({swipePanel:'left'});    
});
myApp.onPageInit('enviado', function (page) {
    path_audio="";
    path_foto="";
    path_video="";    
});
//comprobar nuevamente que el gps este activo
myApp.onPageBeforeInit('reporte', function (page) { 
    console.log(online);
    if(online==1){    
    var path_audio="";
    var path_foto="";
    var path_video="";
    $$(page.navbarInnerContainer).find('#title_reporte').html(decodeURI(page.query.title));
    $$(page.container).find("#instrucciones").html(decodeURI(page.query.instruc));
    id_reporte=page.query.id;
    }else{
        mainView.router.loadPage('iniciar.html');
        myApp.alert("No puede enviar reportes internet","Internet no encontrado");        
    } 
});
//mostrar folio de reporte
myApp.onPageBeforeInit('enviado', function (page) {
    $$(page.container).find('#foliorep').html("Folio de reporte: "+ page.query.folio);  
});
function iniciar(){
     mainView.router.loadPage('iniciar.html');
}
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
    mainView.router.loadPage('iniciar.html');
    myApp.alert("Algunas caracteristicas no estaran disponibles","Internet no detectado");
    
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
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,apellido_p,apellido_m,sexo,telefono,celular,nacimiento,enfermedad,sangre,email)');
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
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos(id INTEGER PRIMARY KEY AUTOINCREMENT,nombre,apellido_p,apellido_m,sexo,telefono,celular,nacimiento,enfermedad,sangre,email)');
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
            var len = results.rows.length;
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
                mainView.router.loadPage('aviso.html');            
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
        //myApp.closeModal('.popup-aviso')
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
                    navigator.contacts.find(
                        ['displayName', 'name','phoneNumbers'],
                        function(contacts){
                            var contact_name;
                            var contact_phone;                            
                            for( i = 0; i < contacts.length; i++) {
                                if(i==0){$$("#contacts").html("");}
                                if(contacts[i].name.formatted != null && contacts[i].name.formatted != undefined ) {
                                    contact_name = contacts[i].name.formatted;
                                    contact_name = contact_name.replace(/'/g,"''");
                                    if(contacts[i].phoneNumbers != null && contacts[i].phoneNumbers.length > 0 && contacts[i].phoneNumbers[0].value != null && contacts[i].phoneNumbers[0].value != undefined ) {
                                        $$("#contacts").append("<li><label class='label-checkbox item-content'><input type='checkbox' name='my-checkbox-"+i+"' value='"+contacts[i].phoneNumbers[0].value+"' nombre='"+contact_name+"'><div class='item-media'><i class='icon icon-form-checkbox'></i></div><div class='item-inner'><div class='item-title'>"+contact_name+"</div></div></label></li>");
                                    } else {contact_phone = "";}
                                }
                            }
                        },function(error){
                            alert(error);
                        },{ filter:"", multiple:true }
                    );           
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

//lleva a pantalla de direccion
function direction(){
    var nombre=$$("input[name='name']").val();
    var apellido_p=$$("input[name='s_name']").val();
    var apellido_m=$$("input[name='t_name']").val();
    var sexo=$$("select[name='sex']").val();
    var nacimiento=$$("input[name='born']").val();
    var telefono=$$("input[name='tel']").val();
    var celular=$$("input[name='cel']").val();
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
    }else if(celular=="" || celular.length!=10){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar su n&uacute;mero celular a 10 d&iacute;gitos',
        closeOnClick:true 
        });
        $$("input[name='cel']").focus();
    }else if(mail==""){
        myApp.addNotification({
        title: 'Campo requerido',
        message: 'Debe indicar su correo electr&oacute;nico',
        closeOnClick:true 
        });
    $$("input[name='mail']").focus();
       
    }else{
        
        db.transaction(
        function(tx) {
        tx.executeSql('DELETE FROM datos',[]);
        tx.executeSql('INSERT INTO datos(nombre,apellido_p,apellido_m,sexo,telefono,celular,nacimiento,enfermedad,sangre,email) VALUES(?,?,?,?,?,?,?,?,?,?)',[nombre,apellido_p,apellido_m,sexo,telefono,celular,nacimiento,enfermedad,sangre,mail]);
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
    var nombre="";var telefono="";
    db.transaction(
        function(tx) { 
    for (var x=0; x < checkboxes.length; x++) {
        nombre="";telefono="";
 if (checkboxes[x].checked) {
    cont = cont + 1;
    nombre=checkboxes[x].getAttribute('nombre');
    telefono=checkboxes[x].value;             
        tx.executeSql('INSERT INTO contactos(nombre,telefono) VALUES(?,?)',[nombre,telefono]);
 } 
 }
 if(cont>=1){
 myApp.modal({
    title:  'Importante',
    text: 'Favor de confirmar, una vez enviada la informaci&oacute;n el registro no podr&aacute; ser cancelado. Para confirmar el registro ingrese el c&oacute;digo de confirmaci&oacute;n que se enviar&aacute; al n&uacute;mero celular que registro.',
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
 });
 
}
function sendDatesServer(){  
    db.transaction(
        function(tx) {              
        tx.executeSql('SELECT nombre,apellido_p,apellido_m,sexo,telefono,celular,nacimiento,enfermedad,sangre,email,calle,numero,colonia,municipio FROM datos left join direccion where datos.id=? and direccion.id=?',[1,1],datosFin);
    });    
    }
    var telefono="";
function datosFin(tx, results){
    var len = results.rows.length;            
            telefono=results.rows.item(0).celular;
            var fecha=results.rows.item(0).nacimiento.split("-");
            var nacimiento=fecha[2]+"/"+fecha[1]+"/"+fecha[0];
            $$.ajax({
                        url:"http://201.134.126.30/BackEnd911WebService/Servicio.aspx",
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
                            TelefonoFijo:results.rows.item(0).telefono,
                            TelefonoMovil:results.rows.item(0).celular
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
                        url:"http://201.134.126.30/BackEnd911WebService/Servicio.aspx",
                        method: "POST", 
                        data: {op:'rce',IdContacto:id,CodigoConfirmacion:verificacion,Nombre:results.rows.item(i).nombre,PrimerApellido:'',SegundoApellido:'',TelefonoMovil:results.rows.item(i).telefono},
                        success: function(result){
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
    myApp.showPreloader('validando');    
    var verificacion;
    if(verify=="" || verify=="undefined" || verify==null){
    if($$("#codigo_confirmaciona").val()!=""){
            verificacion=$$("#codigo_confirmaciona").val();
        }else if($$("#codigo_confirmacion").val()!=""){
            verificacion=$$("#codigo_confirmacion").val();
        }
    }else{
        verificacion=verify;
    }
            $$.ajax({
                        url:"http://201.134.126.30/BackEnd911WebService/Servicio.aspx",
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
                        }, 
                        error: function(result){ 
                            myApp.alert('Ocurrio un error al intentar la verificaci&oacute;n', 'Error');
                            myApp.hidePreloader();
                        }
                        });
}
//mensajes de funcion de botones
function robo() {
    var buttons = [
        {
            text: 'Robo de veh&iacute;culo',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Robo%20de%20veh%C3%ADculo&id=7&instruc=Describa%20el%20modelo,%20placas,%20color,%20etc.%20acerca%20de%20su%20carro%20y%20la%20descripci%C3%B3n%20de%20los%20hechos%20o%20del%20asaltante%20en%20cuestion');
                }
        },
        {
            text: 'Robo a comercio',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Robo%20a%20comercio&id=8&instruc=Describa%20el%20incidente%20y/o%20descripci%C3%B3n%20de%20los%20responsables');
             }
        },
        {
            text: 'Robo a transporte p&uacute;blico',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Robo%20a%20transporte%20p%C3%BAblico&id=9&instruc=Describa%20el%20incidente%20y/o%20descripci%C3%B3n%20de%20los%20responsables');
                }
        },
        {
            text: 'Robo a persona',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Robo%20a%20persona&id=10&instruc=Describa%20el%20incidente%20y/o%20descripci%C3%B3n%20de%20los%20responsables');
            }
        },
    ];
    myApp.actions(buttons);
} 
function abuso_autoridad(){
    mainView.router.loadPage('reporte.html?title=Abuso%20de%20autoridad&id=24&instruc=Describa%20el%20incidente%20y%20descripci%C3%B3n%20de%20la%20autoridad%20responsable%20del%20abuso');
}
function incendio(){
    var buttons = [
        {
            text: 'Incendio de casa habitaci&oacute;n',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Incendio%20de%20casa%20habitaci%C3%B3n&id=11&instruc=Describa%20el%20incidente%20y/o%20descripci%C3%B3n%20de%20los%20responsables');
                }
        },
        {
            text: 'Incendio de veh&iacute;culo',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Incendio%20de%20veh%C3%ADculo&id=12&instruc=Describa%20el%20incidente%20y/o%20descripci%C3%B3n%20de%20los%20responsables');
             }
        },
        {
            text: 'Incendio de comercio/bodega',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Incendio%20de%20comercio/bodega&id=13&instruc=Describa%20el%20incidente%20y/o%20descripci%C3%B3n%20de%20los%20responsables');
                }
        },
        {
            text: 'Incendio de maleza/basura',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Incendio%20de%20maleza/basura&id=14&instruc=Describa%20el%20incidente%20y/o%20descripci%C3%B3n%20de%20los%20responsables');
            }
        },
        {
            text: 'Fuga de gas LP',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Fuga%20de%20gas%20LP&id=15&instruc=Describa%20el%20incidente%20y/o%20descripci%C3%B3n%20de%20los%20responsables');
            }
        },
    ];
    myApp.actions(buttons);
}
function violencia_mujeres(){
    var buttons = [
        {
            text: 'Violencia contra la mujer',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Violencia%20contra%20la%20mujer&id=1&instruc=Describa%20lo%20sucedido%20y%20descripci%C3%B3n%20de%20la%20afectada%20y/o%20responsable');
                }
        },
        {
            text: 'Violencia familiar',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Violencia%20familiar&id=2&instruc=Describa%20lo%20sucedido%20y%20descripci%C3%B3n%20de%20los%20afectados%20y/o%20responsable');
             }
        },
        {
            text: 'Violencia f&iacute;sica (ri&ntilde;a)',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Violencia%20f%C3%ADsica%20(ri%C3%B1a)&id=3&instruc=Describa%20lo%20sucedido%20y%20descripci%C3%B3n%20del%20afectado%20y/o%20responsable');
             }
        },
        {
            text: 'Violencia infantil',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Violencia%20infantil&id=4&instruc=Describa%20lo%20sucedido%20y%20descripci%C3%B3n%20del%20afectado%20y/o%20responsable');
             }
        },
        {
            text: 'Homicidio',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Homicidio&id=5&instruc=Describa%20lo%20sucedido%20y%20descripci%C3%B3n%20del%20afectado%20y/o%20responsable');
             }
        },
    ];
    myApp.actions(buttons);
}
function accidente(){
    var buttons = [
        {
            text: 'Con lesionados',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Accidente%20con%20lesionados&id=16&instruc=Describa%20los%20hechos%20ocurridos%20en%20el%20incidente');
                }
        },
        {
            text: 'Sin lesionados',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Accidente%20sin%20lesionados&id=17&instruc=Describa%20los%20hechos%20ocurridos%20en%20el%20incidente');
             }
        },
        {
            text: 'Tipo volcadura',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Accidente%20tipo%20volcadura&id=18&instruc=Describa%20los%20hechos%20ocurridos%20en%20el%20incidente');
                }
        },
    ];
    myApp.actions(buttons);
}
function emergencia(){
    var buttons = [
        {
            text: 'Persona inconsiente',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Emergencia%20persona%20inconsiente&id=19&instruc=Describa%20los%20hechos%20ocurridos%20en%20el%20incidente');
                }
        },
        {
            text: 'Ataque por convulciones',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Emergencia%20ataque%20por%20convulciones&id=20&instruc=Describa%20los%20hechos%20ocurridos%20en%20el%20incidente');
             }
        },
        {
            text: 'Ataque cardiaco',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Emergencia%20ataque%20cardiaco&id=21&instruc=Describa%20los%20hechos%20ocurridos%20en%20el%20incidente');
             }
        },
        {
            text: 'Caida/fractura',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Emergencia%20caida/fractura&id=22&instruc=Describa%20los%20hechos%20ocurridos%20en%20el%20incidente');
             }
        },
        {
            text: 'Electrocutado',
            onClick: function () {
                mainView.router.loadPage('reporte.html?title=Emergencia%20electrocutado&id=23&instruc=Describa%20los%20hechos%20ocurridos%20en%20el%20incidente');
             }
        },
    ];
    myApp.actions(buttons);
}
function privacion(){
    mainView.router.loadPage('reporte.html?title=Privaci%C3%B3n%20ilegal%20de%20la%20libertad&id=6&instruc=Describa%20las%20caracteristicas%20del%20privado%20y/o%20de%20los%20responsables');
}
function extorsion(){
    mainView.router.loadPage('extorsion.html');
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
        mimeType=mediaFiles[i].type;
    }
    mimeType_xa=mimeType;
    path_audio=path;
    $$(".audio").removeClass('button-gold-c').addClass('active');;
};
// captura de audio con error
var captureErroraudio = function(error) {
    navigator.notification.alert('No se grab&oacute; nada', 'Captura');
};
// captura de foto exitosa
var captureSuccessfoto = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
    mimeType=mediaFiles[i].type;
    }
    mimeType_xf=mimeType;
   path_foto=path ;
   $$(".foto").removeClass('button-gold-c').addClass('active');
};
// captura de foto con error
var captureErrorfoto = function(error) {
    navigator.notification.alert('No se captur&oacute; nada', 'Captura');
};
// captura de video exitosa
var captureSuccessvideo = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
    mimeType=mediaFiles[i].type;
    }
    mimeType_xv=mimeType;
path_video=path;
$$(".video").removeClass('button-gold-c').addClass('active');;
};
// captura de video con error
var captureErrorvideo = function(error) {
    navigator.notification.alert('No se captur&oacute; nada', 'Captura');
};
//obtencion de las coordenadas exitosa
function onSuccessC(position) {
    latitud=position.coords.latitude;
    longitude=position.coords.longitude; 
}
// obtencion de las coordenadas error
function onErrorC(error) {
    console.log("error de geolocalizacion "+error.message);  
}
//activar gps del celular
function activar_gps(){
    if(typeof cordova.plugins.settings.openSetting != undefined){
            cordova.plugins.settings.open(function(){
                    console.log("opened settings")
                },
                function(){
                    console.log("failed to open settings")
                });
        }
}
//boton llamada al 911
function onSuccesscall(result){
  console.log("Success:"+result);
}
function onErrorcall(result) {
 myApp.alert("Error:"+result);
}
function callNumber(number){
  console.log("Launching Calling Service for number "+number);
 window.PhoneCaller.call(number,onSuccesscall,onErrorcall);
}
//verificar ubicacion
function verify_ubic(){
      var popupHTML = '<div class="popup">'+
                    '<div class="content-block" style="height:100%;width:100%;padding:0;margin-top:3%">'+
                      '<div id="map"></div><img id="imgmapa" src="img/marker.png" /><div id="transmap"></div>'+
                      '<p style="position: relative;margin:10px 15px 10px 15px" id="coors">Verifique que el icono muestra el punto donde se encuentra actualmente, de lo contrario mueva el mapa hasta colocar el punto en su posici&oacute;n actual</p>'+
                      '<div class="row" style="position: relative;margin:0 15px 0 15px">'+
                          '<div class="col-50">'+
                            '<a href="#" class="button button-big button-red sombra-roja close-popup">Cancelar</a>'+
                          '</div>'+
                          '<div class="col-50">'+
                            '<a href="#" class="button button-big button-gold-c sombra close-popup" onclick="beforereport()">Enviar</a>'+
                          '</div>'+
                        '</div>'+
                    '</div>'+
                  '</div>';
  myApp.popup(popupHTML);
var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 24.798508, lng: -107.408766},
          scrollwheel: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          zoom: 14
        });
var marker = new google.maps.Marker({});
      if(latitud!="" && longitude!=""){
        var myLatLng = new google.maps.LatLng(latitud,longitude);
      }else{   
        latitud=24.798508;
        longitude=-107.408766;
        var myLatLng = new google.maps.LatLng(24.798508,-107.408766);
      }
map.setCenter(myLatLng);
map.addListener('dragstart', function (event){
   $$("#imgmapa").css('top','-36%');
      });
      
map.addListener("dragend",function(event){
            $$("#imgmapa").css('top','-32.5%');
        latitud=this.getCenter().lat();
        longitude=this.getCenter().lng();
            var marker = new google.maps.Marker({
            position: this.getCenter(),
            map: map
          });
});     
}
//aviso antes de envio de reporte
function beforereport(){
    myApp.modal({
    title:  'Importante',
    text: '<p>Est&aacute; por realizar el reporte de un "Incidente" una vez generado no podr&aacute; ser cancelado y se alertar&aacute; a las autoridades correspondientes para su atenci&oacute;n.</p><p>El uso indebido de esta aplicaci&oacute;n ser&aacute; sancionado</p><h3 class="gold text-center">&iquest;EST&Aacute; SEGURO DE CONTINUAR CON EL REPORTE?</h3> ',
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
           sendserver();            
        }
      },
    ]
  })
}
//envio del reporte
var totalx=0;
function sendserver(){
    if(latitud!="" && longitude!=""){
    $$("#aviso_importante").css('display', 'none');
    $$("#co_aviso").css('display', 'none');
    $$("#enviando_todo").css('display', 'block');
    descrip=$$("#hechos").val();
    $$.ajax({
        url:"http://201.134.126.30/BackEnd911WebService/Servicio.aspx",
        method: "POST",
        data: {op:'ri',IdContacto:id_contacto,CodigoConfirmacion:codigo_confirmacion,IdIncidente:id_reporte,Latitud:latitud,Longitud:longitude,DatosAdicionales:descrip},
            success: function(result){
                var json = JSON.parse(result);
                if(json.OcurrioError==0){
                        folio=json.FolioIncidente;
                        promad=json.FolioPromad;
                        if(path_audio!=""){
                            totalx+=1;
                            sendfiles(path_audio,folio,mimeType_xa); 
                            $$("#enviando_todo").append("<h2 class='text-center gold'>Enviando audio</h2>"+
                            "<div class='progressbar color-orange pgrs1' data-progress='0'><span></span>");                                                        
                        }
                        if(path_foto!=""){                            
                            totalx+=1;
                            sendfiles2(path_foto,folio,mimeType_xf); 
                             $$("#enviando_todo").append("<h2 class='text-center gold'>Enviando foto</h2>"+
                            "<div class='progressbar color-orange pgrs2' data-progress='0'><span></span>");                           
                        }
                        if(path_video!=""){
                            totalx+=1;
                            sendfiles3(path_video,folio,mimeType_xv);
                             $$("#enviando_todo").append("<h2 class='text-center gold'>Enviando video</h2>"+
                            "<div class='progressbar color-orange pgrs3' data-progress='0'><span></span>");                            
                        }     
                        $$("#preload_reporte").html("<img src='img/palomita.png' style='width:42px; height:42px;'/>");                   
                        if(totalx==0){                            
                            mainView.router.loadPage('final.html?folio='+promad);
                            console.log("sin archivos a enviar finalizado");
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
    }else{
        myApp.alert('La ubicacion no fue encontrada, por favor verifiquelas', 'Ubicacion no encontrada', function () {
        verify_ubic();
    });
        
        
       // myApp.alert('Asegurese que tiene habilitada la geolocalizacion', 'Ubicacion no encontrada', function (){
//        if(typeof cordova.plugins.settings.openSetting != undefined){
//            cordova.plugins.settings.open(function(){
//                    console.log("opened settings")
//                },
//                function(){
//                    console.log("failed to open settings")
//                });
//        }
//    });
    }
    
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
         mainView.router.loadPage('final.html?folio='+promad);
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
        mainView.router.loadPage('final.html?folio='+promad);
        console.log("no se pudo enviar el archivo");
    }
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}
//enviar los archivos
function sendfiles(fileURL,folio,mime){
    var uri = encodeURI("http://201.134.126.30/BackEnd911WebService/Servicio.aspx");
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
function sendfiles2(fileURL,folio,mime){
    var uri = encodeURI("http://201.134.126.30/BackEnd911WebService/Servicio.aspx");
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
                var progressbar= $$('.pgrs2');
                var total= Math.floor(progressEvent.loaded / progressEvent.total* 100);
                myApp.setProgressbar(progressbar,total);
        }
    };
    ft.upload(fileURL, uri, win, fail, options);
}
function sendfiles3(fileURL,folio,mime){
    var uri = encodeURI("http://201.134.126.30/BackEnd911WebService/Servicio.aspx");
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
                var progressbar= $$('.pgrs3');
                var total= Math.floor(progressEvent.loaded / progressEvent.total* 100);
                myApp.setProgressbar(progressbar,total);
        }
    };
    ft.upload(fileURL, uri, win, fail, options);
}

//funciones de sms
function sendSMS() {
    var sendto="";
    var textmsg="";//"Sufri un incidente, me encuentro en:";
    db.transaction(
        function(tx) {              
        tx.executeSql('select * from contactos',[],function(tx, results){
            var len = results.rows.length;            
            for (var i=0; i<len; i++){sendto += results.rows.item(i).telefono+";";}
            db.transaction(
                function(tx) {              
                tx.executeSql('select * from mensaje where id=?',[1],function(tx, results){
                    textmsg=results.rows.item(0).mensaje;
                    if(latitud!="" && longitude!=""){
                       textmsg=textmsg+" https://www.google.com.co/maps/place/"+latitud+","+longitude; 
                    }                        
                    	if(sendto.indexOf(";") >=0) {
                    	   sendto=sendto.substr(0,sendto.length-1)
                    		sendto = sendto.split(";");
                    		for(i in sendto) {
                    			sendto[i] = sendto[i].trim();
                    		}
                    	}
                        var options = {
                            replaceLineBreaks: false, // true to replace \n by a new line, false by default                           
                        };
                    	sms.send(sendto, textmsg,options, function(e){
                            myApp.alert("El mensaje a sido enviado",'SMS exitoso');
                        }, function(e){
                            myApp.alert('error: '+e, "SMS error");
                        });
                });
            });
            
        });
    });

}
//editar mensaje sms a enviar a contactos de emergencia
function Edit_message(){
    myApp.closePanel();
    mainView.router.loadPage('mensaje.html');
            db.transaction(
                function(tx) {              
                tx.executeSql('select * from mensaje where id=?',[1],function(tx, results){                        
                        $$("#mensaje_sms").text(results.rows.item(0).mensaje);
                        $$("#plus_sms").html("https://www.google.com.co/maps/place/"+latitud+","+longitude);
                });
            });
}
function save_mensaje(){
    var sms_mens = $$("#mensaje_sms").val();    
    db.transaction(
    function(tx) {              
        tx.executeSql('UPDATE mensaje SET mensaje=? where id=?',[sms_mens,1],function(tx,results){
            myApp.alert("Mensaje guardado correctamente","Guardado");
        }, function (error) {
        myApp.alert("Ocurrrio un error al intentar guardar los cambios","Error");
    });
    });
}
//ver y cambiar contactos de emergencia
function view_contacts(){
    myApp.closePanel();
    mainView.router.loadPage('contactos_ver.html');
        db.transaction(
            function(tx) {              
                tx.executeSql('select * from contactos',[],function(tx, results){                        
                var len=results.rows.length;
                for(var i=0; i<len; i++){
                    if(i==0){$$("#contacts_view").html("");}
                    $$("#contacts_view").append("<li class='item-content'>"+
                          "<div class='item-media'><i class='icon icon-form-name'></i></div>"+
                          "<div class='item-inner'>"+
                            "<div class='item-title'>"+results.rows.item(i).nombre+"</div>"+
                          "</div>"+
                        "</li>");
                }
            });
        });
    }
//modificar contactos
function modificar_con(){
    console.log("jecutando");
    mainView.router.loadPage('contactos _mod.html');
                    navigator.contacts.find(
                        ['displayName', 'name','phoneNumbers'],
                        function(contacts){
                            var contact_name;
                            var contact_phone;                            
                            for( i = 0; i < contacts.length; i++) {
                                if(i==0){$$("#contacts_m").html("");}
                                if(contacts[i].name.formatted != null && contacts[i].name.formatted != undefined ) {
                                    contact_name = contacts[i].name.formatted;
                                    contact_name = contact_name.replace(/'/g,"''");
                                    if(contacts[i].phoneNumbers != null && contacts[i].phoneNumbers.length > 0 && contacts[i].phoneNumbers[0].value != null && contacts[i].phoneNumbers[0].value != undefined ) {
                                        $$("#contacts_m").append("<li><label class='label-checkbox item-content'><input type='checkbox' name='my-checkbox-"+i+"' value='"+contacts[i].phoneNumbers[0].value+"' nombre='"+contact_name+"'><div class='item-media'><i class='icon icon-form-checkbox'></i></div><div class='item-inner'><div class='item-title'>"+contact_name+"</div></div></label></li>");
                                    } else {contact_phone = "";}
                                }
                            }
                        },function(error){
                            alert(error);
                        },{ filter:"", multiple:true }
                    );
}
//guardar los nuevos contactos
function Save_new_con(){    
    var checkboxes = $$("#contacts_m input[type='checkbox']");
    var cont = 0;
    for (var x=0; x < checkboxes.length; x++) {
     if (checkboxes[x].checked) {
        cont = cont + 1;
     } 
    }
 if(cont>=1){
 myApp.modal({
    title:  'Confirmaci&oacute;n',
    text: 'Favor de confirmar que desea cambiar sus contactos de emergencia',
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
            boygunew();
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
//borrar y guardar nuevos contactos
function boygunew(){           
    cont = 0; 
    var nombre="";var telefono="";
    db.transaction(
        function(tx) {
            tx.executeSql('DELETE FROM contactos',[],function(tx,results){
                myApp.showPreloader('Guardando contactos de emergencia');
                $$.ajax({
                        url:"http://201.134.126.30/BackEnd911WebService/Servicio.aspx",
                        method: "POST", 
                        data: {op:'ece',IDCONTACTO:id_contacto,CODIGOCONFIRMACION:codigo_confirmacion},
                        success: function(result){
                            var checkboxes = $$("#contacts_m input[type='checkbox']");
                                var cont = 0; 
                                var nombre="";var telefono="";
                                db.transaction(
                                    function(tx){ 
                                for (var x=0; x < checkboxes.length; x++) {
                                    nombre="";telefono="";
                             if (checkboxes[x].checked) {
                                cont = cont + 1;
                                nombre=checkboxes[x].getAttribute('nombre');
                                telefono=checkboxes[x].value;             
                                    tx.executeSql('INSERT INTO contactos(nombre,telefono) VALUES(?,?)',[nombre,telefono]);
                                    console.log(nombre+" - "+telefono+" count:"+cont);
                             } 
                             }
                             enviocontactos_new();
                             });                             
                         }, 
                        error: function(result){ 
                            myApp.alert('Ocurrio un error al registrar el contacto de emergencia ', 'Error');
                            myApp.hidePreloader();
                        }
                        });
            });
         });
}
//se envian los contactos al servidor
function enviocontactos_new(){
    db.transaction(
        function(tx) {              
        tx.executeSql('select * from contactos',[],function(tx, results){
            var len = results.rows.length;
            for (var i=0; i<len; i++){
                   $$.ajax({
                        url:"http://201.134.126.30/BackEnd911WebService/Servicio.aspx",
                        method: "POST", 
                        data: {op:'rce',IdContacto:id_contacto,CodigoConfirmacion:codigo_confirmacion,Nombre:results.rows.item(i).nombre,PrimerApellido:'',SegundoApellido:'',TelefonoMovil:results.rows.item(i).telefono},
                        success: function(result){
                            console.log("respuesta contactos: "+result);
                            myApp.hidePreloader();        
                            //mainView.router.loadPage('contactos_ver.html');
                            view_contacts();
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
