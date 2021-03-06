(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("index", [], factory);
	else if(typeof exports === 'object')
		exports["index"] = factory();
	else
		root["index"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var make_decorator_1 = __webpack_require__(5);
var MVBase = (function () {
    function MVBase(customErrorKey) {
        this.customErrorKey = customErrorKey;
        this.attachedValidators = {};
        this.lastValidator = null;
        this.validateWith = [];
        this.skipCondition = null;
        this.validatorConditions = {};
        this.converters = [];
        this.isTrigger = false;
        this.isNested = false;
    }
    MVBase.prototype.attachValidator = function (name, validator) {
        this.lastValidator = name;
        this.attachedValidators[name] = validator;
    };
    MVBase.prototype.required = function () {
        this.attachValidator('required', function (v) { return !v; });
        return this;
    };
    MVBase.prototype.skipIf = function (condition) {
        if (!this.lastValidator) {
            console.warn('No last validator for "if" statement');
            return this;
        }
        this.validatorConditions[this.lastValidator] = condition;
        return this;
    };
    MVBase.prototype.skip = function (condition) {
        this.skipCondition = condition;
        return this;
    };
    MVBase.prototype.with = function (fields) {
        var anotherFields = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            anotherFields[_i - 1] = arguments[_i];
        }
        if (Array.isArray(fields)) {
            this.validateWith = fields;
        }
        else {
            this.validateWith = [fields].concat(anotherFields);
        }
        return this;
    };
    MVBase.prototype.custom = function (name, validator) {
        this.attachValidator(name, validator);
        return this;
    };
    Object.defineProperty(MVBase.prototype, "validators", {
        get: function () {
            return this.attachedValidators;
        },
        enumerable: true,
        configurable: true
    });
    MVBase.prototype.make = function () {
        return make_decorator_1.makeDecorator(this);
    };
    return MVBase;
}());
exports.MVBase = MVBase;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description Хранилище данных о валидности полей с вспомогательным методом проверки на полную валидность
 */
var Validity = (function () {
    function Validity() {
        this.errors = {};
    }
    Validity.allFieldsIsFalse = function (obj, ignoreFields, currentChain) {
        if (ignoreFields === void 0) { ignoreFields = []; }
        if (currentChain === void 0) { currentChain = ''; }
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var fieldKey = _a[_i];
            var value = obj[fieldKey];
            var chainedCurrentField = currentChain ? currentChain + "." + fieldKey : fieldKey;
            if (ignoreFields.includes(chainedCurrentField)) {
                continue;
            }
            for (var _b = 0, _c = Object.keys(value); _b < _c.length; _b++) {
                var fieldValidation = _c[_b];
                var validationValue = value[fieldValidation];
                // if this is real validation value - check to false
                if (typeof validationValue === 'boolean') {
                    if (validationValue) {
                        return false;
                    }
                }
                else {
                    // validate deeper
                    var deeperValueIsFalse = Validity.allFieldsIsFalse(value, ignoreFields, currentChain ? currentChain + "." + fieldKey : fieldKey);
                    // if not all deeper validations is false
                    if (!deeperValueIsFalse) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    Validity.prototype.isFullValid = function (ignoreFields) {
        if (ignoreFields === void 0) { ignoreFields = []; }
        return Validity.allFieldsIsFalse(this.errors, ignoreFields);
    };
    return Validity;
}());
exports.Validity = Validity;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATE_FIELDS_KEY = 'MetaValidateFields';


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var number_1 = __webpack_require__(7);
var string_1 = __webpack_require__(8);
var base_1 = __webpack_require__(0);
var base_2 = __webpack_require__(0);
exports.MVBase = base_2.MVBase;
var MetaValidate = (function () {
    function MetaValidate() {
    }
    MetaValidate.Number = function (customName) {
        return new number_1.MVNumber(customName);
    };
    MetaValidate.String = function (customName) {
        return new string_1.MVString(customName);
    };
    MetaValidate.Trigger = function () {
        var retVal = new base_1.MVBase();
        retVal.isTrigger = true;
        return retVal;
    };
    MetaValidate.Nested = function (customName) {
        var retVal = new base_1.MVBase(customName);
        retVal.isNested = true;
        return retVal;
    };
    MetaValidate.Base = function (customName) {
        return new base_1.MVBase(customName);
    };
    MetaValidate.Register = function (validatorsClass) {
        MetaValidate.customValidatorsStore.set(validatorsClass, validatorsClass);
    };
    MetaValidate.Get = function (validatorClass) {
        if (!MetaValidate.customValidatorsStore.has(validatorClass)) {
            throw new Error("No validators registered for class " + validatorClass.name);
        }
        var validatorsConstructor = MetaValidate.customValidatorsStore.get(validatorClass);
        return new validatorsConstructor();
    };
    MetaValidate.customValidatorsStore = new WeakMap();
    return MetaValidate;
}());
exports.MetaValidate = MetaValidate;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var validity_1 = __webpack_require__(1);
exports.Validity = validity_1.Validity;
var types_1 = __webpack_require__(3);
exports.MetaValidate = types_1.MetaValidate;
exports.MVBase = types_1.MVBase;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = __webpack_require__(2);
var relation_store_1 = __webpack_require__(6);
var validity_1 = __webpack_require__(1);
function makeDecorator(validationConfig) {
    return function (target, propertyKey) {
        if (!Reflect.hasMetadata(interfaces_1.VALIDATE_FIELDS_KEY, target)) {
            Reflect.defineMetadata(interfaces_1.VALIDATE_FIELDS_KEY, new relation_store_1.ValidateRelationStore(), target);
        }
        var existValidateMetadata = Reflect.getMetadata(interfaces_1.VALIDATE_FIELDS_KEY, target);
        var errorKey = validationConfig.customErrorKey || propertyKey;
        existValidateMetadata.setupCustomErrorKey(propertyKey, errorKey);
        if (!validationConfig.isTrigger) {
            existValidateMetadata.addValidators(propertyKey, validationConfig.validators);
        }
        if (validationConfig.validateWith) {
            existValidateMetadata.addValidateRelation(propertyKey, validationConfig.validateWith);
        }
        existValidateMetadata.setupSkipCondition(propertyKey, validationConfig.skipCondition);
        existValidateMetadata.setupValidatorConditions(propertyKey, validationConfig.validatorConditions);
        if (validationConfig.isNested) {
            existValidateMetadata.addNestedField(propertyKey);
        }
        var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
            configurable: true,
            enumerable: true
        };
        var valueStore = new WeakMap();
        var originalGet = descriptor.get || function () {
            return valueStore.get(this);
        };
        var originalSet = descriptor.set || function (val) {
            valueStore.set(this, val);
        };
        descriptor.get = originalGet;
        descriptor.set = function (newVal) {
            var _this = this;
            var validateKeyMetadata = Reflect.getMetadata(interfaces_1.VALIDATE_FIELDS_KEY, target);
            var currentVal = originalGet.call(this);
            originalSet.call(this, newVal);
            var errorsStore = validateKeyMetadata.errorsStore;
            if (!errorsStore.has(this)) {
                errorsStore.set(this, new validity_1.Validity());
            }
            if (newVal !== currentVal) {
                // Валидация самого поля
                // Если не триггер - валидируем
                if (!validationConfig.isTrigger) {
                    var skipNested = validateKeyMetadata.toSkipFieldValidation(propertyKey, this) && validationConfig.isNested;
                    var fieldErrors = skipNested
                        ? {}
                        : validateKeyMetadata.validateField(propertyKey, newVal, this);
                    setErrors(errorsStore, this, errorKey, fieldErrors, true);
                }
                // Валидация связанных полей
                var relatedErrors = validateKeyMetadata.validateRelatedFields(propertyKey, this);
                for (var relatedErrorKey in relatedErrors) {
                    if (validateKeyMetadata.toSkipFieldValidation(relatedErrorKey, this)) {
                        relatedErrors[relatedErrorKey] = {};
                    }
                }
                Object.assign(errorsStore.get(this).errors, relatedErrors);
                if (validationConfig.isNested) {
                    if (newVal && newVal.validity$) {
                        newVal.validity$.subscribe(function (nestedValidity) {
                            if (!validateKeyMetadata.toSkipFieldValidation(propertyKey, _this)) {
                                setErrors(errorsStore, _this, errorKey, nestedValidity.errors);
                            }
                            else {
                                setErrors(errorsStore, _this, errorKey, {}, true);
                            }
                            _this.validity$.next(errorsStore.get(_this));
                        });
                    }
                    else {
                        var errors = validateKeyMetadata.validateField(propertyKey, newVal, this);
                        errorsStore.get(this).errors[errorKey] = errors;
                    }
                }
                this.validity$.next(errorsStore.get(this));
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
        return descriptor;
    };
}
exports.makeDecorator = makeDecorator;
function setErrors(wm, instance, key, errors, force) {
    if (force === void 0) { force = false; }
    var errorsStore = wm.get(instance).errors;
    if (!errorsStore[key] || force) {
        errorsStore[key] = errors;
    }
    else {
        Object.assign(errorsStore[key], errors);
    }
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = __webpack_require__(2);
/**
 * @description Хранилище информации, необходимой для работы валидаторов.
 * Хранит сами валидаторы, созависимые поля и результаты валидации
 */
var ValidateRelationStore = (function () {
    function ValidateRelationStore() {
        /**
         * @description Хранилище зависимостей полей. Ключ - поле, значение - поля, которые надо провалидировать при его изменении
         */
        this.fieldsRelationsStore = {};
        /**
         * @description Хранилище валидаторов для поля. Ключ - поле, значение - объект с валидаторами
         */
        this.validatorsStore = {};
        /**
         * @description Хранилище условий, при которых поле нужно валидировать. Ключ - поле, значение - функция
         */
        this.skipConditions = {};
        /**
         * @description Хранилище условий, при которых нужно запускать определенный валидатор. Ключ - поле, значение -
         * рекорд, где ключ - валидатор, значение - условие
         */
        this.validatorConditions = {};
        /**
         * @description Хранилище вложенных полей, чтобы лишний раз не дергать метадату при валидации зависимых полей
         */
        this.nestedFields = [];
        this.customErrorKeys = {};
        this.errorsStore = new WeakMap();
    }
    ValidateRelationStore.prototype.getErrorKey = function (propertyKey) {
        return this.customErrorKeys[propertyKey] || propertyKey;
    };
    ValidateRelationStore.prototype.addValidators = function (key, validators) {
        this.validatorsStore[key] = __assign({}, this.validatorsStore[key], validators);
        var existsValidators = this.validatorsStore[key] || {};
        for (var _i = 0, _a = Object.keys(validators); _i < _a.length; _i++) {
            var invalidKey = _a[_i];
            existsValidators[invalidKey] = validators[invalidKey];
        }
    };
    ValidateRelationStore.prototype.addNestedField = function (field) {
        this.nestedFields.push(field);
    };
    ValidateRelationStore.prototype.addValidateRelation = function (key, fields) {
        if (!fields || !fields.length) {
            return;
        }
        var passedTypes = fields.map(function (f) { return typeof f; });
        if (new Set(passedTypes).size !== 1) {
            throw new Error("Invalid field keys specified. String expecting, got " + passedTypes.toString());
        }
        if (!passedTypes.includes('string')) {
            throw new Error("Invalid field keys specified. String expecting, got " + passedTypes.toString());
        }
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            var validateAfterFields = this.fieldsRelationsStore[field] || [];
            if (!validateAfterFields.includes(key)) {
                validateAfterFields.push(key);
            }
            this.fieldsRelationsStore[field] = validateAfterFields;
        }
    };
    ValidateRelationStore.prototype.setupSkipCondition = function (field, condition) {
        this.skipConditions[field] = condition;
    };
    ValidateRelationStore.prototype.setupValidatorConditions = function (field, conditions) {
        this.validatorConditions[field] = conditions;
    };
    ValidateRelationStore.prototype.setupCustomErrorKey = function (propertyKey, errorKey) {
        this.customErrorKeys[propertyKey] = errorKey;
    };
    /**
     * @description Условие полного скипа валидации
     */
    ValidateRelationStore.prototype.toSkipFieldValidation = function (field, instance) {
        return this.skipConditions[field] ? this.skipConditions[field](instance) : false;
    };
    ValidateRelationStore.prototype.toSkipValidator = function (field, validatorKey, instance) {
        return this.validatorConditions[field][validatorKey]
            ? this.validatorConditions[field][validatorKey](instance)
            : false;
    };
    ValidateRelationStore.prototype.validateField = function (field, newVal, instance) {
        var skipValidation = this.toSkipFieldValidation(field, instance);
        var errors = {};
        var validators = this.getValidators(field);
        if (validators) {
            for (var _i = 0, _a = Object.keys(validators); _i < _a.length; _i++) {
                var validationErrorKey = _a[_i];
                var skipValidator = this.toSkipValidator(field, validationErrorKey, instance);
                if (skipValidation || skipValidator) {
                    errors[validationErrorKey] = false;
                    continue;
                }
                var validity = validators[validationErrorKey](newVal, instance);
                errors[validationErrorKey] = validity;
            }
        }
        var isNestedField = this.nestedFields.includes(field);
        if (isNestedField) {
            errors = __assign({}, errors, this.validateNestedField(newVal));
        }
        return errors;
    };
    ValidateRelationStore.prototype.validateRelatedFields = function (field, instance) {
        var relatedFields = this.getRelatedFields(field);
        var errors = {};
        for (var _i = 0, relatedFields_1 = relatedFields; _i < relatedFields_1.length; _i++) {
            var relatedField = relatedFields_1[_i];
            var relatedFieldValue = instance[relatedField];
            errors[this.getErrorKey(relatedField)] = this.validateField(relatedField, relatedFieldValue, instance);
        }
        return errors;
    };
    ValidateRelationStore.prototype.validateNestedField = function (value) {
        if (!value) {
            return {};
        }
        var nestedMetadata = Reflect.getMetadata(interfaces_1.VALIDATE_FIELDS_KEY, Object.getPrototypeOf(value));
        if (!nestedMetadata) {
            return {};
        }
        var errors = {};
        for (var _i = 0, _a = Object.keys(nestedMetadata.validatorsStore); _i < _a.length; _i++) {
            var propertyKey = _a[_i];
            errors[nestedMetadata.getErrorKey(propertyKey)] = nestedMetadata.validateField(propertyKey, value[propertyKey], value);
        }
        return errors;
    };
    ValidateRelationStore.prototype.getRelatedFields = function (key) {
        return this.fieldsRelationsStore[key] || [];
    };
    ValidateRelationStore.prototype.getValidators = function (field) {
        return this.validatorsStore[field] || {};
    };
    return ValidateRelationStore;
}());
exports.ValidateRelationStore = ValidateRelationStore;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = __webpack_require__(0);
var MVNumber = (function (_super) {
    __extends(MVNumber, _super);
    function MVNumber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MVNumber.prototype.required = function () {
        _super.prototype.required.call(this);
        return this;
    };
    MVNumber.prototype.skipIf = function (condition) {
        _super.prototype.skipIf.call(this, condition);
        return this;
    };
    MVNumber.prototype.skip = function (condition) {
        _super.prototype.skip.call(this, condition);
        return this;
    };
    MVNumber.prototype.with = function (fields) {
        var anotherFields = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            anotherFields[_i - 1] = arguments[_i];
        }
        _super.prototype.with.apply(this, [fields].concat(anotherFields));
        return this;
    };
    MVNumber.prototype.custom = function (name, validator) {
        _super.prototype.custom.call(this, name, validator);
        return this;
    };
    MVNumber.prototype.min = function (arg) {
        var validator = function (v, i) {
            var compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) < compareValue;
        };
        this.attachValidator('min', validator);
        return this;
    };
    MVNumber.prototype.greater = function (arg) {
        var validator = function (v, i) {
            var compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) <= compareValue;
        };
        this.attachValidator('greater', validator);
        return this;
    };
    MVNumber.prototype.max = function (arg) {
        var validator = function (v, i) {
            var compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) > compareValue;
        };
        this.attachValidator('max', validator);
        return this;
    };
    MVNumber.prototype.less = function (arg) {
        var validator = function (v, i) {
            var compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) >= compareValue;
        };
        this.attachValidator('less', validator);
        return this;
    };
    MVNumber.prototype.integer = function () {
        var validator = function (v) {
            var isSafe = typeof v === 'number'
                && v === v
                && v !== Number.POSITIVE_INFINITY
                && v !== Number.NEGATIVE_INFINITY
                && parseInt(v + '', 10) === v
                && Math.abs(v) < Number.MAX_VALUE;
            return !v || !isSafe;
        };
        this.attachValidator('integer', validator);
        return this;
    };
    MVNumber.prototype.negative = function () {
        var validator = function (v) { return !v || parseFloat(v) >= 0; };
        this.attachValidator('negative', validator);
        return this;
    };
    MVNumber.prototype.positive = function () {
        var validator = function (v) { return !v || parseFloat(v) <= 0; };
        this.attachValidator('positive', validator);
        return this;
    };
    MVNumber.prototype.divideBy = function (arg) {
        var validator = function (v, i) {
            var compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) % compareValue !== 0;
        };
        this.attachValidator('divideBy', validator);
        return this;
    };
    return MVNumber;
}(base_1.MVBase));
exports.MVNumber = MVNumber;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = __webpack_require__(0);
var MVString = (function (_super) {
    __extends(MVString, _super);
    function MVString() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MVString.prototype.required = function () {
        _super.prototype.required.call(this);
        return this;
    };
    MVString.prototype.skipIf = function (condition) {
        _super.prototype.skipIf.call(this, condition);
        return this;
    };
    MVString.prototype.skip = function (condition) {
        _super.prototype.skip.call(this, condition);
        return this;
    };
    MVString.prototype.with = function (fields) {
        var anotherFields = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            anotherFields[_i - 1] = arguments[_i];
        }
        _super.prototype.with.apply(this, [fields].concat(anotherFields));
        return this;
    };
    MVString.prototype.custom = function (name, validator) {
        _super.prototype.custom.call(this, name, validator);
        return this;
    };
    MVString.prototype.convert = function () {
        this.converters.push(function (value) {
            return !value ? value : value.toString();
        });
        return this;
    };
    MVString.prototype.minLength = function (arg) {
        var validator = function (v, i) {
            var compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v.length < compareValue;
        };
        this.attachValidator('minLength', validator);
        return this;
    };
    MVString.prototype.maxLength = function (arg) {
        var validator = function (v, i) {
            var compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !!v && v.length > compareValue;
        };
        this.attachValidator('maxLength', validator);
        return this;
    };
    MVString.prototype.length = function (arg) {
        var validator = function (v, i) {
            var compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v.length !== compareValue;
        };
        this.attachValidator('length', validator);
        return this;
    };
    MVString.prototype.regex = function (pattern, name) {
        var validator = function (v, i) {
            var compareValue = typeof pattern === 'function' ? pattern(i) : pattern;
            if (!compareValue) {
                console.warn("RegExp validator '" + name + "' return null pattern");
                return true;
            }
            compareValue = new RegExp(compareValue);
            return !v || !compareValue.test(v);
        };
        this.attachValidator(name, validator);
        return this;
    };
    /**
     * @description Allow only a-z A-Z 0-9
     */
    MVString.prototype.alphanum = function () {
        var validator = function (v) {
            return !v || /^[а-яА-Яa-zA-Z0-9]+$/.test(v);
        };
        this.attachValidator('alphanum', validator);
        return this;
    };
    /**
     * @description Allow only a-z A-Z 0-9 - _
     */
    MVString.prototype.token = function () {
        var validator = function (v) {
            return !v || /^[a-zA-Z0-9_\-]+$/.test(v);
        };
        this.attachValidator('token', validator);
        return this;
    };
    return MVString;
}(base_1.MVBase));
exports.MVString = MVString;


/***/ })
/******/ ]);
});