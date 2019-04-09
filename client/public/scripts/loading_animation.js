const LoadingAnimation = (initLoadingAnimationDom, initDoneTextContent, initCompleteCount) =>
{
    const $loadingAnimation = $(initLoadingAnimationDom);

    const heightRegexMatches = /([0-9]*)([^0-9]*)/.exec($("#loadingImage", $loadingAnimation)[0].style.height);
    const fullHeightNumber = Number(heightRegexMatches[1]) || '';
    const fullHeightUnit = heightRegexMatches[2] || '';

    const fontSizeRegexMatches = /([0-9]*)([^0-9]*)/.exec($("#loadingImage > div")[0].style.fontSize);
    const fullFontSizeNumber = Number(fontSizeRegexMatches[1]) || '';
    const fullFontSizeUnit = fontSizeRegexMatches[2] || '';

    const doneTextContent = initDoneTextContent;
    const completeCount = initCompleteCount;
    let loadedCount = 0;


    showCurrentProgress();
    
    
    function advance()
    {
        loadedCount++;
        showCurrentProgress();
    }


    function showCurrentProgress()
    {
        console.log(`Loading: ${loadedCount / completeCount * 100}%`);
        $("#loadingImage", $loadingAnimation).css("height", (loadedCount / completeCount) * fullHeightNumber + fullHeightUnit);
        $("img", $loadingAnimation).css("height", $("#loadingImage", $loadingAnimation).css("height"));
        $("#loadingImage > div").css("font-size", (loadedCount / completeCount) * fullFontSizeNumber + fullFontSizeUnit);

        let settingText;
        if((loadedCount / completeCount) < 1) settingText = (loadedCount / completeCount * 100) + '%';
        else settingText = doneTextContent;

        $("#progressText", $loadingAnimation).text(settingText);
    }


    return { advance };
};