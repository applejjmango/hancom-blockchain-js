const hex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];

const btn = document.getElementById("btn");
const color = document.querySelector(".color");

btn.addEventListener("click", () => {
  // random color
  let hexColor = "#";

  // #0B4C2F
  // #0B4C2F
  for (let i = 0; i < 6; i++) {
    const number = getRandomNumber();
    hexColor += hex[number];
  }

  document.body.style.backgroundColor = hexColor;
  document.textContent = hexColor;
});

const getRandomNumber = () => {
  const randomNumber = Math.floor(Math.random() * hex.length);
  return randomNumber;
};
