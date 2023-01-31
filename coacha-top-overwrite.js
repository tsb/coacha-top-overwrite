// ==UserScript==
// @name         Coach A
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://register.coach.co.jp/academia/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=coach.co.jp
// @grant        none
// ==/UserScript==

const courses = ["#F00-05", "#F06-10", "#F11-15", "#F16-20", "#F21-25", "#F26-30"];
const thisyear = 2023;

(function() {
    'use strict';

    // 履修完了かつアンケートの回答期間が完了しているものを display:none で見せなくするセレクトボックスを追加する
    const optionbox = document.createElement("select");
    optionbox.id = "optionbox";
    const option1 = document.createElement("option");
    option1.value = "履修完了を表示しない";
    option1.innerHTML = "履修完了を表示しない";
    optionbox.appendChild(option1);
    const option2 = document.createElement("option");
    option2.value = "すべて表示";
    option2.innerHTML = "すべて表示";
    optionbox.appendChild(option2);
    optionbox.addEventListener('change', selecterFired, false)
    document.querySelector("#registration > div:nth-child(2)").appendChild(optionbox);

    // デフォルトは見せない状態として、hideCompletedClasses関数を起動する
    courses.forEach(hideCompletedClasses);

    // カレンダー生成用のリンクを作成する
    courses.forEach(generateCalendarURL);
})();

// セレクトボックスを変更すると発火する
function selecterFired(x){
    const index = document.getElementById("optionbox").selectedIndex;
    //console.log(index);
    if(index == 0) courses.forEach(hideCompletedClasses);
    if(index == 1) courses.forEach(showCompletedClasses);
}

// 各単元（F01とかの単位）で for を回して確認を行い、最後の週のコースが履修済みかつ回答期間終了の場合、display:none を設定して非表示にする。
// F00 など 4週目が無い場合もあるので、そのときは 1週目を確認する。
function hideCompletedClasses(course){
    const sections = document.querySelector(course).querySelectorAll('section');
    for (let i=0 ; i < sections.length ; i++) {
        let courseFinished = sections[i].querySelector("div.col-sm-10 > div:nth-child(4) > div.week.col-sm-1 > span");
        if(!courseFinished) courseFinished = sections[i].querySelector("div.col-sm-10 > div:nth-child(1) > div.week.col-sm-1 > span");
        //console.log(courseFinished);
        let surveyDuration = sections[i].querySelector("div.col-sm-10 > div:nth-child(4) > div.evaluation.col-sm-2 > span > small");
        if(!surveyDuration) surveyDuration = sections[i].querySelector("div.col-sm-10 > div:nth-child(1) > div.evaluation.col-sm-2 > span > small");
        //console.log(surveyDuration);
        if(courseFinished.innerHTML == "履修済" && surveyDuration.innerHTML == "回答期間終了"){
            sections[i].style = "display:none";
        }
    }
}

// "すべて表示" を選択した場合、すべてのスタイルをリセットする。
function showCompletedClasses(course){
    const sections = document.querySelector(course).querySelectorAll('section');
    for (let i=0 ; i < sections.length ; i++) {
        sections[i].style = "";
    }
}

// https://qiita.com/yuta_sawamura/items/738732565e2cfd11fb23
// Googleカレンダーに飛ぶリンクを生成して付与する
function generateCalendarURL(course){
    const sections = document.querySelector(course).querySelectorAll('section');

    for (let i=0 ; i < sections.length ; i++) {
        const classes = sections[i].getElementsByClassName("onlineClassBoxInner row");
        const courseTitle = sections[i].querySelector("h4").innerHTML.replace(" ", "%20");
        let week = 1;
        for (let j=0 ; j < classes.length ; j++) {
            let courseDateTMP = classes[j].querySelector("div.date.col-sm-2 > small");
            console.log(courseDateTMP)
            if(!courseDateTMP){
                courseDateTMP = classes[j].querySelector("div.date.col-sm-2");
                if(!courseDateTMP) continue;
            }
            let courseDate = courseDateTMP.innerHTML.split(">")[3]; console.log(courseDate);
            let thismonth = courseDate.split("月")[0]; if(thismonth<10) thismonth = "0" + thismonth; //console.log(thismonth);
            let thisday = courseDate.split("月")[1].split("日")[0]; if(thisday<10) thisday = "0" + thisday; //console.log(thisday);
            let starttime = courseDate.split("日")[1].split("<")[0].split(" ")[1].replace(":", ""); if(parseInt(starttime, 10)<1000) starttime = "0" + starttime; //console.log(starttime);
            let endtime = parseInt(starttime, 10) + 100; if(endtime<1000) endtime = "0" + endtime; //console.log(endtime);

            let zoomURL = classes[j].querySelector("div.tell.col-sm-3 > small > a");

            if(zoomURL){
                let calendarURL = "https://www.google.com/calendar/render?action=TEMPLATE&ctz=JST&text=[コーチエィ]%20" + courseTitle + "%20(" + week++ + ")&dates=" +
                    thisyear + thismonth + thisday + "T" + starttime + "00/" + thisyear + thismonth + thisday + "T" + endtime + "00&location=" + zoomURL;
                console.log(calendarURL);
                courseDateTMP.innerHTML = courseDateTMP.innerHTML + "<br><a href=" + calendarURL + " target=_blank>Google Calendar生成</a>";
            }
        }
    }
}
