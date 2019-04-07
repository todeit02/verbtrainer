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
const tenseMoodIndices =
{
    "prezent":
    {
        "indicativ": 2,
        "conjunctiv": 3
    },
    "imperfect": { "indicativ": 4 },
    "perfect simplu": { "indicativ": 5 },
    "mai mult ca perfect": { "indicativ": 6 }
}
const formIndices =
{
    "infinitiv": 0,
    "infinitiv lung": 1,
    "participiu": 2,
    "gerunziu": 3
};
const moodColumnIndices =
{
    "imperativ": [0 ,1],
    "indicativ": [2, 4, 5, 6],
    "conjunctiv": [3]
}
const numerusPersonRowIndices =
{
    "singular": { 1: 5, 2: 6, 3: 7},
    "plural": { 1: 8, 2: 9, 3: 10}
}

let $;


function scrapeConjugationPossibilities(conjugatedVerb, pageDom)
{
    console.log("Scraping for conjugatedVerb", conjugatedVerb);

    $ = getJQueryFunction(pageDom);
    
    const $verbLabel = $(".panel-body .label").filter((index, element) => element.textContent === "verb");
    if($verbLabel.length === 0) return null;

    const $conjugationTables = $(".lexeme").filter((index, element) => $(element).siblings().has($verbLabel).length > 0);
    
    const conjugationPossibilities = {};
    conjugationPossibilities.verbs = [];
    
    $conjugationTables.each((index, conjugationTableDom) => 
    {
        const verb = scrapeVerbFromVerbtable(conjugationTableDom, conjugatedVerb);     
        verb && conjugationPossibilities.verbs.push(verb);   
    });

    if(conjugationPossibilities.verbs.length > 0)
    {
        conjugationPossibilities.conjugatedVerb = conjugatedVerb;
        return conjugationPossibilities;
    }
    else return null;
}


function scrapeRandomConjugationForInfinitive(infinitive)
{
    console.log("Scraping for infinitive", infinitive);

    scrapingJsdom = new JSDOM(pageHtml);        
    $ = jquery(scrapingJsdom.window);
    
    const $verbLabel = $(".panel-body .label").filter((index, element) => element.textContent === "verb");
    if($verbLabel.length === 0) return null;
    
    const $conjugationTables = $(".lexeme").filter((index, element) => $(element).siblings().has($verbLabel).length > 0);
    const $conjugationTablesReferringToInfinitive = $conjugationTables.filter((index, element) => scrapeInfintive($(element)) === infinitive);
    const randomTableIndex = Math.floor(Math.random() * $conjugationTablesReferringToInfinitive.length);
    const $randomTable = $conjugationTablesReferringToInfinitive.eq(randomTableIndex);

    $conjugationTables.each((index, conjugationTableDom) =>
    {
        if(scrapeInfintive($(conjugationTableDom)) !== infinitive) return;


        verb && conjugationPossibilities.verbs.push(verb);   
    });
}


function scrapeVerbFromVerbtable(conjugationTableDom, conjugatedVerb)
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

        scrapedConjugationParameters.synonymsIncludingSelf = scrapeSynonyms(conjugatedVerbCellDom);

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
    const bareInfinitive = $(`tr:eq(${tableRowIndices.impersonal}) td:eq(0) li[class='']:eq(0)`, $conjugationTable)
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


function scrapeSynonyms(conjugatedVerbCellDom)
{
    const synonymsIncludingSelf = {};

    $("li", conjugatedVerbCellDom).each((index, listItemDom) =>
    {
        if(listItemDom.classList.contains("notRecommended")) return;
        if(listItemDom.classList.length === 0)
        {
            if(!synonymsIncludingSelf.completeForms) synonymsIncludingSelf.completeForms = [];
            synonymsIncludingSelf.completeForms.push(listItemDom.textContent);
        }
        else if(listItemDom.classList.contains('elision'))
        {
            if(!synonymsIncludingSelf.elisionForms) synonymsIncludingSelf.elisionForms = [];
            synonymsIncludingSelf.elisionForms.push(listItemDom.textContent);
        }
    });

    return synonymsIncludingSelf;
}


function getJQueryFunction(pageDom)
{
    const scrapingJsdom = new JSDOM(pageDom);        
    return jquery(scrapingJsdom.window);
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


function getCellCoordinatesFromConjugation(conjugationParameters)
{
    const { form, numerus, mood, person, tense } = conjugationParameters;
    let x, y;

    if(form != null)
    {
        x = formIndices[form];
        y = tableRowIndices.impersonal;        
    }
    else if(mood === "imperativ") // person doesn't matter
    {
        const columnIndices = { 0: "singular", 1: "plural"};
        x = Object.keys(columnIndices).find(key => columnIndices[key] === numerus);
        y = tableRowIndices.imperative;
    }
    else if(tense != null)
    {
        x = tenseMoodIndices[tense][mood];
        if(x === tableRowIndices.firstSingular || x === tableRowIndices.firstPlural) x++;
        y = numerusPersonRowIndices[numerus][person];
    }
}


function getRandomConjugationParameters(personalFormWeight)
{
    
}


module.exports =
{
    searchUrlPattern: searchUrlPattern,
    scrapeConjugationPossibilities: scrapeConjugationPossibilities,
    scrapeRandomConjugationForInfinitive
};