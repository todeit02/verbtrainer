"use strict";
const express       = require('express');
const WordFrequency = require('./word_frequency');
const Dictionary    = require('./dictionary');
const Dexonline     = require('./dexonline');

const port = process.env.PORT || 3000;
const app = express();

WordFrequency.loadWordFrequencyTable();
app.use(express.static(__dirname + "/../client/public"));

app.get("^/verb/:verb([^/]+)", (req, res) =>
{
    Dictionary.getWordInformation(Dexonline.searchUrlPattern, req.params.verb, Dexonline.scrapeConjugationPossibilities)
    .then(result => res.send(result))
    .catch(error =>
    {
        res.send("An error occured ... :(");
        console.error("Error on route ^/verb/:verb([^/]+):", error);
    });
});


app.get("^/randomconjugation/infinitive/:infinitive([^/]+)", (req, res) =>
{
    Dictionary.getWordInformation(Dexonline.searchUrlPattern, req.params.infinitive, Dexonline.scrapeRandomConjugationForInfinitive)
    .then(result => res.send(result))
    .catch(error =>
    {
        res.send("An error occured ... :(");
        console.error("Error on route ^/randomconjugation/infinitive/:infinitive([^/]+)", error);
    });
});


app.get("^/randomword/percentile/:percentile([0-9]{1,3})", (req, res) =>
{
    const randomWordIterator = (function *()
    {
        try
        {
            let result;
            let allowedTrials = 20;
            do
            {
                result = yield getResult();
                allowedTrials--;
            } while (!result && allowedTrials);

            if(!result) throw "Verb fetching timed out.";
            res.send(result);
        }
        catch (error)
        {
            res.send("An error occured ... :(");
            console.error(`Error on route "${arguments[0]}":`, error);
        }
    })();

    const getResult = () =>
    {
        const randomWord = WordFrequency.getRandomWordByPercentile(Number(req.params.percentile));    
        Dictionary.getWordInformation(Dexonline.searchUrlPattern, randomWord, Dexonline.scrapeConjugationPossibilities)
        .then(result => randomWordIterator.next(result));        
    }    

    randomWordIterator.next();
});


app.listen(port, () => console.log("Server listening on port " + port));