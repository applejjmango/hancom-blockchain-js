// Ch-08 Extract first half of string

// Write a function that takes a string (a) as argument
// Extract the first half a
// Return the result

function myFunction(a) {
  return a.slice(0, a.length / 2);
}

console.log(myFunction("gedcba"));

/* Test Cases

myFunction('abcdefgh') Expected 'abcd'
myFunction('1234') Expected '12'
myFunction('gedcba') Expected 'ged'

*/
