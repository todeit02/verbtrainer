(async () => 
{
    let everythingIsGoingAsPlanned = true;

    do
    {
        let trainingParameters = await StartScreen.run();
        let completedExercises = await TrainingScreen.run(trainingParameters);
        await SummaryScreen.run(completedExercises);
    }
    while(everythingIsGoingAsPlanned);

    alert("The application has caused an error. Please reload the page.");
})();