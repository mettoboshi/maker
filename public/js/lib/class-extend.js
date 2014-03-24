(function (win, doc, exports, undefined) {

    'use strict';

    var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    function Class() { /* noop. */ }

    Class.extend = function (props) {

        var SuperClass = this;

        function Class() {
            if (typeof this.initialize === 'function') {
                this.initialize.apply(this, arguments);
            }
        }

        Class.prototype = Object.create(SuperClass.prototype, {
            constructor: {
                value: Class,
                writable: true,
                configurable: true
            }
        });

        Object.keys(props).forEach(function (key) {
            var prop   = props[key],
                _super = SuperClass.prototype[key],
                isMethodOverride = (typeof prop === 'function' && typeof _super === 'function' && fnTest.test(prop));

            if (isMethodOverride) {
                Class.prototype[key] = function () {
                    var ret,
                        tmp = this._super;

                    this._super = _super;

                    ret = prop.apply(this, arguments);

                    this._super = tmp;

                    return ret;
                };
            }
            else {
                Class.prototype[key] = prop;
            }
        });

        Class.extend = SuperClass.extend;

        return Class;
    };

    exports.Class = Class;
}(window, window.document, window));
