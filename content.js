// *************************************************************************************
//
// @author - Arrash
// @last_modified - 1/22/2016
// @date - 1/22/2016
// @version - 1.3.4
// @purpose - The purpose is to be the content page for chrome extension and listens for
// changes in the pages and changes the DOM of Glint.
//
// *************************************************************************************

console.log("Glint Plugin > Running");

// *************************************************************************************
//
// All of the regex expressions that will be used to listen for what page the user is on
// there are 4 main ones. We listen to see if theyre on the survey, and then if they're on 
// the survey then we'll see if theyre on the done page or within the actual questionnaire
//
// *************************************************************************************

var inSurvey = new RegExp('#/questionnaire/preview'),
        thanks = new RegExp('#/questionnaire/done/preview'),
        survey = new RegExp('#/questionnaire/'),
        reports = new RegExp('#/results/report'),
        results = new RegExp('results'),
        comments = new RegExp('comments'),
        commentKeyword = new RegExp('available career pathing'),
        welcome = new RegExp('Welcome to the Glint Pulse.'),
        dashboard = new RegExp('#/dashboard'),
        surveyTab = new RegExp('surveys'),
        lunchSnippet = new RegExp('located next to Cal Train'),
        heatMap = new RegExp('REPORT_TYPE_ENGAGEMENT_HEATMAP'),
        executiveSummary = new RegExp('REPORT_TYPE_ENGAGEMENT_EXECUTIVE_SUMMARY'),
        careerPathingWords = [
            "<b>Available career pathing</b> is very limited in the sales organization.",
            "I am routinely told that <b> available career pathing </b> will be prioritized, but it never materializes.",
            "We need to put a greater emphasis on <b>available career pathing</b>.",
            "<b>Available career pathing</b> is not a major priority for my manager.",
            "I have been thoroughly impressed with the <b>available career pathing</b> for recent college graduates.",
            "<b>Available career pathing</b> was billed as a key cultural value in the interview process but hasn't lived up to expectations.",
            "<b>Available career pathing</b> is discussed in every quarterly review that I have with my manager. They show a strong commitment to my development.",
            "I am not happy with the <b>available career pathing</b> my manager provides.",
            "I am frustrated by the <b>available career pathing</b> that has been available so far. I hope there are improvements.",
            "I am happy with the <b>available career pathing</b> in my current job."
        ],
        snippetsWords = [
        "I feel like our culture has improved a lot but I'd still like to see more for the available career pathing. My manager has been talking about improvements but little has happened.",
        "We could really use a team for volunteers and philanthropy. We don't do enough in the community and it's important to give back.",
        "I believe our senior management team has been doing a great job at making improvements to our culture but could make even more improvements to our available career pathing.",
        "All hands meetings are sporadic and late in the day often on Fridays. This impacts being able to plan ahead for work or personal engagement. I suggest setting up a schedule and agenda to make these more effective.",
        "We've done a great recruiting job with the new hires! They are learning so fast and quickly are becoming big assets to our teams based on what I've been hearing.",
        "I feel that I am able to take time off when I need it, I love our open PTO policy! It's been a big improvement to the culture that we have been improving.",
        "I love our new awesome perks! We really have made big strides in having more amenities available, especially with snacks. Our senior management team's decision to include nap pods was also a great addition.",
        "We have been improving in so many areas, but the one area I think we can still improve on is our available career pathing. I feel like my manager hasn't done a great job of improving.",
        ],
        whatElseWords = [
        "Management has made a lot of improvements but one that is needed and still lingering is the available career pathing. I just feel like I don't have the ability to progress in my career here.",
        "I really feel like the available career pathing still needs attention. Besides that the culture has been improving tremendously!",
        "I feel like our culture has improved a lot but I'd still like to see more for the available career pathing. My manager has been talking about improvements but little has happened.",
        "I believe our senior management team has been doing a great job at making improvements to our culture but could make even more improvements to our available career pathing.",
        "I feel that I am able to take time off when I need it, I love our open PTO policy! It's been a big improvement to the culture that we have been improving.",
        "I love our new awesome perks! We really have made big strides in having more amenities available, especially with snacks. Our senior management team's decision to include nap pods was also a great addition.",
        "We have been improving in so many areas, but the one area I think we can still improve on is our available career pathing. I feel like my manager hasn't done a great job of improving.",
        ];
        wordCloudColors = ["#33adda", "#74787f", "#ed5f63"];
        var teamDash = {
            "Product Management:&nbsp;" : 3,
            "Marketing:&nbsp;" : 5,
            "G&amp;A:&nbsp;" : 4, 
            "Engineering:&nbsp;" : 0,
            "Sales:&nbsp;" : 1,
            "Service:&nbsp;" : 2,
            "Research:&nbsp;" : 6
        }
        var heatMapDash = {
            "Product Management" : 3,
            "Marketing" : 5,
            "G&amp;A" : 4, 
            "Engineering" : 0,
            "Sales" : 1,
            "Service" : 2,
            "Research" : 6
        }

function glintHashHandler(load){
    this.oldHash = window.location.hash;
    this.Check;
    this.load = load;

    var that = this;
    var detectPage = function(){
        if(that.oldHash != window.location.hash || that.load == "yup"){
            console.log("Page > Loaded");
            // Checking to see if theyre in the actual survey
            if(survey.test(window.location.hash)){
                // If they're in the survey then lets check if they're previewing it or on the final page
                if(inSurvey.test(window.location.hash)){
                    console.log("Survey > Loaded");
                    // they're in the survey so lets grab the company name by communicating with background
                    chrome.runtime.sendMessage({greeting: "company"}, function(response) {
                        // We then store the company name in localstorage so we can use it for all the other functions
                        if(response.company != null)
                            localStorage.setItem("company", response.company);
                        else{
                            localStorage.removeItem("company");
                        }
                    });
                    var companyName = localStorage.getItem('company');
                    if(companyName != null){
                        console.log("Company > " + companyName);
                        // we wait for the page to actually load and then grab the contents of it
                        var pageListen = function() {
                            // we grab the main intro section and also we need to grab the first question posed
                            // the first question has the company name as well asking how happy you are there
                            var intro = document.getElementsByClassName("col-unit-complement");
                            var question = document.getElementsByClassName("question");
                            // check to see if the page has loaded by seeing if theres content within the intro class
                            if(intro.length != 0){
                                // add in the id for the intro section so we can swap out the innerHTML
                                intro[0].id = "first";
                                var introWords = document.getElementById('first');
                                if(welcome.test(introWords.innerHTML)){
                                    var objDate = new Date(),
                                        locale = "en-us",
                                        month = objDate.toLocaleString(locale, { month: "long" }),
                                        introWordsReplace = introWords.innerHTML;
                                        children = question[0].childNodes,
                                        firstQuestionTitle = children[0].childNodes[8],
                                        firstQuestionReplace = firstQuestionTitle.innerHTML;
                                    introWordsReplace = introWordsReplace.replace(/Thrive Inc/, companyName);
                                    introWordsReplace = introWordsReplace.replace(/September/, month);
                                    introWords.innerHTML = introWordsReplace;
                                    // grab the title of the first question and do the same thing. Swap out the company name chosen
                                    firstQuestionTitle.id = "second";
                                    var firstQuestion = document.getElementById("second");
                                    firstQuestionReplace = firstQuestionReplace.replace(/Thrive Inc/, companyName);
                                    firstQuestionTitle.innerHTML = firstQuestionReplace;
                                    window.clearInterval(pageLoad);
                                }
                            }
                        }
                    // set interval to listen for the page to load
                    var pageLoad = window.setInterval(pageListen, 100);
                    }
                }
                // We need to check if there is a hashchange on the url by using our regex for the questionnaire being done
                // We do this by using an interval that runs every 100 milliseconds. We might want to revisit this.
                var changePage = function() {
                    if(thanks.test(window.location.hash)){
                        console.log("Thank You > Loaded");
                        var companyName = localStorage.getItem('company'),
                            thankYou = document.getElementsByClassName("thanks")[0];
                        if(typeof(thankYou.childNodes[3]) != "undefined" && thankYou.childNodes[3].innerHTML != "" && companyName != null){
                            var thankYouReplace = thankYou.childNodes[3].innerHTML;
                            thankYouReplace = thankYouReplace.replace(/Thrive Inc/, companyName);
                            thankYou.childNodes[3].innerHTML = thankYouReplace;
                            window.clearInterval(pageChange);
                        }
                    }
                }
                var pageChange = window.setInterval(changePage, 100);
            }
        // *******************************************************************************************************************************************************************

            // this is to check if they're on the comments page or if theyre in the dashboard page

            // if in dashboard page:

            // we're going to listen to see if they inputted custom settings for the team names and for the esat name. 
            // we're then going to change the team names in the top bar and also in the team section under driver.

            // if in comments page:

            // we're then going to do a check to see if theyre on the 'available career pathing' option in the cloudwords. 
            // once we figure that out we need to make sure all of the comments have fully loaded 
            // we need this to run when the app is loaded or when the page is reloaded on the results tab so we need to check if theyre on the home page

        // *******************************************************************************************************************************************************************

            if(dashboard.test(window.location.hash) || results.test(window.location.hash) || surveyTab.test(window.location.hash)){
                console.log("Dashboard or Results Page > Loaded");
                // check to see if theyre on the dashboard page.
                var reportsPage = function(){
                    if(reports.test(window.location.hash)){
                        console.log("Reports Tab > Loaded");
                        chrome.runtime.sendMessage({greeting: "departments"}, function(response) {
                            // We then store the dashboard settings in localstorage so we can use it for all the other functions
                            if(response.departments != null){
                                localStorage.setItem("departments", response.departments);
                            }
                            else{
                                localStorage.removeItem("departments");
                            }
                        });
                        var dep = JSON.parse(localStorage.getItem("departments"));
                        var heatMapPage = function(){
                            if(heatMap.test(window.location.hash) || executiveSummary.test(window.location.hash)){
                                console.log("Reports Tab > Heat Map Loaded");
                                if(typeof(document.getElementsByClassName('rowHeader')[17]) != "undefined"){
                                    if(typeof(document.getElementsByClassName('rowHeader')[17].childNodes[0]) != "undefined"){
                                        for(var x = 10; x < 18; x++){
                                            var mapInnerVal = document.getElementsByClassName('rowHeader')[x].childNodes[0].innerHTML;
                                            if(typeof(heatMapDash[mapInnerVal]) != "undefined"){
                                                if(dep[heatMapDash[mapInnerVal]] != ""){
                                                    if(document.getElementsByClassName('rowHeader')[x].childNodes[0].innerHTML == dep[heatMapDash[mapInnerVal]])
                                                        break;
                                                    else{
                                                        document.getElementsByClassName('rowHeader')[x].childNodes[0].innerHTML = dep[heatMapDash[mapInnerVal]];
                                                    }
                                                }
                                            }
                                        }
                                        console.log("Reports Tab > Heat Map > Departments Loaded");
                                        window.clearInterval(heatMapPageLoad);
                                    }
                                }
                                if(executiveSummary.test(window.location.hash)){
                                    if(typeof(document.getElementsByClassName('dataRows')[1]) != "undefined"){
                                        if(typeof(document.getElementsByClassName('dataRows')[1].childNodes[6]) != "undefined"){
                                            if(typeof(document.getElementsByClassName('dataRows')[1].childNodes[6].childNodes[0]) != "undefined"){
                                                if(typeof(document.getElementsByClassName('dataRows')[1].childNodes[6].childNodes[0].childNodes[0]) != "undefined"){
                                                    for(var x = 0; x < 7; x++){
                                                        var summDashInnerVal = document.getElementsByClassName('dataRows')[1].childNodes[x].childNodes[0].childNodes[0].innerHTML;
                                                        if(typeof(heatMapDash[summDashInnerVal]) != "undefined"){
                                                            if(dep[heatMapDash[summDashInnerVal]] != ""){
                                                                console.log(summDashInnerVal, dep[heatMapDash[summDashInnerVal]], document.getElementsByClassName('dataRows')[1].childNodes[x].childNodes[0].childNodes[0].innerHTML);
                                                                if(document.getElementsByClassName('dataRows')[1].childNodes[x].childNodes[0].childNodes[0].innerHTML == dep[heatMapDash[summDashInnerVal]])
                                                                    break;
                                                                else{
                                                                    document.getElementsByClassName('dataRows')[1].childNodes[x].childNodes[0].childNodes[0].innerHTML = dep[heatMapDash[summDashInnerVal]];
                                                                }  
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else{
                                window.clearInterval(heatMapPageLoad);
                            }
                        }
                        var heatMapPageLoad = window.setInterval(heatMapPage, 500);
                        window.clearInterval(reportsPageLoaded);
                    }
                }

                var dashboardPage = function(){
                    if(dashboard.test(window.location.hash)){
                        chrome.runtime.sendMessage({greeting: "departments"}, function(response) {
                            // We then store the dashboard settings in localstorage so we can use it for all the other functions
                            if(response.departments != null){
                                localStorage.setItem("departments", response.departments);
                            }
                            else{
                                localStorage.removeItem("departments");
                            }
                        });
                        var dep = JSON.parse(localStorage.getItem("departments"));
                        console.log("Dashboard Page > Loaded");
                        // *************************************************************************************
                        // 
                        //this is to update the departments dashboard under Driver
                        // we are simply going through the node tree and updating the inside. The one thing here
                        // is that we are mapping between the top dashboard and the team dashboard using an array "teamDash"
                        // above. We take the value of the innerHTML and map it to the position of the top bar's values.
                        // We do this because the top bar's values map to the values passed from the plugin. We also update the
                        // line graph's title based on the 4th departments name provided. This replaces Product Management
                        //
                        // *************************************************************************************
                        var departmentsDashboardListen = function(){
                            if(dashboard.test(window.location.hash)){
                                if(dep != null){
                                    if(typeof(document.getElementsByClassName('aggregatesCollapsed')[1]) != "undefined"){
                                        console.log("In Dashboard > Team Dashboard Loading...");
                                        if(typeof(document.getElementsByClassName('aggregatesCollapsed')[1].childNodes[0]) != "undefined"){
                                            if(typeof(document.getElementsByClassName('aggregatesCollapsed')[1].childNodes[16].childNodes[1]) != "undefined"){
                                                if(typeof(document.getElementsByClassName('aggregatesCollapsed')[1].childNodes[16].childNodes[1].childNodes[1]) != "undefined"){
                                                    if(typeof(document.getElementsByClassName('aggregatesCollapsed')[1].childNodes[4].childNodes[1].childNodes[1].childNodes[0])  != "undefined"){
                                                        for(var z = 2; z < document.getElementsByClassName('aggregatesCollapsed')[1].childNodes.length-2;){
                                                            var dashInnerVal = document.getElementsByClassName('aggregatesCollapsed')[1].childNodes[z].childNodes[1].childNodes[1].childNodes[0].innerHTML;
                                                            if(typeof(teamDash[dashInnerVal]) != "undefined"){
                                                                if(dep[teamDash[dashInnerVal]] != ""){
                                                                    document.getElementsByClassName('aggregatesCollapsed')[1].childNodes[z].childNodes[1].childNodes[1].childNodes[0].innerHTML = dep[teamDash[dashInnerVal]] + ":" + '&nbsp;';   
                                                                    if(dashInnerVal == "Product Management:&nbsp;"){
                                                                        var tempLine = document.getElementsByClassName('lineChart')[1].childNodes[2].childNodes[0].innerHTML.split(':');
                                                                        document.getElementsByClassName('lineChart')[1].childNodes[2].childNodes[0].innerHTML = dep[teamDash[dashInnerVal]] + ": " + tempLine[1];
                                                                    }
                                                                }
                                                            }
                                                            z = z + 2;
                                                        }
                                                        console.log("Team Dashboard Loaded");
                                                        window.clearInterval(departmentsDashboardLoad);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else{
                                window.clearInterval(departmentsDashboardLoad);
                            }
                        }
                        // *************************************************************************************
                        // 
                        // this is to listen to see when the top bar is loaded. This one we change some of the CSS for the positioning. Tricky part here
                        // is knowing when to split the length of the department from the plugin. We do it on the 13th character when taking out the "<div>"
                        // This makes it so that the length doesnt get too long. We split based on spaces and then add in divs between the sentence breaks.
                        // Lastly, we remove the "<br>" which is placed after using removeChild in the 2nd childNode. 
                        //
                        // *************************************************************************************
                        var departmentsTopListen = function(){
                            if(dep != null){
                                for(var x = 0; x < dep.length; x++){
                                    if(dep[x] != ""){
                                        if(typeof(document.getElementsByClassName('highcharts-subtitle')[x]) != "undefined"){
                                            document.getElementsByClassName('highcharts-subtitle')[x].setAttribute("style", "position: absolute; white-space: nowrap; font-family: 'Graphik Override', 'Graphik Web', 'Graphik Web', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; color: rgb(86, 86, 86); text-align: center; margin-left: 0px; margin-top: 0px; left: 50px; top: 159px; width: 105px;");
                                            var departmentInnerHTML = "<div>";
                                            var testString = "<div>";
                                            if(dep[x].length > 13){
                                                var temp_dep = dep[x].split(' ');
                                                for(var y = 0; y < temp_dep.length; y++){
                                                    testString += temp_dep[y];
                                                    if(testString.length > 17){
                                                        departmentInnerHTML += "</div><div>" + temp_dep[y];
                                                    }
                                                    else{
                                                        departmentInnerHTML += ' ' + temp_dep[y];
                                                    }
                                                }
                                            }
                                            else{
                                                departmentInnerHTML += ' ' + dep[x];
                                            }
                                            departmentInnerHTML += "</div>";
                                            var chart = document.getElementsByClassName('highcharts-subtitle')[x];
                                            if(chart.childNodes[1].localName == "br")
                                                chart.removeChild(chart.childNodes[1])
                                            document.getElementsByClassName('highcharts-subtitle')[x].childNodes[0].innerHTML = departmentInnerHTML;
                                            console.log("Top Bar Updated");
                                            window.clearInterval(departmentsTopLoad);
                                        }
                                    }
                                }
                            }
                            else{
                                window.clearInterval(departmentsTopLoad);
                            }
                        }
                        // This is to update the eSat Name based on the value provided if there is a value. 
                        var eSatListen = function(){
                            if(dep != null){
                                if(typeof(dep[7]) != "undefined"){
                                    if(dep[7] != ""){
                                        if(typeof(document.getElementsByClassName('eSat')[0]) != "undefined"){
                                            if(typeof(document.getElementsByClassName('eSat')[0].childNodes[1]) != "undefined"){
                                                if(typeof(document.getElementsByClassName('eSat')[0].childNodes[1].childNodes[1]) != "undefined"){
                                                    console.log("In Dashboard > eSat Name Loading...");
                                                    document.getElementsByClassName('eSat')[0].childNodes[1].childNodes[1].innerHTML = dep[7];
                                                    console.log("eSat Name Loaded");
                                                    window.clearInterval(eSatLoad);                                      
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else{
                                window.clearInterval(eSatLoad);
                            }
                        }
                        var eSatLoad = window.setInterval(eSatListen, 500);
                        var departmentsDashboardLoad = window.setInterval(departmentsDashboardListen, 500);
                        var departmentsTopLoad = window.setInterval(departmentsTopListen, 500);
                        window.clearInterval(dashboardPageLoaded);
                    }
                }
                // We then need to check if theyre on the comments page afterward using an interval. 
                // If we don't then we'll never know if they visit the page without them refreshing
                var commentsPage = function() {
                    if(comments.test(window.location.hash)){
                        console.log("Comments Page > Loaded");
                        // if the comment page exists then we need to listen for the values. We then use the careerPathingWords
                        // in order to update the comments for Available Career Path. 
                        var commentsListen = function() {
                            // checking to see if the keyword is defined on the comments page. The reason is because the comments bar
                            // only shows when youre looking at a specific keyword. 
                            if(typeof(document.getElementsByClassName("keyword")[0]) != "undefined"){
                                // we need to make sure they selected available career pathing
                                if(commentKeyword.test(document.getElementsByClassName("keyword")[0].innerHTML)){
                                    console.log("Career Pathing > Loading...");
                                    var commentsList = document.getElementsByClassName('commentsList')[0].childNodes[5];
                                    // we need to make sure all of the comments for available career pathing loaded
                                    if(typeof(commentsList) != "undefined"){
                                        var commentsListArray = commentsList.childNodes;
                                        if(typeof(commentsListArray[commentsListArray.length-5].childNodes[3].innerHTML) != "undefined"){
                                            // a double check to make sure that the actual comment text has available career pathing and is loaded
                                            var commentTextCheck = commentsList.childNodes[6].childNodes[3].innerHTML;
                                            if(commentKeyword.test(commentTextCheck)){
                                                console.log("Career Pathing Comment > Loaded");
                                                // loop through all of the comments and give them one of the comments from the careerPathingWords array defined
                                                for(var x = 2, y = 0; x < commentsListArray.length - 4;){
                                                    var commentText = commentsListArray[x].childNodes[3].childNodes[1];
                                                    commentText.innerHTML = careerPathingWords[y];
                                                    x = x + 2;
                                                    y++;
                                                    if(y == careerPathingWords.length)
                                                        y = 0;
                                                    window.clearInterval(commentsLoad);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        // This updates the snippets so that they have realistic comments for the keywords. 
                        var snippetsListen = function(){
                            // make sure that the snippets show up before updating them
                            if(typeof document.getElementsByClassName("snippets")[0] != "undefined"){
                                var snippetSection = document.getElementsByClassName("snippets")[0].childNodes[3];
                                var snippetColumnOne = snippetSection.childNodes[2].childNodes;
                                var snippetColumnTwo = snippetSection.childNodes[4].childNodes;
                                if(typeof(snippetColumnOne[snippetColumnOne.length-3].childNodes[1].childNodes[3]) != "undefined"){
                                    for(var x = 2, y = 0; x < snippetColumnOne.length;){
                                        var snippetOne = snippetColumnOne[x].childNodes[1].childNodes[3];
                                        var snippetTwo = snippetColumnTwo[x].childNodes[1].childNodes[3];
                                        snippetOne.innerHTML = snippetsWords[y];
                                        y++;
                                        if(y == snippetsWords.length)
                                            y = 0;
                                        snippetTwo.innerHTML = snippetsWords[y];
                                        y++;
                                        x = x + 2;
                                        if(y == snippetsWords.length)
                                            y = 0;
                                        window.clearInterval(snippetsLoad);
                                    }
                                }
                            }
                        }
                        // This updates the snippets after 'What else?' is chosen. It functions in the same way as the snippet listener works.
                        var dropDownListen = function(){
                            // make sure that the drop down is defined before progressing
                            if(typeof document.getElementsByClassName("trigger")[5] != "undefined"){
                                var content = document.getElementsByClassName('trigger')[5].childNodes[4].childNodes[2].innerHTML;
                                // check to see if it equals "What else?"
                                console.log("Comments > Drop Down Defined", content);
                                if(content == "What else?"){
                                    console.log("Comments > Drop Down > What Else?");
                                    var snippetSection = document.getElementsByClassName("snippets")[0].childNodes[3];
                                    var snippetColumnOne = snippetSection.childNodes[2].childNodes;
                                    var snippetColumnTwo = snippetSection.childNodes[4].childNodes;
                                    var snippetTest = snippetColumnOne[snippetColumnOne.length-3].childNodes[1].childNodes[3].innerHTML;
                                    // if it is what else lets make sure that the snippets have updated so we can adjust them
                                    if(lunchSnippet.test(snippetTest)){
                                        if(typeof(snippetTest) != "undefined"){
                                            for(var x = 2, y = 0; x < snippetColumnOne.length;){
                                                var snippetOne = snippetColumnOne[x].childNodes[1].childNodes[3];
                                                var snippetTwo = snippetColumnTwo[x].childNodes[1].childNodes[3];
                                                snippetOne.innerHTML = whatElseWords[y];
                                                y++;
                                                if(y == whatElseWords.length)
                                                    y = 0;
                                                snippetTwo.innerHTML = whatElseWords[y];
                                                y++;
                                                x = x + 2;
                                                if(y == whatElseWords.length)
                                                    y = 0;
                                                window.clearInterval(whatElseLoad);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        // this updates the colors for the word cloud. We then choose between three color sets, blue, red and grey 
                        // and assign randomly. The only one we don't assign randomly is Available Career Pathing which is red. 
                        var wordCloudListen = function(){
                            // make sure the word cloud exists
                            if(typeof(document.getElementsByClassName("wordCloud")[1]) != "undefined"){
                                console.log("Word Cloud > Defined");
                                if(typeof(document.getElementsByClassName('wordCloud')[1].childNodes[1].childNodes) != "undefined"){
                                    console.log("Word Cloud Words > Defined...");
                                    var wordCloudLength = document.getElementsByClassName('wordCloud')[1].childNodes[1].childNodes.length - 2;
                                    var greyColorLength = 0;
                                    for(var greyCount = 2; greyCount <= wordCloudLength; greyCount = greyCount + 2){
                                        if(document.getElementsByClassName('wordCloud')[1].childNodes[1].childNodes[greyCount].style.color == "")
                                            greyColorLength++;
                                    }
                                    if(greyColorLength == wordCloudLength / 2 || greyColorLength == (wordCloudLength-1)/2){
                                        for(var x = 2; x <= wordCloudLength;){
                                            var randomNum = Math.floor(Math.random() * (3 - 0));
                                            document.getElementsByClassName('wordCloud')[1].childNodes[1].childNodes[x].style.color = wordCloudColors[randomNum];
                                            if(x == 4){
                                                document.getElementsByClassName('wordCloud')[1].childNodes[1].childNodes[x].style.color = wordCloudColors[2];
                                            }
                                            x = x + 2;
                                        }
                                    }
                                    else{
                                        console.log("Word Cloud > Already Colored");
                                    }
                                    console.log("Word Cloud > Colored");
                                    // window.clearInterval(wordCloudLoad);
                                }
                            }
                            else if(typeof(document.getElementsByClassName("wordCloud")[0]) != "undefined" && typeof(document.getElementsByClassName("wordCloud")[1]) == "undefined"){
                                console.log("Question Chosen > Word Cloud > Defined");
                                if(typeof(document.getElementsByClassName('wordCloud')[0].childNodes[1].childNodes) != "undefined"){
                                    console.log("Question Chosen > Word Cloud Words > Defined...");
                                    var wordCloudLength = document.getElementsByClassName('wordCloud')[0].childNodes[1].childNodes.length - 2;
                                    var greyColorLength = 0;
                                    for(var greyCount = 2; greyCount <= wordCloudLength; greyCount = greyCount + 2){
                                        if(document.getElementsByClassName('wordCloud')[0].childNodes[1].childNodes[greyCount].style.color == "")
                                            greyColorLength++;
                                    }
                                    if(greyColorLength == wordCloudLength / 2 || greyColorLength == (wordCloudLength-1)/2){
                                        for(var x = 2; x <= wordCloudLength;){
                                            var randomNum = Math.floor(Math.random() * (3 - 0));
                                            document.getElementsByClassName('wordCloud')[0].childNodes[1].childNodes[x].style.color = wordCloudColors[randomNum];
                                            if(commentKeyword.test(document.getElementsByClassName('wordCloud')[0].childNodes[1].childNodes[x].innerHTML)){
                                                document.getElementsByClassName('wordCloud')[0].childNodes[1].childNodes[x].style.color = wordCloudColors[2];
                                            }
                                            x = x + 2;
                                        }
                                    }
                                    else{
                                        console.log("Question Chosen > Word Cloud > Already Colored...");
                                    }
                                    console.log("Question Chosen > Word Cloud > Colored");
                                    window.clearInterval(wordCloudLoad);
                                }
                            }
                        }
                        var wordCloudLoad = window.setInterval(wordCloudListen, 500);
                        var whatElseLoad = window.setInterval(dropDownListen, 500);
                        var snippetsLoad = window.setInterval(snippetsListen, 500);
                        var commentsLoad = window.setInterval(commentsListen, 500);
                        window.clearInterval(commentsPageLoaded);
                    }
                }
                var reportsPageLoaded = window.setInterval(reportsPage, 500);
                var commentsPageLoaded = window.setInterval(commentsPage, 500);
                var dashboardPageLoaded = window.setInterval(dashboardPage, 500);
            }

            that.oldHash = window.location.hash;
        }
    };
    this.Check = setInterval(function(){ detectPage() }, 500);
}

var hashDetection = new glintHashHandler();
window.onload = function(){
    glintHashHandler("yup");
}