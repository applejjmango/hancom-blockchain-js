// Ch5 - Creating Javascript objects one

// Write a function that a string (a) as argument
// Create an object that has a property with key 'key' and a value of a
// Return the object
function myFunction(a) {
  return { key: a };
}

/* Test Cases
           
myFunction('a') Expected {key:'a'}
myFunction('z') Expected {key:'z'}
myFunction('b') Expected {key:'b'}
          
  */
