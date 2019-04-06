const ExerciseStatus = Object.freeze(
{
    Pending: 1,
    Passed: 2,
    Failed: 3
});
    
    
function GetExerciseStatusCount(exercises, exerciseStatus)
{
    if(!exercises) return null;
    return exercises.filter(exercise => exercise.status === exerciseStatus).length;
}


Exercise = (conjugationPossibilities, initDifficulty, initLanguageCode) =>
{

    const solutions = [conjugationPossibilities.conjugatedVerb];        
    const verb = getRandomArrayElement(conjugationPossibilities.verbs);
    const infinitive = verb.infinitive;
    const difficulty = initDifficulty;
    const languageCode = initLanguageCode;
    const conjugationParameters = getRandomArrayElement(verb.conjugationParametersList);

    let status = ExerciseStatus.Pending;
    let answer = null;


    function getAnswer() { return answer };
    function setAnswer(settingAnswer) { answer = settingAnswer; }

    function getConjugationParameters() { return Object.assign({}, conjugationParameters); }

    function getInfinitive() { return infinitive; }

    function getLanguageCode() { return languageCode; }

    // function getMood() { return mood; }

    // function getNumerus() { return numerus; }

    // function getPerson() { return person; }

    function getSolutions() { return Array.from(solutions); }

    function getStatus() { return status; }
    function setStatus(settingStatus)
    {
        if(!settingStatus) throw "Invalid ExerciseStatus.";
        status = settingStatus;
    }

    // function getTense() { return tense; }

    function getVerbType() { return verb.type; }


    function getConjugationParametersAsString()
    {
        const orderedKeys = ["person", "numerus", "tense", "mood", "form"];

        let resultString = "";

        for(key of orderedKeys)
        {
            if(!conjugationParameters[key]) continue;
            
            resultString += conjugationParameters[key];
            if(key === "person") resultString += `. ${appStrings["person"][languageCode]}`;
            resultString += ", ";
        }

        resultString = resultString.replace(/, $/, '');

        return resultString;
    }


    return {
        get answer() { return getAnswer(); },
        set answer(value) { setAnswer(value); },

        get conjugationParameters() { return getConjugationParameters() },

        get infinitive() { return getInfinitive(); },

        get languageCode() { return getLanguageCode(); },

        // get mood() { return getMood(); },

        // get numerus() { return getNumerus(); },

        // get person() { return getPerson() },

        get solutions() { return getSolutions(); },

        get status() { return getStatus(); },
        set status(value) { setStatus(value); },

        // get tense() { getTense(); },

        get verbType() { return getVerbType(); },

        getConjugationParametersAsString
    };
};