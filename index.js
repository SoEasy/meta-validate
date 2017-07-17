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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description Хранилище данных о валидности полей с вспомогательным методом проверки на полную валидность
 */
var Validity = (function () {
    function Validity() {
        this.validity = {};
        this.errors = {};
    }
    Validity.prototype.isFullValid = function () {
        for (var _i = 0, _a = Object.keys(this.validity); _i < _a.length; _i++) {
            var fieldKey = _a[_i];
            var fieldValidity = this.validity[fieldKey];
            for (var _b = 0, _c = Object.keys(fieldValidity); _b < _c.length; _b++) {
                var validityKey = _c[_b];
                if (!fieldValidity[validityKey]) {
                    return false;
                }
            }
        }
        return true;
    };
    return Validity;
}());
exports.Validity = Validity;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var relation_store_1 = __webpack_require__(3);
var VALIDATE_FIELDS_KEY = 'JsonNameValidateFields';
/**
 * @description Функция запустит валидаторы для значения
 * @param newVal - новое значение, которое надо провалидировать
 * @param validators - массив
 * @param context - экземпляр класса, поле которого валидируем
 * @return {IMVFieldValidity}
 */
function runValidators(newVal, validators, context) {
    var errors = {};
    if (validators) {
        for (var _i = 0, _a = Object.keys(validators); _i < _a.length; _i++) {
            var validationErrorKey = _a[_i];
            var validity = validators[validationErrorKey](newVal, context);
            if (!errors[validationErrorKey]) {
                errors[validationErrorKey] = validity;
            }
        }
    }
    return errors;
}
function makeDecorator(validationNeeded, validators, validateWith) {
    validators = validators || {};
    return function (target, propertyKey) {
        var existValidateMetadata = Reflect.getMetadata(VALIDATE_FIELDS_KEY, target) || new relation_store_1.ValidateRelationStore();
        if (validationNeeded) {
            existValidateMetadata.addValidators(propertyKey, validators);
            if (validateWith) {
                existValidateMetadata.addValidateRelation(propertyKey, validateWith);
            }
            Reflect.defineMetadata(VALIDATE_FIELDS_KEY, existValidateMetadata, target);
        }
        var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
            configurable: true,
            enumerable: true
        };
        var value;
        var originalGet = descriptor.get || (function () { return value; });
        var originalSet = descriptor.set || (function (val) { return (value = val); });
        descriptor.get = originalGet;
        descriptor.set = function (newVal) {
            // tslint:disable-next-line
            var _this = this;
            var currentVal = originalGet.call(_this);
            originalSet.call(_this, newVal);
            if (newVal !== currentVal) {
                var validateKeyMetadata = Reflect.getMetadata(VALIDATE_FIELDS_KEY, target);
                var fieldValidators = existValidateMetadata.getValidators(propertyKey);
                // Валидация самого поля
                if (validationNeeded) {
                    var currentKeyErrors = runValidators(newVal, fieldValidators, _this);
                    existValidateMetadata.setValidityForField(propertyKey, currentKeyErrors);
                }
                // Валидация связанных полей
                var relatedFields = validateKeyMetadata.getRelatedFields(propertyKey);
                for (var _i = 0, relatedFields_1 = relatedFields; _i < relatedFields_1.length; _i++) {
                    var relatedField = relatedFields_1[_i];
                    var relatedValidators = existValidateMetadata.getValidators(relatedField);
                    var relatedFieldValue = _this[relatedField];
                    var relatedKeyErrors = runValidators(relatedFieldValue, relatedValidators, _this);
                    existValidateMetadata.setValidityForField(relatedField, relatedKeyErrors);
                }
                _this.receiveValidity(existValidateMetadata.getErrors());
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
        return descriptor;
    };
}
function ValidationTrigger() {
    return makeDecorator(false);
}
exports.ValidationTrigger = ValidationTrigger;
function Validate(validators, validateWith) {
    return makeDecorator(true, validators, validateWith);
}
exports.Validate = Validate;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var validation_1 = __webpack_require__(1);
exports.Validate = validation_1.Validate;
exports.ValidationTrigger = validation_1.ValidationTrigger;
var validity_1 = __webpack_require__(0);
exports.Validity = validity_1.Validity;


/***/ }),
/* 3 */
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
var validity_1 = __webpack_require__(0);
/**
 * @description Хранилище информации, необходимой для работы валидаторов.
 * Хранит сами валидаторы, созависимые поля и результаты валидации
 */
var ValidateRelationStore = (function () {
    function ValidateRelationStore() {
        this.fieldsRelationsStore = {};
        this.validatorsStore = {};
        this.errorsStore = new validity_1.Validity();
    }
    ValidateRelationStore.prototype.addValidateRelation = function (key, fields) {
        if (!fields || !fields.length) {
            console.warn("No related fields specified for validation field " + key);
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
    ValidateRelationStore.prototype.getRelatedFields = function (key) {
        return this.fieldsRelationsStore[key] || [];
    };
    ValidateRelationStore.prototype.addValidators = function (key, validators) {
        this.validatorsStore[key] = __assign({}, this.validatorsStore[key], validators);
        var existsValidators = this.validatorsStore[key] || {};
        for (var _i = 0, _a = Object.keys(validators); _i < _a.length; _i++) {
            var invalidKey = _a[_i];
            existsValidators[invalidKey] = validators[invalidKey];
        }
    };
    ValidateRelationStore.prototype.getValidators = function (key) {
        return this.validatorsStore[key] || {};
    };
    ValidateRelationStore.prototype.setValidityForField = function (key, validity) {
        this.errorsStore.validity[key] = validity;
        this.errorsStore.errors[key] = {};
        for (var _i = 0, _a = Object.keys(validity); _i < _a.length; _i++) {
            var validityKey = _a[_i];
            this.errorsStore.errors[key][validityKey] = !validity[validityKey];
        }
    };
    ValidateRelationStore.prototype.getErrors = function () {
        return this.errorsStore;
    };
    return ValidateRelationStore;
}());
exports.ValidateRelationStore = ValidateRelationStore;


/***/ })
/******/ ]);
});