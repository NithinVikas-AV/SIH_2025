const express = require("express");
const dotenv = require("dotenv");
const { neon } = require("@neondatabase/serverless");

dotenv.config();

const app = express();

const client = neon(process.env.DB_URL);

app.get("/test", (req, res) => {
    return res.send("Hello World!");
});

app.get('/', async (req, res) => {
    const data = await client`SELECT * FROM forum_categories`;

    console.log(data);

    return res.send('Success!');
});

app.listen(3000, () => {console.log("Server is running on port 3000");});