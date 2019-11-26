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

function getMethodsForObjectAndArrays(context) {
    return {
        containsKeys(keys) {
            return methods.containsKeys.call(context, keys);
        },
        hasKeys(keys) {
            return methods.hasKeys.call(context, keys);
        },
        containsValues(values) {
            return methods.containsValues.call(context, values);
        },
        hasValues(values) {
            return methods.hasValues.call(context, values);
        },
        hasValueType(key, value) {
            return methods.hasValueType.call(context, key, value);
        }
    };
}

function getMethodForStringsAndArrays(context) {
    return {
        hasLength(length) {
            return methods.hasLength.call(context, length);
        }
    };
}

function getContextMethods(context) {
    let contextMethods = {};
    let type = context.constructor.name;

    if (type === 'Object') {
        Object.assign(contextMethods, getMethodsForObjectAndArrays(context));
    }
    if (type === 'Array') {
        Object.assign(contextMethods, getMethodsForObjectAndArrays(context));
        Object.assign(contextMethods, getMethodForStringsAndArrays(context));
    }
    if (type === 'String') {
        Object.assign(contextMethods, getMethodForStringsAndArrays(context));
        contextMethods.hasWordsCount = function (count) {
            return methods.hasWordsCount.call(context, count);
        };
    }
    if (type === 'Function') {
        contextMethods.hasParamsCount = function (count) {
            return methods.hasParamsCount.call(context, count);
        };
    }
    assignNotMethods(contextMethods);

    return contextMethods;
}

exports.init = function () {
    Object.defineProperty(Object.prototype, 'check', {
        get() {
            return getContextMethods(this);
        }
    });
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

