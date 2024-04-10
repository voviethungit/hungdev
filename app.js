const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const indexRoute = require('./routes/index');
const config = require('./config');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'hungdevhehehehehe',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://voviethungdeveloper:TFxZINVZlKsD2gFk@cluster0.pv6rkef.mongodb.net/voviethungithehehe?retryWrites=true&w=majority',
      ttl: 7 * 24 * 60 * 60
    })
  }));
mongoose.connect(config.mongodbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

// Routes
app.use('/', indexRoute);
app.use('/', userRoutes);
app.use('/', postRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
