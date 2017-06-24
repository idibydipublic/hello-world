/*Tranxtech ToolBuilder 2.0 | This work is licensed under CC BY-SA 3.0.*/
var setup, drawData, handleQueryResponse, search;

function preg_quote(str) {
    // http://kevin.vanzonneveld.net
    // +   original by: booeyOH
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: preg_quote("$40");
    // *     returns 1: '\$40'
    // *     example 2: preg_quote("*RRRING* Hello?");
    // *     returns 2: '\*RRRING\* Hello\?'
    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

    return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
}

function check(v, d) {
    if (typeof(v) !== "undefined") {
        return v;
    } else {
        return d;
    }
}

function addStyle(style) {
    if (style === "") {
        return "";
    } else {
        return "style='" + style + "' ";
    }
}

function getUI(main) {
    var newLine = "<div style=\"height: 10px; overflow: hidden;\"></div>";
    var lblInstructions = "<div class='paragraph' " + addStyle(main.instructions_style) + ">" + main.instructions + "</div>";
    var txtInput = "<input class=\"wsite-input wsite-search-element-input\" type=\"text\" placeholder=\"" + main.input_hint + "\" " + addStyle(main.input_style) + "data-tranxid=\"txtInput\" data-tranxinstant = \"" + main.instantsearch + "\"/>";
    var btnSearch = "";
    var btnRecognition = "";
    var btnStopRecognition = "";
    var btnClear = "";
    if (main.buttons_theme == "true") {
        if (main.searchbutton_show == "true") {
            btnSearch = "<a class=\"wsite-button wsite-button-small wsite-button-highlight\" data-tranxid='btnSearch'><span class=\"wsite-button-inner\">" + main.searchbutton + "</span></a>";
        }
        if (main.recognition == "true") {
            btnRecognition = "<a class=\"wsite-button wsite-button-small wsite-button-highlight\" data-tranxid='btnRecognition'><span data-tranxid='spanRecognition' class=\"wsite-button-inner\">Speak Now 開始說話</span></a>";
        }
        if (main.clearbutton_show == "true") {
            btnClear = "<a class=\"wsite-button wsite-button-small wsite-button-highlight\" data-tranxid='btnClear'><span class=\"wsite-button-inner\">" + main.clearbutton + "</span></a>";
        }

    } else {
        if (main.searchbutton_show == "true") {
            btnSearch = "<button " + addStyle(main.buttons_style) + "data-tranxid='btnSearch'>" + main.searchbutton + "</button>";
        }
        if (main.recognition == "true") {
            btnRecognition = "<button " + addStyle(main.buttons_style) + "data-tranxid='btnRecognition'><span data-tranxid='spanRecognition'>Start 開始</span></button>";
        }
        if (main.clearbutton_show == "true") {
            btnClear = "<button " + addStyle(main.buttons_style) + "data-tranxid='btnClear'>" + main.clearbutton + "</button>";
        }
    }

    var divMessage = "";

    if (main.message_show == "true") {
        divMessage = "<div data-tranxid='divMessage' " + addStyle(main.message_style) + "align='center'>" + main.message_ready + "</div>";
    }
    var divOutput = "<div " + addStyle(main.output_style) + "data-tranxid='divOutput'></div>";
    return "<div align='" + main.align + "'>" + lblInstructions + newLine + txtInput + newLine + btnRecognition + btnSearch + btnClear + newLine + divMessage + newLine + divOutput + "</div>";
}

function getQuery(columns, searchEncoded, mode, sensitivity) {
    var temp = "";

    for (var i = 0; i < columns.length; i++) {
        var columnName = String.fromCharCode(65 + i);
        if ((sensitivity != "true") && (mode != 3)) {
            columnName = "lower(" + columnName + ")";
        }
        if (mode === 0) {
            temp = temp + "(" + columnName + " = \"" + searchEncoded + "\") ";
        } else if (mode == 1) {
            temp = temp + "(" + columnName + " contains \"" + searchEncoded + "\") ";
        } else if (mode == 2) {
            temp = temp + "(\"" + searchEncoded + "\" contains " + columnName + ") ";
        } else if (mode == 3) {
            temp = temp + "(" + columnName + ") \"" + columns[i] + "\"";
        }

        if (i < columns.length - 1) {
            if ((mode === 0) || (mode == 1) || (mode == 2)) {
                temp = temp + "or ";
            } else if (mode == 3) {
                temp = temp + ", ";
            }
        }
    }
    return temp;
}

function getValue(input) {
    var startIndex = input.content.indexOf(input.start);
    var temp = "";
    if (startIndex != -1) {
        startIndex = startIndex + input.start.length;
        var endIndex = input.content.indexOf(input.end, startIndex);
        if (endIndex != -1) {
            temp = input.content.substring(startIndex, endIndex);
        }
    }
    return temp;
}

function drawMultimedia(input) {
    var temp = "";
    var link = getValue({
            start: "link{",
            end: "}",
            content: input
        });
    var src = getValue({
            start: "show{",
            end: "}",
            content: input
        });
    var video = getValue({
            start: "video{",
            end: "}",
            content: input
        });
    var youtube = getValue({
            start: "youtube{",
            end: "}",
            content: input
        });
    var output = "";
    if(youtube !== ""){
        output = "<iframe width='420' height='315' src='"+ src + "'></iframe>"
    } else if(video !== ""){
        output = "<video width='320' height='240' controls><source src='"+ video +"'>Your browser does not support the video tag.</video>";
    } else {
        output = "<a href='" + link + "'><img src='" + src + "'></a>";
    }
    return output;
}

function drawValue(value, language, tts, style) {
    var temp = value;

    temp = temp.replace(new RegExp("(" + preg_quote(search) + ")", 'gi'), "<span style='background-color: yellow;'>$1</span>");

    if (tts === "true") {
        temp = temp + " <button " + addStyle(style) + "data-tranxid='btnStartTTS' data-tranxtext='" + value + "' data-tranxlang='" + language + "'>Listen!</button>";
    }

    return temp;
}

function drawOutput(data, mode, languages, tts, btnStyle) {
    var temp_i = "";
    var heading = "";
    var value = "";
    if (mode == "2") {
        for (i = 0; i < data.getNumberOfRows(); i++) {
            var temp_d = "";
            var temp_s = ""; //horizontal bar
            for (d = 0; d < data.getNumberOfColumns(); d++) {
                value = data.getValue(i, d);
                if (value !== "null") {
                    if (value.indexOf("func:") === 0) {
                        temp_d = temp_d + "<td>" + drawMultimedia(value) + "</td>";
                    } else {
                        temp_d = temp_d + "<td>" + drawValue(value, languages[d], tts, btnStyle) + "</td>";
                    }
                }
                temp_s = temp_s + "<td><hr></td>";
            }
            temp_i = temp_i + "<tr>" + temp_d + "</tr>" + temp_s + "</tr>";
        }
        var temp_h = "";
        var temp_h_s = "";
        for (k = 0; k < data.getNumberOfColumns(); k++) {
            temp_h = temp_h + "<th>" + data.getColumnLabel(k) + "</th>";
            temp_h_s = temp_h_s + "<td><hr></td>";
        }
        temp_h_s = "<tr>" + temp_h_s +  "</tr>";
        temp_i = "<table style='width:100%'>" + "<thead><tr>" + temp_h + "</tr>" + temp_h_s + "</thead><tbody>" + temp_i + "</tbody></table>";
    } else if (mode == "3") {
        for (i = 0; i < data.getNumberOfRows(); i++) {
            var temp_r = "";
            for (j = 0; j < data.getNumberOfColumns(); j++) {
                value = data.getValue(i, j);
                if (value !== "null") {
                    if (value.indexOf("func:") === 0) {
                        temp_r = temp_r + "<tr style='border: 1px solid #ebebeb'><th>" + data.getColumnLabel(j) + "</th><td style='border: 1px solid #ebebeb'>" + drawMultimedia(value) + "</td></tr>";
                    } else {
                        temp_r = temp_r + "<tr style='border: 1px solid #ebebeb'><th>" + data.getColumnLabel(j) + "</th><td style='border: 1px solid #ebebeb'>" + drawValue(value, languages[j], tts, btnStyle) + "</td></tr>";
                    }
                }
            }
            temp_i = temp_i + "<tr><th><br/></th><td><br/></td></tr>" + temp_r;
        }
        temp_i = "<table>" + temp_i + "</table>";
    } else {
        for (i = 0; i < data.getNumberOfRows(); i++) {
            var temp_j = "";
            for (j = 0; j < data.getNumberOfColumns(); j++) {
                console.log("label: " + data.getColumnLabel(j));

                value = data.getValue(i, j);
                if (value !== "null") {
                    if (value.indexOf("func:") === 0) {
                        temp_j = temp_j + data.getColumnLabel(j) + ": " + drawMultimedia(value) + "<br/>";
                        /* Reserved for further development
                        temp_j = temp_j + data.getColumnLabel(j) + ": " + "<button data-tranxid='alert'>" + data.getValue(i, j) + "</button>" + "<br/>";
                        Reserved for further development */
                    } else {
                        temp_j = temp_j + data.getColumnLabel(j) + ": " + drawValue(value, languages[j], tts, btnStyle) + "<br/>";
                        /* Reserved for further development
                        temp_j = temp_j + data.getColumnLabel(j) + ": " + "<button data-tranxid='alert'>" + data.getValue(i, j) + "</button>" + "<br/>";
                        Reserved for further development */
                    }
                }

            }
            temp_i = temp_i + temp_j + "<br/>";
        }
    }
    return temp_i;
}

function startTTS(text, lang) {
    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    msg.voice = voices[10]; // Note: some voices don't support altering params
    msg.voiceURI = 'native';
    msg.volume = 1; // 0 to 1
    //msg.rate = 1; // 0.1 to 10
    if (lang == "en") {
        msg.rate = 2;
    } else {
        msg.rate = 1;
    }
    msg.pitch = 0.15; //0 to 2
    msg.text = text;
    msg.lang = lang;
    speechSynthesis.speak(msg);
}

function f(para) {
    inc("https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js", function() {
        $(document).ready(function() {

            var main = {};
            main.source = "1BtZDWosi3OLz-i5wsZedk_5mcNXmZnQ9pejuqMeyZEU";
            main.align = "center";
            main.columns = ["English", "Chinese"];
            main.languages = ["en", "zh-HK"];
            main.output_mode = "4"; //"1" "2" "3" "4"
            main.search_mode = "exact"; //"exact" "fuzzy"
            main.casesensitive = "true";
            main.instantsearch = "false";
            main.pronunciation = "true";
            main.recognition = "true";
            main.continuousspeech = "false";
            main.instructions = "Type and search here (Chinese or English) <br/> 請在此輸入要搜尋的文字（中文或英文）";
            main.instructions_style = "";
            main.input_hint = "Search";
            main.input_style = "";
            main.buttons_theme = "true"; //"true" "false"
            main.buttons_style = "";
            main.searchbutton = "Search 搜尋";
            main.clearbutton = "Clear 清除";
            main.searchbutton_show = "true";
            main.clearbutton_show = "true";
            main.message_show = "true";
            main.message_searching = "Status: Please wait... <br/> 狀態：請稍候......";
            main.message_style = "";
            main.message_ready = "Status: Ready <br/> 狀態：準備就緒";
            main.message_empty = "Status: Please provide the expression(s) to be searched <br/> 狀態：請提供要搜尋的字詞語句";
            main.message_noresults = "Status: Sorry! No results have been found. The following (if any) are the last search results for your reference. <br/> 狀態：抱歉！查無資料。以下（如有的話）是上次的搜尋結果，以供參考。";
            main.output_style = "";
            //console.log("Source: " + main.source);

            if (typeof(para) == "undefined") {
                console.log("Default values are used.");
            } else {
                main.source = check(para.source, main.source);
                main.align = check(para.align, main.align);
                main.columns = check(para.columns, main.columns);
                main.languages = check(para.languages, main.languages);
                main.output_mode = check(para.output_mode, main.output_mode);
                main.search_mode = check(para.search_mode, main.search_mode);
                main.casesensitive = check(para.casesensitive, main.casesensitive);
                main.instantsearch = check(para.instantsearch, main.instantsearch);
                main.pronunciation = check(para.pronunciation, main.pronunciation);
                main.recognition = check(para.recognition, main.recognition);
                main.continuousspeech = check(para.continuousspeech, main.continuousspeech);
                main.instructions = check(para.instructions, main.instructions);
                main.instructions_style = check(para.instructions_style, main.instructions_style);
                main.input_hint = check(para.input_hint, main.input_hint);
                main.input_style = check(para.input_style, main.input_style);
                main.buttons_theme = check(para.buttons_theme, main.buttons_theme);
                main.buttons_style = check(para.buttons_style, main.buttons_style);
                if (main.buttons_style !== "") {
                    main.buttons_theme = "false";
                }
                main.searchbutton = check(para.searchbutton, main.searchbutton);
                main.clearbutton = check(para.clearbutton, main.clearbutton);
                main.searchbutton_show = check(para.searchbutton_show, main.searchbutton_show);
                main.clearbutton_show = check(para.clearbutton_show, main.clearbutton_show);
                main.message_show = check(para.message_show, main.message_show);
                main.message_searching = check(para.message_searching, main.message_searching);
                main.message_style = check(para.message_style, main.message_style);
                main.message_ready = check(para.message_ready, main.message_ready);
                main.message_empty = check(para.message_empty, main.message_empty);
                main.message_noresults = check(para.message_noresults, main.message_noresults);
                main.output_style = check(para.output_style, main.output_style);

            }

            drawData = function() {
                $("[data-tranxid='divMessage']").html(main.message_searching);

                search = $("[data-tranxid='txtInput']").val();
                if ((search === "") || (search === "") || (search === "#")) {
                    $("[data-tranxid='divMessage']").html(main.message_empty);
                } else {
                    var searchEncoded = "";
                    if (main.casesensitive == "true") {
                        searchEncoded = encodeURIComponent(search);
                    } else {
                        searchEncoded = encodeURIComponent(search.toLowerCase());
                    }
                    var q = "";
                    if (main.search_mode == "exact") {
                        q = "select * where " + getQuery(main.columns, searchEncoded, 0, main.casesensitive) + "label " + getQuery(main.columns, "", 3);
                    } else {
                        q = "select * where " + getQuery(main.columns, searchEncoded, 1, main.casesensitive) + "or " + getQuery(main.columns, searchEncoded, 2, main.casesensitive) + "label " + getQuery(main.columns, "", 3);
                    }
                    console.log(q);
                    var query = new google.visualization.Query("https://docs.google.com/spreadsheets/d/" + main.source + "/gviz/tq?tq=" + q + "&tqx=reqId:1&pref=2&pli=1");
                    query.send(handleQueryResponse);
                }
            };

            handleQueryResponse = function(response) {
                if (response.isError()) {
                    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                    return;
                }
                var data = response.getDataTable();
                var length = data.getNumberOfRows();

                if (length === 0) {
                    $("[data-tranxid='divMessage']").html(main.message_noresults);
                } else {
                    $("[data-tranxid='divMessage']").html(main.message_ready);
                    if (main.output_mode == "1") {
                        var output = new google.visualization.Table($("[data-tranxid='divOutput']")[0]);
                        output.draw(data, {
                                showRowNumber: true
                            });
                    } else {
                        $("[data-tranxid='divOutput']").html(drawOutput(data, main.output_mode, main.languages, main.pronunciation, main.buttons_style));

                        ///* Reserved for further development
                        $("[data-tranxid='btnStartTTS']").click(function() {
                            var text = $(this).attr("data-tranxtext");
                            var lang = $(this).attr("data-tranxlang");
                            startTTS(text, lang);
                        });
                        //Reserved for further development */
                    }
                }

            };

            setup = function() {
                var existingContent = $("[data-tranxid='main']").html();
                var newContent = getUI(main);
                $("[data-tranxid='main']").html(existingContent + newContent);
            };


            ///* Reserved for further development
            //Begin Try (See End Try below (for Safari browser))
            try {

                var recognition = false;

                var recognizer = new webkitSpeechRecognition();
                recognizer.lang = "zh_yue";
                recognizer.interimResults = true;

                if (main.continuousspeech == "true") {
                    recognizer.continuous = true;
                }

                recognizer.onstart = function(event) {
                    $("[data-tranxid='spanRecognition']").text("Processing 辨識中...");
                    console.log("Start: The speech recognition has started.");
                    recognition = true;
                };

                recognizer.onend = function() {
                    if (main.continuousspeech == "true") {
                        recognizer.start();
                    } else {
                        $("[data-tranxid='spanRecognition']").text("Start 開始");
                        recognition = false;
                        console.log("End: The speech recognition has ended.");
                    }
                };

                recognizer.onerror = function(event) {
                    //$("[data-tranxid='spanRecognition']").text("Start 開始");
                    recognition = false;
                    console.log("Error: " + event.error);
                };

                /*
            recognizer.onspeechend = function(){
                $("[data-tranxid='spanRecognition']").text("Start 開始");
                recognition = false;
                console.log("Sound ended. / Stop button is pressed.");
            };
            */

                recognizer.onresult = function(event) {
                    //console.log(event);
                    if (event.results.length > 0) {
                        var result = event.results[event.results.length - 1];
                        var transcript = result[0].transcript;
                        if (result.isFinal) {
                            console.log("Final result:" + transcript);
                        } else {
                            console.log("Interim result:" + transcript);
                        }

                        var transcript_length = transcript.length;
                        if (transcript_length >= 40) {
                            $("[data-tranxid='txtInput']").val(transcript.substring(transcript_length - 40));
                        } else {
                            $("[data-tranxid='txtInput']").val(transcript);
                        }

                        drawData();
                    } else {
                        console.log("Message: The length of the result is 0.");
                    }
                };

                //Reserved for further development */
            } 
            //End Try (See Begin Try above (for Safari browser))
            catch (err) {
                console.log("Speech Recognition is disabled.");
            }


            setup();

            $("[data-tranxinstant='true']").on("input propertychange paste", function() {
                drawData();
            });

            $("[data-tranxid='btnSearch']").click(function() {
                drawData();
            });

            $("[data-tranxid='btnClear']").click(function() {
                $("[data-tranxid='txtInput']").val("");
            });

            $("[data-tranxid='txtInput']").bind("enterKey", function(e) {
                drawData();
            });

            $("[data-tranxid='txtInput']").keyup(function(e) {
                if (e.keyCode == 13) {
                    $(this).trigger("enterKey");
                }
            });

            /*
            $("body").on("click", "[data-tranxid='btnStartTTS']", function() {
                var text = $(this).attr("data-tranxtext");
                var lang = $(this).attr("data-tranxlang");
                startTTS(text,lang);
            });
            */

            $("[data-tranxid='btnRecognition']").click(function() {
                if (recognition == false) {
                    recognizer.start();
                }
            });

        });
    });
}

function inc(fn, ol) {
    var h = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');
    s.src = fn;
    s.type = 'text/javascript';
    s.onload = s.onreadystatechange = function() {
        if (s.readyState) {
            if (s.readyState === 'complete' || s.readyState === 'loaded') {
                s.onreadystatechange = null;
                ol();
            }
        } else {
            ol();
        }
    };
    h.appendChild(s);
}
/*
function include(filename, onload) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';
    script.onload = script.onreadystatechange = function() {
        if (script.readyState) {
            if (script.readyState === 'complete' || script.readyState === 'loaded') {
                script.onreadystatechange = null;
                onload();
            }
        } else {
            onload();
        }
    };
    head.appendChild(script);
}
*/
