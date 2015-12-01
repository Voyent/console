import Ember from 'ember';

export default Ember.Component.extend({
	attributeBindings: ['json'],
	
	didInsertElement: function() {
		var json = this.get('json'),
			elem = document.getElementById(this.get('elementId'));

		function syntaxHighlight(json) {
			if( json ){
				if (typeof json !== 'string') {
					json = JSON.stringify(json, undefined, 2);
				}
				json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
				return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
					var cls = 'number';
					if (/^"/.test(match)) {
						if (/:$/.test(match)) {
							cls = 'key';
						} else {
							cls = 'string';
						}
					} else if (/true|false/.test(match)) {
						cls = 'boolean';
					} else if (/null/.test(match)) {
						cls = 'null';
					}
					return '<span class="' + cls + '">' + match + '</span>';
				});
			}
			else{
				return '<span>Empty</span>';
			}
		}

		if( elem ){
			elem.innerHTML = '';
			var highlight = Ember.String.htmlSafe(
				'<pre>' + syntaxHighlight(JSON.stringify(json, undefined, 4)) + '</pre>'),
				d = document.createElement('div');
		
			d.innerHTML = highlight;
			document.getElementById(this.get('elementId')).appendChild(d);
		}
		
	}.observes('json'),




});
