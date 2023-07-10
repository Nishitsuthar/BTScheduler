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
    @track masterRec = '';
    @track listOfFields = [];
    @track scheduleLineItems = [];
    @track initialStartDate;
    description = '';
    intialDate = '';
    type = 'Standard';

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
        this.masterRec = event.currentTarget.dataset.id;
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
        this.initialStartDate = event.target.value;
        console.log('formattedDate', this.initialStartDate);
    }

    handleTypeChange(event) {
        this.type = event.target.value;
        console.log('type', typeof (this.type));
    }

    createSchedule() {
        try {
            console.log(`description: ${this.description} projectId: ${this.projectId} formattedDate: ${this.initialStartDate} type: ${this.type} userId: ${this.userId} masterRec: 
            ${this.masterRec}`);
            createNewSchedule({ description: this.description, project: this.projectId, initialStartDate: this.initialStartDate, type: this.type, user: this.userId, masterId: this.masterRec })
                .then((result) => {
                    console.log('url:', result);
                    // let cmpDef = {
                    //     componentDef: "c:gantt_component",
                    // };

                    // let encodedDef = btoa(JSON.stringify(cmpDef));
                    // this[NavigationMixin.Navigate]({
                    //     type: "standard__webPage",
                    //     attributes: {
                    //         url: "/one/one.app#" + encodedDef
                    //     },
                    // });

                    let cmpDef = {
                        componentDef: "c:gantt_component",
                        attributes: {
                            SchedulerId: result != "" ? result : "No Record Created",
                        }
                    };
                    // // let toast_error_msg_object = 'Your Form is Created Successfully';
                    // this.template.querySelector('c-toast-component').showToast('success', toast_error_msg_object, 3000);
                    let encodedDef = btoa(JSON.stringify(cmpDef));

                    this[NavigationMixin.Navigate]({
                        type: "standard__webPage",
                        attributes: {
                            url: "/one/one.app#" + encodedDef
                        }
                    });

                })
                .catch((error) => {
                    console.log('error:', error);
                })
        } catch (error) {
            console.log('error', JSON.stringify(error));
        }
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleDocumentEvent.bind(this));
    }

}