TrainingScreen = (() =>
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


    const screenUrl = "training.html";

    let loadingAnimation;
    let exerciseQueue;
    let workingExercise;
    let $displayingExerciseDom;


    function run(trainingParameters)
    {
        let resolveScreenFinishedPromise;
        let rejectScreenFinishedPromise;

        const screenFinishedPromise = new Promise((resolve, reject) =>
        {
            resolveScreenFinishedPromise = resolve;
            rejectScreenFinishedPromise = reject;
        });

        showScreen()
        .then(() =>
        {
            loadingAnimation = LoadingAnimation(trainingParameters.exerciseCount);
            showLoadExerciseSpinner();
            updateScoreViews([]);
            exerciseQueue = HistoryQueue();
            return enqueueExercises(trainingParameters, exerciseQueue);
        })
        .then(() =>
        {
            $(".exercise").hide();    
            displayNextExercise(exerciseQueue);
            hideLoadExerciseSpinner();
            showScoreViews();
            registerInputListeners(resolveScreenFinishedPromise);
        })
        .catch(rejectScreenFinishedPromise);

        return screenFinishedPromise;
    }


    async function showScreen()
    {        
        return $.get(screenUrl).then(screenDom =>
        {
            $("#centralContainer").empty();
            $("#centralContainer").append(screenDom);
            $(".exercise").hide();
        });
    }
    
    
    function enqueueExercises(trainingParameters, exerciseQueue)
    {
        const exerciseLoadedPromises = [];
        const wordsPercentile = convertDifficultyToWordListPercentile(trainingParameters.difficulty);

        for(let i = 0; i < trainingParameters.exerciseCount; i++)
        {
            const exerciseLoadedPromise = $.getJSON("/randomword/percentile/" + wordsPercentile)
            .then(conjugationPossibilities => 
            {
                const enqueueingExercise = Exercise(conjugationPossibilities, trainingParameters.difficulty, trainingParameters.languageCode);
                exerciseQueue.push(enqueueingExercise);
                loadingAnimation.advance();
            });

            exerciseLoadedPromises.push(exerciseLoadedPromise);
        }

        return Promise.all(exerciseLoadedPromises);
    }    


    function displayNextExercise(exerciseQueue)
    {        
        workingExercise = exerciseQueue.peek();
        console.log("workingExercise:", workingExercise);

        const { languageCode, verbType, infinitive } = workingExercise;
        const { numerus, person, tense, mood, form } = workingExercise.conjugationParameters;

        const exerciseDomId = getExerciseTemplateId(verbType, tense, mood, form);
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


    function registerInputListeners(resolveScreenFinishedPromise)
    {
        $("#checkButton").click(event =>
        {
            $(event.target).prop("disabled", true);

            handleAnswer($(".answer", $displayingExerciseDom).val());

            exerciseQueue.pop();
            updateScoreViews(exerciseQueue.allPopped);
            
            getAnimationsFinishedPromise($(".answer", $displayingExerciseDom)[0])
            .then(() =>
            {

                if(exerciseQueue.length > 0)
                {
                    $(".exercise").hide();    
                    displayNextExercise(exerciseQueue);
                    $(event.target).prop("disabled", false);
                }
                else resolveScreenFinishedPromise(exerciseQueue.allPopped);
            });
        });

        $(".answer").keyup(event =>
        {
            if(event.key === "Enter") $("#checkButton").click();
        }); 
        
        $("#finishButton").click(() => resolveScreenFinishedPromise(exerciseQueue.allPopped));
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
        workingExercise.answer = answer;
        if(workingExercise.solutions.map(solution => solution.toLowerCase()).includes(answer.toLowerCase()))
        {
            passExercise();
        }
        else failExercise();
    }


    function passExercise()
    {
        workingExercise.status = ExerciseStatus.Passed;
        showExerciseSuccess();
    }


    function failExercise()
    {
        workingExercise.status = ExerciseStatus.Failed;
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

        $(".answer", $displayingExerciseDom).val(workingExercise.solutions.join('|'));
    }


    function showScoreViews()
    {
        $("#passedCount").addClass("animatedSlideRightToZero");
        $("#failedCount").addClass("animatedSlideLeftToZero");

        getAnimationsFinishedPromise($("#passedCount")[0])
        .then(() =>
        {         
            $("#passedCount").css("transform", 'translate(0)');
            $("#passedCount").removeClass("animatedSlideRightToZero");   
        });
        getAnimationsFinishedPromise($("#failedCount")[0])
        .then(() =>
        {    
            $("#failedCount").css("transform", 'translate(0)');
            $("#failedCount").removeClass("animatedSlideLeftToZero");  
        });
    }


    function updateScoreViews(finishedExercises)
    {
        let passedCount = 0;
        let failedCount = 0;

        for(const exercise of finishedExercises)
        {
            if(exercise.status === ExerciseStatus.Passed) passedCount++;
            else if(exercise.status === ExerciseStatus.Failed) failedCount++;
        }

        $("#passedCount").text(passedCount === 0 ? 0 : ('+' + passedCount));
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
        $(".answer", domElement).removeClass("animatedCorrectAnswerBackground");
        $(".answer", domElement).removeClass("animatedWrongAnswerBackground");         
        $(".answer", domElement).val('');
    }


    function convertDifficultyToWordListPercentile(difficulty)
    {
        const minimalReasonablePercentile = 57;
        const maximallReasonablePercentile = 97;

        const percentileDifference = maximallReasonablePercentile - minimalReasonablePercentile;
        const percentile = Math.round(minimalReasonablePercentile + (difficulty / 100) * percentileDifference);
        return percentile;
    }


    return {
        run
    };
})();