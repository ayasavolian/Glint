// *************************************************************************************
//
// @author - Arrash
// @date - 11/17/2015
// @version - 1.0.0
// @purpose - This is the JS related to the popup that will wait for the user to type
// in the name of the company theyre demoing to and pass that info to a function in background.js
//
// *************************************************************************************

window.onload = function() {
    var background = chrome.extension.getBackgroundPage(),
        clear = document.getElementById("clear-button"),
        submit = document.getElementById("submit-button");
    document.getElementById("logo").src = chrome.extension.getURL("images/glint.png");
    submit.onclick = function(){
        var inputVal = document.getElementById("input").value;
        background.setCompanyName(inputVal);
        document.getElementById("cleared").style.display = "none";
        document.getElementById("submitted").style.display = "block";
    }
    clear.onclick = function(){
        background.clearCompanyName();
        document.getElementById("cleared").style.display = "block";
        document.getElementById("submitted").style.display = "none";
    }
}