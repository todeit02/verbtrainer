const HistoryQueue = () =>
{
    const queuedObjects = [];
    const poppedObjects = [];


    function push(exercise)
    {
        queuedObjects.unshift(exercise);
    }


    function peek()
    {
        return queuedObjects[queuedObjects.length - 1];
    }


    function pop()
    {
        const poppedObject = queuedObjects.pop();
        poppedObjects.push(poppedObject);

        if(queuedObjects.length === 0);
        return poppedObject;
    }


    function getAllPopped()
    {
        return Array.from(poppedObjects);
    }


    function getLength()
    {
        return queuedObjects.length;
    }


    return { 
        push,
        peek,
        pop,
        get allPopped() { return getAllPopped(); },
        get length() { return getLength(); }
    };
};