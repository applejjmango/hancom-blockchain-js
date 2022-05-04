// split (문자열을 배열요소로 나눠 만드는 방법)

const capitals = `Prague,Czech Republic, 
    Seoul, Republic of Korea, 
    Paris, France, 
    Madrid, Spain, 
    Rome, Italy`;

console.log("capitals as string => ", capitals);
console.log("capitals as array => ", capitals.split("\n"));

capitals.split("\n").forEach((el) => {
  console.log("el => ", el);
  const capitals = el.split(",")[0];
  console.log("capitals => ", capitals);
  const country = el.split(",")[1];
  console.log(`${capitals} is in ${country}`);
});

const helloWorld = "hello World";
console.log(helloWorld.split());
console.log(helloWorld.split(""));
console.log(helloWorld.split(" "));
