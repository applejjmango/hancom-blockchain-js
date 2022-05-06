function eatMeals(food) {
  if (food === "sandwich") {
    eatLunch();
  } else {
    eatDinner();
  }
}
function eatLunch() {
  console.log("점심을 먹어요");
}
function eatDinner() {
  console.log("저녁을 먹어요");
}

eatMeals("sandwich");

// callback function
function eatMeals2(food, eatLunchCB, eatDinnerCB) {
  if (food === "sandwich") {
    eatLunchCB();
  } else {
    eatDinnerCB();
  }
}

function eatLunch2() {
  console.log("점심을 먹어요");
}

function eatDinner2(food) {
  console.log(`${food}로 저녁을 먹어요`);
}

eatMeals2("sandwich", eatLunch2, eatDinner2);

const eatMeals3 = (food, eatLunchCB, eatDinnerCB) => {
  if (food === "sandwich") {
    eatLunchCB();
  } else {
    eatDinnerCB(food);
  }
};

eatMeals3("egg", eatLunch2, eatDinner2);
