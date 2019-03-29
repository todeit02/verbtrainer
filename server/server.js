"use strict";
const express       = require('express');
const WordFrequency = require('./word_frequency');
const Dictionary    = require('./dictionary');
const Dexonline     = require('./dexonline');

const port = process.env.PORT || 3000;
const app = express();

WordFrequency.loadWordFrequencyTable();

app.use(express.static("public"));

app.get("^/verb/:verb([^/]+)", (req, res) =>
{
    res.send("Route unavailable.");
});

app.get("^/randomword/percentile/:percentile([0-9]{1,3})", (req, res) =>
{
    const randomWordIterator = (function *()
    {
        try
        {
            let result;
            do
            {
                result = yield getResult();
                console.log("yielded:", result);
            } while (!result);

            res.send(result);
        }
        catch (error)
        {
            res.send("An error occured ... :(");
            console.error(error);
        }
    })();

    const getResult = () =>
    {
        const randomWord = WordFrequency.getRandomWordByPercentile(Number(req.params.percentile));    
        Dictionary.getConjugation(Dexonline.searchUrlPattern, randomWord, Dexonline.scrapeConjugation)
        .then(result => randomWordIterator.next(result));        
    }    

    randomWordIterator.next();
});

app.listen(port, () => console.log("Server listening on port " + port));