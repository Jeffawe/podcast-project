import express from "express";
import hbs from 'hbs'
import bodyParser from 'body-parser'

import { google } from "googleapis";

const app = express();

app.set('view engine', 'hbs')
app.set('views', 'frontend');
app.use(bodyParser.json());

//Converts the Value into a way the frontend can read (Object Inside Array)
const Jsonize = (arr) => {
    let finalData = []

    arr.map((x) => {
        finalData.push(Object.assign({}, x));
    })

    return finalData;
}

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});


// Create client instance for auth
const client = await auth.getClient();


// Instance of google sheets API
const googleSheets = google.sheets({ version: "v4", auth: client });


const spreadsheetId = "1Al76fyd5nyurJ5GTklVODehuFBGDK3_4M46RwklkPaA";

app.get("/", async (req, res) => {
    //Get metaData about spreadsheets
    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,

    });

    let dataset = [];
    //res.send(metaData.data.sheets);
    //Gets the exact title
    metaData.data.sheets.map((x) => {
        dataset.push(x.properties.title);
    })

    //__dirname gets your current directory anme
    //res.sendFile("./views/index.html");
    res.send(dataset);
});

app.get(`/podcast/:channel`, async (req, res) => {
    try {
        let channel = req.params.channel;
        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${channel}!A2:B3`,
        })

        let finalData = Jsonize(getRows.data.values);

        res.render('index.hbs', { data: finalData })
        console.log(finalData)
        //res.send(getRows.data.values);
    } catch {
        res.render('index.hbs', { data: null })
        console.log("There has been an error")
    }


});

app.get(`/podcast/:channel/episode/:id`, async (req, res) => {
    try {
        let channel = req.params.channel;
        let id = Number(req.params.id) + 1;
        console.log(id);
        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${channel}!A${id}:F${id}`,
        })

        // console.log(`${channel}!A${id}:F${id}`)
        let finalData = Jsonize(getRows.data.values);

        res.render('episode.hbs', { data: finalData })
        console.log(finalData)
    } catch {
        res.render('episode.hbs', { data: null })
        console.log("There has been an error")
    }
});


app.listen(1337, (req, res) => console.log("running on 1337"));




