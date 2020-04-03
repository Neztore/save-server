![Logo](https://i.nezto.re/fFskc6.png)
# save-server
Save-Server is a server for the [ShareX](https://getsharex.com/) tool built on [NodeJS](https://nodejs.org/en/), [Bulma](https://bulma.io) and [PostgreSQL](https://www.postgresql.org/).

It is a little more heavy duty than other versions as it is database backed, allowing for "users" and for files to be filtered by owner, which is something I wanted.
Another interesting feature is that it fetches files based purely on their name and ignores the file extension. This means you could upload a txt file but have it render as Javascript, for example. 

## Features
- User system allows for user-specific filtering
- Admin dashboard
- Automatic ShareX configuration
- Markdown and code rendering, with syntax highlighting

## Setting up
### Prerequisites
Before setting up save-server, you should:
- Install [NodeJS](https://nodejs.org/en/)
- Install a [PostgreSQL](https://www.postgresql.org/) server and set it up: [Tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04)
- (Optional) Install NGINX

### 1: Installing
There are two ways to install this server, either through NPM or by downloading it directly from GitHub.


#### Note: I have not finished writing this documentation. It will probably not work.
If you're trying to use this package, open an issue with whatever issues you're having or DM me on Discord: `Neztore#6998`
#### NPM
Optionally, create a folder and run npm init to set up your project.
```Bash
mkdir ShareXServer
cd ShareXServer
npm init
``` 
Install it:
```bash
npm install save-server
```

#### GitHub
```bash
git clone 
```