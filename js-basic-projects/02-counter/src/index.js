let count = 0;

const value = document.querySelector(".value");
const btns = document.querySelectorAll(".btn");

btns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    console.log(e.currentTarget);
    const styles = e.currentTarget.classList;
    console.log(styles);

    if (styles.contains("decrease")) {
      count--;
    }
    if (styles.contains("reset")) {
      count = 0;
    }

    if (styles.contains("increase")) {
      count++;
    }

    if (count > 0) {
      value.style.color = "green";
    } else if (count < 0) {
      value.style.color = "red";
    } else if (count === 0) {
      value.style.color = "black";
    }

    value.textContent = count;
  });
});
