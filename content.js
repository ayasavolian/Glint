// *************************************************************************************
//
// @author - Arrash
// @date - 11/19/2015
// @version - 1.1.1
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

var inSurvey = new RegExp('app.glintinc.com/thrive@demo2#/questionnaire/preview'),
    thanks = new RegExp('app.glintinc.com/thrive@demo2#/questionnaire/done/preview'),
    survey = new RegExp('app.glintinc.com/thrive@demo2#/questionnaire/'),
    results = new RegExp('results'),
    comments = new RegExp('comments'),
    commentKeyword = new RegExp('available career pathing'),
    welcome = new RegExp('Welcome to the Glint Pulse.'),
    dashboard = new RegExp('dashboard'),
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
    ]

window.onload = function(){
    console.log("Page > Loaded");
    // Checking to see if theyre in the actual survey
    if(survey.test(window.location.href)){
        // If they're in the survey then lets check if they're previewing it or on the final page
        if(inSurvey.test(window.location.href)){
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
                function pageListen() {
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
        function changePage() {
            if(thanks.test(window.location.href)){
                console.log("Thank You > Loaded");
                var companyName = localStorage.getItem('company'),
                    thankYou = document.getElementsByClassName("thanks")[0];
                if(typeof thankYou.childNodes[3] != "undefined" && thankYou.childNodes[3].innerHTML != "" && companyName != null){
                    var thankYouReplace = thankYou.childNodes[3].innerHTML;
                    thankYouReplace = thankYouReplace.replace(/Thrive Inc/, companyName);
                    thankYou.childNodes[3].innerHTML = thankYouReplace;
                    window.clearInterval(pageChange);
                }
            }
        }
        var pageChange = window.setInterval(changePage, 100);
    }
    // this is to check if they're on the comments page
    // we're then going to do a check to see if theyre on the 'available career pathing' option in the cloudwords. 
    // once we figure that out we need to make sure all of the comments have fully loaded 
    // we need this to run when the app is loaded or when the page is reloaded on the results tab so we need to check if theyre on the home page
    if(dashboard.test(window.location.href) || results.test(window.location.href)){
        console.log("App or Results Page > Loaded");
        // We then need to check if theyre on the comments page afterward using an interval. 
        // If we don't then we'll never know if they visit the page without them refreshing
        function commentsPage() {
            if(comments.test(window.location.href)){
                console.log("Comments Page > Loaded");
                function commentsListen() {
                    // checking to see if the keyword is defined on the comments page. The reason is because the comments bar
                    // only shows when youre looking at a specific keyword. 
                    if(typeof document.getElementsByClassName("keyword")[0] != "undefined"){
                        // we need to make sure they selected available career pathing
                        if(commentKeyword.test(document.getElementsByClassName("keyword")[0].innerHTML)){
                            console.log("Career Pathing > Loading...");
                            var commentsList = document.getElementsByClassName('commentsList')[0].childNodes[5];
                            // we need to make sure all of the comments for available career pathing loaded
                            if(typeof commentsList != "undefined"){
                                var commentsListArray = commentsList.childNodes;
                                if(typeof commentsListArray[200].childNodes[3].innerHTML != "undefined"){
                                    // a double check to make sure that the actual comment text has available career pathing and is loaded
                                    var commentsListArray = commentsList.childNodes;
                                    var commentCheck = commentsListArray[6].childNodes[3];
                                    var commentTextCheck = commentCheck.childNodes[1].innerHTML;
                                    if(commentKeyword.test(commentTextCheck)){
                                        console.log("Career Pathing Comment > Loaded");
                                        var y = 0;
                                        // loop through all of the comments and give them one of the comments from the careerPathingWords array defined
                                        for(var x = 2; x < commentsListArray.length;){
                                            var comment = commentsListArray[x].childNodes[3];
                                            var commentText = comment.childNodes[1];
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
                var commentsLoad = window.setInterval(commentsListen, 100);
                window.clearInterval(commentsPageLoaded);
            }
        }
        var commentsPageLoaded = window.setInterval(commentsPage, 100);
    }
}