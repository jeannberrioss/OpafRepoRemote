({
	doInit : function(component, event, helper) {
		component.set("v.Spinner", true);
		var action =  component.get("c.getRecordType");
		action.setParams({
			recordTypeName : 'Provider'
		});
		action.setCallback(this, function(response){
			if(response.getState() === 'SUCCESS'){
				component.set("v.recordTypeId", response.getReturnValue());
				component.set("v.Spinner", false);
			}
		});
		$A.enqueueAction(action);
	},

	navigateToRecordPage : function(component, event, helper) {
		var createRecordEvent = $A.get("e.force:createRecord");
		createRecordEvent.setParams({
			"entityApiName": "Contact",
			"recordTypeId": component.get("v.recordTypeId")
		});
		createRecordEvent.fire();	
	}
})