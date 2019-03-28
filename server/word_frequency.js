"use strict";
const promisesFilesystem = require('fs').promises;

let wordFrequencyTable = null;


async function loadWordFrequencyTable()
{
    return promisesFilesystem.readFile(__dirname + "/ro.txt")
    .then(data =>
    {
        const lines = data.toString().split(/\r?\n/);
        wordFrequencyTable = {};
        wordFrequencyTable.lines = [];
        wordFrequencyTable.totalOccurences = 0;

        for (const line of lines)
        {
            if(line === "") continue;

            const lineSegments = line.split(' ');
            const wordFrequency =
            {
                word: lineSegments[0],
                frequency: Number(lineSegments[1])
            };
            if(isNaN(wordFrequency.frequency)) throw ("Error loading word frequencies. Frequency was NaN at:", wordFrequency);
            wordFrequencyTable.totalOccurences += wordFrequency.frequency;

            wordFrequencyTable.lines.push(wordFrequency);
        }

        console.log("loaded words:", wordFrequencyTable.lines.length);
        console.log("total occurences:", wordFrequencyTable.totalOccurences);
    });
}


function getRandomWordByMinFrequency(minimalFrequency)
{
    if(!wordFrequencyTable) return null;

    let lastIndexAboveFrequency = (-1);

    for(let i = 0; i < wordFrequencyTable.lines.length; i++)
    {
        if(wordFrequencyTable.lines[i].frequency < minimalFrequency)
        {
            lastIndexAboveFrequency = (i - 1);
            break;
        }
    }
    if(lastIndexAboveFrequency < 0) return null;

    const randomIndex = Math.floor(Math.random() * (lastIndexAboveFrequency + 1));

    return wordFrequencyTable.lines[randomIndex].word;
}


function getRandomWordByPercentile(percentile)
{
    if(!wordFrequencyTable || wordFrequencyTable.lines.length === 0) return null;
    if(percentile <= 0 || percentile > 100) return null;

    const targetOccurenceCount = wordFrequencyTable.totalOccurences * (percentile / 100);
    let occurencesSum = 0;
    let maxIndex = 0;

    for(let i = 0; i < wordFrequencyTable.lines.length; i++)
    {
        occurencesSum += wordFrequencyTable.lines[i].frequency;

        if(occurencesSum >= targetOccurenceCount)
        {
            maxIndex = i;
            if(occurencesSum > targetOccurenceCount) maxIndex--;

            break;
        }
    }

    const randomIndex = Math.floor(Math.random() * (maxIndex + 1));
    const randomWord = wordFrequencyTable.lines[randomIndex].word;
    
    return randomWord;
}


module.exports = 
{
    loadWordFrequencyTable: loadWordFrequencyTable,
    getRandomWordByMinFrequency: getRandomWordByMinFrequency,
    getRandomWordByPercentile: getRandomWordByPercentile
};