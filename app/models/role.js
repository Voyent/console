import Selectable from 'console/models/selectable';

var Role = Selectable.extend({

	permissions: [],
	isNew: false,

	toJSON: function(){
		return {
			name: this.get('content'),
			permissions: this.get('permissions')
		};
	}
});

export default Role;