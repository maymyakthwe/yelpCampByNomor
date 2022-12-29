if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express')
const app = express();
const path = require('path')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpCamp';

const flash = require('connect-flash');
const session = require('express-session');

const userRoutes = require('./routes/userRoutes');
const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const MongoDBStore = require('connect-mongo')(session);

//'mongodb://127.0.0.1:27017/yelpCamp'

const mongoose = require('mongoose');
mongoose.connect(dbUrl);

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));//////

const secret = process.env.SECRET || 'Thisisthesecret';
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'colt@gmail.com', username: 'colt' })
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.listen('3000', () => {
    console.log('listening on 3000')
})

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Oh Boy Something Went Wrong.' } = err;
    if (!err.message) err.message = 'Oh no Something went wrong'
    res.status(statusCode).render('error', { err });
})


///smth wrong with new/post and the body pursing type. research
