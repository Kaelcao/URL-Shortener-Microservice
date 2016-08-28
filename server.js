var express = require("express");
var mongoClient = require("mongodb");
var app = express();

app.set('port', process.env.PORT || 5000);

app.get('/new?url', (req,res) => {

});

app.listen(app.get('port'),() => {
    console.log('App is listening at port ' + app.get('port'));
})