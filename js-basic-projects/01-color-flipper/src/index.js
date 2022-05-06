const colors = ["green", "red", "rgba(133,120,200)", "#f15035"];

const btn = document.getElementById("btn");
const color = document.querySelector(".color");

btn.addEventListener("click", function () {
  const randomNumber = getRandomNumber();

  document.body.style.backgroundColor = colors[randomNumber];
  document.textContent = colors[randomNumber];
});

const getRandomNumber = () => {
  const randomNumber = Math.floor(Math.random() * colors.length);
  return randomNumber;
};
