console.log(callMeA());
// console.log(callMeB());
// console.log(callMeC());

// 함수 선언식
function callMeA() {
  return "저를 불렀나요? Call me A";
}

// 함수 표현식
const callMeB = function () {
  return "저를 불렀나요? Call Me B";
};

// 화살표 함수
const callMeC = () => {
  return "저를 불렀나요? Call Me C";
};
