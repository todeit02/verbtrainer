function capitalizeFirstLetter(string)
{
    if(string.length === 0) return string;
    else return string.charAt(0).toUpperCase() + string.slice(1);
}


function getRandomArrayElement(array)
{
    if(!array && array.length) return null;        
    else return array[Math.floor(Math.random() * array.length)];
}