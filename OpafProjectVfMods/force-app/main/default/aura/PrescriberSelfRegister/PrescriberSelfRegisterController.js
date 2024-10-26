({
    initialize: function(component, event, helper) {
        // Register query event mappings for startURL and expid
        $A.get("e.siteforce:registerQueryEventMap")
            .setParams({"qsToEvent" : helper.qsToEventMap})
            .fire();
        $A.get("e.siteforce:registerQueryEventMap")
            .setParams({"qsToEvent" : helper.qsToEventMap2})
            .fire();        
        
        // Fetch and set extra fields for the registration form
        helper.getExtraFields(component, event, helper);
    },
    
    handleSelfRegister: function(component, event, helper) {
        // Delegate the self-registration handling to the helper
        helper.handleSelfRegister(component, event, helper);
    },
    
    setStartUrl: function(component, event, helper) {
        // Handle the setting of the start URL from the event
        var startUrl = event.getParam('startURL');
        if(startUrl) {
            component.set("v.startUrl", startUrl);
        }
    },
    
    setExpId: function(component, event, helper) {
        // Handle the setting of the branding experience ID from the event
        var expId = event.getParam('expid');
        if (expId) {
            component.set("v.expid", expId);
        }
        helper.setBrandingCookie(component, event, helper);
    },
    
    onKeyUp: function(component, event, helper){
        // Trigger self-registration when the "Enter" key is pressed
        if (event.getParam('keyCode') === 13) {
            helper.handleSelfRegister(component, event, helper);
        }
    }   
})