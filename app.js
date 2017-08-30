var express = require('express');
var app = express();


app.use(express.static('app'));

app.set('views', './src/template');
app.set('view engine', 'pug');

app.get('/', function (req, res) {
    res.render('index', { message: 'Hello there!'});
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
