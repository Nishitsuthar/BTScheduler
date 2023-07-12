// import insertUpdateTask from '@salesforce/apex/BT_NewGanttChartCls.insertUpdateTask';
// import {
//     ShowToastEvent
// } from "lightning/platformShowToastEvent";

function formatApexDatatoJSData(scheduleData, scheduleItemsData, scheduleItemsDataList) {
    var taskData = scheduleItemsData;
    var taskDependencyData = [];
    var resourceRowData = [];
    var resourceRowIdList = []
    var assignmentRowData= [];
    var scheduleItemIdsList = [];
    var rows = [];
    var formattedData = {}

    var taskListForPhase = scheduleItemsDataList;
    var firstRowDup = {};
    console.log('taskListForPhase :- ' + JSON.stringify(taskListForPhase));
    firstRowDup["id"] = scheduleData.Id;
    firstRowDup["name"] = scheduleData.Name
    firstRowDup["startDate"] = ""
    firstRowDup["expanded"] = true
    firstRowDup["type"] = 'Project'
    firstRowDup['customtype'] = 'Project'
    firstRowDup["endDate"] = ""
    firstRowDup["children"] = []
    firstRowDup["constraintType"] = 'none'
    var newPhaseFlag = true;
    var taskWithphaseList = [];
    var taskPhaseRow;
    var phIndex = -1;
    for(var i=0;i<taskListForPhase.length;i++){
        if(taskListForPhase[i].buildertek__Phase__c && taskPhaseRow){
            console.log('method 1 in helper');

            if(taskPhaseRow['name'] != taskListForPhase[i].buildertek__Phase__c){
                phIndex = phIndex+1;
                taskPhaseRow = {}
                taskPhaseRow["type"] = 'Phase'

                taskPhaseRow["id"] = taskListForPhase[i].buildertek__Schedule__c+"_"+taskListForPhase[i].buildertek__Phase__c
                taskPhaseRow["name"] = taskListForPhase[i].buildertek__Phase__c

                taskPhaseRow["startDate"] = ""
                taskPhaseRow["expanded"] = true
                taskPhaseRow["Contractor"] = 'test'
                taskPhaseRow["endDate"] = ""
                taskPhaseRow["children"] = []
                taskPhaseRow["customtype"] = 'Phase'

                taskPhaseRow["constraintType"] = 'none'
                newPhaseFlag = false;
            }
            var rowChilObj = {};
            rowChilObj["type"] = 'Task'
            rowChilObj["customtype"] = taskListForPhase[i].buildertek__Type__c
                if(taskListForPhase[i].buildertek__Type__c == 'Milestone'){
                rowChilObj["cls"] = 'milestoneTypeColor'
            }
            rowChilObj["iconCls"] = "b-fa b-fa-arrow-right"
            rowChilObj["indentVal"] = taskListForPhase[i].buildertek__Indent_Task__c;
                if(taskListForPhase[i].buildertek__Indent_Task__c){
                rowChilObj["iconCls"] = "b-fa b-fa-arrow-left indentTrue"

            }
            rowChilObj['phase'] = taskListForPhase[i].buildertek__Phase__c


                if(taskListForPhase[i].buildertek__Dependency__c){
                rowChilObj["constraintType"] = ''
                }else{
                rowChilObj["constraintType"] = 'startnoearlierthan'
            }

                if(scheduleItemIdsList.indexOf(taskListForPhase[i].Id) < 0){
                scheduleItemIdsList.push(taskListForPhase[i].Id)
            }
            rowChilObj["id"] = taskListForPhase[i].Id
            rowChilObj["name"] = taskListForPhase[i].Name
            rowChilObj["percentDone"] = taskListForPhase[i].buildertek__Completion__c
            rowChilObj["startDate"] = taskListForPhase[i].buildertek__Start__c
            rowChilObj['predecessor'] = taskListForPhase[i].buildertek__Dependency__c;

            if (taskListForPhase[i].hasOwnProperty('buildertek__Dependency__c') == true) {
                rowChilObj['predecessorName'] = taskListForPhase[i].buildertek__Dependency__r.Name;
            } else {
                rowChilObj['predecessorName'] = '';
            }

            rowChilObj['internalresource'] = taskListForPhase[i].buildertek__Resource__c;

                if(taskListForPhase[i].buildertek__Resource__c){
                rowChilObj['internalresourcename'] = taskListForPhase[i].buildertek__Resource__r.Name;
                }else{
                rowChilObj['internalresourcename'] = '';
            }

            rowChilObj['contractorresource'] = taskListForPhase[i].buildertek__Contractor_Resource__c;

                if(taskListForPhase[i].buildertek__Contractor_Resource__c){
                rowChilObj['contractorresourcename'] = taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
                }else{
                rowChilObj['contractorresourcename'] = '';
            }
            rowChilObj['contractoracc'] = taskListForPhase[i].buildertek__Contractor__c;

                if(taskListForPhase[i].buildertek__Contractor__c){
                    rowChilObj["contractorname"] = taskListForPhase[i].buildertek__Contractor__r.Name;  //Added for contractor
                }else{
                rowChilObj["contractorname"] = '';
            }

            rowChilObj['notes'] = taskListForPhase[i].buildertek__Notes__c;
                if(taskListForPhase[i].buildertek__Lag__c != undefined && taskListForPhase[i].buildertek__Lag__c != null && taskListForPhase[i].buildertek__Lag__c != 0){
                    var startDate = new Date(taskListForPhase[i].buildertek__Start__c);
                    rowChilObj["startDate"] = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate(),0,0,0)
                }
            rowChilObj["duration"] = taskListForPhase[i].buildertek__Duration__c

                if(taskListForPhase[i].buildertek__Milestone__c){
                rowChilObj["duration"] = 0
                rowChilObj["durationMile"] = taskListForPhase[i].buildertek__Duration__c;
                rowChilObj["cls"] = 'milestoneCompleteColor'
                rowChilObj['orgmilestone'] = taskListForPhase[i].buildertek__Milestone__c;
            }
            rowChilObj["expanded"] = true
            rowChilObj["order"] = taskListForPhase[i].buildertek__Order__c
            var dependencyRow = {};
                if(taskListForPhase[i].buildertek__Dependency__c){
                    dependencyRow["id" ]  = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Dependency__c
                dependencyRow["fromTask"] = taskListForPhase[i].buildertek__Dependency__c
                    dependencyRow["toTask"]  = taskListForPhase[i].Id
                    dependencyRow["lag"]  = taskListForPhase[i].buildertek__Lag__c
                taskDependencyData.push(dependencyRow)
            }


                if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Resource__c){
                    if(resourceRowIdList.indexOf(taskListForPhase[i].buildertek__Resource__c) < 0){
                    var resourceRow = {}
                    resourceRow['id'] = taskListForPhase[i].buildertek__Resource__c;
                    resourceRow['name'] = taskListForPhase[i].buildertek__Resource__r.Name;
                    resourceRow['calendar'] = "general";
                    resourceRowData.push(resourceRow)
                    resourceRowIdList.push(taskListForPhase[i].buildertek__Resource__c)
                }

            }
                if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Contractor_Resource__c){

                    if(resourceRowIdList.indexOf(taskListForPhase[i].buildertek__Contractor_Resource__c) < 0){
                    var resourceRow = {}
                    resourceRow['id'] = taskListForPhase[i].buildertek__Contractor_Resource__c
                    resourceRow['name'] = taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
                    resourceRow['calendar'] = "general";
                    resourceRowData.push(resourceRow)
                    resourceRowIdList.push(resourceRow['id'])
                }
            }


                if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Resource__c){
                var assignmentRow = {}
                    assignmentRow['id'] = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Resource__c+'__index_'+i+'Resource_Name'+taskListForPhase[i].buildertek__Resource__r.Name;
                assignmentRow['event'] = taskListForPhase[i].Id
                assignmentRow['resource'] = taskListForPhase[i].buildertek__Resource__c;
                assignmentRowData.push(assignmentRow)
            }
                if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Contractor_Resource__c){
                var assignmentRow = {}
                    assignmentRow['id'] = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Contractor_Resource__c+'__index'+i+'ContractorResource_Name'+taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
                assignmentRow['event'] = taskListForPhase[i].Id
                assignmentRow['resource'] = taskListForPhase[i].buildertek__Contractor_Resource__c;
                assignmentRowData.push(assignmentRow)
            }
            taskPhaseRow["children"].push(rowChilObj);

            var found = false;
               if(firstRowDup['children'].length){
                   for(var k=0;k<firstRowDup['children'].length;k++){
                       if(firstRowDup['children'][k].id == taskPhaseRow['id']){
                        firstRowDup['children'][k] = taskPhaseRow
                        found = true
                    }
                }
               }else{
                firstRowDup['children'].push(taskPhaseRow);
                found = true
            }
               if(!found){
                firstRowDup['children'].push(taskPhaseRow);
            }
        }else if(taskListForPhase[i].buildertek__Phase__c && !taskPhaseRow){
            console.log('method 2 in helper');

            taskPhaseRow = {};
            phIndex = phIndex+1;
            taskPhaseRow["type"] = 'Phase'
            taskPhaseRow["id"] = taskListForPhase[i].buildertek__Schedule__c+"_"+taskListForPhase[i].buildertek__Phase__c
            taskPhaseRow["name"] = taskListForPhase[i].buildertek__Phase__c
            taskPhaseRow["startDate"] = ""
            taskPhaseRow["expanded"] = true
            taskPhaseRow["endDate"] = ""
            taskPhaseRow["children"] = []
            taskPhaseRow["constraintType"] = 'none'
            var rowChilObj = {};
            rowChilObj["type"] = 'Task'
            rowChilObj["customtype"] = taskListForPhase[i].buildertek__Type__c
                if(taskListForPhase[i].buildertek__Type__c == 'Milestone'){
                rowChilObj["cls"] = 'milestoneTypeColor'
            }
            rowChilObj["iconCls"] = "b-fa b-fa-arrow-right"
            rowChilObj["indentVal"] = taskListForPhase[i].buildertek__Indent_Task__c;
                if(taskListForPhase[i].buildertek__Indent_Task__c){
                rowChilObj["iconCls"] = "b-fa b-fa-arrow-left indentTrue"
            }
            rowChilObj['phase'] = taskListForPhase[i].buildertek__Phase__c
                if(taskListForPhase[i].buildertek__Dependency__c){
                rowChilObj["constraintType"] = ''
                }else{
                rowChilObj["constraintType"] = 'startnoearlierthan'
            }
                if(scheduleItemIdsList.indexOf(taskListForPhase[i].Id) < 0){
                scheduleItemIdsList.push(taskListForPhase[i].Id)
            }
            rowChilObj["id"] = taskListForPhase[i].Id
            rowChilObj["name"] = taskListForPhase[i].Name
            rowChilObj["percentDone"] = taskListForPhase[i].buildertek__Completion__c
            rowChilObj["startDate"] = taskListForPhase[i].buildertek__Start__c

            rowChilObj['predecessor'] = taskListForPhase[i].buildertek__Dependency__c;

            if (taskListForPhase[i].hasOwnProperty('buildertek__Dependency__c') == true) {
                rowChilObj['predecessorName'] = taskListForPhase[i].buildertek__Dependency__r.Name;
            } else {
                rowChilObj['predecessorName'] = '';
            }

            rowChilObj['internalresource'] = taskListForPhase[i].buildertek__Resource__c;

                if(taskListForPhase[i].buildertek__Resource__c){
                rowChilObj['internalresourcename'] = taskListForPhase[i].buildertek__Resource__r.Name;
                }else{
                rowChilObj['internalresourcename'] = '';
            }

            rowChilObj['contractorresource'] = taskListForPhase[i].buildertek__Contractor_Resource__c;

                if(taskListForPhase[i].buildertek__Contractor_Resource__c){
                rowChilObj['contractorresourcename'] = taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
                }else{
                rowChilObj['contractorresourcename'] = ''
            }
            rowChilObj['contractoracc'] = taskListForPhase[i].buildertek__Contractor__c;

                if(taskListForPhase[i].buildertek__Contractor__c){
                    rowChilObj["contractorname"] = taskListForPhase[i].buildertek__Contractor__r.Name;  //Added for contractor
                }else{
                rowChilObj["contractorname"] = '';
            }

            rowChilObj['notes'] = taskListForPhase[i].buildertek__Notes__c;

                if(taskListForPhase[i].buildertek__Lag__c != undefined && taskListForPhase[i].buildertek__Lag__c != null && taskListForPhase[i].buildertek__Lag__c != 0){
                var startDate = new Date(taskListForPhase[i].buildertek__Start__c);
                startDate.setDate(startDate.getDate());
                rowChilObj["startDate"] = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate(),0,0,0)
                }
            rowChilObj["duration"] = taskListForPhase[i].buildertek__Duration__c


                if(taskListForPhase[i].buildertek__Milestone__c){
                rowChilObj["duration"] = 0;
                rowChilObj["cls"] = 'milestoneCompleteColor'
                rowChilObj['orgmilestone'] = taskListForPhase[i].buildertek__Milestone__c;
            }

            rowChilObj["expanded"] = true
            rowChilObj["order"] = taskListForPhase[i].buildertek__Order__c
            var dependencyRow = {};
                if(taskListForPhase[i].buildertek__Dependency__c){
                    dependencyRow["id" ]  = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Dependency__c
                dependencyRow["fromTask"] = taskListForPhase[i].buildertek__Dependency__c
                dependencyRow["toTask"]  = taskListForPhase[i].Id
                dependencyRow["lag"]  = taskListForPhase[i].buildertek__Lag__c
                taskDependencyData.push(dependencyRow)
            }


                if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Resource__c){
                    if(resourceRowIdList.indexOf(taskListForPhase[i].buildertek__Resource__c) < 0){
                    var resourceRow = {}
                    resourceRow['id'] = taskListForPhase[i].buildertek__Resource__c;
                    resourceRow['name'] = taskListForPhase[i].buildertek__Resource__r.Name;
                    resourceRow['calendar'] = "general";
                    resourceRowData.push(resourceRow)
                    resourceRowIdList.push(resourceRow['id'])
                }

            }
                if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Contractor_Resource__c){

                    if(resourceRowIdList.indexOf(taskListForPhase[i].buildertek__Contractor_Resource__c) < 0){
                    var resourceRow = {}
                    resourceRow['id'] = taskListForPhase[i].buildertek__Contractor_Resource__c
                    resourceRow['name'] = taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
                    resourceRow['calendar'] = "general";
                    resourceRowData.push(resourceRow)
                    resourceRowIdList.push(resourceRow['id'])
                }
            }


                if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Resource__c){
                var assignmentRow = {}
                    assignmentRow['id'] = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Resource__c+'__index_'+i+'Resource_Name'+taskListForPhase[i].buildertek__Resource__r.Name;
                assignmentRow['event'] = taskListForPhase[i].Id
                assignmentRow['resource'] = taskListForPhase[i].buildertek__Resource__c;
                assignmentRowData.push(assignmentRow)
            }
                if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Contractor_Resource__c){
                var assignmentRow = {}
                    assignmentRow['id'] = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Contractor_Resource__c+'__index'+i+'ContractorResource_Name'+taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
                assignmentRow['event'] = taskListForPhase[i].Id
                assignmentRow['resource'] = taskListForPhase[i].buildertek__Contractor_Resource__c;
                assignmentRowData.push(assignmentRow)
            }
            taskPhaseRow["children"].push(rowChilObj);
            console.log(taskPhaseRow)
            newPhaseFlag = false;
        }else if(!taskListForPhase[i].buildertek__Phase__c){
            console.log('method 3 in helper');
            phIndex = phIndex+1;
            var rowChilObj = {};
            rowChilObj["type"] = 'Task'
            rowChilObj["customtype"] = taskListForPhase[i].buildertek__Type__c
            if(taskListForPhase[i].buildertek__Type__c == 'Milestone'){
                rowChilObj["cls"] = 'milestoneTypeColor'
            }
            rowChilObj["iconCls"] = "b-fa b-fa-arrow-right"
            rowChilObj["indentVal"] = taskListForPhase[i].buildertek__Indent_Task__c;
            if(taskListForPhase[i].buildertek__Indent_Task__c){
                rowChilObj["iconCls"] = "b-fa b-fa-arrow-left indentTrue"
            }
            rowChilObj['phase'] = taskListForPhase[i].buildertek__Phase__c
            if(taskListForPhase[i].buildertek__Dependency__c){
                rowChilObj["constraintType"] = ''
            }else{
                rowChilObj["constraintType"] = 'startnoearlierthan'
            }
            if(scheduleItemIdsList.indexOf(taskListForPhase[i].Id) < 0){
                scheduleItemIdsList.push(taskListForPhase[i].Id)
            }
            rowChilObj["id"] = taskListForPhase[i].Id
            rowChilObj["name"] = taskListForPhase[i].Name
            rowChilObj["percentDone"] = taskListForPhase[i].buildertek__Completion__c
            rowChilObj["startDate"] = taskListForPhase[i].buildertek__Start__c


            rowChilObj['predecessor'] = taskListForPhase[i].buildertek__Dependency__c;

            if (taskListForPhase[i].hasOwnProperty('buildertek__Dependency__c') == true) {
                rowChilObj['predecessorName'] = taskListForPhase[i].buildertek__Dependency__r.Name;
            } else {
                rowChilObj['predecessorName'] = '';
            }

            rowChilObj['internalresource'] = taskListForPhase[i].buildertek__Resource__c;

            if(taskListForPhase[i].buildertek__Resource__c){
                rowChilObj['internalresourcename'] = taskListForPhase[i].buildertek__Resource__r.Name;
            }else{
                rowChilObj['internalresourcename'] = '';
            }
            rowChilObj['contractorresource'] = taskListForPhase[i].buildertek__Contractor_Resource__c;

            if(taskListForPhase[i].buildertek__Contractor_Resource__c){
                rowChilObj['contractorresourcename'] = taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
            }else{
                rowChilObj['contractorresourcename'] = '';
            }
            rowChilObj['contractoracc'] = taskListForPhase[i].buildertek__Contractor__c;

            if(taskListForPhase[i].buildertek__Contractor__c){
                rowChilObj["contractorname"] = taskListForPhase[i].buildertek__Contractor__r.Name;  //Added for contractor
            }else{
                rowChilObj["contractorname"] = '';
            }

            rowChilObj['notes'] = taskListForPhase[i].buildertek__Notes__c;

            if(taskListForPhase[i].buildertek__Lag__c != undefined && taskListForPhase[i].buildertek__Lag__c != null && taskListForPhase[i].buildertek__Lag__c != 0){
            var startDate = new Date(taskListForPhase[i].buildertek__Start__c);

            startDate.setDate(startDate.getDate());

            rowChilObj["startDate"] = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate(),0,0,0)
            }
            rowChilObj["duration"] = taskListForPhase[i].buildertek__Duration__c

            if(taskListForPhase[i].buildertek__Milestone__c){
                rowChilObj["duration"] = 0
                rowChilObj["cls"] = 'milestoneCompleteColor'
                rowChilObj['orgmilestone'] = taskListForPhase[i].buildertek__Milestone__c;
            }

            rowChilObj["expanded"] = true
            rowChilObj["order"] = taskListForPhase[i].buildertek__Order__c
            firstRowDup['children'].push(rowChilObj);
            var dependencyRow = {};
            if(taskListForPhase[i].buildertek__Dependency__c){
                dependencyRow["id" ]  = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Dependency__c
                dependencyRow["fromTask"] = taskListForPhase[i].buildertek__Dependency__c
                dependencyRow["toTask"]  = taskListForPhase[i].Id
                dependencyRow["lag"]  = taskListForPhase[i].buildertek__Lag__c
                taskDependencyData.push(dependencyRow)
            }


            if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Resource__c){
                if(resourceRowIdList.indexOf(taskListForPhase[i].buildertek__Resource__c) < 0){
                    var resourceRow = {}
                    resourceRow['id'] = taskListForPhase[i].buildertek__Resource__c;
                    resourceRow['name'] = taskListForPhase[i].buildertek__Resource__r.Name;
                    resourceRow['calendar'] = "general";
                    resourceRowData.push(resourceRow)
                    resourceRowIdList.push(resourceRow['id'])
                }

            }

            if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Contractor_Resource__c){

                if(resourceRowIdList.indexOf(taskListForPhase[i].buildertek__Contractor_Resource__c) < 0){
                    var resourceRow = {}
                    resourceRow['id'] = taskListForPhase[i].buildertek__Contractor_Resource__c
                    resourceRow['name'] = taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
                    resourceRow['calendar'] = "general";
                    resourceRowData.push(resourceRow)
                    resourceRowIdList.push(resourceRow['id'])
                }
            }


            if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Resource__c){
                var assignmentRow = {}
                assignmentRow['id'] = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Resource__c+'__index_'+i+'Resource_Name'+taskListForPhase[i].buildertek__Resource__r.Name;
                assignmentRow['event'] = taskListForPhase[i].Id
                assignmentRow['resource'] = taskListForPhase[i].buildertek__Resource__c;
                assignmentRowData.push(assignmentRow)
            }
            if(!taskListForPhase[i].buildertek__Milestone__c && taskListForPhase[i].buildertek__Contractor_Resource__c){
                var assignmentRow = {}
                assignmentRow['id'] = taskListForPhase[i].Id+'_'+taskListForPhase[i].buildertek__Contractor_Resource__c+'__index'+i+'ContractorResource_Name'+taskListForPhase[i].buildertek__Contractor_Resource__r.Name;
                assignmentRow['event'] = taskListForPhase[i].Id
                assignmentRow['resource'] = taskListForPhase[i].buildertek__Contractor_Resource__c;
                assignmentRowData.push(assignmentRow)
            }

        }

    }
    rows.push(firstRowDup);
    formattedData['rows'] = rows;
    formattedData['resourceRowData'] = resourceRowData;
    formattedData['assignmentRowData'] = assignmentRowData
    formattedData['taskDependencyData'] = taskDependencyData;
    console.log('rows ==> ',rows);
    console.log('resourceRowData ==> ',resourceRowData);
    console.log('assignmentRowData ==> ',assignmentRowData);
    console.log('taskDependencyData ==> ',taskDependencyData);
    return formattedData;
}

function formatJSDatatoApexData(libraryDataList) {
    let dataForApexController = {};
    let scheduleItemList = [];
    let scheduleObj = {};
    libraryDataList.forEach(LibraryData => {
        var scheduleItemObj = {};
        console.log('check lib data ',LibraryData);
        if (LibraryData['type'] === "Project") {
            const endDateTimeSchedule = convertDateTime(LibraryData.endDate);
            scheduleObj['id'] = LibraryData.id;
            scheduleObj['buildertek__End_date__c'] = endDateTimeSchedule.substring(0, 8);
        }else if(LibraryData['type'] === "Task"){
            scheduleItemObj['Id'] = LibraryData.id;
            scheduleItemObj['Name'] = LibraryData.name;
            scheduleItemObj['buildertek__Completion__c'] = LibraryData.percentDone;
            scheduleItemObj['buildertek__Start_Date_Time__c'] = convertDateTime(LibraryData.startDate);
            scheduleItemObj['buildertek__End_Date_Time__c'] = convertDateTime(LibraryData.endDate);
            scheduleItemObj['buildertek__Duration__c'] = LibraryData.duration;
            scheduleItemObj['buildertek__Dependency__c'] = LibraryData.predecessor;
            scheduleItemObj['buildertek__Phase__c'] = LibraryData.phase;
            scheduleItemList.push(scheduleItemObj);
        }
    });
    console.log('scheduleObj ',scheduleObj);
    dataForApexController['scheduleObj'] = scheduleObj;
    dataForApexController['scheduleItemList'] = scheduleItemList;
    console.log('dataForApexController check ',dataForApexController);
    return dataForApexController;
}

function convertDateTime(dateString) {
    // Convert the date string to a JavaScript Date object
    const date = new Date(dateString);
    // Get the current time zone offset in milliseconds
    const timeZoneOffset = date.getTimezoneOffset() * 60000;
    // Convert the date to UTC
    const utcDate = new Date(date.getTime() - timeZoneOffset);
    // Format the UTC date to the desired format
    const formattedDate = utcDate.toISOString();
    // Remove the "Z" at the end of the formatted date
    const newDate = formattedDate.slice(0, -1);
    return newDate;
  }

export{ formatApexDatatoJSData, formatJSDatatoApexData};