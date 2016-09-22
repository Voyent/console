/*
 * ICESOFT COMMERCIAL SOURCE CODE LICENSE V 1.1
 *
 * The contents of this file are subject to the ICEsoft Commercial Source
 * Code License Agreement V1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the
 * License at
 * http://www.icesoft.com/license/commercial-source-v1.1.html
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations under
 * the License.
 *
 * Copyright 2009-2014 ICEsoft Technologies Canada, Corp. All Rights Reserved.
 */

// See ../gulp-common/readme.md for documentation

//Add gulp dependency and load any gulp plugins that are
//are in the package.json file (e.g. gulp-util).
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var path = require('path');

//This line registers all the common gulp tasks we want
//to use and their dependencies.  The cfg object will allow
//us to add info specific to this particular service in the 
//future.
var cfg = {
    foo: 'bar'
};
var gulpCommon = require('../gulp-common/docker')(gulp, plugins, cfg);

gulp.task('default', ['push-repo-image'], function () {
    //plugins.util.log('default gulp task');
});