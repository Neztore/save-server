![Banner](https://i.imgur.com/3u9rTNm.png)

# save-server
<a href="https://npmjs.org/package/save-server" title="View this project on NPM" rel="nofollow"><img src="https://img.shields.io/npm/v/save-server.svg" alt="NPM version"></a>

Save-Server is a server for the [ShareX](https://getsharex.com/) tool built on [NodeJS](https://nodejs.org/en/), [Bulma](https://bulma.io) and [SQLite](https://sqlite.org/).

It is a little more heavy duty than other versions as it uses SQLite, allowing for "users" and for files to be filtered by owner, which is something I wanted.
Another interesting feature is that it fetches files based purely on their name and ignores the file extension. This means you could upload a txt file but have it render as Javascript, for example. 

## Features
- User system allows for user-specific filtering
- Admin dashboard
- Automatic ShareX configuration
- Markdown and code rendering, with syntax highlighting
- Flexible extensions (Files are identified by the name, extension is ignored)

Demo/Example (My instance): [https://i.nezto.re](https://i.nezto.re).

## Setting up
### Prerequisites
Before setting up save-server, you should:
- Install [NodeJS](https://nodejs.org/en/)
- (Optional) Install NGINX

### 1: Installing

#### Clone from GitHub
Use the command line program `git`:
```bash
$ git clone https://github.com/neztore/save-server
```
or, you can click Download on this page and then unzip it.
Then, you need to install depdencies:
```bash
$ cd save-server
$ npm install
```

#### Install from NPM
Alternatively, you can install it from NPM:
```bash
$ npm install save-server
```


### 2: Running and configuring the server
The only configuration value that needs to be passed is the port which the application should run on. By default, it listens on port 80 (http port).
To run the server, there are two ways. Regardless of which method you use to run it, you can provide the port through the `port` environment variable.
For servers with a lot of images or users, you may wish want to increase the length of the file name to prevent conflicts. Use the environment variable `nameLength` to do this - it defaults to `6`.

Run `npm start` to do this. For when this is running in production, you should use a process manager such as [pm2](https://pm2.keymetrics.io/), which can also take care of environment variables for you.

#### 2.1: Using "npm start"
This method is better suited if you cloned the server from GitHub. Just run `npm start` while in the project directory, or configure your process manager to do so.
Port can be configured by the setting the `port` environment variable.

#### 2.2:  Requiring the package
This method is generally for if you choose to download this package from NPM. You can require the package, which exports a function.
This function then takes a single value, the port to run on, which is passed to express. If this doesn't suit, you can also require and use the `port` environment variable.

##### Example code
```js
const saveServer = require("save-server");
saveServer(3000)
```

#### 2.3: Using Docker
The project contains a Dockerfile for building and running the server in a Docker container. You can set the build-time variables `port` and `nameLength` to configure these as mentioned [previously](#2-running-and-configuring-the-server). The image will inform Docker that it listens on the port specified by the build-time variable (80 by default).

A Docker bind mount is required to persist the database located at `server/util/save-server-database.db`. Additionally, a Docker volume mounted at `/usr/src/app/uploads` is required in order to persist uploaded files. You can create a volume with `docker volume create save-server-uploads` (following examples assume a volume named `save-server-uploads`).

The following will build an image with default values, and run a container in the background (`-d`) with port 80 (default server port) in the container mapped to port 80 on the host:
```sh
docker build -t save-server .
docker run -dp 80:80 -v "$(pwd)"/server/util/save-server-database.db:/usr/src/app/server/util/save-server-database.db -v save-server-uploads:/usr/src/app/uploads save-server
```

The following will build an image with `port` set to 3000, `nameLength` to 8, and publish port 3000 in the container to port 80 on the host:
```sh
docker build -t save-server --build-arg port=3000 nameLength=8 .
docker run -dp 80:3000 -v "$(pwd)"/server/util/save-server-database.db:/usr/src/app/server/util/save-server-database.db -v save-server-uploads:/usr/src/app/uploads save-server
```

See the [Docker documentation](https://docs.docker.com/) for more information on Docker.

#### 2.4 Changing the root password
> You **must** change the root password, otherwise this installation will be **horrifically** insecure.

Once you have the server running, open the dashboard and login to the root account with the following details:
- Username: `root`
- Password: `saveServerRoot`
You should then navigate to the `settings` page using the left panel and then update your password.
Once you've done this, use the `Create user` button to create a new user.

### Configuring ShareX
For easy configuration, this server comes with a config generator. Just access it on the domain you'd like to use, go to the settings of the user who's config you'd like to download, and click one of the download buttons.
The file config allows you to upload files such as images and markdown files, while the URL config allows you to add a link shortener.

### Additional set-up
I recommend that you install a reverse proxy such as [nginx](https://www.nginx.com/), and with [letsencrypt](https://letsencrypt.org/) you can set up free https support.
Please note that you must ensure that your proxy passes the `host` and `X-Forwarded-Proto` headers at a minimum. Express will trust these as it is set to trust proxies by default.

#### Example NGINX configuration:

    server {
        listen 80;
        server_name example.com www.example.com;
    
        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
## About
Each user is allocated a token. This token is used both to authenticate ShareX uploads and web panel access, through a cookie. This server features a rest API.

The SQLite database is included here for ease, but the root user is created at run time if it is not detected. You can find the SQL statements to create the statement tables should you wish to, for whatever reason, in `create.sql`.  

You can manually explore the SQLite data using a variety of tools, my favourite of which is the [SQLite browser](https://sqlitebrowser.org/).

#### A note on passwords
We use Bcrypt to hash passwords. This is timing attack-safe, but this algorithm only makes use of the first **72** bytes of your password.
The server will not accept passwords longer than 100 characters, and a warning will be displayed - but be aware of this! Encoding dependent, 72 bytes is *roughly* equal to 72 characters.

### Getting help
To get help setting this up, or if you encounter any issues you can:
1. Open an issue in the [Issues](https://github.com/Neztore/Save-Server) section of the GitHub repository.
2. You can contact me on Discord:
    - [Polaris discord server](https://discord.gg/QevWabU)
   
3. Email me: [hi@nezto.re](mailto:hi@nezto.re)
