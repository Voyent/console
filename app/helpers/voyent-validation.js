import errors from 'console/helpers/voyent-errors';

var require = function(){
    return {
        getLogger: function(){
            return {
                debug: function(){}
            };
        }
    };
};

var exports = {};

/**
 * Shared validation functions for validating various fields.
 * These functions, being in a common library, may not be used
 * for project specific validations and techniques, such as using
 * the project database module to perform various lookups. Those
 * validation tasks are best left to a project specific validation module
 */
var spaceAndPeriodRegex = /^[A-Za-z0-9\.\s]*$/;
var spacePeriodAndUnderscoreRegex = /^[A-Za-z0-9_\.\s]*$/;
var periodAndUnderscoreRegex = /^[A-Za-z0-9_\.\s]*$/;
var usernameRegex = /^[A-Za-z0-9_@\.]*$/;    // ascii printable plus enough to enter email, and underscores
var passwordRegex = /^[A-Za-z0-9!@#%^&*_\s]*$/;    // A few more punctuation chars.

var firstLastNameRegex = /^[$!{}]/;
var spaceAndLimitedPunctuationRegex = /^[A-Za-z0-9\.\s,!#@$%^&*]*$/;
var serviceNameRegex = /^[A-Za-z0-9\.]*$/;
var spaceOnlyRegex = /^[A-Za-z0-9\s]*$/; //jshint ignore:line
var underscoreOnlyRegex = /^[A-Za-z0-9_]*$/; //jshint ignore:line
var permissionOpRegex = /[and|or|single]/;
var lowerCaseDotRegex = /^[a-z\.]*$/;

// read, execute, update, delete, readMeta, updateMeta, readPermissions, updatePermissions
var allowableRightsRegex = /[r|x|u|d|mu|pr|pu]/;

var PermissionStringLength = 100;
var DescriptionStringLength = 256;
var MaxRightsLength = 4000;
var RealmMaxLength = 75;
var RealmMinLength = 2;
var OriginsMaxLength = 100;
var PasswordMinLength = 8;
var PasswordMaxLength = 48;
var EmailMaxLength = 50;
var ServiceMaxLength = 50;
var PermissionOpMaxLength = 6;
var serviceTypeMaxLength = 32; //jshint ignore:line

var NameMaxLength = 30;
var NameMinLength = 1;

/**
 * For example, min length 8, max length: 30, no punctuation other than the subrealm
 * separator '.' and '_'
 * @param val The realm name to test
 */
var realmValidator = function (val) {
    if (typeof(val) !=='string') {
        return false;
    }
    if (val.length < RealmMinLength || val.length > RealmMaxLength) {
        return false;
    }
    return periodAndUnderscoreRegex.test(val);
};
exports.realmValidator = realmValidator;

// Username validator. Valid chars are ascii character ranges plus a few punctuation
// characters for email addresses as username.
var usernameValidator = function (val) {

    //In order to have modules respect the logging configuration supplied by the service, we
    //need to get the logger in a 'lazy' fashion.  If we get it during initialization, then
    //the logger instance only has the default configuration.
    var logger = require('./loggers').getLogger();

    if (typeof(val) !=='string') {
        logger.debug('Username invalid type');
        return false;
    }
    if (val.length < NameMinLength || val.length > NameMaxLength) {
        logger.debug('Username invalid length');
        return false;
    }
    var result = usernameRegex.test(val);
    return result;
};
exports.usernameValidator = usernameValidator;


// First, last name validator
var nameValidator = function (val) {
    if (typeof(val) !=='string') {
        return false;
    }
    if (val.length < NameMinLength || val.length > NameMaxLength) {
        return false;
    }
    // Allow all unicode chars for name fields.
    return !firstLastNameRegex.test(val);
};
exports.nameValidator = nameValidator;

// accountname validator.
var accountNameValidator = function (val) {
    if (typeof(val) !=='string') {
        return false;
    }
    if (val.length < NameMinLength || val.length > NameMaxLength) {
        return false;
    }
    return spacePeriodAndUnderscoreRegex.test(val);
};
exports.accountNameValidator = accountNameValidator;

// Account description validator
var descriptionValidator = function (val) {
    if (typeof(val) !=='string') {
        return false;
    }
    if (val.length > DescriptionStringLength) {
        return false;
    }
    return spaceAndLimitedPunctuationRegex.test(val);
};
exports.descriptionValidator = descriptionValidator;

var serviceNameValidator = function (val) {
    if (typeof(val) !=='string') {
        return false;
    }
    if (val.length > ServiceMaxLength) {
        return false;
    }
    return serviceNameRegex.test(val);
};
exports.serviceNameValidator = serviceNameValidator;

var serviceArrayValidator = function(val) {
    if (Array.isArray(val) === false) {
        return false;
    }
    var service;
    for (var i = 0; i < val.length; i ++) {
        service = val[i];
        if (!serviceNameValidator(service)) {
            return false;
        }
    }
    return true;
};
exports.serviceArrayValidator = serviceArrayValidator;

var booleanValidator = function (val) {
    if (typeof(val)==='boolean') {
        if (true !== val && false !== val) {
            return false;
        }
        return true;
    } else if (typeof(val)==='string') {
        if ('true'!= val && 'false' != val){ //jshint ignore:line
            return false;
        }
        return true;
    }
    return false;
};
exports.booleanValidator = booleanValidator;

var passwordValidator = function (val) {
    if (typeof(val) !=='string') {
        return false;
    }
    if (val.length < PasswordMinLength || val.length > PasswordMaxLength) {
        return false;
    }
    return passwordRegex.test(val);
};
exports.passwordValidator = passwordValidator;


var emailValidator = function (val) {
    if (typeof(val) !=='string') {
        return false;
    }
    if (val.length > EmailMaxLength) {
        return false;
    }
    return validator.isEmail(val);
};
exports.emailValidator = emailValidator;


var queryValidator = function (query) { //jshint ignore:line
    // Todo
    return true;
};
exports.queryValidator = queryValidator;

/**
 * Check that the format of the permissions array is correct. This should be
 * done prior to doing the account type validation
 */
var permissionFormatValidator = function (val) {

    //In order to have modules respect the logging configuration supplied by the service, we
    //need to get the logger in a 'lazy' fashion.  If we get it during initialization, then
    //the logger instance only has the default configuration.
    var logger = require('./loggers').getLogger();

    if (Array.isArray(val) === false) {
        logger.debug('Permission set not an array: ' + typeof(val));
        return false;
    }
    for (var i = 0; i < val.length; i++) {
        if (typeof(val[i]) !=='string') {
            logger.debug('Permission not a string: ' + typeof(val[i]));
            return false;
        }
        if (val[i].length > PermissionStringLength) {
            logger.debug('Invalid permission length: ' + val[i].length);
            return false;
        }
        if (!serviceNameRegex.test(val[i])) {
            logger.debug('Permission name invalid: ' + val[i]);
            return false;
        }
    }
    return true;
};
exports.permissionFormatValidator = permissionFormatValidator;

/**
 * Check that the format of the realm reference array is correct.
 * @param val An array of permission strings
 */
var realmReferenceFormatValidator = function (val) {
    if (Array.isArray(val) === false) {
        return false;
    }
    for (var i = 0; i < val.length; i++) {
        if (typeof(val[i]) !=='string') {
            return false;
        }
        if (!val[i] || val[i].length > RealmMaxLength) {
            return false;
        }
        if (!spaceAndPeriodRegex.test(val[i])) {
            return false;
        }
    }
    return true;
};
exports.realmReferenceFormatValidator = realmReferenceFormatValidator;


/**
 * This validator is to validate the context registration 'service'
 * section. This currently contains a 'type' property which may be
 * anything, but shouldn't be goofy or too long.
 */
var registrationSectionValidation = function(val) {
    if (!val.type) {
        return false;
    }
    if (typeof(val.type) !== 'string') {
        return false;
    }
    if (val.type.length > ServiceMaxLength) {
        return false;
    }
    return lowerCaseDotRegex.test(val.type);
};
exports.registrationSectionValidation = registrationSectionValidation;

/**
 * Check that the format of the origins array is correct. This should be done as
 * part of the realm validation
 *
 * The origin array can contain a series of domains which need to be validated.
 *
 */
var originsArrayFormatValidator = function(val) {
    if (Array.isArray(val) == false) { //jshint ignore:line
        var logger = require('./loggers').getLogger();
        logger.debug('Origins value is not array');
        return false;
    }
    var pass = true;
    var originField; //jshint ignore:line
    for (var i = 0; i < val.length; i++) {
        if (typeof (val[i]) !== 'string' ) {
            return false;
        }
        if (val[i].length <= 0 || val[i].length > OriginsMaxLength) {
            return false;
        }
        // wildcard doesn't fit URL scheme
        if (val[i].indexOf('*') > -1) {
            continue;
        }
        pass = validator.isURL( val[i] );
        if (!pass) {
            return false;
        }
    }
    return true;

};
exports.originsArrayFormatValidator = originsArrayFormatValidator;

/**
 * Validate the format of the batch permission request. The batch permissions
 * is an array of named objects that encapsulate a name, a set of permissions, and an optional
 * operation. eg.
 * [ { name: 'some_name',
 *     permission: ['bridget.auth.viewUser'],
 *     op: 'and', 'or', 'single'
 *   }]
 *
 *   The returnValue is a series of named values.
 *
 */
function validateBatchPermissions(rawPermissions) {

    var logger = require('./loggers').getLogger();
    logger.debug('Validate Batch Permissions permissions follow:');
    logger.debug(rawPermissions);

    for (var i = 0; i < rawPermissions.length; i++) {
        var permStruct = rawPermissions[i];
        // if (!permStruct.name || !rolenameValidator(permStruct.name)) {
        if (!permStruct.name) {
            throw new errors.BadRequestDetailsError('invalidPermissionsFormat', 'Permission entry must have name');
        }
        if ( ('string' != typeof (permStruct.permission)) && (!Array.isArray(permStruct.permission))) { //jshint ignore:line
            throw new errors.BadRequestDetailsError('invalidPermissionsFormat', 'Permissions value must be string or array of string');
        }
        // If perms are array, check that all elements are strings. No nested Arrays for you!
        if (Array.isArray(permStruct.permission) ) {
            for (var v = 0; v < permStruct.permission.length; v++ ) {
                if ('string' != typeof(permStruct.permission[v])) { //jshint ignore:line
                    throw new errors.BadRequestDetailsError('invalidPermissionsFormat', 'Nested permissions arrays not allowed');
                }
            }
        }
        if (!permStruct.op) {
            if ('string' == typeof (permStruct.permission)) { //jshint ignore:line
                permStruct.op = 'and';
            }
            if (Array.isArray(permStruct.permission)) {
                permStruct.op = 'single';
            }
        }
        if (!permissionOpValidator(permStruct.op)) {
            throw new errors.BadRequestDetailsError('invalidPermissionsFormat', 'Invalid permission op field: ' + permStruct.op);
        }
    }
    return rawPermissions;
}
exports.validateBatchPermissions = validateBatchPermissions;


/**
 * permission operations validator. An undefined value is allowed
 */
var permissionOpValidator = function (val) {
    if (!val) {
        return true;
    }
    if (typeof(val) !=='string') {
        return false;
    }
    if (val.length < 2 || val.length > PermissionOpMaxLength) {
        return false;
    }
    return permissionOpRegex.test(val);
};
exports.permissionOpValidator = permissionOpValidator;

var validateRightsJSON = function(val) {
    var logger = require('./loggers').getLogger();
    if (!val) {
        return new errors.BadRequestError('incorrectMetadataStructure');
    }
    if (val.length > MaxRightsLength) {
        return new errors.BadRequestDetailsError('invalidPermissionsFormat',
            'Rights string too long');
    }

    var ownerRights = val.owner;
    // Check that all owner rights are in the list of available rights
    if (ownerRights) {
        if (!ownerRights instanceof Array) { //jshint ignore:line
            logger.error('Owner rights value is not array');
            return new errors.BadRequestError('incorrectMetadataStructure');
        }
        for (var i = 0; i < ownerRights.length; i++) {
            if (typeof ownerRights[i] !== 'string') {
                logger.error('Owner rights not instance of string: ' + typeof(ownerRights[i]));
                return new errors.BadRequestError('incorrectMetadataStructure');
            }
            if (!allowableRightsRegex.test(ownerRights[i])) {
                logger.error('Regex failure, owner rights: ' + ownerRights[i]);
                return new errors.BadRequestError('invalidPermissionsFormat');
            }
        }
    }

    // Check that all realm rights are in the list of available rights
    var realmRights = val.realm;
    if (realmRights) {
        if (!realmRights instanceof Array) { //jshint ignore:line
            logger.error('Realm rights value is not array');
            return new errors.BadRequestError('incorrectMetadataStructure');
        }
        // Check that all owner rights are in the list of available rights
        for (var i = 0; i < realmRights.length; i++) { //jshint ignore:line
            if (typeof realmRights[i] !== 'string') {
                logger.error('Realm rights not instance of string: ' + typeof(realmRights[i] ));
                return new errors.BadRequestError('incorrectMetadataStructure');
            }
            if (!allowableRightsRegex.test(realmRights[i])) {
                logger.error('Regex failure, realm rights: ' + realmRights[i]);
                return new errors.BadRequestError('invalidPermissionsFormat');
            }
        }
    }
    // For each role in roles object,
    // ensure rights are in the list of available rights

    for (var v in val.roles) {
        /*if (!rolenameValidator(v) ) {
            return new errors.BadRequestError('invalidRolename');
        }*/

        var roleRights  = val.roles[v];
        if (roleRights) {
            if (!roleRights instanceof Array) { //jshint ignore:line
                logger.error('Role rights value is not array');
                return new errors.BadRequestError('incorrectMetadataStructure');
            }
            for (var i = 0; i < roleRights.length; i++) { //jshint ignore:line
                if (typeof roleRights[i] !== 'string' ) {
                    logger.error('Role rights not instance of string: ' + typeof(roleRights[i]));
                    return new errors.BadRequestError('incorrectMetadataStructure');
                }
                if (!allowableRightsRegex.test(roleRights[i])) {
                    logger.error('Regex failure, role rights: ' + roleRights[i]);
                    return new errors.BadRequestError('invalidPermissionsFormat');
                }
            }
        }
    }
    return null;
};
exports.validateRightsJSON = validateRightsJSON;

var validateClientMetadataJSON = function(val) {

    if (val.length > MaxRightsLength) {
        return new errors.BadRequestDetailsError('invalidPermissionsFormat',
            'Rights string too long');
    }

    // Just make sure the client metadata is parseable. There's no structure to this
    try {
        JSON.parse(val);
        return null;
    } catch (e) {
        return e;
    }
};
exports.validateClientMetadataJSON = validateClientMetadataJSON;

export default exports;
