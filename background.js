// *************************************************************************************
//
// @author - Arrash
// @last_modified - 11/17/2015
// @date - 11/23/2015
// @version - 1.2.2
// @purpose - The purpose is to be the background page for chrome extension and store values
// from the popup and to communicate with content
//
// *************************************************************************************


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
  localStorage.clear();
}

// *************************************************************************************
//
// This is a listener for a message sent from the content.js page. This will pass company
// that has been stored in localstorage back to content
//
// *************************************************************************************

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "company"){
      var companyName = localStorage.getItem('company');
      sendResponse({company: companyName});
    }
});