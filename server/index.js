const express = require("express");
const path = require("path");

const files = require("./api/files");
const users = require("./api/users");
const links = require("./api/url");
const auth = require("./api/auth");

const {errorHandler} = require("./util");
const bodyParser = require('body-parser');
const cookie = require("cookie-parser");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cookie());

// Client
const client = path.join(__dirname, "client");
const pages = path.join(client, "pages");
app.use("/css", express.static(path.join(client, "css")));
app.use("/js", express.static(path.join(client, "js")));

// Routes
app.use("/files", files.router);
app.use("/users", users);
app.use("/links", links);
app.use("/u", links);

// Main routes
const getLoc = (n)=>path.join(pages, `${n}.ejs`);
app.get('/', (req, res) => res.render(getLoc("index")));

app.use("/home", auth.cookie);
app.get('/home', (req, res) => {
    res.render(getLoc("home"), {
        user: {
            username: req.user.username,
            isAdmin: req.user.isAdmin
        }
    });
});

const {port} = require("../config.js");
app.get('/:id', files.getFile);


// Error handling
app.use(errorHandler);

// 404
app.use(function (_req, res, _next) {
    res.status(404).render(getLoc(404))
});



process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err);
    process.exit(1) //mandatory (as per the Node.js docs)
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

// Required:
/*
    - Authentication
    - Upload file (done)
    - Delete file
    - Shorten url
    - Use shortened URL
        Add URL validation
        Client side
            HTML Form which sends POST to backend
            No authentication required
    - Gallery

 */