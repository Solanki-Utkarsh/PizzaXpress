require('dotenv').config();
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000

const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo');
const passport = require('passport');
const { FALSE } = require('sass');


//database Connection

const url = 'mongodb://localhost/PizzaExpress';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).on('error', function(err) {
    console.log(err);
})

//session store
// let mongoStore = new MongoDbStore({
//     mongooseConnection: connection,
//     collection: 'sessions'
// })


//session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoDbStore.create({mongoUrl: url}),
    cookie: {maxAge: 1000 * 60 * 60 * 24}
}));


//passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Assets
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//global middleware jisse ki session ki info layout.ejs tak ja sake
app.use((req, res, next)=>{
    res.locals.session = req.session;
    res.locals.user = req.user;
    next()
})

//set template engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');








//(app) se function call ho rahi h jisse function chal jae web.js m 
require('./routes/web')(app);

app.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}`);
})