"use strict";
const jquery        = require('jquery');
const { JSDOM }     = require('jsdom');


const searchUrlPattern = "https://dexonline.ro/definitie/${this.query}";
const personsCount = 3;
const tableRowIndices =
{
    impersonalHeaders: 0,
    impersonal: 1,
    imperative: 2,
    tenses: 4,
    firstSingular: 5,
    firstPlural: 8
};
let scrapingJsdom;
let $;


function scrapeConjugationPossibilities(conjugatedVerb, pageHtml)
{
    console.log("Scraping for conjugatedVerb", conjugatedVerb);

    scrapingJsdom = new JSDOM(pageHtml);        
    $ = jquery(scrapingJsdom.window);
    
    const $verbLabel = $(".panel-body .label").filter((index, element) => element.textContent === "verb");
    if($verbLabel.length === 0) return null;
    // TO DO: there can be multiple conjugationTables (e.g. "voiam", but care for "vin")
    const $conjugationTables = $(".lexeme").filter((index, element) => $(element).siblings().has($verbLabel).length > 0);
    
    const conjugationPossibilities = {};
    conjugationPossibilities.verbs = [];
    
    $conjugationTables.each((index, conjugationTableDom) =>
    {
        const verb = scrapeOverVerbtable(conjugationTableDom, conjugatedVerb);     
        verb && conjugationPossibilities.verbs.push(verb);   
    });    

    if(conjugationPossibilities.verbs.length > 0)
    {
        conjugationPossibilities.conjugatedVerb = conjugatedVerb;
        return conjugationPossibilities;
    }
    else return null;
}


function scrapeOverVerbtable(conjugationTableDom, conjugatedVerb)
{
    const $conjugationTable = $(conjugationTableDom);

    const $conjugatedVerbListItems = $("li", $conjugationTable).filter((index, domElement) => domElement.textContent === conjugatedVerb);
    const $conjugatedVerbCells = $conjugatedVerbListItems.map((index, domElement) => $(domElement).closest("td"))
    .filter((index, $element) => $.contains(conjugationTableDom, $element[0]));

    if($conjugatedVerbCells.length === 0) return null;

    const isDefectiveVerb = ($conjugationTable.parent().find(".label:contains('defectiv')").length > 0);
    if(isDefectiveVerb) return null;

    const verb = {};
    verb.type = scrapeVerbtype($conjugationTable);
    verb.infinitive = scrapeInfintive($conjugationTable);
    verb.conjugationParametersList = [];

    $conjugatedVerbCells.each((index, conjugatedVerbCellDom) =>
    {
        const conjugationVerbCellIndices =
        {
            x: $(conjugatedVerbCellDom).index(),
            y: $(conjugatedVerbCellDom).closest("tr").index()
        }

        let scrapedConjugationParameters;
        if(conjugationVerbCellIndices.y === tableRowIndices.impersonal)
        {
            scrapedConjugationParameters = scrapeImpersonalConjugationParameters(conjugationVerbCellIndices);
        }
        else if(conjugationVerbCellIndices.y === tableRowIndices.imperative)
        {
            scrapedConjugationParameters = scrapeImperativeConjugationParameters(conjugationVerbCellIndices);
        }
        else if(conjugationVerbCellIndices.y >= tableRowIndices.firstSingular)
        {
            scrapedConjugationParameters = scrapePersonalConjugationParameters($conjugationTable, conjugatedVerbCellDom, conjugationVerbCellIndices);
        }        
        verb.conjugationParametersList.push(scrapedConjugationParameters);
    });

    return verb;
}


function scrapeVerbtype($conjugationTable)
{
    const inflectionType = $(`tr:eq(${tableRowIndices.impersonalHeaders}) td:eq(0) a`, $conjugationTable).text();
    
    if(inflectionType.includes("aux")) return "auxiliary";
    else return "full";
}


function scrapeInfintive($conjugationTable)
{
    const bareInfinitive = $(`tr:eq(${tableRowIndices.impersonal}) td:eq(0) li[class='']`, $conjugationTable)
    .filter((index, domElement) => domElement.classList.length === 0).text().trim();

    const infinitive = "a " + bareInfinitive;
    return infinitive;
}


function scrapeImpersonalConjugationParameters(conjugationVerbCellIndices)
{
    const conjugationParameters = {};

    if(conjugationVerbCellIndices.x === 0) conjugationParameters.form = "infinitiv";
    else if(conjugationVerbCellIndices.x === 1) conjugationParameters.form = "infinitiv lung";
    else if(conjugationVerbCellIndices.x === 2) conjugationParameters.form = "participiu";
    else if(conjugationVerbCellIndices.x === 3) conjugationParameters.form = "gerunziu";

    return conjugationParameters;
}


function scrapeImperativeConjugationParameters(conjugationVerbCellIndices)
{
    const conjugationParameters = {};
    conjugationParameters.person = 2;
    
    if(conjugationVerbCellIndices.x === 0) conjugationParameters.numerus = "singular";
    else if(conjugationVerbCellIndices.x === 1) conjugationParameters.numerus = "plural";
    
    conjugationParameters.mood = "imperativ";

    return conjugationParameters;
}


function scrapePersonalConjugationParameters($conjugationTable, conjugatedVerbCellDom, conjugationVerbCellIndices)
{        
    const conjugationParameters = {};
    conjugationParameters.person = convertPersonStringToNumber($(conjugatedVerbCellDom).siblings(".person").text()); 

    if(conjugationVerbCellIndices.y >= tableRowIndices.firstPlural) conjugationParameters.numerus = "plural";
    else if(conjugationVerbCellIndices.y >= tableRowIndices.firstSingular) conjugationParameters.numerus = "singular";
    else conjugationParameters.numerus = undefined;

    const firstLineElementIsNumerus = (conjugationVerbCellIndices.y === tableRowIndices.firstSingular || conjugationVerbCellIndices.y === tableRowIndices.firstPlural);
    const tenseColumnIndex = firstLineElementIsNumerus ? conjugationVerbCellIndices.x : (conjugationVerbCellIndices.x + 1);
    
    const moodfulTense = $(`tr:eq(${tableRowIndices.tenses}) td:eq(${tenseColumnIndex})`, $conjugationTable).text();
    if(moodfulTense.includes("conjunctiv"))
    {
        conjugationParameters.tense = moodfulTense.replace("conjunctiv", "").trim();
        conjugationParameters.mood = "conjuntiv";
    }
    else
    {
        conjugationParameters.tense = moodfulTense;
        conjugationParameters.mood = "indicativ";
    }

    return conjugationParameters;
}


function convertPersonStringToNumber(personString)
{
    switch(personString)
    {
        case "I (eu)":
        case "I (noi)":
        return 1;

        case "a II-a (tu)":
        case "a II-a (voi)":
        return 2;

        case "a III-a (el, ea)":
        case "a III-a (ei, ele)":
        return 3;

        default:
        return null;
    }
}


module.exports =
{
    searchUrlPattern: searchUrlPattern,
    scrapeConjugationPossibilities: scrapeConjugationPossibilities
};