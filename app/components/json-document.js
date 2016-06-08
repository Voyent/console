import Ember from 'ember';

export default Ember.Component.extend({

	document: null,

	didRender: function(){
		console.log('json-document.didRender()');
		this._super(...arguments);
		this.renderDocument();
	},

	didUpdateAttrs: function(){
		console.log('json-document.didUpdateAttrs()');
		this._super(...arguments);
		this.renderDocument();
	},

	renderDocument: function() {
		let doc = this.get('document');
		let elemId = this.get('elementId');
		let elem = document.getElementById(elemId);
		if( elem ){
			elem.innerHTML = '';
			let prettyHtml = Ember.String.htmlSafe('<pre>' + this.jsonToHTML(JSON.stringify(doc, undefined, 4)) + '</pre>');
			let d = document.createElement('div');
			d.innerHTML = prettyHtml;
			elem.appendChild(d);
		}
	},

	jsonToHTML: function(json){
		if( json ){
			if (typeof json !== 'string') {
				json = JSON.stringify(json, undefined, 2);
			}
			json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,  (match) => {
				let cls = 'number';
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

});