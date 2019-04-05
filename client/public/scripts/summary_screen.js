const SummaryScreen = (() =>
{
    const screenUrl = "summary.html";

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
            $(".exercise").hide();
        });
    }


    function registerInputListeners(resolveScreenFinishedPromise)
    {
        $("#restartButton").click(resolveScreenFinishedPromise);
    }


    return { run };
})();