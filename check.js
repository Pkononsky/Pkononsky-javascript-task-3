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
        const realValues = Object.keys(this.self);
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
        return Object.entries(this.self).length === length;
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
    not: {
        containsKeys: function (keys) {
            return !keys.every((key) => Object.keys(this.self)
                .includes(key));
        },
        hasKeys: function (keys) {
            const realKeys = Object.keys(this.self);
            const equalLength = isEqualObjectsLength(keys, realKeys);

            return !keys.every((key) => realKeys.includes(key)) && equalLength;
        },
        containsValues: function (values) {
            return !values.every((value) => Object.values(this.self)
                .includes(value));
        },
        hasValues: function (values) {
            const realValues = Object.keys(this.self);
            const equalLength = isEqualObjectsLength(values, realValues);

            return !values.every((value) => realValues.includes(value)) && equalLength;
        },
        hasValueType: function (key, type) {
            if (!Object.keys(this.self)
                .includes(key)) {
                return true;
            }
            const allowableType = [String, Number, Function, Array].includes(type);

            return !(typeof this.self[key] === typeof type() && allowableType);
        },
        hasLength: function (length) {
            return !(Object.entries(this.self).length === length);
        },
        hasParamsCount: function (count) {
            return !(this.self.length === count);
        },
        hasWordsCount: function (count) {
            let wordsCount = 0;
            this.self.split(' ')
                .forEach((word) => {
                    if (word !== '') {
                        wordsCount++;
                    }
                });

            return !(wordsCount === count);
        }
    }
};

function ConstructorForObject(self) {
    this.self = self;
    this.containsKeys = methods.containsKeys;
    this.hasKeys = methods.hasKeys;
    this.containsValues = methods.containsValues;
    this.hasValues = methods.hasValues;
    this.hasValueType = methods.hasValueType;
    this.not = methods.not;
    this.not.self = self;
}

function ConstructorForArray(self) {
    this.self = self;
    Object.assign(this, new ConstructorForObject(self));
    this.hasLength = methods.hasLength;
    this.not = methods.not;
    this.not.self = self;
}

function ConstructorForString(self) {
    this.self = self;
    this.hasLength = methods.hasLength;
    this.hasWordsCount = methods.hasWordsCount;
    this.not = methods.not;
    this.not.self = self;
}

function ConstructorForFunction(self) {
    this.self = self;
    this.hasParamsCount = methods.hasParamsCount;
    this.not = methods.not;
    this.not.self = self;
}

exports.init = function () {
    definePropertyForPrototype(Object.prototype, 'check', ConstructorForObject);
    definePropertyForPrototype(Array.prototype, 'check', ConstructorForArray);
    definePropertyForPrototype(String.prototype, 'check', ConstructorForString);
    definePropertyForPrototype(Function.prototype, 'check', ConstructorForFunction);
};

exports.wrap = function (val) {
    if (!isNull(val)) {
        return val;
    }

    let obj = {
        isNull: function () {
            return true;
        }
    };

    obj = new Proxy(obj, {
        get(target, prop) {
            if (prop in target) {
                return target[prop];
            }

            return function () {
                return false;
            };
        }
    });

    return obj;
};
