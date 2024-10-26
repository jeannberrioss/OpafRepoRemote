({
    qsToEventMap: {
        'startURL': 'e.c:setStartUrl'
    },

    qsToEventMap2: {
        'expid': 'e.c:setExpId'
    },

    validateData: function (component, event, helper) {
        component.set("v.Spinner", true);
        var isValid = 0;
        var firstname = component.find("firstname");
        isValid = helper.setErrorMessage(firstname, isValid);
        var lastname = component.find("lastname");
        isValid = helper.setErrorMessage(lastname, isValid);
        var email = component.find("email");
        isValid = helper.setErrorMessage(email, isValid);
        if (!component.get('v.isPatient')) {
            var npiNumber = component.find("npiNumber");
            isValid = helper.setErrorMessage(npiNumber, isValid);
            var contacttype = component.find("contacttype");
            contacttype.showHelpMessageIfInvalid();
        }
        var workphone = component.find("workphone");
        isValid = helper.setErrorMessage(workphone, isValid);
        //var workfax = component.find("workfax");
        //isValid = helper.setErrorMessage(workfax,isValid);
        component.set("v.Spinner", false);
        return isValid;
    },

    setErrorMessage: function (cmp, isValid) {
        cmp.setCustomValidity("");
        cmp.reportValidity();
        if ($A.util.isEmpty(cmp.get("v.value"))) {
            cmp.setCustomValidity("Required");
            cmp.reportValidity();
            isValid = isValid + 1;
        }
        return isValid;
    },

    handleSelfRegister: function (component, event, helpler) {
        component.set("v.Spinner", true);
        var accountId = component.get("v.accountId");
        var regConfirmUrl = component.get("v.regConfirmUrl");
        var firstName = component.find("firstname").get("v.value");
        var lastName = component.find("lastname").get("v.value");
        var email = component.find("email").get("v.value");
        var npiNumberCmp = component.find("npiNumber");
        var npiNumber = null;
        if (npiNumberCmp) {
            npiNumber = npiNumberCmp.get("v.value");
        }
        var includePassword = component.get("v.includePasswordField");
        var password = component.find("password").get("v.value");
        var confirmPassword = component.find("confirmPassword").get("v.value");
        var action = component.get("c.selfRegister");
        var extraFields = JSON.stringify(component.get("v.extraFields"));   // somehow apex controllers refuse to deal with list of maps
        var startUrl = component.get("v.startUrl");
        var contactType = '';
        var contactTypeCMP = component.find("contacttype");
        if (contactTypeCMP != undefined) {
            contactType = component.find("contacttype").get("v.value");
        }
        var salutation = component.find("salutation").get("v.value");
        var suffix = component.find("suffix").get("v.value");
        var workphone = component.find("workphone").get("v.value");
        var mobilephone = component.find("mobilephone").get("v.value");
        var workfax = component.find("workfax").get("v.value");
        var methodOfContact = component.find("methodOfContact").get("v.value");
        //alert(contactType +'2'+salutation+'3'+suffix+'4'+workphone+'5'+mobilephone+'6'+workfax+'7'+methodOfContact);
        startUrl = decodeURIComponent(startUrl);
        if (component.get('v.isPatient')) contactType = 'Patient';
        action.setParams({
            firstName: firstName, lastName: lastName, email: email, npiNumber: npiNumber,
            password: password, confirmPassword: confirmPassword, accountId: accountId, regConfirmUrl: regConfirmUrl, extraFields: extraFields, startUrl: startUrl, includePassword: includePassword,
            contactType: contactType, salutation: salutation, suffix: suffix, workphone: workphone,
            mobilephone: mobilephone, workfax: workfax, methodOfContact: methodOfContact
        });
        action.setCallback(this, function (a) {
            var rtnValue = a.getReturnValue();
            if (rtnValue !== null) {
                component.set("v.errorMessage", rtnValue);
                component.set("v.showError", true);
            }
            component.set("v.Spinner", false);
        });
        $A.enqueueAction(action);
    },

    getExtraFields: function (component, event, helpler) {
        var action = component.get("c.getExtraFields");
        action.setParam("extraFieldsFieldSet", "ExtraFieldsCommunity");
        action.setCallback(this, function (a) {
            var rtnValue = a.getReturnValue();
            if (rtnValue !== null) {
                component.set('v.extraFields', rtnValue);
            }
        });
        $A.enqueueAction(action);
    },

    setBrandingCookie: function (component, event, helpler) {
        var expId = component.get("v.expid");
        if (expId) {
            var action = component.get("c.setExperienceId");
            action.setParams({ expId: expId });
            action.setCallback(this, function (a) { });
            $A.enqueueAction(action);
        }
    }
})