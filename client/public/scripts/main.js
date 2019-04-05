(async () => 
{
    let everythingIsGoingAsPlanned = true;

    do
    {
        let trainingParameters = await StartScreen.run();
        let trainingResult = await TrainingScreen.run(trainingParameters);
        await SummaryScreen.run(trainingResult);
    }
    while(everythingIsGoingAsPlanned);

    alert("The application has caused an error. Please reload the page.");
})();