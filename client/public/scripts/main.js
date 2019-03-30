(() => 
{
    // TO DO: move this into a JSON file        
    const personalPronouns = 
    {
        ro:
        {
            singular:
            {
                1: ["eu"],
                2: ["tu"],
                3: ["el", "ea"]
            },
            plural:
            {
                1: ["noi"],
                2: ["voi"],
                3: ["ei", "ele"]
            }
        }
    };


    const auxiliaryVerbs =
    {
        ro:
        {
            perfect:
            {
                singular: { 1: "am", 2: "ai", 3: "a" },
                plural: { 1: "am", 2: "ați", 3: "au" }
            }
        }
    };


    const generalQuestions = 
    [
        "Cum se spune?",
        "Ce-i corect?",
        "Cum este potrivit?"   
    ];


    const ExerciseStatus = Object.freeze(
    {
        Pending: 1,
        Passed: 2,
        Failed: 3
    });



    const languageCode = "ro";
    const wordsPercentile = 80;

    const upcomingExercises = [];
    const finishedExercises = [];
    let workingExercise;
    let $displayingExerciseDom;

    $(".exercise").hide();
    showLoadExerciseSpinner();
    enqueueExercise(wordsPercentile)
    .then(() =>
    {
        console.log("Enqueued exercise.")
        displayNextExercise();
    });

    registerInputListeners();
    updateScoreView();



    function enqueueExercise(wordsPercentile)
    {
        return $.getJSON("/randomword/percentile/" + wordsPercentile)
        .then(conjugation =>
        {
            const enqueueingExercise = createExercise(conjugation, wordsPercentile, languageCode);
            upcomingExercises.unshift(enqueueingExercise);
        });
    }


    function createExercise(conjugation, wordsPercentile, languageCode)
    {
        const exercise = {};
        exercise.solution = conjugation.conjugatedVerb;
        exercise.infinitive = conjugation.infinitive;
        exercise.wordsPercentile = wordsPercentile;
        exercise.languageCode = languageCode;
        exercise.conjugationParameters = getRandomArrayElement(conjugation.conjugationParametersList);
        exercise.status = ExerciseStatus.Pending;
        
        return exercise;
    }


    function displayNextExercise()
    {        
        workingExercise = upcomingExercises.pop();

        const { languageCode, infinitive } = workingExercise;
        const { numerus, person, tense } = workingExercise.conjugationParameters;

        const exerciseDomId = getExerciseTemplateId(tense, workingExercise.conjugationParameters.mood, workingExercise.conjugationParameters.form);
        const $exerciseDom = $("#" + exerciseDomId);

        if(exerciseDomId === "presentIndicativeExercise")
        {
            $(".question", $exerciseDom).text(getRandomArrayElement(generalQuestions));
            const capitalizedPersonalPronoun = capitalizeFirstLetter(getRandomPersonalPronoun(languageCode, numerus, person));
            $(".personalPronoun", $exerciseDom).text(capitalizedPersonalPronoun);
            $(".infinitive", $exerciseDom).text(infinitive);
        }
        else if(exerciseDomId === "perfectExercise")
        {
            $(".question", $exerciseDom).text(getRandomArrayElement(generalQuestions));
            const randomNumerus = getRandomNumerus(languageCode);
            const randomPerson = getRandomPerson(languageCode);
            const capitalizedPersonalPronoun = capitalizeFirstLetter(getRandomPersonalPronoun(languageCode, randomNumerus, randomPerson));
            const auxiliaryVerb = getAuxiliaryVerb(languageCode, "perfect", randomNumerus, randomPerson);
            $(".perfectBegin", $exerciseDom).text(`${capitalizedPersonalPronoun} ${auxiliaryVerb}`);
            $(".infinitive", $exerciseDom).text(infinitive);
        }
        else if(exerciseDomId === "substantivationExercise")
        {
            $(".infinitive", $exerciseDom).text(infinitive);
        }
        else if(exerciseDomId === "imperativeExercise")
        {
            const capitalizedPersonalPronoun = capitalizeFirstLetter(getRandomPersonalPronoun(languageCode, numerus, person));
            $(".personalPronoun", $exerciseDom).text(capitalizedPersonalPronoun);
            $(".infinitive", $exerciseDom).text(infinitive);
        }

        $(".answer", $exerciseDom).val('');

        hideLoadExerciseSpinner();

        $displayingExerciseDom = $("#" + exerciseDomId).show();
    }


    function registerInputListeners()
    {
        $("#checkButton").click((event) =>
        {
            $(event.target).prop("disabled", true);

            handleAnswer($(".answer", $displayingExerciseDom).val());

            $(".exercise").hide();
            showLoadExerciseSpinner();
            enqueueExercise(wordsPercentile)
            .then(() =>
            {
                displayNextExercise();
                $(event.target).prop("disabled", false);
            });
        });

        $(".answer").keyup(event =>
        {
            if(event.key === "Enter") $("#checkButton").click();
        }); 
        
        $("#finishButton").click(() => alert("kthxbye"));
    }


    function getExerciseTemplateId(tense, mood, form)
    {
        if(tense === "prezent" && mood === "indicativ") return "presentIndicativeExercise";
        else if(form === "participiu") return "perfectExercise";
        else if(form === "infinitiv lung") return "substantivationExercise"; // TO DO: something wrong here
        else if(mood === "imperativ") return "substantivationExercise";

        return null;
    }


    function getRandomPersonalPronoun(languageCode, numerus, person)
    {
        return getRandomArrayElement(personalPronouns[languageCode][numerus][person]);
    }


    function getRandomAuxiliaryVerb(languageCode)
    {
        const languageAuxiliaryVerbs = auxiliaryVerbs[languageCode];
        const randomTenseVerbs = getRandomArrayElement(Object.values(languageAuxiliaryVerbs));
        const randomNumerusVerbs = getRandomArrayElement(Object.values(randomTenseVerbs));
        return getRandomArrayElement(Object.values(randomNumerusVerbs));
    }


    function getAuxiliaryVerb(languageCode, tense, numerus, person)
    {
        return auxiliaryVerbs[languageCode][tense][numerus][person];
    }


    function getRandomArrayElement(array)
    {
        if(!array && array.length) return null;        
        else return array[Math.floor(Math.random() * array.length)];
    }


    function getRandomPerson(languageCode)
    {
        return getRandomArrayElement(Object.keys(personalPronouns[languageCode][getRandomNumerus(languageCode)]));
    }


    function getRandomNumerus(languageCode)
    {
        return getRandomArrayElement(Object.keys(personalPronouns[languageCode]));
    }


    function handleAnswer(answer)
    {
        if(!workingExercise) return;

        console.log("User entered: " + answer);
        console.log("Solution was: " + workingExercise.solution);
        if(workingExercise.solution === answer) passExercise();
        else failExercise();
    }


    function passExercise()
    {
        workingExercise.status = ExerciseStatus.Passed;
        finishedExercises.push(workingExercise);
        updateScoreView();
        showExerciseSuccess();
    }


    function failExercise()
    {
        workingExercise.status = ExerciseStatus.Failed;
        finishedExercises.push(workingExercise);
        updateScoreView();
        showExerciseFailure();
    }


    function showExerciseSuccess()
    {

    }


    function showExerciseFailure()
    {

    }


    function updateScoreView()
    {
        let passedCount = 0;
        let failedCount = 0;

        for(const exercise of finishedExercises)
        {
            if(exercise.status === ExerciseStatus.Passed) passedCount++;
            else if(exercise.status === ExerciseStatus.Failed) failedCount++;
        }

        $("#passedCount").text(passedCount);
        $("#failedCount").text(failedCount === 0 ? 0 : ('-' + failedCount));
    }


    function showLoadExerciseSpinner()
    {
        $("#loadExerciseSpinner").show();
    }


    function hideLoadExerciseSpinner()
    {
        $("#loadExerciseSpinner").hide();
    }


    function capitalizeFirstLetter(string)
    {
        if(string.length === 0) return string;
        else return string.charAt(0).toUpperCase() + string.slice(1);
    }
})();