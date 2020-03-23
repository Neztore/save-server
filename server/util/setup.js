// Performs the initial set-up, including the creation of a root user.
/*
    This should:
        - Create tables
        - Create a root user;
            Username: root,
            Password: SaveServerRoot

      Install "flow"
      - npm install / clone?
      - Tell person to run node (or auto run with Env=start?)
      - Initial page load includes password change and config download
 */
const db = require("./db");
const fs = require("fs");

const file = "create.sql";
fs.readFile(file, "utf8",async function(err, data) {
    if (err) console.error("Warning: Failed to create tables.\n",err.message);
    const statements = data.split(";");
    let errors = 0;
    for (let counter =0; counter<statements.length;counter++) {
        try {
            await db.query(statements[counter]);
        } catch (e) {
            console.error(`Failed to run query at position ${counter}! \n    Error: ${e.message}`)
            console.log(`Query: ${statements[counter]}\n`)
            errors++
        }
    }
    console.log(`Database set up completed with ${errors} errors.`)

});
