// Initialize your app
var myApp = new Framework7({
    init:true,
    preprocess: function (content, url, next) {
        myApp.alert(url);
        if (url === 'aviso.html') {
           myApp.alert(url);
        }else{
            myApp.alert(url);
        }
    }
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});


