// *************************************************************************************
//
// @author - Arrash
// @last_modified - 1/18/2016
// @date - 1/22/2016
// @version - 1.3.7
// @purpose - The purpose is to be the background page for chrome extension and store values
// from the popup and to communicate with content
//
// *************************************************************************************


// *************************************************************************************
//
// this is a function that will take the departments that are typed in from the Chrome Plugin
// and store it in localStorage to be used later
//
// *************************************************************************************

var setDepartmentNames = function(departments){
	var dep = JSON.stringify(departments)
	localStorage.setItem("departments", dep);
	console.log(localStorage.getItem("departments"));
}

// *************************************************************************************
//
// This function will clear the department names from background's storage
//
// *************************************************************************************

var clearDepartmentNames = function(){
	localStorage.removeItem("departments");
}

// *************************************************************************************
//
// this is a function that will take the company that is typed in from the Chrome Plugin
// and store it in localStorage to be used later
//
// *************************************************************************************

var setCompanyName = function(company){
	localStorage.setItem("company", company);
	console.log(company);
}

// *************************************************************************************
//
// This function will clear the company name from background's storage
//
// *************************************************************************************

var clearCompanyName = function(company){
	localStorage.removeItem("company");
}

// *************************************************************************************
//
// This is a listener for a message sent from the content.js page. This will pass company
// that has been stored in localstorage back to content
//
// *************************************************************************************

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.greeting == "company"){
      var companyName = localStorage.getItem('company');
      sendResponse({company: companyName});
    }
    else if(request.greeting == "departments"){
      var departmentNames = localStorage.getItem('departments');
      sendResponse({departments: departmentNames});
    }
});