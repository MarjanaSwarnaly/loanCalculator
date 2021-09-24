//initial variables
var loanYear = 10;
var stepYear = 1;
var maxLoanYear = 30;
var paymentCycle = 1;
var monthlyRepayment = 0;
var monthlyInterest = 0;
var amortData = [];


//start up method
$(function () {


  $(".btn-group a").click(function () {
    $(".btn-group a").removeClass("active");
    $(this).addClass("active");
    paymentCycle = parseInt($(this).attr("data-value"));
    calculateLoan();
  });


  //Add on blur event
  $("#txtLoan, #txtInterest").on("blur", function () {
    //Perform a check if loan or interest value has been entered invalid value, if it is, set the default value 
    if (isNaN($("#txtLoan").val())) {
      $("#txtLoan").val(1000000);
    }

    if (isNaN($("#txtInterest").val())) {
      $("#txtInterest").val(8.99);
    }
    calculateLoan();
  });
});

//noUI slider range
var sliderFormat = document.getElementById('yearRange');

noUiSlider.create(sliderFormat, {
  step: stepYear,
  range: {
    min: 1,
    max: maxLoanYear
  },
  start: [loanYear],
  connect: 'lower',

  format: wNumb({
    parseFloat: 2,
    thousand: '.',
    suffix: ' (years)'
  })
});

var rangeSliderValueElement = document.getElementById('slider-range-value');

sliderFormat.noUiSlider.on('update', function (values, handle) {
  rangeSliderValueElement.innerHTML = values[handle];
});


//Add the change event to redraw the graph and calculate loan
sliderFormat.noUiSlider.on("change", function (value) {
  loanYear = parseInt(value[0]);
  calculateLoan();
});


//Get amortization data based on type and terms

function getAmortData(dataType, terms) {
  var dataValue = 0;
  switch (dataType) {
    case "interest":
      for (var i = 0; i < terms; i++) {
        dataValue += parseFloat(amortData[i].Interest);
      }
      break;
    case "balance":
      dataValue = parseFloat(amortData[terms - 1].Balance);
      break;
  }
  return Math.round(dataValue);
}

//calculate function
function calculateLoan() {
  $("#year-value").html(loanYear);
  var loanBorrow = parseFloat($("#txtLoan").val());
  var interestRate = parseFloat($("#txtInterest").val()) / 1200;
  var totalTerms = 12 * loanYear;

  //Monthly
  var schedulePayment = Math.round(loanBorrow * interestRate / (1 - (Math.pow(1 / (1 + interestRate), totalTerms))));
  monthlyRepayment = schedulePayment;
  var totalInterestPay = totalTerms * schedulePayment;
  amort(loanBorrow, parseFloat($("#txtInterest").val()) / 100, totalTerms);

  switch (paymentCycle) {
    case 2:
      //Fortnightly                                            
      //we multiple by 12 then divided by 52 then multiple by 2
      schedulePayment = Math.round(((schedulePayment * 12) / 52) * 2);
      break;
    case 3:
      //Weekly
      //we multiple by 12 then divided by 52 
      schedulePayment = Math.round((schedulePayment * 12) / 52);
      break;
  }

  $("#repayment-value").html(schedulePayment);
  $("#interest-total").html(getAmortData("interest", totalTerms));

  monthlyInterest = (totalInterestPay - loanBorrow) / totalTerms;

}

calculateLoan();

//function to calculate the amortization data
function amort(balance, interestRate, terms) {
  amortData = [];

  //Calculate the per month interest rate
  var monthlyRate = interestRate / 12;

  //Calculate the payment
  var payment = balance * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -terms)));

  for (var count = 0; count < terms; ++count) {
    var interest = balance * monthlyRate;
    var monthlyPrincipal = payment - interest;
    var amortInfo = {
      Balance: balance.toFixed(2),
      Interest: balance * monthlyRate,
      MonthlyPrincipal: monthlyPrincipal
    }
    amortData.push(amortInfo);
    balance = balance - monthlyPrincipal;
  }

}

// Listen for Submit
document.getElementById("loan-form").addEventListener("submit", function (e) {
  // Hide Results
  document.getElementById("collapseExample").style.display = "none";

  e.preventDefault();
});