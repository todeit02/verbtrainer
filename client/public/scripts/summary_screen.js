const SummaryScreen = (() =>
{
    const screenUrl = "summary.html";

    function run(completedExercises)
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
            registerInputListeners(resolveScreenFinishedPromise);

            const passedCount = GetExerciseStatusCount(completedExercises, ExerciseStatus.Passed);
            const failedCount = GetExerciseStatusCount(completedExercises, ExerciseStatus.Failed);            
            setResultCounts(passedCount, failedCount);

            const failedExercises = completedExercises.filter(exercise => exercise.status === ExerciseStatus.Failed);
            fillMistakeList(failedExercises);
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


    function registerInputListeners(resolveScreenFinishedPromise)
    {
        $("#restartButton").click(resolveScreenFinishedPromise);
    }


    function setResultCounts(passedCount, failedCount)
    {
        $("#passedCount").text(passedCount === 0 ? 0 : ('+' + passedCount));
        $("#failedCount").text(failedCount === 0 ? 0 : ('-' + failedCount));
        
        const score = passedCount - failedCount;
        $("#scoreNumber").text(score);
    }


    function fillMistakeList(failedExercises)
    {
        for(failedExercise of failedExercises)
        {
            const $creatingFailedExercise = $(".mistakeItem.template").clone().removeClass("template");
            $(".infinitive", $creatingFailedExercise).text(failedExercise.infinitive);
            $(".conjugationParameters", $creatingFailedExercise).text(failedExercise.getConjugationParametersAsString());
            $(".wrongAnswer", $creatingFailedExercise).text(failedExercise.answer);
            $(".correctAnswer", $creatingFailedExercise).text(failedExercise.solutions.join('|'));

            $("#mistakesList").append($creatingFailedExercise);
        }
    }


    return { run };
})();