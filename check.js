'use strict';

function isNull(val) {
    return val === null;
}

function isArraysEqual(a, b) {
    return a.every((value) => b.includes(value));
}

const methods = {
    containsKeys: function (keys) {
        return isArraysEqual(keys, Object.keys(this));
    },
    hasKeys: function (keys) {
        let realKeys = Object.keys(this);

        return isArraysEqual(realKeys, keys) && isArraysEqual(keys, realKeys);
    },
    containsValues: function (values) {
        return isArraysEqual(values, Object.values(this));
    },
    hasValues: function (values) {
        let realValues = Object.values(this);

        return isArraysEqual(realValues, values) && isArraysEqual(values, realValues);
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
            .filter((word) => {
                return word !== '';
            }).length === count;
    },
    isNull: function () {
        return false;
    }
};

function assignNotMethods(object) {
    let notMethods = {};
    for (let method of Object.getOwnPropertyNames(object)) {
        if (method === 'not') {
            continue;
        }
        Object.defineProperty(notMethods, method, {
            get() {
                return function () {
                    return !object[method](...Object.values(arguments));
                };
            },
            enumerable: true
        });
    }
    object.not = {};
    Object.assign(object.not, notMethods);
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

function getContextMethods(context) {
    let contextMethods = {};
    let type = context.constructor.name;

    if (type === 'Object') {
        Object.assign(contextMethods, getMethodsForObjectAndArrays(context));
    }
    if (type === 'Array') {
        Object.assign(contextMethods, getMethodsForObjectAndArrays(context));
        contextMethods.hasLength = function (length) {
            return methods.hasLength.call(context, length);
        };
    }
    if (type === 'String') {
        contextMethods.hasLength = function (length) {
            return methods.hasLength.call(context, length);
        };
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
    return isNull(val) ? getWrapForNull() : getWrapForNotNull(val);
};

function getWrapForNull() {
    let nullWrap = {};
    nullWrap.isNull = function () {
        return true;
    };
    assignMethods(nullWrap);

    return nullWrap;
}

function getWrapForNotNull(val) {
    let valWrap = getContextMethods(val);
    valWrap.isNull = function () {
        return methods.isNull.call();
    };
    assignMethods(valWrap);

    return valWrap;
}

function assignMethods(wrap) {
    assignUndefinedMethods(wrap);
    assignNotMethods(wrap);
}

function assignUndefinedMethods(wrap) {
    for (let method in methods) {
        if (!(method in wrap)) {
            let name = method.toString();
            Object.defineProperty(wrap, name, {
                value: function () {
                    return false;
                },
                enumerable: true
            });
        }
    }
}
