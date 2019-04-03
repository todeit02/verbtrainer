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
        console.log("Enqueued exercise.");
        $(".exercise").hide();    
        displayNextExercise();
        hideLoadExerciseSpinner();
    });

    registerInputListeners();
    updateScoreView();



    function enqueueExercise(wordsPercentile)
    {
        return $.getJSON("/randomword/percentile/" + wordsPercentile)
        .then(conjugationPossibilities =>
        {
            const enqueueingExercise = createExercise(conjugationPossibilities, wordsPercentile, languageCode);
            upcomingExercises.unshift(enqueueingExercise);
        });
    }


    function createExercise(conjugationPossibilities, wordsPercentile, languageCode)
    {
        const exercise = {};
        exercise.solution = conjugationPossibilities.conjugatedVerb;
        
        const verb = getRandomArrayElement(conjugationPossibilities.verbs);

        exercise.verbType = verb.type;
        exercise.infinitive = verb.infinitive;
        exercise.wordsPercentile = wordsPercentile;
        exercise.languageCode = languageCode;
        exercise.conjugationParameters = getRandomArrayElement(verb.conjugationParametersList);
        exercise.status = ExerciseStatus.Pending;
        
        return exercise;
    }


    function displayNextExercise()
    {        
        workingExercise = upcomingExercises.pop();
        console.log("workingExercise:", workingExercise);

        const { languageCode, verbType, infinitive } = workingExercise;
        const { numerus, person, tense } = workingExercise.conjugationParameters;

        const exerciseDomId = getExerciseTemplateId(verbType, tense, workingExercise.conjugationParameters.mood, workingExercise.conjugationParameters.form);
        const $exerciseDom = $("#" + exerciseDomId);

        resetExerciseTemplate($exerciseDom[0]);

        if(["presentIndicativeExercise", "imperfectExercise", "simplePastExercise", "pastPerfectExercise"].includes(exerciseDomId))
        {
            $(".question", $exerciseDom).text(getRandomArrayElement(generalQuestions));
            const capitalizedPersonalPronoun = capitalizeFirstLetter(getRandomPersonalPronoun(languageCode, numerus, person));
            $(".personalPronoun", $exerciseDom).text(capitalizedPersonalPronoun);
            $(".infinitive", $exerciseDom).text(infinitive);
        }
        else if(exerciseDomId === "perfectIndicativeExercise")
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

        $displayingExerciseDom = $("#" + exerciseDomId).show();

        $(".answer", $displayingExerciseDom).focus();
    }


    function registerInputListeners()
    {
        $("#checkButton").click((event) =>
        {
            $(event.target).prop("disabled", true);

            handleAnswer($(".answer", $displayingExerciseDom).val().toLowerCase());

            const exerciseEnqueued = enqueueExercise(wordsPercentile);
            const animationFinished = getAnimationsFinishedPromise($(".answer", $displayingExerciseDom)[0]);
            Promise.all([exerciseEnqueued, animationFinished])
            .then(() =>
            {
                $(".exercise").hide();    
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


    function getExerciseTemplateId(verbType, tense, mood, form)
    {
        if(verbType !== "full") return "unavailableExercise";

        if(tense === "prezent" && mood === "indicativ") return "presentIndicativeExercise";
        else if(tense === "imperfect") return "imperfectExercise";
        else if(tense === "perfect simplu") return "simplePastExercise";
        else if(form === "mai mult ca perfect") "pastPerfectExercise";
        else if(form === "participiu") return "perfectIndicativeExercise";
        else if(form === "infinitiv lung") return "substantivationExercise";
        else if(mood === "imperativ") return "imperativeExercise";

        return "unavailableExercise";
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
        $(".answer", $displayingExerciseDom).addClass("animatedCorrectAnswerBackground");
        $("#passedCount").addClass("shakeGrowAnimated");
        getAnimationsFinishedPromise($("#passedCount")[0])
        .then(() => $("#passedCount").removeClass("shakeGrowAnimated"));
    }


    function showExerciseFailure()
    {
        $(".answer", $displayingExerciseDom).addClass("animatedWrongAnswerBackground");  
        $("#failedCount").addClass("shakeGrowAnimated");
        getAnimationsFinishedPromise($("#failedCount")[0])
        .then(() => $("#failedCount").removeClass("shakeGrowAnimated"));      

        $(".answer", $displayingExerciseDom).val(workingExercise.solution);
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


    function getAnimationsFinishedPromise(domElement)
    {
        return new Promise(resolve =>
        {
            const listener = event =>
            {
                domElement.removeEventListener("animationend", listener);
                resolve(event);
            }
            domElement.addEventListener("animationend", listener);
        });
    }


    function resetExerciseTemplate(domElement)
    {
        console.log("Resetting", domElement.outerHTML);
        $(".answer", domElement).removeClass("animatedCorrectAnswerBackground");
        $(".answer", domElement).removeClass("animatedWrongAnswerBackground");         
        $(".answer", domElement).val('');
    }


    function capitalizeFirstLetter(string)
    {
        if(string.length === 0) return string;
        else return string.charAt(0).toUpperCase() + string.slice(1);
    }
})();