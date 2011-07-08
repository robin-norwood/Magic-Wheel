/*
   editor.js - Prototype for the editing mode

   Copyright (c) 2011 Robin Norwood <robin.norwood@gmail.com>
 */
"use strict";

var Editor = function (wheel) {
    this.wheel = wheel;

    this.shiftMap = {
        "1": "!",
        "2": "@",
        "3": "#",
        "4": "$",
        "5": "%",
        "6": "^",
        "7": "&",
        "8": "*",
        "9": "(",
        "0": ")",
        ";": ":",
        "=": "+",
        "`": "~",
        "-": "_",
        "[": "{",
        "]": "}",
        "\\": "\\", // | is used as a separator
        "'": "\"",
        ",": "<",
        ".": ">",
        "/": "?"
    };
};

Editor.prototype = {
    log: function (msg) {
        if (console) {
            console.log(msg);
        }
    },
    load: function () {
        this.wheel.editMode = true;

        var self = this;

        // Bind handlers
        $(window).bind('keydown', function (event) {
            if (event.altKey || event.ctrlKey) {
                return true; // don't intercept
            }
            event.preventDefault();

            var letter = "";
            if (event.which >= 48 && event.which <= 90) {
                letter = String.fromCharCode(event.which);
            }
            else if (event.which == 192) {
                letter = "`";
            }
            else if (event.which == 32) {
                letter = " ";
            }
            else if (event.which == 109) {
                letter = "-";
            }
            else if (event.which == 219) {
                letter = "[";
            }
            else if (event.which == 221) {
                letter = "]";
            }
            else if (event.which == 220) {
                letter = "\\";
            }
            else if (event.which == 222) {
                letter = "'";
            }
            else if (event.which == 186) {
                letter = ";";
            }
            else if (event.which == 187) {
                letter = "=";
            }
            else if (event.which == 188) {
                letter = ",";
            }
            else if (event.which == 189) {
                letter = "-";
            }
            else if (event.which == 190) {
                letter = ".";
            }
            else if (event.which == 191) {
                letter = "/";
            }

            if (letter) {
                if (event.shiftKey) {
                    if (self.shiftMap.hasOwnProperty(letter)) {
                        letter = self.shiftMap[letter];
                    }
                }
                else {
                    letter = letter.toLowerCase();
                }

                self.wheel.insert(letter);
            }


            // Control keys
            if (event.which == 46) {
                self.wheel.del();
            }
            else if (event.which == 8) {
                self.wheel.backspace();
            }
            else if (event.which == 37) {
                self.wheel.left();
            }
            else if (event.which == 38) {
                self.wheel.up();
            }
            else if (event.which == 39) {
                self.wheel.right();
            }
            else if (event.which == 40) {
                self.wheel.down();
            }
            else if (event.which == 9) { // tab
                if (event.shiftKey) {
                    self.wheel.prevSegment();
                }
                else {
                    self.wheel.nextSegment();
                }
            }

            return false;
        });
    },
    unload: function () {
        this.wheel.editMode = false;

        $(window).unbind('keydown');
    },
    toggle: function () {
        if (this.wheel.editMode) {
            this.unload();
        }
        else {
            this.load();
        }
    }

};
