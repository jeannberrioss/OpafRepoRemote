trigger AttachmentTrigger on Attachment (after insert,before insert, before update, after update) {
    if(trigger.isafter){
        for(Attachment a:Trigger.New){
        ConvertAttachmentToContent.convertAttachment(a.id);   
        }
    }
    if(trigger.isBefore){
    	ConvertAttachmentToContent.updateType(Trigger.New);   
    }
}