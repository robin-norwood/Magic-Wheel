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

    var data = document.location.hash;
    if (data) {
        this.wheel.restore(data.slice(1));
    }

    this.maxSpeed = .020;
    this.speed = 0;

    this.clickPos = {x: undefined, y: undefined};
    this.dragging = false;
    this.origAngle = undefined;

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
        if (delay > 200) {
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
        $(this.canvas).bind('mousedown', function (e) { return self.startDrag(e); });
        $(this.canvas).bind('mouseup', function (e) { return self.stopDrag(e); });
        $(this.canvas).bind('mousemove', function (e) { return self.doDrag(e); });

        $(this.canvas).bind('mouseout', function (e) {
            $("#wheel_canvas").css('cursor', 'default');
            return self.stopDrag(e);
        });

        /* Thanks to http://www.sitepen.com/blog/2008/07/10/touching-and-gesturing-on-the-iphone/ for 'splaining this */
        $(this.canvas).bind('touchstart', function (e) {return self.startDrag(e); });
        $(this.canvas).bind('touchend', function (e) { return self.stopDrag(e); });
        $(this.canvas).bind('touchmove', function (e) { return self.doDrag(e); });

        $(this.canvas).bind('touchcancel', function (e) {
            $("#wheel_canvas").css('cursor', 'default');
            return self.stopDrag(e);
        });

        this.editor = new Editor(this.wheel);

        $("#edit_mode:checked").click();
        $("#edit_mode").bind('click', function (e) { self.editor.toggle(); });
        $("#save").bind('mousedown', function (e) {
            $(e.target).attr('href', '#' + self.wheel.save());

            return true;
        });


        // Start animation loop
        (function animloop() {
            self.render(self.context);
            requestAnimFrame(animloop);
        })();
    },
    startDrag: function (event) {
        var theObj = event;
        if (event.originalEvent.changedTouches) {
            theObj = event.originalEvent.changedTouches[0];
        }

        this.clickPos = Utils.getRelPos(theObj, this.canvas);
        this.dragging = true;
        this.origAngle = this.wheel.angle;

        this.wheel.speed = 0;

        event.preventDefault();

        return false;
    },
    doDrag: function (event) {
        var theObj = event;
        if (event.originalEvent.changedTouches) {
            theObj = event.originalEvent.changedTouches[0];
        }

        var pos = Utils.getRelPos(theObj, this.canvas);
        if (Math.sqrt(Math.pow(this.wheel.x - pos.x, 2) +
                      Math.pow(this.wheel.y - pos.y, 2))
            < this.wheel.radius) {
            $("#wheel_canvas").css('cursor', 'pointer');
        }
        else if(!this.dragging) {
            $("#wheel_canvas").css('cursor', 'default');
        }

        if (this.dragging) {
            var now = (new Date()).getTime();
                var angle = Math.atan2(pos.y - this.wheel.y,
                                       pos.x - this.wheel.x)
                - Math.atan2(this.clickPos.y - this.wheel.y,
                             this.clickPos.x - this.wheel.x);
            this.wheel.updated = true;
            this.wheel.angle = this.origAngle + angle;

            this.speed = angle / (now - this.lastUpdateTime);
        }

        event.preventDefault();
        return false;
    },
    stopDrag: function (event) {
        event.preventDefault();

        if (!this.dragging) {
            return false;
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

        return false;
    }
};

// Init and run
$(document).ready(function () {
    var controller = new Controller();
});
