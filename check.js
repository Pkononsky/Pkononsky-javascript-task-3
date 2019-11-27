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
    },
    isNull: function () {
        return isNull(this);
    }
};

function assignNotMethods(object, context) {
    object.not = {};
    Object.assign(object.not, Object.getOwnPropertyNames(object)
        .filter((prop) => prop !== 'not')
        .reduce((prev, prop) => {
            prev[prop] = function () {
                return !callFunction(methods[prop], context, arguments);
            };

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
    return ((isNull(context) && func.name === 'isNull') ||
        !isNull(context) && func.name in getPrototypeByVal(context)) &&
        func.call(context, ...Object.values(args));
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

ArrayConstructor.prototype = {
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
    },
    hasLength() {
        return callFunction(methods.hasLength, this.context, arguments);
    }
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
        return methods.isNull.call(val);
    };
    assignNotMethods(wrap, val);

    return wrap;
};

function assignAllMethods(val) {
    let wrap = {};
    Object.getOwnPropertyNames(methods)
        .reduce((prev, method) => {
            prev[method] = function () {
                return !isNull(val) &&
                    method in getPrototypeByVal(val) &&
                    methods[method].call(val, ...Object.values(arguments));
            };

            return prev;
        }, wrap);

    return wrap;
}

function getPrototypeByVal(val) {
    if (val === null) {
        return null;
    }
    if (val.constructor.name === 'Object') {
        return ObjectConstructor.prototype;
    }
    if (val.constructor.name === 'Array') {
        return ArrayConstructor.prototype;
    }
    if (val.constructor.name === 'String') {
        return StringConstructor.prototype;
    }
    if (val.constructor.name === 'Function') {
        return FunctionConstructor.prototype;
    }
}
