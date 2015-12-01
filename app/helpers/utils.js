var util = {
	formatTime: function(timeStr) {
		if( !timeStr ){
			return '';
		}
		var hour = Number(timeStr.substring(0,2));
		var minute = timeStr.substring(3,5);
		var ampm = hour < 12 ? 'am' : 'pm';
		return ( hour < 13 ? hour : hour - 12 ) + ':' + minute + ampm;
	},
	dataURLToBlob: function(dataURL){
		var parts = dataURL.split(',');
		var byteString = atob(parts[1]);
		var mimeString = parts[0].split(':')[1].split(';')[0];
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);
		for( var i = 0 ; i < byteString.length ; i++ ){
			ia[i] = byteString.charCodeAt(i);
		}
		var bb = new Blob([ab], {"type": mimeString});
		return bb;
	},
	/* http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object */
	clone: function(obj) {
		var copy;

		// Handle the 3 simple types, and null or undefined
		if (null === obj || "object" !== typeof obj){
			return obj;	
		} 

		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = util.clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)){
					copy[attr] = util.clone(obj[attr]);
				}
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	},
	createTimestampStringFromDate: function(date){
		if( date ){
			var _date;
			if( date instanceof Date){
				_date = date;
			}
			else if( typeof date === 'number' ){
				_date = new Date(date);
			}
			else{
				_date = Date.parse(date);
			}
			if( !(_date instanceof Date )){
				return;
			}
			return _date.getFullYear() + util.padNumberTo2(_date.getMonth()+1) + util.padNumberTo2(_date.getDate()) +
				util.padNumberTo2(_date.getHours()) + util.padNumberTo2(_date.getMinutes()) +
				util.padNumberTo2(_date.getSeconds());
		}
	},
	padNumberTo2: function(number) {
		if (number<=99) { number = ("00"+number).slice(-2); }
		return number;
	},
	mergeRanges: function(range1, range2){
		var merged = range1.concat(range2).sort();
		for(  var i = 0; i < merged.length -1 ; i++ ){
			//current and next overlap
			if( merged[i][1] > merged[i+1][0] || merged[i][0] === merged[i+1][0]){
				var maxend = Math.max(merged[i][1], merged[i+1][1]);
				var mergedRange = [merged[i][0], maxend];
				merged.splice(i,2,mergedRange);
				i = 0;
			}
		}
		return merged;
	},
	getPathDelimiter: function(path){
		var pathDelimiter;
		if( path.indexOf('/') > -1 ){
			pathDelimiter = '/';
		}
		else if( path.indexOf('\\') > -1 ){
			pathDelimiter = '\\';
		}
		return pathDelimiter;
	},
	extractErrorMessage: function(err){
		var msg = '';
		if( err ){
			if( err.errors ){
				for( var i = 0 ; i < err.errors.length ; i++ ){
					msg += err.errors[i].detail + ' ';
				}
			}
			else if( err.responseText ){
				try{
					var json = JSON.parse(err.responseText);
					msg = json.message;
				}
				catch(e){
					msg = err.responseText;
				}
			}
			else{
				if( err.message ){
					msg = err.message;
				}
				else{
					try{
						msg = JSON.stringify(err);
					}
					catch(e){
						msg = err;
					}
				}
			}
		}
		return msg;
	},

	rewriteURL: function(url, realm, isWebSite){
		if( url ){
			var startIdx = url.indexOf('#/realms/');
			//if url includes internal /realms part, it must be rewritten as native and web links are different
			if( startIdx > -1 ){
				var gap = '#/realms/'.length;
				var endIdx = url.indexOf('/', startIdx+gap+1);
				var newLink;
				if( isWebSite ){
					newLink = url.substring(0,startIdx+gap) + realm + url.substring(endIdx);
				}
				else{
					newLink = './index.html#/realms/native' + url.substring(endIdx);
				}
				return newLink;
			}
			else{
				return url;
			}
		}
	}
};

export default util;