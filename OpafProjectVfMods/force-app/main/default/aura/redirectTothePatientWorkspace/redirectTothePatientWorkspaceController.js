({
	doInit : function(component, event, helper) {   
        var urlEvent = $A.get("e.force:navigateToURL");
        let urlString = window.location.href;
        let baseURL = urlString.substring(0, urlString.indexOf("/s"));
  urlEvent.setParams({
    'url': baseURL+'/s/my-workspace'
  });
  urlEvent.fire();
	}
})