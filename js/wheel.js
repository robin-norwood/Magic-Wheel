/*
   wheel.js - Prototype for the wheel object

   Copyright (c) 2011 Robin Norwood <robin.norwood@gmail.com>
 */
"use strict";

var Wheel = function (x, y, radius) {
    this.angle = 0;
    this.speed = 0;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.friction = 0.00001;

    this.editLineRate = 500;
    this.editLineLife = this.editLineRate;
    this.showEditLine = false;
    this.editMode = false;

    this.insertionPoint = {
        seg: 0,
        line: 0,
        dist: 0
    };

    this.lineLengths = [15, 13, 11, 9, 7, 5, 3];
    /* NTS: In the unrotated position, the segments start at 'due right', and go clockwise. */
    this.segments = [
        {
            width: Math.PI/4,
            fillStyle: "#e9967a",
            text: ["Yes, click", "OK.", "", "", "", "", ""]
        },
        {
            width: Math.PI/4,
            fillStyle: "#1e90ff",
            text: ["Is the cord", "plugged in?", "", "", "", "", ""]
        },
        {
            width: Math.PI/4,
            fillStyle: "#32cd32",
            text: ["Have you tried", "restarting", "your", "computer?", "", "", ""]
        },
        {
            width: Math.PI/4,
            fillStyle: "#9370d8",
            text: ["OK, let me", "just google", "that for", "you.", "", "", ""]
        },
        {
            width: Math.PI/4,
            fillStyle: "#ffd700",
            text: ["No, it's gone", "forever.", "", "", "", "", ""]
        },
        {
            width: Math.PI/4,
            fillStyle: "#fdf5e6",
            text: ["That sounds", "like a", "hardware","problem.", "", "", ""]
        },
        {
            width: Math.PI/4,
            fillStyle: "#ffa500",
            text: ["It's a scam,", "just delete", "it.", "", "", "", ""]
        },
        {
            width: Math.PI/4,
            fillStyle: "#e0ffff",
            text: ["Have you tried", "changing your", "password?", "", "", "", ""]
        }
    ];

    this.title = ["IT Helpdesk", "Wheel of Answers"];
};

Wheel.prototype = {
    log: function (msg) {
        if (console) {
            console.log(msg);
        };
    },
    update: function (elapsed) {
        if (this.speed) {
            this.angle += this.speed * elapsed;
            if (this.speed < 0) {
                this.speed += this.friction * elapsed;
                if (this.speed > 0) { this.speed = 0; }
            }
            else if (this.speed > 0) {
                this.speed -= this.friction * elapsed;
                if (this.speed < 0) { this.speed = 0; }
            }
        }

        if (this.editMode) {
            this.editLineLife -= elapsed;
            if (this.editLineLife < 0) {
                this.editLineLife = this.editLineRate;
                this.showEditLine = !this.showEditLine;
            }
        }
    },
    render: function (context) {
        var startAngle = this.angle;
        var endAngle = startAngle;
        var wheel = this;

        context.save();
        $.each(this.segments, function (idx, seg) {
            endAngle += seg.width;
            context.fillStyle = seg.fillStyle;
            context.beginPath();
            context.arc(wheel.x,
                        wheel.y,
                        wheel.radius,
                        startAngle,
                        endAngle,
                        false);
            context.lineTo(wheel.x, wheel.y);
            context.closePath();
            context.fill();

            var centerAngle = (endAngle - startAngle) / 2 + startAngle;
            var distance = wheel.radius - 15;

            $.each(seg.text, function (lineIdx, txt) {
                distance -= 45;

                /* Every time I work with Canvas, I wish I were better at trig. */
                var newx = Math.cos(centerAngle) * distance;
                var newy = Math.sin(centerAngle) * distance;

                context.save();

                context.font = 'bold 30px mono';
                context.textAlign = 'center';
                context.fillStyle = 'black';
                context.translate(wheel.x + newx, wheel.y + newy);
                context.rotate(centerAngle + Math.PI/2);
                context.fillText(txt, 0, 0);

                var ip = wheel.insertionPoint;
                if (wheel.editMode && wheel.showEditLine && ip.seg == idx && ip.line == lineIdx) {
                    var metrics = context.measureText(txt);
                    var letterWidth = metrics.width / txt.length;
                    var pos = Math.ceil(txt.length / 2) * letterWidth;
                    if ((txt.length/2) % 1) {
                        pos -= letterWidth / 2;
                    } // I'm fairly certain there's a more elegant way to do this, but...

                    pos -= letterWidth * ip.dist;
                    if (!pos) {
                        pos = 0;
                    }
                    context.strokeStyle = 'red';
                    context.lineWidth = 2;
                    context.beginPath();
                    context.moveTo(-pos, -30);
                    context.lineTo(-pos, 0);
                    context.stroke();
                }
                context.restore();
            });

            startAngle = endAngle;
        });

        context.font = 'bold 30px mono';
        context.textAlign = 'right';
        context.fillStyle = 'black';
        context.fillText(this.title[0], 305, 75);
        context.fillText(this.title[1], 305, 105);
        context.fillStyle = "red";
        context.beginPath();
        context.moveTo(320,50);
        context.lineTo(380,100);
        context.lineTo(310,110);
        context.closePath();
        context.fill();
        context.restore();

    },
    // Editing functions:
    insert: function (theChar) {
        var ip = this.insertionPoint;
        if (this.segments[ip.seg].text[ip.line].length >= this.lineLengths[ip.line]) {
            return;
        }
        var str = this.segments[ip.seg].text[ip.line];
        this.segments[ip.seg].text[ip.line] = str.substr(0, ip.dist) + theChar + str.substr(ip.dist, str.length);
        ip.dist += 1;
    },
    del: function () {
        var ip = this.insertionPoint;
        var str = this.segments[ip.seg].text[ip.line];
        this.segments[ip.seg].text[ip.line] = str.substr(0, ip.dist) + str.substr(ip.dist + 1, str.length);
    },
    backspace: function () {
        var ip = this.insertionPoint;
        var str = this.segments[ip.seg].text[ip.line];
        this.segments[ip.seg].text[ip.line] = str.substr(0, ip.dist - 1) + str.substr(ip.dist, str.length);
        ip.dist -= 1;

        if (ip.dist < 0) {
            ip.dist = 0;
        }
    },
    left: function () {
        var ip = this.insertionPoint;
        ip.dist -= 1;

        if (ip.dist < 0) {
            ip.dist = 0;
        }
    },
    right: function () {
        var ip = this.insertionPoint;
        ip.dist += 1;

        var maxLen = this.segments[ip.seg].text[ip.line].length;
        if (ip.dist > maxLen) {
            ip.dist = maxLen;
        }
    },
    up: function () {
        var ip = this.insertionPoint;
        ip.line -= 1;
        if (ip.line < 0) {
            ip.line = 0;
        }

        ip.dist = 0;
    },
    down: function () {
        var ip = this.insertionPoint;
        ip.line += 1;

        var len = this.segments[ip.seg].text.length;
        if (ip.line >= len) {
            ip.line = len - 1;
        }
        ip.dist = 0;
    },
    prevSegment: function () {
        var ip = this.insertionPoint;
        ip.line = 0;
        ip.dist = 0;
        ip.seg -= 1;
        if (ip.seg < 0) { ip.seg = this.segments.length - 1; }
    },
    nextSegment: function () {
        var ip = this.insertionPoint;
        ip.line = 0;
        ip.dist = 0;
        ip.seg += 1;
        if (ip.seg >= this.segments.length) { ip.seg = 0; }
    }
};
