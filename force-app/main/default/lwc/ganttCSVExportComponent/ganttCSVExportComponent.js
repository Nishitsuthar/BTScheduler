import { api, LightningElement, track, wire } from "lwc";
import { loadScript } from 'lightning/platformResourceLoader';

import PARSER from "@salesforce/resourceUrl/pParse";


export default class GanttCSVExportComponent extends LightningElement {
    @api scheduleDataToExport;
    @track fileName = 'Schedule-Gantt';

    renderedCallback(){
        try {
            Promise.all([
                loadScript(this, PARSER + "/pParse/papaparse.js"),
            ])
            .then(() => {
                console.log('lib loaded');
            })
            .catch((error) => {
                console.log('error in promise', {error});
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error loading Papa Parse",
                        message: error,
                        variant: "error",
                    })
                );
            });
        } catch (error) {
            console.log('error ',JSON.parse(JSON.stringify(error)));
        }

    }

    changeFileName(event) {
        this.fileName = event.target.value;
    }

    hideModalBox() {
        this.dispatchEvent(new CustomEvent('hidemodel', {
            detail: {
                message: false
            }
        }));
    }

    exportScheduleData() {
        try {
            console.log('exportScheduleData');
            let temp = this.scheduleDataToExport;
            console.log('exportScheduleData', JSON.parse(JSON.stringify(temp)));
            let getColumns = [
                "Name",
                "buildertek__Dependency__r.Name",
                "buildertek__Start__c",
                "buildertek__Finish__c",
                "buildertek__Completion__c",
                "buildertek__Phase__c",
                "buildertek__Notes__c",
                "buildertek__Lag__c",
            ];

            const convertedObject = this.scheduleDataToExport.map((item) => {
                const obj = {};
                getColumns.forEach((column) => {
                    if (item.hasOwnProperty(column)) {
                        obj[column] = item[column];
                    } else {
                        obj[column] = null;
                    }

                    if (item.hasOwnProperty("buildertek__Dependency__c")) {
                        obj["buildertek__Dependency__r.Name"] =
                            item.buildertek__Dependency__r.Name;
                    } else {
                        obj["buildertek__Dependency__r.Name"] = null;
                    }
                });
                return obj;
            });

            var csvData = Papa.unparse(convertedObject);
            const element = document.createElement("a");
            element.setAttribute(
                "href",
                "data:text/csv;charset=utf-8," + encodeURIComponent(csvData)
            );
            element.setAttribute("download", this.fileName + ".csv");
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            this.hideModalBox();
        } catch (error) {
            console.log('error ',JSON.parse(JSON.stringify(error)));
        }
    }
}