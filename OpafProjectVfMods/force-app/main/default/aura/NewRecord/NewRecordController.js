({
	doInit : function(component, event, helper) {
        alert('home');
		var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": component.get("v.objectAPIName"),
            "navigationLocation": "LOOKUP",
            "panelOnDestroyCallback": function(event) {
                
                alert('record saved');
                alert('alert ------> '+component.get('v.recordId'));
            }
        });
        createRecordEvent.fire();	
	},
    
})