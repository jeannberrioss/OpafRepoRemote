({
    doInit : function(component, event, helper) {
        // Show modal popup
        var modal = component.find("myModal");
        var modalBackdrop = component.find("myModalBackdrop");
        $A.util.addClass(modal, "slds-fade-in-open");
        $A.util.addClass(modalBackdrop, "slds-backdrop_open");
    },
    
    closeModal : function(component, event, helper) {
        // Close modal popup
        var modal = component.find("myModal");
        var modalBackdrop = component.find("myModalBackdrop");
        $A.util.removeClass(modal, "slds-fade-in-open");
        $A.util.removeClass(modalBackdrop, "slds-backdrop_open");
    }
})