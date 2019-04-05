const LoadingAnimation = completeCount =>
{
    let loadedCount = 0;


    console.log("Loading: 0/" + completeCount);
    
    
    function advance()
    {
        loadedCount++;
        console.log(`Loaded: ${loadedCount}/${completeCount}`);
    }

    return { advance };
};