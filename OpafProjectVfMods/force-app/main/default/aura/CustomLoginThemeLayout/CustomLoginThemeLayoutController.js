({
    updateRecord: function(component,event,helper){
        $A.get('e.force:refreshView').fire();
    },
    
    doInit : function(component, event, helper) {
        console.log('reload');
    }
})