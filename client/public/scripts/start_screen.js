StartScreen = (() =>
{
    const screenUrl = "start.html";


    function run()
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
            
            const selectedDifficulty = $("#difficultySlider").val();
            $("#difficultyEmoji").text(convertDifficultyToEmoji(selectedDifficulty));
        });
    }


    function registerInputListeners(resolveScreenFinishedPromise)
    {
        $("#startButton").click(() =>
        {
            const wordsPercentile = 80;
            const exerciseCount = 10;    
            const languageCode = "ro";

            const trainingParameters =
            {
                exerciseCount,
                difficulty: $("#difficultySlider").val(),
                languageCode
            };

            resolveScreenFinishedPromise(trainingParameters);
        });

        $("#difficultySlider").on("input", function()
        {
            const selectedDifficulty = $(this).val();
            $("#difficultyEmoji").text(convertDifficultyToEmoji(selectedDifficulty));
        });
    }


    function convertDifficultyToEmoji(difficulty)
    {
        if(difficulty <= 20) return '👼';
        if(difficulty <= 40) return '😊';
        if(difficulty <= 60) return '😅';
        if(difficulty <= 80) return '😈';
        return '😵';
    }

    
    return { run };
})();