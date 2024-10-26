({
    initialize: function (component, event, helper) {
        //$A.get("e.siteforce:registerQueryEventMap").setParams({"qsToEvent" : helper.qsToEventMap}).fire();
        //$A.get("e.siteforce:registerQueryEventMap").setParams({"qsToEvent" : helper.qsToEventMap2}).fire();        
        //component.set('v.extraFields', helper.getExtraFields(component, event, helper));
        //component.set("v.includePasswordField", "true");
        var urlString = window.location.href;
        var baseURL = urlString.substring(0, urlString.indexOf("/s"));
        var salutationOpts;
        if (baseURL.indexOf('Patient') >= 0) {
            component.set('v.isPatient', true);
            salutationOpts = [
                { id: '', label: '[Select]' },
                { id: 'Mrs.', label: 'Mrs.' },
                { id: 'Mr.', label: 'Mr.' },
                { id: 'Ms.', label: 'Ms.' },
                { id: 'Other', label: 'Other' }];
            component.set('v.suffixOptions', [
                { id: '', label: '[Select]' },
                { id: 'II', label: 'II' },
                { id: 'III', label: 'III' },
                { id: 'IV', label: 'IV' },
                { id: 'Jr.', label: 'Jr.' }]);
        } else {
            component.set('v.isPatient', false);
            salutationOpts = [
                { id: '', label: '[Select]' },
                { id: 'Dr	.', label: 'Dr.' },
                { id: 'DO', label: 'DO' },
                { id: 'Mrs.', label: 'Mrs.' },
                { id: 'Mr.', label: 'Mr.' },
                { id: 'Ms.', label: 'Ms.' },
                { id: 'PA', label: 'PA' },
                { id: 'NP', label: 'NP' },
                { id: 'Other', label: 'Other' }];
            component.set('v.suffixOptions', [
                { id: '', label: '[Select]' },
                { id: 'DO', label: 'DO' },
                { id: 'II', label: 'II' },
                { id: 'III', label: 'III' },
                { id: 'IV', label: 'IV' },
                { id: 'Jr.', label: 'Jr.' },
                { id: 'LPN', label: 'LPN' },
                { id: 'MD', label: 'MD' },
                { id: 'NP', label: 'NP' },
                { id: 'PA', label: 'PA' },
                { id: 'RN', label: 'RN' }]);
        }
        component.set('v.options', salutationOpts);
        component.set('v.contactOptions', [
            { id: 'Email', label: 'Email' },
            { id: 'Fax', label: 'Fax' },
            { id: 'Work Phone', label: 'Work Phone' },
            { id: 'Mobile Phone', label: 'Mobile Phone' }]);
        component.set('v.contactTypeOptions', [
            { id: '', label: '[Select]' },
            { id: 'Billing Personnel', label: 'Billing Personnel' },
            { id: 'Healthcare Personnel', label: 'Healthcare Personnel' },
            { id: 'Nurse', label: 'Nurse' },
            { id: 'Office Manager', label: 'Office Manager' },
            { id: 'Transplant Coordinator', label: 'Transplant Coordinator' },
            { id: 'Physician', label: 'Physician' },
            { id: 'Patient Support Specialist', label: 'Patient Support Specialist' },
            { id: 'Pharmacy Technician', label: 'Pharmacy Technician' },
            { id: 'Provider', label: 'Provider' },
            { id: 'Social Worker/Case Manager', label: 'Social Worker/Case Manager' },
            { id: 'Specialty Pharmacy Staff', label: 'Specialty Pharmacy Staff' },
            { id: 'Other', label: 'Other' },
            { id: 'Pharmacist', label: 'Pharmacist' },
            { id: 'Site Coordinator', label: 'Site Coordinator' }]);
    },

    handleSelfRegister: function (component, event, helpler) {
        var isValid = helpler.validateData(component, event, helpler);
        if (isValid == 0) {
            helpler.handleSelfRegister(component, event, helpler);
        } else {
            window.scroll(0, 0)
        }
    },

    setStartUrl: function (component, event, helpler) {
        var startUrl = event.getParam('startURL');
        if (startUrl) {
            component.set("v.startUrl", startUrl);
        }
    },

    setExpId: function (component, event, helper) {
        var expId = event.getParam('expid');
        if (expId) {
            component.set("v.expid", expId);
        }
        helper.setBrandingCookie(component, event, helper);
    },
    onKeyUp: function (component, event, helpler) {
        //checks for "enter" key
        if (event.keyCode === 13) {
            helpler.handleSelfRegister(component, event, helpler);
        }
    },
    handleCancel: function (component, event, helpler) {
        if (component.get('v.isPatient'))
            window.open('/Patient/s/login', '_parent');
        else
            window.open('/Prescriber/s/login', '_parent');
    }
})