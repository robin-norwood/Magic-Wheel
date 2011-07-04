var UtilProto = function () {

};

UtilProto.prototype = {
    getRelPos: function (e, obj) {
        // Get the relative position of the event inside the object
        return {x: e.pageX - obj.offsetLeft,
                y: e.pageY - obj.offsetTop};
    }
};

var Utils = new UtilProto();
