'use strict';

function isEqualObjectsLength(obj1, obj2) {
    return obj1.length === obj2.length;
}

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

const methods = {
    containsKeys: function (keys) {
        return keys.every((key) => Object.keys(this.self)
            .includes(key));
    },
    hasKeys: function (keys) {
        const realKeys = Object.keys(this.self);
        const equalLength = isEqualObjectsLength(keys, realKeys);

        return keys.every((key) => realKeys.includes(key)) && equalLength;
    },
    containsValues: function (values) {
        return values.every((value) => Object.values(this.self)
            .includes(value));
    },
    hasValues: function (values) {
        const realValues = Object.values(this.self);
        const equalLength = isEqualObjectsLength(values, realValues);

        return values.every((value) => realValues.includes(value)) && equalLength;
    },
    hasValueType: function (key, type) {
        if (!Object.keys(this.self)
            .includes(key)) {
            return false;
        }
        const allowableType = [String, Number, Function, Array].includes(type);

        return typeof this.self[key] === typeof type() && allowableType;
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
    this.not = new Proxy(methods, {
        get(target, prop) {
            if (prop === 'self') {
                return self;
            }
            if (prop in prototype.check) {
                return new Proxy(prototype.check[prop], {
                    apply(target2, thisArg, argArray) {
                        return !target2.apply(thisArg, argArray);
                    }
                });
            }
        }
    });
}

function ConstructorForObject(self) {
    this.containsKeys = methods.containsKeys;
    this.hasKeys = methods.hasKeys;
    this.containsValues = methods.containsValues;
    this.hasValues = methods.hasValues;
    this.hasValueType = methods.hasValueType;
    Object.assign(this, new ConstructorForAll(self, Object.prototype));
}

function ConstructorForArray(self) {
    Object.assign(this, new ConstructorForObject(self));
    this.hasLength = methods.hasLength;
}

function ConstructorForString(self) {
    this.hasLength = methods.hasLength;
    this.hasWordsCount = methods.hasWordsCount;
    Object.assign(this, new ConstructorForAll(self, String.prototype));
}

function ConstructorForFunction(self) {
    this.hasParamsCount = methods.hasParamsCount;
    Object.assign(this, new ConstructorForAll(self, Function.prototype));
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
    Object.defineProperty(properties, 'check', { value: { isNull: properties.isNull } });
    Object.assign(properties.check, getOtherMethods(properties.check));
    Object.assign(properties.check, new ConstructorForAll(null, properties));

    return properties;
}

function getObjForNotNull(val) {
    let properties = Object.getPrototypeOf(val).check;
    properties.isNull = function () {
        return false;
    };
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
