'use strict';

function definePropertyForPrototype(proto, prop, Constructor) {
    Object.defineProperty(proto, prop, {
        get() {
            return new Constructor(this);
        }
    });
}

function isNull(val) {
    return val === null;
}

function compareArrays(arr1, arr2) {
    return arr1.every((value) => arr2.includes(value));
}

const methods = {
    containsKeys: function (keys) {
        return compareArrays(keys, Object.keys(this.self));
    },
    hasKeys: function (keys) {
        let realKeys = Object.keys(this.self);

        return compareArrays(realKeys, keys) && compareArrays(keys, realKeys);
    },
    containsValues: function (values) {
        return compareArrays(values, Object.values(this.self));
    },
    hasValues: function (values) {
        let realValues = Object.values(this.self);

        return compareArrays(realValues, values) && compareArrays(values, realValues);
    },
    hasValueType: function (key, type) {
        if (![String, Number, Function, Array].includes(type)) {
            return false;
        }
        if (!Object.keys(this.self).includes(key)) {
            return false;
        }
        let boolRes = this.self[key].constructor.name === type.name;

        return boolRes;
    },
    hasLength: function (length) {
        return this.self.length === length;
    },
    hasParamsCount: function (count) {
        return this.self.length === count;
    },
    hasWordsCount: function (count) {
        let wordsCount = 0;
        this.self.split(' ')
            .forEach((word) => {
                if (word !== '') {
                    wordsCount++;
                }
            });

        return wordsCount === count;
    },
    isNull: function () {
        return false;
    }
};

function ConstructorForAll(self, prototype) {
    this.self = self;
    this.not = {};
    for (let method of Object.getOwnPropertyNames(prototype)) {
        Object.defineProperty(this.not, method, {
            get() {
                return function () {
                    return !prototype[method](...Object.values(arguments));
                };
            },
            enumerable: true
        });
    }
}

function ConstructorForObjectAndArrays() {
    this.containsKeys = methods.containsKeys;
    this.hasKeys = methods.hasKeys;
    this.containsValues = methods.containsValues;
    this.hasValues = methods.hasValues;
    this.hasValueType = methods.hasValueType;
}

function ConstructorForObject(self) {
    Object.assign(this, new ConstructorForObjectAndArrays());
    Object.assign(this, new ConstructorForAll(self, this));
}

function ConstructorForArray(self) {
    this.hasLength = methods.hasLength;
    Object.assign(this, new ConstructorForObjectAndArrays());
    Object.assign(this, new ConstructorForAll(self, this));
}

function ConstructorForString(self) {
    this.hasLength = methods.hasLength;
    this.hasWordsCount = methods.hasWordsCount;
    Object.assign(this, new ConstructorForAll(self, this));
}

function ConstructorForFunction(self) {
    this.hasParamsCount = methods.hasParamsCount;
    Object.assign(this, new ConstructorForAll(self, this));
}

exports.init = function () {
    definePropertyForPrototype(Object.prototype, 'check', ConstructorForObject);
    definePropertyForPrototype(Array.prototype, 'check', ConstructorForArray);
    definePropertyForPrototype(String.prototype, 'check', ConstructorForString);
    definePropertyForPrototype(Function.prototype, 'check', ConstructorForFunction);
};

exports.wrap = function (val) {
    return isNull(val) ? getObjForNull() : getObjForNotNull(val);
};

function getObjForNull() {
    let properties = {};
    properties.isNull = function () {
        return true;
    };
    Object.assign(properties, getOtherMethods(properties));

    return properties;
}

function getObjForNotNull(val) {
    let properties = Object.getPrototypeOf(val).check;
    properties.isNull = methods.isNull;
    properties.self = val;
    Object.assign(properties, getOtherMethods(properties));
    let obj = { check: properties };
    Object.assign(obj, getOtherMethods(obj));
    obj.check.not = {};
    Object.assign(obj.check, new ConstructorForAll(val, obj));

    return obj;
}

function getOtherMethods(properties) {
    let proper = {};
    for (let method in methods) {
        if (!(method in properties)) {
            let name = method.toString();
            Object.defineProperty(proper, name, {
                value: function () {
                    return false;
                },
                enumerable: true
            });
        }
    }

    return proper;
}
