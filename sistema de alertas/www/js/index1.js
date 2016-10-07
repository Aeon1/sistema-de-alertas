/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        db = window.openDatabase("Database", "1.0", "datos de acceso", 1000000);        
        //db.transaction(populateDB);
        checkConnection();
    }
    
};
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
    if (online=='1'){showAlert();}
    }
    function showAlert() {
    navigator.notification.alert(
    'Algunas caracteristicas no estaran disponibles',     // mensaje (message)
    'Sin internet',            // titulo (title)
    'Cerrar'                // nombre del botón (buttonName)
    );
    }
myApp.onPageInit('index', function (page) {
    myApp.alert("iniciado correctamente");
    
});
