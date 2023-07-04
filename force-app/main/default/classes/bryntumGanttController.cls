public with sharing class bryntumGanttController {
    @AuraEnabled
    public static DataTableDetails getScheduleWrapperAtLoading(String objApi, string scheduleid){


        System.debug('getScheduleWrapperAtLoading called===');
        List<Id> filesIdList = new List<Id>();
        Set<Id> notesIdList = new Set<Id>();


        DataTableDetails dataTableDtls = new DataTableDetails();

        String strQuery = 'SELECT ';

        strQuery += 'Id,Name,buildertek__Type__c,buildertek__Indent_Task__c,buildertek__Reference_for_Import__c,buildertek__Lag__c,buildertek__Schedule__c,buildertek__Budget__c,buildertek__Add_To_All_Active_Schedules__c,buildertek__Notes__c,buildertek__Schedule__r.Name,buildertek__Start__c,buildertek__Finish__c,buildertek__Duration__c,buildertek__Contractor__c,buildertek__Contractor__r.Name,buildertek__Phase__c,buildertek__Completion__c, buildertek__Dependency__c,buildertek__Dependency__r.Name,buildertek__Contractor_Resource__c,buildertek__Contractor_Resource__r.Name,buildertek__Resource__c, buildertek__Resource__r.Name,buildertek__Milestone__c,buildertek__Order__c,buildertek__Budget_Line__c,CreatedDate FROM ' + objApi + ' where buildertek__Schedule__c = :  scheduleid Order By buildertek__Order__c NULLS LAST,CreatedDate';//CreatedDate//Order by buildertek__Milestone__c , Order__c ASC NULLS LAST, Auto_Number__c ASC
        system.debug('strQuery---' + strQuery);

        dataTableDtls.lstOfSObjs = Database.query(strQuery);

        System.debug('dataTableDtls**=='+JSON.serialize(dataTableDtls.lstOfSObjs));
        List<buildertek__Project_Task__c> projectTasksSorted = dataTableDtls.lstOfSObjs;

        String milestonequery = 'Select buildertek__Project__r.Name,buildertek__Schedule__r.Name, buildertek__Dependency__r.Finish__c,buildertek__Contractor_Resource__r.Name,buildertek__Contractor__r.Name,buildertek__Resource__r.Name, ' + new_BT_Utils.getQueryStringForObjectWithAllFields('buildertek__Project_Task__c');
        milestonequery = milestonequery + ' From buildertek__Project_Task__c where buildertek__Schedule__c =:scheduleid AND buildertek__Milestone__c= true';
        List<buildertek__Project_Task__c> milestoneTaskList = DataBase.query(milestonequery);

        Map<String, List<buildertek__Project_Task__c>> TaskWithPhaseMap = new Map<String, List<buildertek__Project_Task__c>>();

        for (buildertek__Project_Task__c task : projectTasksSorted){
            if (!filesIdList.contains(task.Id)){
                filesIdList.add(task.Id);
            }
            if (task.buildertek__Reference_for_Import__c != null){
                if (!filesIdList.contains(task.buildertek__Reference_for_Import__c)){
                    filesIdList.add(task.buildertek__Reference_for_Import__c);
                }
            }
            if (!notesIdList.contains(task.Id)){
                notesIdList.add(task.Id);
            }
            if (!task.buildertek__Milestone__c){
                if (task.buildertek__Phase__c != null){
                    if (TaskWithPhaseMap.get(task.buildertek__Phase__c) != null){
                        list<buildertek__Project_Task__c> newProjectTaskList = TaskWithPhaseMap.get(task.buildertek__Phase__c);
                        newProjectTaskList.add(task) ;
                        TaskWithPhaseMap.put(task.buildertek__Phase__c, newProjectTaskList);
                    } else{
                        List<buildertek__Project_Task__c> newTaskList = new List<buildertek__Project_Task__c>();
                        newTaskList.add(task) ;
                        TaskWithPhaseMap.put(task.buildertek__Phase__c, newTaskList);
                    }
                }
            }
        }

        Map<String, buildertek__Project_Task__c> milestoneMap = new Map<String, buildertek__Project_Task__c>();
        if (milestoneTaskList.Size() > 0){
            for (buildertek__Project_Task__c milestone : milestoneTaskList){
                if (milestone.buildertek__Phase__c != null){
                    System.debug(milestone.buildertek__Phase__c);
                    list<buildertek__Project_Task__c> newProjectTaskList = TaskWithPhaseMap.get(milestone.buildertek__Phase__c);
                    System.debug(newProjectTaskList);
                    if (newProjectTaskList != null){
                        if (newProjectTaskList.Size() > 0){
                            newProjectTaskList.add(milestone);
                            TaskWithPhaseMap.put(milestone.buildertek__Phase__c, newProjectTaskList);
                        }
                    }

                } else{
                    milestoneMap.put(milestone.Id, milestone);
                }
            }
        }

        Integer i = 0;
        Map<String, Integer> newTaskWithPhaseMap = new Map<String, Integer>();
        List<buildertek__Project_Task__c> updatetaskList = new List<buildertek__Project_Task__c>();
        List<buildertek__Project_Task__c> newProjectTaskList = new List<buildertek__Project_Task__c>();
        Integer ListSize = 0;
        for (Integer j = 0; j < projectTasksSorted.Size(); j++){
            buildertek__Project_Task__c task = projectTasksSorted[j];
            if (!string.isBlank(task.buildertek__Phase__c)){
                if (TaskWithPhaseMap.Size() > 0){
                    if (newTaskWithPhaseMap.get(task.buildertek__Phase__c) == null){
                        if (TaskWithPhaseMap.get(task.buildertek__Phase__c) != null){
                            newProjectTaskList = TaskWithPhaseMap.get(task.buildertek__Phase__c);
                            if (newProjectTaskList != null){
                                ListSize = ListSize + newProjectTaskList.Size();
                            }
                            newTaskWithPhaseMap.put(task.buildertek__Phase__c, newProjectTaskList.Size());
                            updatetaskList.addAll(newProjectTaskList);
                            i = i + ListSize;
                        }
                    }
                }
            } else{
                updatetaskList.add(task) ;
                i++;
            }
        }

        system.debug('Schedule Items ::' + dataTableDtls.lstOfSObjs);
        system.debug('Schedule Item ::' + dataTableDtls);
        buildertek__Schedule__c schedulerec = [Select Id, Name, buildertek__Gantt_Draw_Dependencies__c, buildertek__Gantt_Highlight_Non_Working_Time__c, buildertek__Gantt_Project_Lines__c, buildertek__Gantt_Task_Labels__c, buildertek__Hide_Gantt_Schedule__c, buildertek__Project__c, buildertek__Project__r.Name
                                               from buildertek__Schedule__c
                                               Where Id = :scheduleid];
        dataTableDtls.scheduleObj = schedulerec;
        NotesAttachmet notesAttachFiles = new NotesAttachmet();
        Map<String, NotesAttachmet> getnotesFilesLengthMap = new Map<String, NotesAttachmet>();

        if (updatetaskList.size() > 0){
            Map<Id, list<ContentVersion>> filesList = new Map<Id, list<ContentVersion>>();
            if (filesIdList.size() > 0){
                filesList = new_filePreviewController.getRelatedFiles(filesIdList);
                System.debug(filesList.size());
                System.debug(filesList);
            }

            // for notes
            List<ContentNote> notesList = new List<ContentNote>();
            map<Id, list<ContentNote>> parentandNoteMap = new map<Id, list<ContentNote>>();
            Map<Id, Id> docAndParentMap = new Map<Id, Id>();
            if (notesIdList.size() > 0){
                Set<Id> contentDocumentIds = new Set<Id>();
                for (ContentDocumentLink conDoc : [SELECT ContentDocumentId, LinkedEntityId
                                                   FROM ContentDocumentLink
                                                   WHERE LinkedEntityId IN:notesIdList]){
                    contentDocumentIds.add(conDoc.ContentDocumentId);
                    docAndParentMap.put(conDoc.ContentDocumentId, conDoc.LinkedEntityId);
                }
                System.debug(docAndParentMap);
                //get all the content notes using contentDocumentIds
                List<ContentNote> contentNotes = [SELECT Id, Content, Title, TextPreview, CreatedDate
                                                  from ContentNote
                                                  where Id In:contentDocumentIds
                                                  order by CreatedDate ASC];
                System.debug(contentNotes);
                for (ContentNote noteRec : contentNotes){
                    system.debug(noteRec.Id);
                    if (!parentandNoteMap.containsKey(docAndParentMap.get(noteRec.Id))){
                        parentandNoteMap.put(docAndParentMap.get(noteRec.Id), new list<ContentNote>());
                    }
                    parentandNoteMap.get(docAndParentMap.get(noteRec.Id)).add(noteRec);
                }
                System.debug(parentandNoteMap);
            }

            NotesAttachmet getnotesFilesLength = new NotesAttachmet();

            if (updatetaskList.size() > 0){
                for (buildertek__Project_Task__c taskItem : updatetaskList){
                    NotesAttachmet getnotesFilesObj = new NotesAttachmet();

                    if (filesList.get(taskItem.Id) != null || filesList.get(taskItem.buildertek__Reference_for_Import__c) != null){
                        getnotesFilesObj.fileLength = 0;
                        if (filesList.get(taskItem.Id) != null){
                            getnotesFilesObj.fileLength = filesList.get(taskItem.Id).size();
                        }
                        if (filesList.get(taskItem.buildertek__Reference_for_Import__c) != null){
                            getnotesFilesObj.fileLength += filesList.get(taskItem.buildertek__Reference_for_Import__c).size();
                        }
                    } else{
                        getnotesFilesObj.fileLength = 0;
                    }

                    if (parentandNoteMap.get(taskItem.Id) != null){
                        getnotesFilesObj.notesLength = parentandNoteMap.get(taskItem.Id).size();
                    } else{
                        getnotesFilesObj.notesLength = 0;
                    }

                    if (!getnotesFilesLengthMap.containsKey(taskItem.Id)){
                        getnotesFilesLengthMap.put(taskItem.Id, getnotesFilesObj);
                    }
                }
            }
            system.debug(getnotesFilesLengthMap);

        }

        User curruser = [select id, Name, buildertek__Hide_Schedule__c
                         from User
                         where id = :userInfo.getUserId()];

        List<object> fileLenListCustom = new list<Object>();

        dataTableDtls.lstOfSObjs = updatetaskList;
        System.debug('updatetaskList===='+JSON.serialize(updatetaskList));

        dataTableDtls.filesandattacmentList = getnotesFilesLengthMap;
        dataTableDtls.hideScheduleFromUser = curruser.buildertek__Hide_Schedule__c;
        Id profileId = userinfo.getProfileId();
        String profileName = [Select Id, Name
                              from Profile
                              where Id = :profileId].Name;
        system.debug('ProfileName' + profileName);
        system.debug(userinfo.getusername());
        dataTableDtls.profileName = profileName;
        System.debug('dataTable :: ' + dataTableDtls);
        return dataTableDtls;
    }

    public class DataTableDetails{
        @AuraEnabled
        public List<buildertek__Project_Task__c> lstOfSObjs = new List<buildertek__Project_Task__c>();
        @AuraEnabled
        public buildertek__Schedule__c scheduleObj = new buildertek__Schedule__c();
        @AuraEnabled
        public Map<String, NotesAttachmet> filesandattacmentList = new Map<String, NotesAttachmet>();
        @AuraEnabled
        public string ganttJSON;
        @AuraEnabled
        public boolean hideScheduleFromUser;
        @AuraEnabled
        public string profileName;
    }

    public class NotesAttachmet{
        @AuraEnabled
        public Integer fileLength;
        @AuraEnabled
        public Integer notesLength;
    }
}