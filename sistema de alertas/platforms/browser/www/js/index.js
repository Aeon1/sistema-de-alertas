document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("offline", checkConnection, false);
document.addEventListener("online", checkConnection, false);
function onDeviceReady() {    
        db = window.openDatabase("Database", "1.0", "datos de acceso", 1000000);        
        db.transaction(populateDB);
        verificado();
        checkConnection();

}
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
 var online=0;
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
    mainView.router.loadPage('iniciar.html'); 
    //myApp.showPreloader('Verificando estado del registro');
//    console.log('verificando');
//        db.transaction(
//        function(tx) {
//        tx.executeSql('SELECT * FROM acceso',[],function(tx, results){
//            myApp.hidePreloader();
//            var len = results.rows.length;
//            if(len==1){ 
//                id_contacto=results.rows.item(0).contacto;
//                codigo_confirmacion=results.rows.item(0).confirmacion;
//                if(results.rows.item(0).verificado==1){ 
//                  mainView.router.loadPage('iniciar.html');  
//                }                        
//            }else{
//                myApp.hidePreloader();
//              aviso();  
//            }
//        });
//    });
                     
}
 // Initialize your app
var myApp = new Framework7({
    init:true,
    swipePanel:'left'
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
    swipeBackPage:false
});
//saber si el gps esta funcionando
myApp.onPageInit('index', function (page) {mainView.router.loadPage('iniciar.html');
    var watchID = navigator.geolocation.watchPosition(onSuccessC, onErrorC, { timeout: 5000 });
    $$("#robo").on("click",function(e){
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
    })
});
//comprobar nuevamente que el gps este activo
myApp.onPageBeforeInit('reporte', function (page) {
    navigator.device.capture.captureAudio(captureSuccessaudio, captureErroraudio, {});
    if(online==1){
    var path_audio="";
    var path_foto="";
    var path_video="";
    $$(page.navbarInnerContainer).find('#title_reporte').html(page.query.title);
    id_reporte=page.query.id;
    }else{
        mainView.router.loadPage('iniciar.html');
        myApp.alert("No puede enviar reportes internet","Internet no encontrado");
        
    }
//    if(latitud=="" || longitude==""){
//  navigator.geolocation.getCurrentPosition(onSuccessC, onErrorC,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
//    }
  $$('#audio').on('click', function (e) {
    navigator.device.capture.captureAudio(captureSuccessaudio, captureErroraudio, {});
}); 
$$("#foto").on("click",function(e){
    
})
});
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
    $$(".audio").removeClass('button-gold-c').addClass('active');;
};
// captura de audio con error
var captureErroraudio = function(error) {
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
        if(typeof cordova.plugins.settings.openSetting != undefined){
            cordova.plugins.settings.open(function(){
                    console.log("opened settings")
                },
                function(){
                    console.log("failed to open settings")
                });
        }
    });
    //mainView.router.loadPage('iniciar.html'); 
}
//camara
function onSuccess(imageData) {
    var image = document.getElementById('myImage');
    image.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
    alert('Failed because: ' + message);
}