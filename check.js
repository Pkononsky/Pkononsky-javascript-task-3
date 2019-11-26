'use strict';

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

const OBJECT_ARRAY_METHODS = [
    methods.containsValues,
    methods.hasValues,
    methods.containsKeys,
    methods.hasKeys,
    methods.hasValueType
];

const ARRAY_AND_STRING_METHOD = [
    methods.hasLength
];

const STRING_METHOD = [
    methods.hasWordsCount
];

const FUNCTION_METHOD = [
    methods.hasParamsCount
];

let context;

function defineMethodsForPrototype(properties, prototype) {
    prototype.not = prototype.not === undefined ? {} : prototype.not;
    properties.reduce((prev, method) => {
        prototype[method.name] = method;
        prototype.not[method.name] = function () {
            return !method.call(context, ...Object.values(arguments));
        };

        return prototype;
    }, prototype);
}

exports.init = function () {
    Object.defineProperty(Object.prototype, 'check', {
        get() {
            context = this;

            return this;
        }
    });
    defineMethodsForPrototype(OBJECT_ARRAY_METHODS, Object.prototype);
    defineMethodsForPrototype(OBJECT_ARRAY_METHODS, Array.prototype);
    defineMethodsForPrototype(ARRAY_AND_STRING_METHOD, Array.prototype);
    defineMethodsForPrototype(ARRAY_AND_STRING_METHOD, String.prototype);
    defineMethodsForPrototype(STRING_METHOD, String.prototype);
    defineMethodsForPrototype(FUNCTION_METHOD, Function.prototype);
};

exports.wrap = function (val) {
    let wrap = assignAllMethods(val);
    wrap.isNull = function () {
        return isNull(val);
    };
    assignNotMethods(wrap);

    return wrap;
};

function assignAllMethods(val) {
    let wrap = {};
    Object.getOwnPropertyNames(methods)
        .reduce((prev, method) => {
            prev[method] = function () {
                return isNull(val) ? false : methods[method].call(val, ...Object.values(arguments));
            };

            return prev;
        }, wrap);

    return wrap;
}

function isNull(val) {
    return val === null;
}

function assignNotMethods(object) {
    object.not = {};
    Object.assign(object.not, Object.getOwnPropertyNames(object)
        .filter((prop) => prop !== 'not')
        .reduce((prev, prop) => {
            prev[prop] = function () {
                return !object[prop](...Object.values(arguments));
            };

            return prev;
        }, {}));
}
