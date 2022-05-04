// splice (특정 위치의 배열 요소를 수정하는 방법)
// splice(start)
// splice(start, deleteCount)
// splice(start, deleteCount, item1)

const fruits = ["melon", "banana", "apple", "kiwi", "watermelon"];

console.log(fruits.splice(2, 3));
console.log(fruits);

// console.log(fruits.splice(3, 1, "lemon"));
// console.log(fruits);
// console.log(fruits.splice(4, 0, "grape"));
// console.log(fruits);
