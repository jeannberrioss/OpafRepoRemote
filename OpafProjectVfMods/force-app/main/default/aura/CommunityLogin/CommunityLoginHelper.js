({
helperMethod: function () {
 
},
 
handleLogin: function (username,
password) {
console.log("called helper");
var username = username;
console.log("username " +
username);
var password = password;
var action = component.get(
"c.login");
var startUrl = component.get(
"v.startUrl");
 
console.log("password " +
password);
console.log("startUrl " +
startUrl);
 
startUrl =
decodeURIComponent(
startUrl);
 
action.setParams({
username: username,
password: password,
startUrl: startUrl
});
action.setCallback(this,
function (a) {
var rtnValue = a.getReturnValue();
if (rtnValue !==
null) {
component.set(
"v.errorMessage",
rtnValue);
component.set(
"v.showError",
true);
}
});
$A.enqueueAction(action);
},
 
getCommunitySelfRegisterUrl : function (component, event, helpler) {
        var action = component.get("c.getSelfRegistrationUrl");
        action.setCallback(this, function(a){
        var rtnValue = a.getReturnValue();
            if (rtnValue !== null) {
                component.set('v.communitySelfRegisterUrl',rtnValue);
            }
        });
        $A.enqueueAction(action);
},
getIsSelfRegistrationEnabled : function (component, event, helpler) {
        var action = component.get("c.getIsSelfRegistrationEnabled");
        action.setCallback(this, function(a){        
        var rtnValue = a.getReturnValue();
            if (rtnValue !== null) {
                component.set('v.isSelfRegistrationEnabled',rtnValue);
            }
        });
        $A.enqueueAction(action);
    },
    getCommunityForgotPasswordUrl : function (component, event, helpler) {
        var action = component.get("c.getForgotPasswordUrl");
        action.setCallback(this, function(a){
        var rtnValue = a.getReturnValue();
            if (rtnValue !== null) {
                component.set('v.communityForgotPasswordUrl',rtnValue);
            }
        });
        $A.enqueueAction(action);
    },
    getCustomSettings : function (component, event, helpler) {
        var action = component.get("c.getCustomsettings");
        action.setCallback(this, function(a){
        var rtnValue = a.getReturnValue();
            if (rtnValue !== null) {
                component.set('v.communityHeader',rtnValue.Patient_Login_Header__c);
            }
        });
        $A.enqueueAction(action);
    },
    
 
})