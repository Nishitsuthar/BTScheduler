import { LightningElement, track } from 'lwc';
import searchProject from '@salesforce/apex/bryntumGanttController.searchProject';
import searchUsers from '@salesforce/apex/bryntumGanttController.searchUsers';
export default class Create_New_Schedule extends LightningElement {

    @track searchProjectName = '';
    suggestedProjectName = [];
    @track showProjectName = false;
    
    @track searchProjectManager = '';
    suggestedProjectManagerName = [];
    @track showProjectManagerName = false;

    handleProjectSearch(event) {
        try {
            this.searchProjectName = event.target.value;
            console.log(`searchProjectName: ${this.searchProjectName}`);
            if (this.searchProjectName.length >= 3) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    searchProject({ searchProjectName: this.searchProjectName })
                        .then((result) => {
                            this.searchProjectName = result;
                            console.log('result',result);
                            console.log('result type',typeof(result));
                            this.showSearchedProjectName = true;
                        })
                        .catch((error) => {
                            console.log('error:', JSON.stringify(error));
                        });
                }, 300);
            } else {
                this.showSearchedProjectName = false;
                this.suggestedProjectName = [];
            }
        } catch (error) {
            console.log('error', JSON.stringify(error));
        }
    }

    handleProjectManagerSearch(event) {
        try {
            this.searchProjectManager = event.target.value;
            console.log(`searchProjectManager: ${this.searchProjectManager}`);
            if (this.searchProjectManager.length >= 3) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    searchUsers({ searchProjectManagerName: this.searchProjectManager })
                        .then((result) => {
                            this.suggestedProjectManagerName = result;
                            console.log('result',result);
                            console.log('result type',typeof(result));
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
}