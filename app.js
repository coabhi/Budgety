// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      //Create new Id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      //create new Item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //push it into our data structure
      data.allItems[type].push(newItem);
      //return the new Item
      return newItem;
    },
    deleteItem: function (type, id) {
      // data.allItems[type][id];
      var ids, index;
      var ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // calculate the budget: income- expenses
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totolInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  var formatNumber = function (num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }
    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        Value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },
    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayMonth: function () {
      var months = [
        "jan",
        "feb",
        "Mar",
        "April",
        "May",
        "June",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    displayBudget: function (obj) {
      var type;
      obj.type > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totolInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function (percentage) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      console.log(fields);

      nodeListForEach(fields, function (current, index) {
        if (percentage[index] > 0) {
          console.log(current.textContent);
          current.textContent = percentage[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    ChangeType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputButton).classList.toggle("red");
    },
    getDOMstrings: function () {
      return DOMstrings;
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;
      //create html string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        // console.log(element, type);
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //insert the html into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  //setupEventListeners function
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMstrings();
    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.ChangeType);
  };
  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 1  Return the budget
    var budget = budgetCtrl.getBudget();
    // 2. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };
  var updatePercentages = function () {
    // 1. calculate percentage
    budgetCtrl.calculatePercentages();
    // 2.Read percentages from the budget controller
    var percentage = budgetCtrl.getPercentages();
    // 3.Update the UI with the new Percentage
    UICtrl.displayPercentages(percentage);
  };
  var ctrlAddItem = function () {
    var input, newItem;
    //1. get the filed input data
    input = UICtrl.getInput();
    if (input.description !== "" && input.Value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.Value);
      // 3.add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4.clear the fields
      UICtrl.clearFields();
      // 5 calculate the budget
      updateBudget();
      // 6 calculate & Update the percentage
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemId, splitId, type, ID;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      //inc-1
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);
      // 1.Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delte the item from the UI
      UICtrl.deleteListItem(itemId);
      // 3.Update and show the new Budget
      updateBudget();
      // 4 calculate & Update the percentage
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totolInc: 0,
        totalExp: 0,
        percentage: 0,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
