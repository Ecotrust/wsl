/**
 * @author toddcullen
 */
CustomEvent = {};
CustomEvent.Events = {};
CustomEvent.Events.Base = Class.create();
CustomEvent.Events.Base.prototype = {
	initialize : function(){
		this.type = "CustomEvent.Events.Base";
	}
}
CustomEvent.EventController = Class.create();
CustomEvent.EventController.prototype = {
	initialize: function(){
		this.listeners = $A([]);
	},
	addEventListener: function(n, f){
		this.listeners.push({name: n, callback: f});
	},
	removeEventListener: function(n, f){
		this.listeners = this.listeners.without({name: n, callback: f});
	},
	dispatchEvent: function(n, e){
		for(var x=0; x<this.listeners.length; x++){
			if(this.listeners[x].name == n){
				this.listeners[x].callback(e);
			}
		}
	}
}
var EventController = new CustomEvent.EventController();

/************************** Create custom events *****************************/

// Location selection event. Used after user selects from multiple geocoder results
CustomEvent.Events.LocSelectEvent = Class.create();
CustomEvent.Events.LocSelectEvent.prototype = {
	//Expects a GeocoderLocation object
	initialize : function(location){
		this.type = "CustomEvent.Events.LocSelectEvent";
		this.data = location;
	}
};