({
    qsToEventMap: {
        'startURL'  : 'e.c:setStartUrl'
    },
    
    qsToEventMap2: {
        'expid'  : 'e.c:setExpId'
    },
    
    /**
     * Handles the self-registration process by collecting input values,
     * invoking the Apex controller, and handling the response.
     */
    handleSelfRegister: function(component, event, helper) {
        // Retrieve input values from the component
        var accountId = component.get("v.accountId");
        var regConfirmUrl = component.get("v.regConfirmUrl");
        var firstname = component.find("firstname").get("v.value");
        var lastname = component.find("lastname").get("v.value");
        var email = component.find("email").get("v.value");
        var npiNumber = component.find("npiNumber").get("v.value"); // Retrieve NPI number
        var includePassword = component.get("v.includePasswordField");
        var password = includePassword ? component.find("password").get("v.value") : null;
        var confirmPassword = includePassword ? component.find("confirmPassword").get("v.value") : null;
        var action = component.get("c.selfRegister");
        var extraFields = JSON.stringify(component.get("v.extraFields"));   // Convert list of maps to JSON string
        var startUrl = component.get("v.startUrl");
        
        // Decode the start URL to ensure it's properly formatted
        startUrl = decodeURIComponent(startUrl);
        
        // Set parameters for the Apex selfRegister method, including the new npiNumber
        action.setParams({
            firstname: firstname,
            lastname: lastname,
            email: email,
            npiNumber: npiNumber, // Pass NPI number
            password: password,
            confirmPassword: confirmPassword,
            accountId: accountId,
            regConfirmUrl: regConfirmUrl,
            extraFields: extraFields,
            startUrl: startUrl,
            includePassword: includePassword
        });
        
        // Define the callback for handling the Apex response
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var rtnValue = response.getReturnValue();
                if (rtnValue !== null) {
                    // If there is an error message, display it
                    component.set("v.errorMessage", rtnValue);
                    component.set("v.showError", true);
                } else {
                    // Optionally, handle successful registration (e.g., redirect)
                    // This can be managed by the Apex controller's redirect logic
                }
            } else {
                // Handle unexpected server errors
                component.set("v.errorMessage", 'An unexpected error occurred. Please try again.');
                component.set("v.showError", true);
            }
        });
        
        // Enqueue the Apex action
        $A.enqueueAction(action);
    },
    
    /**
     * Fetches extra fields for the registration form from the Apex controller.
     */
    getExtraFields: function(component, event, helper) {
        var action = component.get("c.getExtraFields");
        action.setParam("extraFieldsFieldSet", component.get("v.extraFieldsFieldSet"));
        
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var rtnValue = response.getReturnValue();
                if (rtnValue !== null) {
                    component.set('v.extraFields', rtnValue);
                }
            } else {
                // Optionally, handle errors in fetching extra fields
                console.error('Failed to retrieve extra fields.');
            }
        });
        
        $A.enqueueAction(action);
    },

    /**
     * Sets the branding experience cookie based on the provided expId.
     */
    setBrandingCookie: function(component, event, helper) {        
        var expId = component.get("v.expid");
        if (expId) {
            var action = component.get("c.setExperienceId");
            action.setParams({expId:expId});
            action.setCallback(this, function(response){
                // Optionally, handle the response
            });
            $A.enqueueAction(action);
        }
    }    
})