const array = [5, "20", true, false, null, undefined, {}, [], () => {}, function () {}];

console.log(array);

const arrNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

arrNum.push(11); // 뒤에서 내용물 추가
console.log(arrNum);

arrNum.pop(); // 뒤에서 내용물 삭제
console.log(arrNum);

console.log(arrNum.length);

arrNum.unshift(0); //앞에서 내용물 추가
arrNum.shift(); // 앞에서 내용물 삭제

const people = [
  {
    name: "Kim",
    age: 23,
  },
  {
    name: "Lee",
    age: 25,
  },
  {
    name: "Yoo",
    age: 30,
  },
];
console.log(people[0]);
console.log(people[1]);
console.log(people[2]);
console.log(people[0].name);
console.log(people[0].age);

people.push({
  name: "Hong",
  age: 40,
});

console.log(people);
