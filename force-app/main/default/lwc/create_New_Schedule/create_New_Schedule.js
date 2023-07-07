import { LightningElement, track } from 'lwc';
import searchProject from '@salesforce/apex/bryntumGanttController.searchProject';
import searchUsers from '@salesforce/apex/bryntumGanttController.searchUsers';
import fetchScheduleList from '@salesforce/apex/bryntumGanttController.fetchScheduleList';
import getScheduleItemList from '@salesforce/apex/bryntumGanttController.getScheduleItemList';
import createNewSchedule from '@salesforce/apex/bryntumGanttController.createNewSchedule';
import { NavigationMixin } from 'lightning/navigation';

export default class Create_New_Schedule extends NavigationMixin(LightningElement) {

    @track searchProjectName = '';
    @track suggestedProjectName = [];
    @track showProjectName = false;
    @track projectId = '';
    @track userId = '';
    @track searchProjectManager = '';
    @track suggestedProjectManagerName = [];
    @track showProjectManagerName = false;
    @track searchbarValue = '';
    @track masterId = '';
    @track listOfFields = [];
    @track scheduleLineItems = [];
    description = '';
    intialDate = '';
    type = 'Standard';
    formattedDate;

    connectedCallback(event) {
        document.addEventListener('click', this.handleDocumentEvent.bind(this));
        this.getFields();
    }

    handleProjectSearch(event) {
        try {
            this.searchProjectName = event.target.value;
            this.searchbarValue = event.target.dataset.id;
            console.log(`searchProjectName: ${this.searchProjectName}`);
            if (this.searchProjectName.length >= 3) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    searchProject({ searchProjectName: this.searchProjectName })
                        .then((result) => {
                            this.suggestedProjectName = result;
                            console.log('result', result);
                            this.showProjectName = true;
                        })
                        .catch((error) => {
                            console.log('error:', JSON.stringify(error));
                        });
                }, 300);
            } else {
                this.showProjectName = false;
                this.suggestedProjectName = [];
            }
        } catch (error) {
            console.log('error', JSON.stringify(error));
        }
    }

    handleProjectManagerSearch(event) {
        try {
            this.searchProjectManager = event.target.value;
            this.searchbarValue = event.target.dataset.id;
            console.log(`searchProjectManager: ${this.searchProjectManager}`);
            if (this.searchProjectManager.length >= 3) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    searchUsers({ searchProjectManagerName: this.searchProjectManager })
                        .then((result) => {
                            this.suggestedProjectManagerName = result;
                            console.log('result', result);
                            this.showProjectManagerName = true;
                        })
                        .catch((error) => {
                            console.log('error:', JSON.stringify(error));
                        });
                }, 300);
            } else {
                this.showProjectManagerName = false;
                this.suggestedProjectManagerName = [];
            }
        } catch (error) {
            console.log('error', JSON.stringify(error));
        }
    }

    handleDocumentEvent(event) {
        const clickedElement = event.target;
        const componentElement = this.template.querySelector('.detailContainer');
        if (componentElement && !componentElement.contains(clickedElement)) {
            console.log('handleDocumentEvent condition');
            this.showProjectName = false;
            this.showProjectManagerName = false;
        }
    }

    selectedRecord(event) {
        const selectedValue = event.target.innerText;
        let pId = event.currentTarget.dataset.id;
        console.log('selectedValue', selectedValue);
        console.log('Id', pId);

        if (this.searchbarValue === 'project') {
            this.searchProjectName = selectedValue;
            this.projectId = pId;
        } else {
            this.searchProjectManager = selectedValue;
            this.userId = pId;
        }

    }

    getFields() {
        fetchScheduleList()
            .then((result) => {
                this.masterId = result;
                console.log('masterId', this.masterId);
            })
            .catch((error) => {
                console.log('error', JSON.stringify(error));
            })
    }

    saveSelectedPO(event) {
        let masterRec = event.currentTarget.dataset.id;
        console.log('masterId', masterRec);
        getScheduleItemList({ masterId: masterRec })
            .then((result) => {
                this.scheduleLineItems = result;
                console.log('scheduleLineItems:', this.scheduleLineItems);
            })
            .catch((error) => {
                console.log('error', JSON.stringify(error));
            })
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
        console.log('description', typeof (this.description));
    }

    handleStartDateChange(event) {
        this.initialDate = event.target.value;
        let date = new Date(this.initialDate);
        let year = date.getFullYear();
        let month = ('0' + (date.getMonth() + 1)).slice(-2);
        let day = ('0' + date.getDate()).slice(-2);
        this.formattedDate = year + '-' + month + '-' + day;
        console.log('formattedDate', this.formattedDate);
    }

    handleTypeChange(event) {
        this.type = event.target.value;
        console.log('type', typeof (this.type));
    }

    // createSchedule() {
    //     try {
    //         console.log('createSchedule');
    //         console.log(`description: ${this.description} projectId: ${this.projectId} formattedDate: ${this.formattedDate} type: ${this.type} userId: ${this.userId}`);
    //         createNewSchedule({ description: this.description, project: this.projectId, initialDate: this.formattedDate, type: this.type, user: this.userId })
    //             .then((result) => {
    //                 console.log('url:', result);
    //                 // let cmpDef = {
    //                 //     componentDef: `gantt_component\ ${result}`,
    //                 // };
    //                 // let encodedDef = btoa(JSON.stringify(cmpDef));
    //                 // this[NavigationMixin.Navigate]({
    //                 //     type: "standard__component",
    //                 //     attributes: {
    //                 //         url: "/one/one.app#" + encodedDef
    //                 //     }
    //                 // });
    //                 this[NavigationMixin.Navigate]({
    //                     type: 'standard__recordPage',
    //                     attributes: {
    //                     recordId: record,
    //                     actionName: 'view'
    //                 }
    //                 });

    //             })
    //             .catch((error) => {
    //                 console.log('error:', error);
    //             })
    //     } catch (error) {
    //         console.log('error', JSON.stringify(error));
    //     }
    // }
    createSchedule() {
        let recordId = 'a2zDm0000004bF6IAI'; 

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'buildertek__Schedule__c',
                actionName: 'view'
            }
        });
    }


    disconnectedCallback() {
        document.removeEventListener('click', this.handleDocumentEvent.bind(this));
    }

}