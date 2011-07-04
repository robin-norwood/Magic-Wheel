/*
   controller.js - Prototype for the controller object and launch code

   Copyright (c) 2011 Robin Norwood <robin.norwood@gmail.com>
 */
"use strict";

//
// shim layer with setTimeout fallback
// See http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
//        window.mozRequestAnimationFrame    || // mozRequestAnimationFrame is not performing very well for me in FF5.
        function(/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 30);
        };
})();

var Controller = function () {
    this.lastUpdateTime = (new Date()).getTime();

    this.canvas = $('#wheel_canvas')[0];
    this.canvas.height = 840;
    this.canvas.width = 1000;

    this.context = this.canvas.getContext("2d");

    this.wheel = new Wheel(600, 420, 400);
    this.maxSpeed = .020;
    this.speed = 0;

    this.stopDrag();

    this.load();
};

Controller.prototype = {
    log: function (msg) {
        if (console) {
            console.log(msg);
        }
    },
    render: function (context) {
        var now = (new Date()).getTime();
        var delay = now - this.lastUpdateTime;
        if (delay > 60) {
            this.log("Delay: " + delay);
        }
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.wheel.update(delay);
        this.wheel.render(context);
        this.lastUpdateTime = now;
    },
    load: function () {
        var self = this;

        // Bind handlers
        $(this.canvas).bind('mousedown', function (e) {
            self.startDrag(e);
        });

        $(this.canvas).bind('mouseup', function (e) {
            self.stopDrag();
        });

        $(this.canvas).bind('mousemove', function (e) {
            var pos = Utils.getRelPos(e, self.canvas);
            if (Math.sqrt(Math.pow(self.wheel.x - pos.x, 2) +
                          Math.pow(self.wheel.y - pos.y, 2))
                < self.wheel.radius) {
                $(this).css('cursor', 'pointer');
            }
            else if(!self.dragging) {
                $(this).css('cursor', 'default');
            }

            if (self.dragging) {
                var now = (new Date()).getTime();
                var angle = Math.atan2(pos.y - self.wheel.y,
                                       pos.x - self.wheel.x)
                    - Math.atan2(self.clickPos.y - self.wheel.y,
                                 self.clickPos.x - self.wheel.x);
                self.wheel.updated = true;
                self.wheel.angle = self.origAngle + angle;

                self.speed = angle / (now - self.lastUpdateTime);
            }

        });

        $(this.canvas).bind('mouseout', function (e) {
            self.stopDrag();
            $(this).css('cursor', 'default');
        });


        // Start animation loop
        (function animloop() {
            self.render(self.context);
            requestAnimFrame(animloop);
        })();
    },
    startDrag: function (event) {
        this.clickPos = Utils.getRelPos(event, this.canvas);
        this.dragging = true;
        this.origAngle = this.wheel.angle;

        this.wheel.speed = 0;
    },
    stopDrag: function () {
        if (!this.dragging) {
            return;
        }
        this.clickPos = {x: undefined, y: undefined};
        this.dragging = false;
        this.origAngle = undefined;

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -1 * this.maxSpeed) {
            this.speed = -1 * this.maxSpeed;
        }
        this.wheel.speed = this.speed;
    }
};

// Init and run
$(document).ready(function () {
    var controller = new Controller();
});
