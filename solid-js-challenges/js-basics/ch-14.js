// Clear up the chaos behind these strings

// It seems like something happened to these strings
// Can you figure out how to clear up the chaos?
// Write a function that joins these strings together such that they form the following words:
// 'Javascript', 'Countryside', and 'Downtown'
// You might want to apply basic JS string methods such as replace(), split(), slice() etc

function myFunction(a, b) {
  const cleanS1 = a.replace("%", "");
  const cleanS2 = b.replace("%", "");

  return cleanS1.charAt(0).toUpperCase() + cleanS1.slice(1) + cleanS2.split("").reverse().join("");
}

console.log(myFunction("c%ountry", "edis"));

/*

myFunction('java', 'tpi%rcs') Expected 'Javascript'
myFunction('c%ountry', 'edis') Expected 'Countryside'
myFunction('down', 'nw%ot') Expected 'Downtown'

*/
