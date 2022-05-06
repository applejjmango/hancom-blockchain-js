// Ch-7 - Get first n characters of string

// Write a function that takes a string (a) as argument
// Get the first 3 characters of a
// Return the result

function myFunction(a) {
  return a.slice(0, 3);
}

console.log(myFunction("fgedcba"));

/*

myFunction('abcdefg') Expected 'abc'
myFunction('1234') Expected '123'
myFunction('fgedcba') Expected 'fge'

*/
