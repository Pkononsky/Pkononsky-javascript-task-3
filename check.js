'use strict';

function isNull(val) {
    return val === null;
}

function isArraysEqual(a, b) {
    return a.length === b.length && isArrayContainsElements(a, b);
}

function isArrayContainsElements(a, b) {
    return a.every((value) => b.includes(value));
}

const methods = {
    containsKeys: function (keys) {
        return isArrayContainsElements(keys, Object.keys(this));
    },
    hasKeys: function (keys) {
        let realKeys = Object.keys(this);

        return isArraysEqual(realKeys, keys);
    },
    containsValues: function (values) {
        return isArrayContainsElements(values, Object.values(this));
    },
    hasValues: function (values) {
        let realValues = Object.values(this);

        return isArraysEqual(realValues, values);
    },
    hasValueType: function (key, type) {
        if (![String, Number, Function, Array].includes(type)) {
            return false;
        }
        if (!Object.keys(this)
            .includes(key)) {
            return false;
        }

        return this[key].constructor.name === type.name;
    },
    hasLength: function (length) {
        return this.length === length;
    },
    hasParamsCount: function (count) {
        return this.length === count;
    },
    hasWordsCount: function (count) {
        return this.split(' ')
            .filter((word) => word !== '').length === count;
    }
};

function assignNotMethods(object, context) {
    object.not = {};
    Object.assign(object.not, Object.getOwnPropertyNames(object)
        .filter((prop) => prop !== 'not')
        .reduce((prev, prop) => {
            if (isNull(context)) {
                prev[prop] = function () {
                    return true;
                };
            } else {
                prev[prop] = function () {
                    return !methods[prop].call(context, ...Object.values(arguments));
                };
            }
            return prev;
        }, {}));
}

function ObjectConstructor(context) {
    this.context = context;
}

function ArrayConstructor(context) {
    this.context = context;
}

function StringConstructor(context) {
    this.context = context;
}

function FunctionConstructor(context) {
    this.context = context;
}

function callFunction(func, context, args) {
    return func.call(context, ...Object.values(args));
}

ObjectConstructor.prototype = {
    containsKeys() {
        return callFunction(methods.containsKeys, this.context, arguments);
    },
    hasKeys() {
        return callFunction(methods.hasKeys, this.context, arguments);
    },
    containsValues() {
        return callFunction(methods.containsValues, this.context, arguments);
    },
    hasValues() {
        return callFunction(methods.hasValues, this.context, arguments);
    },
    hasValueType() {
        return callFunction(methods.hasValueType, this.context, arguments);
    }
};

ArrayConstructor.prototype = Object.create(ObjectConstructor.prototype);
ArrayConstructor.prototype.hasLength = function () {
    return callFunction(methods.hasLength, this.context, arguments);
};

StringConstructor.prototype = {
    hasWordsCount() {
        return callFunction(methods.hasWordsCount, this.context, arguments);
    },
    hasLength() {
        return callFunction(methods.hasLength, this.context, arguments);
    }
};

FunctionConstructor.prototype.hasParamsCount = function () {
    return callFunction(methods.hasParamsCount, this.context, arguments);
};

function defineCheckForPrototype(proto, Constructor) {
    Object.defineProperty(proto, 'check', {
        get() {
            let constructor = new Constructor(this);
            assignNotMethods(Constructor.prototype, this);

            return constructor;
        }
    });
}

exports.init = function () {
    defineCheckForPrototype(Object.prototype, ObjectConstructor);
    defineCheckForPrototype(Array.prototype, ArrayConstructor);
    defineCheckForPrototype(String.prototype, StringConstructor);
    defineCheckForPrototype(Function.prototype, FunctionConstructor);
};

exports.wrap = function (val) {
    let wrap = assignAllMethods(val);
    wrap.isNull = function () {
        return isNull(val);
    };
    assignNotMethods(wrap, val);

    return wrap;
};

function assignAllMethods(val) {
    let wrap = {};
    Object.getOwnPropertyNames(methods)
        .reduce((prev, method) => {
            if (!isNull(val) && method in val.check) {
                prev[method] = function () {
                    return methods[method].call(val, ...Object.values(arguments));
                };
            } else {
                prev[method] = function () {
                    return false;
                };
            }

            return prev;
        }, wrap);

    return wrap;
}
