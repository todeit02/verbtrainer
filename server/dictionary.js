"use strict";
const request = require('request');


function getVerbPage(searchUrlTemplate, verb)
{
    return new Promise((resolve, reject) =>
    {
        const url = encodeURI(fillTemplate(searchUrlTemplate, {query: verb}));
        console.log("Request url:", url);

        request
        .get(url, (err, result, body) => 
        {
            if (err || result.statusCode !== 200) reject(err || result);
            else resolve(body);
        });
    });
}


async function getConjugation(searchUrlTemplate, verb, scraperFunction)
{
    console.log("Fetching conjugation parameters for:", verb);

    return getVerbPage(searchUrlTemplate, verb)
    .then(pageHtml => scraperFunction(verb, pageHtml));
}


function fillTemplate(templateString, templateVarsObject)
{
    return new Function("return `"+templateString +"`;").call(templateVarsObject);
}


module.exports =
{
    getConjugation: getConjugation
};