var express = require("express");
var mongoClient = require("mongodb").MongoClient;
var user = 'admin';
var password = '12345678';

var MONGOLAB_URI = 'mongodb://'+user+':'+password+'@ds017736.mlab.com:17736/urlshortener';
var app = express();

app.set('views', __dirname+"/views");
app.set('view engine','jade');


app.set('port', process.env.PORT || 5000);

function isURL(url) {
    var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    if (!re.test(url)) { 
        return false;
    }
    return true;
}

app.get('/',(req,res) => {
    res.render('index',{url:req.protocol + '://' + req.get('host')});
})

app.get('/:urlId', (req,res) => {
    mongoClient.connect(MONGOLAB_URI, (err,db) => {
        if (err) throw(err);
        var urlId = req.params.urlId;
        
        db.collection('urls')
            .findOne({
                _id: +urlId
            },function (err,doc){
                if (err) throw(err);
                if (doc){
                    res.redirect(doc.url);    
                }else{
                    res.json({
                       error: "url does not exist" 
                    });
                }
                
            });
    })
});

app.get('/new/*', (req,res) => {
    var url = req.params[0];
    if (!isURL(url)) {
        res.json({
            "error": "Wrong url format, make sure you have a valid protocol and real site."
        });
    }else{
        mongoClient.connect(MONGOLAB_URI, (err,db) => {
            if (err) throw(err);
            db.collection('counters').updateOne(
                {_id: 'urlId' }, 
                {$inc:{seq:1}},
                function (err,result){
                    if (err) throw(err);
                    db.collection('counters').findOne(
                        {_id: 'urlId'},
                        function(err,doc){
                            if (err) throw(err);
                            db.collection('urls')
                                .insertOne({
                                    url:url,
                                    _id: doc.seq
                                },(err,result) => {
                                    if (err) throw(err);
                                    var shortenUrl = req.protocol + '://' + req.get('host') +"/"+doc.seq;
                                    res.json({
                                        'original_url': url,
                                        'shorten_url': shortenUrl
                                    });
                                });
                        });
                });
        })
    }
});

app.listen(app.get('port'),() => {
    console.log('App is listening at port ' + app.get('port'));
})