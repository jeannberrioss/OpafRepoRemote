({
	doInit : function(component, event, helper) {
		var urlString = window.location.href;
		var baseURL = urlString.substring(0, urlString.indexOf("/s"));
		if(baseURL.indexOf('Patient')>=0){
			component.set('v.communityHeader','OPAF Care Connect Patient Portal');    
		}
		else component.set('v.communityHeader','OPAF Care Connect Prescriber Portal'); 	
	}
})