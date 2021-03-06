const colors = [
  "00AFF0",
  "2c3e50",
  "2980b9",
  "7f8c8d",
  "f1c40f",
  "d35400",
  "27ae60",
];

const refMacro = { "P": 30, "C": 50, "G": 10 }

const userDataRequest = async () => {
  const response = await fetch("./users.json");
  usersData = await response.json();
};

const foodDataRequest = async () => {
  const response = await fetch("./food.json");
  foodData = await response.json();
};

const loginAcceptedSound = new Audio("./assets/sounds/loginAccepted.mp3"); // buffers automatically when created
const loginRejectedSound = new Audio("./assets/sounds/loginRejected.mp3"); // buffers automatically when created

let usersData;
let foodData;
let selectedDay = "A";
let userCode = "";
let userId;
let mealList = [];

document.addEventListener("DOMContentLoaded", function () {
  userDataRequest();
  foodDataRequest();
});

colors.each(function (color) {
  $$(".color-picker")[0].insert(
    '<div class="square" style="background: #' + color + '"></div>'
  );
});

$$(".color-picker")[0].on("click", ".square", function (event, square) {
  background = square.getStyle("background");
  $$(".custom-dropdown select").each(function (dropdown) {
    dropdown.setStyle({ background: background });
  });
  $$(".button7").each(function (buttonColor) {
    buttonColor.setStyle({ "background-color": background });
  });
});

switchMeal = function () {
  let meal = document.getElementById("mealSelector").value;
  document.getElementById("protein_counter").innerHTML =
    usersData[userId]["macroNutrients"][selectedDay][meal]["p"];
  document.getElementById("carb_counter").innerHTML =
    usersData[userId]["macroNutrients"][selectedDay][meal]["c"];
  document.getElementById("fat_counter").innerHTML =
    usersData[userId]["macroNutrients"][selectedDay][meal]["g"];
};

switchDay = function () {
  selectedDay = document.getElementById("daySelector").value;
  switchMeal();
};

const root = document.documentElement;

getCustomPropertyValue = function (name) {
  const styles = getComputedStyle(root);
  return styles.getPropertyValue(name);
};

const fieldset = document.querySelector(".fieldset");
const fields = document.querySelectorAll(".field");
const boxes = document.querySelectorAll(".box");

handleInputField = function ({ target }) {
  const value = target.value.slice(0, 1);
  target.value = value;

  const step = value ? 1 : -1;
  const fieldIndex = [...fields].findIndex((field) => field === target);
  const focusToIndex = fieldIndex + step;

  if (focusToIndex < 0 || focusToIndex >= fields.length) return;

  fields[focusToIndex].focus();
};
fields.forEach((field) => {
  field.addEventListener("input", handleInputField);
});

// Controls
const submitBtn = document.querySelector(".submit-btn");

// const successBtn = document.querySelector(".success-btn");
// const failureBtn = document.querySelector(".failure-btn");
// const resetBtn = document.querySelector(".reset-btn");

submitBtn.addEventListener("click", (event) => {
  let box1Val = document.getElementById("box1").value;
  let box2Val = document.getElementById("box2").value;
  let box3Val = document.getElementById("box3").value;
  let box4Val = document.getElementById("box4").value;
  let box5Val = document.getElementById("box5").value;

  userId = box1Val + box2Val + box3Val + box4Val + box5Val;
  userId = userId.toLowerCase();

  if (usersData[userId]) {
    console.log("Exist!");
    loginAcceptedSound.play();
    fieldset.classList.add("animate-success");
    setTimeout(function () {
      loginAccepted();
    }, 2300);
  } else {
    console.log("Not Exist!");
    loginRejectedSound.play();
    if (fieldset.classList.contains("animate-success")) {
      fieldset.classList.remove("animate-success");

      const delay = parseInt(
        getCustomPropertyValue("--transition-duration-step-1")
      );

      setTimeout(() => {
        animateFailure();
      }, delay);

      return;
    }

    animateFailure();
  }
});

// successBtn.addEventListener("click", (event) => {
//   fieldset.classList.add("animate-success");
// });

// resetBtn.addEventListener("click", (event) => {
//   fieldset.classList.remove("animate-failure");
//   fieldset.classList.remove("animate-success");
// });

const inputs = document.querySelectorAll(".settings-controls__input");

function setAnimationDuration({ target }) {
  const {
    value,
    dataset: { step },
  } = target;
  const safeValue = parseInt(value);
  const propertyValue = Number.isNaN(safeValue) ? null : safeValue + "ms";

  root.style.setProperty(`--transition-duration-step-${step}`, propertyValue);
};

getDelay = function () {
  const firstStepDuration = getCustomPropertyValue(
    "--transition-duration-step-1"
  );
  const secondStepDuration = getCustomPropertyValue(
    "--transition-duration-step-2"
  );

  return parseInt(firstStepDuration) + parseInt(secondStepDuration);
};

inputs.forEach((node) => {
  node.addEventListener("input", setAnimationDuration);
});

loginAccepted = function () {
  document.getElementById("codeInput").style.display = "none";
  getWelcome();
  handleUser();
  setTimeout(function () {
    document.getElementById("mainBody").style.display = "inherit";
    adaptLogo()
  }, 2800);
};

handleUser = function () {
  let customerUserName = document.getElementById("userName").innerHTML;
  document.getElementById("userName").innerHTML = customerUserName.replace(
    "Utente: Sconosciuto",
    "Ciao, " + usersData[userId]["firstName"] + "!"
  );
  if (usersData[userId]["owner"]) {
    let ownerButton = document.createElement("button");
    ownerButton.setAttribute("class", "button7 topRight");
    ownerButton.setAttribute("id", "ownerButton");
    ownerButton.setAttribute("type", "button");
    ownerButton.innerHTML = "Aggiungi Utente";
    ownerButton.addEventListener("click", addUser);
    document.body.appendChild(ownerButton);
    }
};

resetInputFields = function () {
  document.getElementById("box1").value = "";
  document.getElementById("box2").value = "";
  document.getElementById("box3").value = "";
  document.getElementById("box4").value = "";
  document.getElementById("box5").value = "";
};

buildSuggestion = function (ar) {
  let stringSuggestion = [];
  let tempString = "";
  let tempQuantity;

  ar.forEach((item, index) => {
    console.log("Index: " + index + " Item: " + item);
    console.log("Quantity before handle: " + item[1][0]["q"])
    tempQuantity = item[1][0]["q"];
    tempQuantity = handleQuantity(item);
    tempString = item[0] + " - " + tempQuantity + " " + item[1][0]["u"];
    tempString = tempString.toUpperCase();
    stringSuggestion.push(tempString);
  });

  return stringSuggestion;
};

handleQuantity = function (arr) {
  let currentProteins = document.getElementById("protein_counter").innerHTML; // k
  let currentCarbs = document.getElementById("carb_counter").innerHTML;
  let currentFats = document.getElementById("fat_counter").innerHTML;
  let foodName = arr[0];
  let foodQuantity = arr[1][0]["q"];
  let foodType = arr[1][0]["t"];

  console.log("HTML: " + currentProteins + " Quantity: " + foodQuantity + " Refmacro: " + refMacro["P"] + " Type: " + foodType)

  console.log("Check " + arr);

  if (foodData["P"][foodName] !== undefined) {
    if (currentProteins < 30) {
      foodQuantity = (currentProteins * foodQuantity) / refMacro["P"];
      console.log("RETURNED PROTEIN: " + foodQuantity);
    }
    return foodQuantity;
  } else if (foodData["C"][foodName] !== undefined) {
    if (currentCarbs < 50) {
      foodQuantity = (currentCarbs * foodQuantity) / refMacro["C"];
      console.log("RETURNED CARBS: " + foodQuantity);
    }
    return foodQuantity;
  } else if (foodData["G"][foodName] !== undefined) {
    if (currentFats < 10) {
      foodQuantity = (currentFats * foodQuantity) / refMacro["G"];
      console.log("RETURNED FAT: " + foodQuantity);
    }
    return foodQuantity;
  }
};

generateMeal = function () {
  let prevDiv = document.getElementById("mealSuggest");
  let mealDiv;
  let mealSuggestDiv;
  let ul;

  if (prevDiv) {
    console.log("ALWAYS DIV");
    prevDiv.remove();
  }

  mealSuggestDiv = document.createElement("div");
  mealSuggestDiv.setAttribute("class", "mealSuggest");
  mealSuggestDiv.setAttribute("id", "mealSuggest");
  document.body.appendChild(mealSuggestDiv);
  mealDiv = document.getElementById("mealSuggest");
  ul = document.createElement("ul");
  ul.setAttribute("class", "foodList");
  ul.setAttribute("id", "fL");

  let randomizedProteins = randomizeMeal(foodData["P"]);
  let randomizedCarbs = randomizeMeal(foodData["C"]);
  let randomizedFat = randomizeMeal(foodData["G"]);

  // console.log(randomizedProteins);
  // console.log(randomizedCarbs);
  // console.log(randomizedFat);

  mealList.push(randomizedProteins);
  mealList.push(randomizedCarbs);
  mealList.push(randomizedFat);

  console.log(mealList);
  let suggString = buildSuggestion(mealList);

  for (i = 0; i <= suggString.length - 1; i++) {
    // console.log(suggString[i]);
    let li = document.createElement("li");
    li.innerHTML = suggString[i];
    li.setAttribute("style", "foodlist");
    li.setAttribute("id", "foodlist");
    ul.appendChild(li);
  }

  mealDiv.appendChild(ul);
  mealList = [];
  suggString = [];
  li = [];
};

animateFailure = function () {
  fieldset.classList.add("animate-failure");
  const delay = getDelay();

  setTimeout(() => {
    fieldset.classList.remove("animate-failure");
  }, delay);
  setTimeout(() => {
    resetInputFields();
  }, delay);
};

getWelcome = function () {
  var welcomeDiv = document.createElement("div");
  welcomeDiv.textContent = "Benvenuto " + usersData[userId]["firstName"];
  welcomeDiv.setAttribute("class", "text");
  welcomeDiv.setAttribute("id", "welcomeText");
  document.body.appendChild(welcomeDiv);
  welcomeDiv = document.getElementById("welcomeText");
  setTimeout(function () {
    welcomeDiv.remove();
  }, 2500);
};

addUser = function () {
  console.log("Add user!")
  alert("Coming Soon!")
}; 

randomizeMeal = function (obj) {
  let keys = Object.keys(obj);
  let randomKey = (keys.length * Math.random()) << 0;
  let foodName = keys[randomKey];
  let tempNutrictionFact = obj[keys[randomKey]];
  let nutritionFacts = [];

  if (foodName == "albume") {
    foodName = "";
    keys = Object.keys(tempNutrictionFact);
    randomKey = (keys.length * Math.random()) << 0;
    tempNutrictionFact = tempNutrictionFact[keys[randomKey]];

    Object.keys(tempNutrictionFact).forEach((key) => {
      if (!foodName) {
        foodName = key;
      } else {
        foodName = foodName + " + " + key;
      }
      nutritionFacts.push(tempNutrictionFact[key]);
    });
  } else {
    nutritionFacts.push(tempNutrictionFact);
  }
  return [foodName, nutritionFacts];
};

adaptLogo = function () {
  let logoEl = document.querySelectorAll(".logo");
  logoEl.forEach((item, index, array) => {
    console.log(item["id"]);
    let element = document.getElementById(item["id"]);
    
    switch (item["id"]) {
      case 'logo-img':
        element.classList.add("logo-logged");
        break;
      case 'userName':
        element.classList.remove("userText");
        element.classList.add("userText-logged");
        element.classList.add("userText");

        break;
      default:
        console.log(`No event has been found for ${element}`);
    }
    
    console.log(element);

  });

}