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

    /* NTS: In the unrotated position, the segments start at 'due right', and go clockwise. */
    this.segments = [
        {
            width: Math.PI/4,
            fillStyle: "#e9967a",
            text: ["Yes, click", "OK."]
        },
        {
            width: Math.PI/4,
            fillStyle: "#1e90ff",
            text: ["Is the chord", "plugged in?"]
        },
        {
            width: Math.PI/4,
            fillStyle: "#32cd32",
            text: ["Have you tried", "restarting", "your", "computer?"]
        },
        {
            width: Math.PI/4,
            fillStyle: "#9370d8",
            text: ["OK, let me", "just google", "that for", "you."]
        },
        {
            width: Math.PI/4,
            fillStyle: "#ffd700",
            text: ["No, it's gone", "forever."]
        },
        {
            width: Math.PI/4,
            fillStyle: "#fdf5e6",
            text: ["That sounds", "like a", "hardware","problem."]
        },
        {
            width: Math.PI/4,
            fillStyle: "#ffa500",
            text: ["It's a scam,", "just delete", "it."]
        },
        {
            width: Math.PI/4,
            fillStyle: "#e0ffff",
            text: ["Have you tried", "changing your", "password?"]
        }
    ];
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

            $.each(seg.text, function (idx, txt) {
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
                context.restore();
            });

            startAngle = endAngle;
        });

        context.font = 'bold 30px mono';
        context.textAlign = 'right';
        context.fillStyle = 'black';
        context.fillText("IT Helpdesk", 305, 75);
        context.fillText("Wheel of Answers", 305, 105);
        context.fillStyle = "red";
        context.beginPath();
        context.moveTo(320,50);
        context.lineTo(380,100);
        context.lineTo(310,110);
        context.closePath();
        context.fill();
        context.restore();

    }
};
