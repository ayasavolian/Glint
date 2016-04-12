// *************************************************************************************
//
// @author - Arrash
// @last_modified - 2/28/2016
// @date - 2/29/2016
// @version - 1.4.1
// @purpose - This is the JS related to the popup that will wait for the user to type
// in the name of the company theyre demoing to and pass that info to a function in background.js
//
// *************************************************************************************

window.onload = function() {
    var background = chrome.extension.getBackgroundPage(),
        clear = document.getElementById("clear-button"),
        submit = document.getElementById("submit-button");
    document.getElementById("logo").src = chrome.extension.getURL("images/glint.png");
    var editDash = document.getElementById("edit-dashboard");
    var editCompany = document.getElementById("edit-company");
    var editImpact = document.getElementById("edit-impact");
    var departmentSubmit = document.getElementById("department-button");
    var impactSubmit = document.getElementById("impact-button");
    var departmentClear = document.getElementById("department-clear-button");
    var impactClear = document.getElementById("impact-clear-button");
    editImpact.onclick = function(){
        document.getElementById("edit-impact-drop-down-container").style.display = "block";
        document.getElementById("edit-dashboard-departments-container").style.display = "none";
        document.getElementById("choose-survey-company-container").style.display = "none";
        document.getElementById("edit-dashboard").style.display = "block";
        document.getElementById("edit-company").style.display = "block";
        document.getElementById("edit-impact").style.display = "none";
        document.getElementById("department-submitted").style.display = "none";
        document.getElementById("department-cleared").style.display = "none";
        document.getElementById("submitted").style.display = "none";
        document.getElementById("cleared").style.display = "none";
    }
    editDash.onclick = function(){
        document.getElementById("edit-impact-drop-down-container").style.display = "none";
        document.getElementById("edit-impact").style.display = "block";
        document.getElementById("impact-submitted").style.display = "none";
        document.getElementById("impact-cleared").style.display = "none";
        document.getElementById("edit-dashboard-departments-container").style.display = "block";
        document.getElementById("choose-survey-company-container").style.display = "none";
        document.getElementById("edit-dashboard").style.display = "none";
        document.getElementById("edit-company").style.display = "block";
        document.getElementById("department-submitted").style.display = "none";
        document.getElementById("department-cleared").style.display = "none";
        document.getElementById("submitted").style.display = "none";
        document.getElementById("cleared").style.display = "none";
    }
    editCompany.onclick = function(){
        document.getElementById("edit-impact-drop-down-container").style.display = "none";
        document.getElementById("edit-impact").style.display = "block";
        document.getElementById("impact-submitted").style.display = "none";
        document.getElementById("impact-cleared").style.display = "none";
        document.getElementById("edit-dashboard-departments-container").style.display = "none";
        document.getElementById("choose-survey-company-container").style.display = "block";
        document.getElementById("edit-dashboard").style.display = "block";
        document.getElementById("edit-company").style.display = "none";
        document.getElementById("department-submitted").style.display = "none";
        document.getElementById("department-cleared").style.display = "none";
        document.getElementById("submitted").style.display = "none";
        document.getElementById("cleared").style.display = "none";
    }
    submit.onclick = function(){
        var inputVal = document.getElementById("input").value;
        background.setCompanyName(inputVal);
        document.getElementById("cleared").style.display = "none";
        document.getElementById("submitted").style.display = "block";
    }
    impactSubmit.onclick = function(){
        outcomeArr = [document.getElementById("first-outcome").value,
            document.getElementById("second-outcome").value,
            document.getElementById("third-outcome").value];
        console.log(outcomeArr);
        background.setImpactNames(outcomeArr);
        document.getElementById("impact-submit-result").innerHTML = outcomeArr;
        document.getElementById("impact-cleared").style.display = "none";
        document.getElementById("impact-submitted").style.display = "block";
        document.getElementById("edit-impact-drop-down-container").style.display = "none";
    }
    departmentSubmit.onclick = function(){
        depArr = [document.getElementById("first-dep").value,
            document.getElementById("second-dep").value,
            document.getElementById("third-dep").value,
            document.getElementById("fourth-dep").value,
            document.getElementById("fifth-dep").value,
            document.getElementById("sixth-dep").value,
            document.getElementById("seventh-dep").value,
            document.getElementById("esat").value];
        console.log(depArr);
        background.setDepartmentNames(depArr);
        document.getElementById("department-submit-result").innerHTML = depArr;
        document.getElementById("department-cleared").style.display = "none";
        document.getElementById("department-submitted").style.display = "block";
        document.getElementById("edit-dashboard-departments-container").style.display = "none";
    }
    impactClear.onclick = function(){
        background.clearImpactNames();
        document.getElementById("edit-impact-drop-down-container").style.display = "none";
        document.getElementById("impact-submit-result").style.display = "none";
        document.getElementById("impact-cleared").style.display = "block";
        document.getElementById("impact-submitted").style.display = "none";
    }
    departmentClear.onclick = function(){
        background.clearDepartmentNames();
        document.getElementById("edit-dashboard-departments-container").style.display = "none";
        document.getElementById("department-submit-result").style.display = "none";
        document.getElementById("department-cleared").style.display = "block";
        document.getElementById("department-submitted").style.display = "none";
    }
    clear.onclick = function(){
        background.clearCompanyName();
        document.getElementById("cleared").style.display = "block";
        document.getElementById("submitted").style.display = "none";
    }
}