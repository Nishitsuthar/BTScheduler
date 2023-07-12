/* globals bryntum : true */
import { api, LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import GANTT from "@salesforce/resourceUrl/bryntum_gantt";
import GanttStyle from "@salesforce/resourceUrl/BT_Bryntum_NewGanttCss";
import GanttToolbarMixin from "./lib/GanttToolbar";
import data from './data/launch-saas';
import scheduleWrapperDataFromApex from "@salesforce/apex/bryntumGanttController.getScheduleWrapperAtLoading"
import { formatApexDatatoJSData } from "./gantt_componentHelper";
import { populateIcons, populateIconsOnExpandCollapse } from "./lib/BryntumGanttIcons";

export default class Gantt_component extends LightningElement {

    @track islibraryloaded = false;
    @track scheduleItemsDataList;
    @track scheduleData;
    @track scheduleItemsData;
    @api SchedulerId;
    @api recordId;

    connectedCallback() {
        console.log('Connected Callback new gantt chart');
        console.log('ReocrdID:- ',this.recordId);
        if (this.SchedulerId == null || this.SchedulerId == undefined) {
          if(this.recordId == null || this.recordId == undefined){
              this.SchedulerId = 'a101K00000GocLcQAJ' // New
            //   this.SchedulerId = 'a101K00000GobTCQAZ' // Old
          }else{
            this.SchedulerId = this.recordId;
          }
        } else{
            console.log('SchedulerId :- ',this.SchedulerId);
        }
        this.getScheduleWrapperDataFromApex()
    }

    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, GANTT + "/gantt.lwc.module.min.js"),
            loadStyle(this, GANTT + "/gantt.stockholm-1.css"),
            loadStyle(this, GanttStyle + "/gantt.stockholm.css")
        ])
            .then(() => {
                console.log('lib loaded');
                this.islibraryloaded = true;
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error loading Bryntum Gantt",
                        message: error,
                        variant: "error"
                    })
                );
            });
    }

    getScheduleWrapperDataFromApex() {
        scheduleWrapperDataFromApex({
            scheduleid: this.SchedulerId,
        }).then((response) => {
            console.log('response ', JSON.parse(JSON.stringify(response)));
            var records = response;
            console.log({ records });
            var data = response.lstOfSObjs;
            console.log('data-->', data);
            this.scheduleItemsDataList = JSON.parse(JSON.stringify(response.lstOfSObjs));
            console.log('scheduleItemsDataList', this.scheduleItemsDataList);
            this.scheduleData = response.scheduleObj;
            console.log('scheduleData', this.scheduleData);
            // that.storeRes = response.filesandattacmentList;

            var scheduleItemsList = [];
            var scheduleItemsListClone = [];
            let scheduleItemsMap = new Map();
            let taskMap = new Map();
            console.log('after variables');
            for (var i in data) {
                if (
                    data[i].Id != undefined &&
                    data[i].buildertek__Milestone__c != undefined &&
                    !data[i].buildertek__Milestone__c
                ) {
                    scheduleItemsList.push(data[i]);
                    taskMap.set(
                        data[i].buildertek__Phase__c,
                        scheduleItemsList.length - 1
                    );
                } else if (
                    data[i].Id != undefined &&
                    data[i].buildertek__Milestone__c != undefined &&
                    data[i].buildertek__Milestone__c
                ) {
                    scheduleItemsMap.set(data[i].buildertek__Phase__c, data[i]);
                }
            }
            console.log('after first for loop');
            for (var i = 0; i < scheduleItemsList.length; i++) {
                if (
                    scheduleItemsList[i] != undefined &&
                    scheduleItemsList[i].Id != undefined
                ) {
                    scheduleItemsListClone.push(scheduleItemsList[i]);
                    if (
                        taskMap.has(scheduleItemsList[i].buildertek__Phase__c) &&
                        i == taskMap.get(scheduleItemsList[i].buildertek__Phase__c) &&
                        scheduleItemsMap.get(scheduleItemsList[i].buildertek__Phase__c) !=
                        undefined
                    ) {
                        scheduleItemsListClone.push(
                            scheduleItemsMap.get(scheduleItemsList[i].buildertek__Phase__c)
                        );
                        scheduleItemsMap.delete(
                            scheduleItemsList[i].buildertek__Phase__c
                        );
                    }
                }
            }
            console.log('after second for loop');
            for (const [key, value] of scheduleItemsMap.entries()) {
                if (value != undefined) {
                    scheduleItemsListClone.push(value);
                }
            }
            console.log('after third for loop');
            let recordsMap = new Map();
            for (var i in scheduleItemsListClone) {
                if (scheduleItemsListClone[i].buildertek__Phase__c) {
                    if (
                        !recordsMap.has(scheduleItemsListClone[i].buildertek__Phase__c)
                    ) {
                        recordsMap.set(
                            scheduleItemsListClone[i].buildertek__Phase__c,
                            []
                        );
                    }
                    recordsMap
                        .get(scheduleItemsListClone[i].buildertek__Phase__c)
                        .push(JSON.parse(JSON.stringify(scheduleItemsListClone[i])));
                } else {
                    if (!recordsMap.has("null")) {
                        recordsMap.set("null", []);
                    }
                    recordsMap
                        .get("null")
                        .push(JSON.parse(JSON.stringify(scheduleItemsListClone[i])));
                }
            }
            console.log('after fourth for loop');

            var result = Array.from(recordsMap.entries());
            var groupData = [];
            for (var i in result) {
                var newObj = {};
                newObj["key"] = result[i][0];
                newObj["value"] = result[i][1];
                groupData.push(newObj);
            }
            console.log('after fifth for loop');

            this.scheduleItemsData = groupData;

            if (this.template.querySelector(".container").children.length) {
                this.template.querySelector(".container").innerHTML = "";
                this.template.querySelector(".container1").innerHTML = "";
                this.createGanttChartInitially();
                // this.createGantt();
            } else {
                this.createGanttChartInitially();
                // this.createGantt();
                this.isLoaded = false;
            }


        }).catch((error) => {
            console.log('error message to get while getting data from apex:- ', error.message);
        });
    }

    populateIcons(record) {
      // console.log('popluate record-->',record);
      if (record.row) {
        if (record.row._allCells.length) {
          if (
            record.record._data.type == "Project" &&
            record.row._allCells[1].innerHTML
          ) {
            var iconElement = `<span class="slds-icon_container slds-icon-custom-custom70" >
                                              <svg aria-hidden="true" class="slds-icon slds-icon-text-default" style="fill: white !important;height:1.2rem;width:1.2rem;">
                                                  <use xmlns:xlink=" http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/custom-sprite/svg/symbols.svg#custom70">
                                                  </use>
                                              </svg>
                                          </span>`;
            if (record.row._allCells[1].children[0]) {
              if (
                record.row._allCells[1].children[0].innerHTML.indexOf(
                  "custom70"
                ) == -1
              ) {
                record.row._allCells[1].children[0].innerHTML =
                  iconElement + record.row._allCells[1].children[0].innerHTML;
              }
            }
          }
          if (
            record.record._data.type == "Phase" &&
            record.row._allCells[1].innerHTML
          ) {
            var iconElement = `<span class="slds-icon_container slds-icon-standard-task" >
                                              <svg aria-hidden="true" class="slds-icon slds-icon-text-default" style="fill: white !important;height:1.2rem;width:1.2rem;">
                                                  <use xmlns:xlink=" http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/standard-sprite/svg/symbols.svg#task">
                                                  </use>
                                              </svg>
                                          </span>`;
            if (record.row._allCells[1].children[0]) {
              if (
                record.row._allCells[1].children[0].innerHTML.indexOf(
                  "slds-icon-standard-task"
                ) == -1
              ) {
                record.row._allCells[1].children[0].innerHTML =
                  iconElement + record.row._allCells[1].children[0].innerHTML;
              }
            }
          }
          if (
            record.record._data.type == "Task" &&
            record.row._allCells[1].innerHTML
          ) {
            if (
              record.record._data.iconCls == "b-fa b-fa-arrow-left indentTrue" &&
              record.row._allCells[1].children[0].classList.contains(
                "indentCellTrue"
              ) == false
            ) {
              if (record.row._allCells[1].children[0]) {
                record.row._allCells[1].children[0].classList.add(
                  "indentCellTrue"
                );
              }
              if (
                record.record._data.name == "Milestone Complete" ||
                record.record._data.customtype == "Milestone"
              ) {
                var iconElement = `<span class="slds-icon_container slds-icon-custom-custom8" style="background:white;">
                                                      <svg aria-hidden="true" class="slds-icon slds-icon-text-default" style="fill: #e56798 !important;height:1.2rem;width:1.2rem;">
                                                          <use xmlns:xlink=" http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/custom-sprite/svg/symbols.svg#custom8">
                                                          </use>
                                                      </svg>
                                                  </span>`;
                if (record.row._allCells[1].children[0]) {
                  if (
                    record.row._allCells[1].children[0].innerHTML.indexOf(
                      "slds-icon-utility-multi_select_checkbox"
                    ) == -1
                  ) {
                    record.row._allCells[1].children[0].innerHTML =
                      iconElement + record.row._allCells[1].children[0].innerHTML;
                  }
                }
              } else {
                var iconElement = `<span class="slds-icon_container slds-icon-utility-multi_select_checkbox" style="background:rgb(1 82 134 / 62%);">
                                                      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                                              width="1.5rem" height="1.4rem" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
                                                      <path fill="#FFFFFF" d="M73,20H41c-3.3,0-6,2.7-6,6v1c0,0.6,0.4,1,1,1h29c3.3,0,6,2.7,6,6v31c0,0.6,0.4,1,1,1h1c3.3,0,6-2.7,6-6V26
                                                          C79,22.7,76.3,20,73,20z"/>
                                                      <path fill="#FFFFFF" d="M59,34H27c-3.3,0-6,2.7-6,6v34c0,3.3,2.7,6,6,6h32c3.3,0,6-2.7,6-6V40C65,36.7,62.3,34,59,34z M56.3,51
                                                          L41,66.3c-0.6,0.6-1.3,0.9-2.1,0.9c-0.7,0-1.5-0.3-2.1-0.9l-7.4-7.4c-0.6-0.6-0.6-1.5,0-2.1l2.1-2.1c0.6-0.6,1.5-0.6,2.1,0l5.3,5.3
                                                          l13.2-13.2c0.6-0.6,1.5-0.6,2.1,0l2.1,2.1C56.8,49.5,56.8,50.5,56.3,51z"/>
                                                      </svg>
                                                  </span>`;
                if (record.row._allCells[1].children[0]) {
                  if (
                    record.row._allCells[1].children[0].innerHTML.indexOf(
                      "slds-icon-utility-multi_select_checkbox"
                    ) == -1
                  ) {
                    record.row._allCells[1].children[0].innerHTML =
                      iconElement + record.row._allCells[1].children[0].innerHTML;
                  }
                }
              }
            } else if (
              record.record._data.iconCls != "b-fa b-fa-arrow-left indentTrue"
            ) {
              if (
                record.record._data.name == "Milestone Complete" ||
                record.record._data.customtype == "Milestone"
              ) {
                var iconElement = `<span class="slds-icon_container slds-icon-custom-custom8" style="background:white;">
                                                      <svg aria-hidden="true" class="slds-icon slds-icon-text-default" style="fill: #e56798 !important;height:1.2rem;width:1.2rem;">
                                                          <use xmlns:xlink=" http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/custom-sprite/svg/symbols.svg#custom8">
                                                          </use>
                                                      </svg>
                                                  </span>`;
                if (record.row._allCells[1].children[0]) {
                  if (
                    record.row._allCells[1].children[0].innerHTML.indexOf(
                      "slds-icon-custom-custom8"
                    ) == -1
                  ) {
                    record.row._allCells[1].children[0].innerHTML =
                      iconElement + record.row._allCells[1].children[0].innerHTML;
                  }
                }
              } else {
                var iconElement = `<span class="slds-icon_container slds-icon-standard-task2" style="background:orange;">
                                                      <svg aria-hidden="true" class="slds-icon slds-icon-text-default" style="fill: white !important;height:1.2rem;width:1.2rem;">
                                                          <use xmlns:xlink=" http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/standard-sprite/svg/symbols.svg#task2">
                                                          </use>
                                                      </svg>
                                                  </span>`;
                if (record.row._allCells[1].children[0]) {
                  if (
                    record.row._allCells[1].children[0].innerHTML.indexOf(
                      "slds-icon-standard-task2"
                    ) == -1
                  ) {
                    record.row._allCells[1].children[0].innerHTML =
                      iconElement + record.row._allCells[1].children[0].innerHTML;
                  }
                }
              }
            }
          }
        }
      }
    }

      populateIconsOnExpandCollapse(source) {
        var rowPhaseElement = this.template.querySelector(
          '[data-id="' + source.record.id + '"]'
        );
        if (rowPhaseElement && rowPhaseElement.innerHTML) {
          var iconElement = "";
          if (source.record.type == "Phase") {
            iconElement = `<span class="slds-icon_container slds-icon-standard-task" >
                                        <svg aria-hidden="true" class="slds-icon slds-icon-text-default" style="fill: white !important;height:1.2rem;width:1.2rem;">
                                            <use xmlns:xlink=" http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/standard-sprite/svg/symbols.svg#task">
                                            </use>
                                        </svg>
                                    </span>`;
            if (
              rowPhaseElement.innerHTML.indexOf("slds-icon-standard-task") == -1
            ) {
              if (rowPhaseElement.children.length) {
                if (rowPhaseElement.children[1].children.length) {
                  rowPhaseElement.children[1].children[0].innerHTML =
                    iconElement + rowPhaseElement.children[1].children[0].innerHTML;
                }
              }
            }
          } else if (source.record.type == "Project") {
            iconElement = `<span class="slds-icon_container slds-icon-custom-custom70" >
                                        <svg aria-hidden="true" class="slds-icon slds-icon-text-default" style="fill: white !important;height:1.2rem;width:1.2rem;">
                                        <use xmlns:xlink=" http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/custom-sprite/svg/symbols.svg#custom70">
                                            </use>
                                        </svg>
                                    </span>`;
            if (
              rowPhaseElement.innerHTML.indexOf("slds-icon-custom-custom70") == -1
            ) {
              if (rowPhaseElement.children.length) {
                if (rowPhaseElement.children[1].children.length) {
                  rowPhaseElement.children[1].children[0].innerHTML =
                    iconElement + rowPhaseElement.children[1].children[0].innerHTML;
                }
              }
            }
          }
        }
      }


    createGanttChartInitially() {
        const GanttToolbar = GanttToolbarMixin(bryntum.gantt.Toolbar);

        var assignments = {};
        var resources = {};
        var tasks = {};
        var taskDependencyData = [];
        var resourceRowData = [];
        var assignmentRowData = [];
        var rows = [];

        var scheduleDataList = this.scheduleItemsDataList;
        console.log("scheduleDataList ==> ", {
            scheduleDataList,
        });

        // for (var key in scheduleDataList) {
        //   console.log('key --> ',key);
        //   if (scheduleDataList[key].buildertek__Milestone__c == true) {
        //     for (var ph of phaseDateList) {

        //       if (scheduleDataList[key].buildertek__Phase__c == ph.label) {
        //         scheduleDataList[key].buildertek__Start__c = ph.value.expr1;
        //         const date1 = new Date(ph.value.expr1);
        //         const date2 = new Date(ph.value.expr2);
        //         const diffTime = Math.abs(date2 - date1);
        //         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        //         scheduleDataList[key].buildertek__Duration__c = diffDays;
        //       }
        //     }
        //   }
        // }
        console.log('scheduleDataList after logic changed ', { scheduleDataList });
        this.scheduleItemsDataList = scheduleDataList;

        var formatedSchData = formatApexDatatoJSData(
            this.scheduleData,
            this.scheduleItemsData,
            this.scheduleItemsDataList
        );

        console.log("=== formatedSchData ===");
        console.log({
            formatedSchData,
        });

        tasks["rows"] = formatedSchData["rows"];
        resources["rows"] = formatedSchData["resourceRowData"];
        assignments["rows"] = formatedSchData["assignmentRowData"];
        taskDependencyData = formatedSchData["taskDependencyData"];
        resourceRowData = formatedSchData["resourceRowData"];
        assignmentRowData = formatedSchData["assignmentRowData"];

        const project = new bryntum.gantt.ProjectModel({
            calendar: data.project.calendar,
            // startDate: data.project.startDate,
            // tasksData: data.tasks.rows,
            tasksData: tasks.rows,
            // resourcesData: data.resources.rows,
            skipNonWorkingTimeWhenSchedulingManually: true,
            resourcesData: resourceRowData,
            // assignmentsData: data.assignments.rows,
            assignmentsData: assignmentRowData,
            // dependenciesData: data.dependencies.rows,
            dependenciesData: taskDependencyData,
            calendarsData: data.calendars.rows
        });

        console.log('project:-', project);
        const gantt = new bryntum.gantt.Gantt({
            project,
            appendTo: this.template.querySelector(".container"),
            // startDate: "2019-07-01",
            // endDate: "2019-10-01",

            tbar: new GanttToolbar(),

            dependencyIdField: "sequenceNumber",
            columns: [{
                type: "wbs"
            },
            {
                type: "name",
                width: 250,
                renderer: (record) => {
                    // populateIcons(record);
                    this.populateIcons(record);
                    if (record.record._data.type == "Phase") {
                      record.cellElement.style.margin = "";
                    }
                    if (
                      record.record._data.iconCls == "b-fa b-fa-arrow-right indentTrue"
                    ) {
                        console.log('Test Log');
                      //record.cellElement.style.margin = '0 0 0 1.5rem';
                    }
                    if (record.record._data.name == "Milestone Complete") {
                      return "Milestone";
                    } else {
                      return record.value;
                    }
                  },
            },
            {
                type: "startdate"
            },
            {
                type: "duration",
                allowedUnits: 'hour',
            },
            // {
            //   type: "contractor",
            //   width: 120
            // },
            {
                type: "percentdone",
                showCircle: true,
                width: 70
            },
            {
                type: "predecessor",
                width: 120,
                renderer: (record) => {
                    console.log('record :- ', JSON.parse(JSON.stringify(record.record.data)));
                    if (record.record._data.type == "Project") {
                        return "";
                    }
                    if (record.record._data.type == "Phase") {
                        return "";
                    }
                    if (record.record._data.name == "Milestone Complete") {
                        return "";
                    } else {
                        return record.record._data.predecessorName;
                    }
                },
            },
            {
                text: "Internal Resource",
                type: 'resourceassignment',
                width: 120,
                editor: true,
                items: {
                    Test1: 'Test1',
                    Test2: 'Test2',
                },
                renderer: function (record) {
                    if (
                        record.record._data.type == "Task" &&
                        record.record._data.name != "Milestone Complete"
                    ) {
                        if (record.record._data.internalresource) {
                            record.cellElement.classList.add("b-resourceassignment-cell");
                            record.cellElement.innerHTML = `<div class="b-assignment-chipview-wrap">
                                  <div class="b-assignment-chipview b-widget b-list b-chipview b-outer b-visible-scrollbar b-chrome b-no-resizeobserver b-widget-scroller b-hide-scroll" tabindex="0" style="overflow-x: auto;" >
                                      <div class="b-chip" data-index="0" data-isinternalresource="true" > ${record.record._data.internalresourcename}</div>
                                      <i id="editInternalResource" data-resource="${record.record._data.internalresource}" class="b-action-item b-fa b-fa-pen" style="font-size:1rem;color:#cfd1d3;margin-left:0.2rem;" id="editInternalResource" ></i>
                                      </div>
                              </div>`;
                        } else {
                            record.cellElement.innerHTML = `
                              <i  class="b-action-item b-fa b-fa-user-plus addinternalresource" style="font-size:1rem;color:#cfd1d3;margin-left:0.2rem;"  ></i>
                              `;
                        }
                    } else {
                        record.cellElement.innerHTML = `<span></span>`;
                    }
                },
                filterable: ({ record, value, operator }) => {
                    if (record._data.internalresourcename && value) {
                        if (
                            record._data.internalresourcename
                                .toUpperCase()
                                .indexOf(value.toUpperCase()) > -1
                        ) {
                            return true;
                        }
                    }
                },
            },
            //Added for Contractor
            {
                text: "Contractor",
                width: 120,
                editor: false,
                renderer: function (record) {
                    console.log('record :- ', JSON.parse(JSON.stringify(record.record.data)));

                    if (
                        record.record._data.type == "Task" &&
                        record.record._data.name != "Milestone Complete"
                    ) {
                        if (record.record._data.contractoracc) {
                            record.cellElement.classList.add("b-resourceassignment-cell");
                            record.cellElement.innerHTML = `<div id="" class="b-assignment-chipview-wrap">
                                  <div class="b-assignment-chipview b-widget b-list b-chipview b-outer b-visible-scrollbar b-chrome b-no-resizeobserver b-widget-scroller b-hide-scroll" tabindex="0" style="overflow-x: auto;" >
                                      <div class="b-chip" data-index="0" data-isinternalres="false" > ${record.record._data.contractorname}</div>
                                      <i id="editcontractor" data-resource="${record.record._data.contractorname}" class="b-action-item b-fa b-fa-pen" style="font-size:1rem;color:#cfd1d3;margin-left:0.2rem;"  ></i>
                                      </div>
                              </div>`;
                        } else {
                            record.cellElement.innerHTML = `
                              <i  class="b-action-item b-fa b-fa-user-plus addcontractor" style="font-size:1rem;color:#cfd1d3;margin-left:0.2rem;"  ></i>
                              `;
                        }
                    } else {
                        record.cellElement.innerHTML = `<span></span>`;
                    }
                },
                filterable: ({ record, value, operator }) => {
                    if (record._data.contractorresourcename && value) {
                        if (
                            record._data.contractorresourcename
                                .toUpperCase()
                                .indexOf(value.toUpperCase()) > -1
                        ) {
                            return true;
                        }
                    }
                },
            },
            {
                text: "Contractor Resource",
                width: 110,
                editor: false,
                renderer: function (record) {
                    if (
                        record.record._data.type == "Task" &&
                        record.record._data.name != "Milestone Complete"
                    ) {
                        if (record.record._data.contractorresource) {
                            record.cellElement.classList.add("b-resourceassignment-cell");
                            record.cellElement.innerHTML = `<div id="" class="b-assignment-chipview-wrap">
                                  <div class="b-assignment-chipview b-widget b-list b-chipview b-outer b-visible-scrollbar b-chrome b-no-resizeobserver b-widget-scroller b-hide-scroll" tabindex="0" style="overflow-x: auto;" >
                                      <div class="b-chip" data-index="0" data-isinternalres="false" > ${record.record._data.contractorresourcename}</div>
                                      <i id="editcontractorResource" data-resource="${record.record._data.contractorresource}" class="b-action-item b-fa b-fa-pen" style="font-size:1rem;color:#cfd1d3;margin-left:0.2rem;"  ></i>
                                      </div>
                              </div>`;
                        } else {
                            record.cellElement.innerHTML = `
                              <i  class="b-action-item b-fa b-fa-user-plus addcontractorresource" style="font-size:1rem;color:#cfd1d3;margin-left:0.2rem;"  ></i>
                              `;
                        }
                    } else {
                        record.cellElement.innerHTML = `<span></span>`;
                    }
                },
                filterable: ({ record, value, operator }) => {
                    if (record._data.contractorresourcename && value) {
                        if (
                            record._data.contractorresourcename
                                .toUpperCase()
                                .indexOf(value.toUpperCase()) > -1
                        ) {
                            return true;
                        }
                    }
                },
            },
            // {
            //   type: "successor",
            //   width: 112
            // },
            {
                type: "schedulingmodecolumn"
            },
            {
                type: "calendar"
            },
            {
                type: "constrainttype"
            },
            {
                type: "constraintdate"
            },
            //{ type: "statuscolumn" },
            {
                type: "date",
                text: "Deadline",
                field: "deadline"
            },
            {
                type: "addnew"
            }
            ],

            subGridConfigs: {
                locked: {
                    flex: 3
                },
                normal: {
                    flex: 4
                }
            },

            columnLines: false,

            features: {
                rollups: {
                    disabled: true
                },
                baselines: {
                    disabled: true
                },
                progressLine: {
                    disabled: true,
                    statusDate: new Date(2019, 0, 25)
                },
                filter: true,
                dependencyEdit: true,
                timeRanges: {
                    showCurrentTimeLine: true
                },
                labels: {
                    left: {
                        field: "name",
                        editor: {
                            type: "textfield"
                        }
                    }
                },
                pdfExport : {
                  exportServer : 'http://localhost:8080' // Required
              },
              mspExport : {
                // Choose the filename for the exported file
                filename : 'Gantt Export'
            }
            }
        });

        gantt.on('cellClick', ({ record }) => {
            // Scroll the associated task into view
            gantt.scrollTaskIntoView(record);
        });

        // gantt.features.pdfExport.showExportDialog();
        // debugger;
        // // Simple export
        // gantt.features.pdfExport.export({
        //     // Required, set list of column ids to export
        //     columns : gantt.columns.map(c => c.id)
        // }).then(result => {
        //     // Response instance and response content in JSON
        //     let { response, responseJSON } = result;
        // });
        // debugger;

        console.log('gantt:-', gantt);

        gantt.on("expandnode", (source) => {
            this.populateIconsOnExpandCollapse(source);
          });
          gantt.on("collapsenode", (source) => {
            this.populateIconsOnExpandCollapse(source);
          });

        project.commitAsync().then(() => {
            // console.timeEnd("load data");
            const stm = gantt.project.stm;
            console.log('stm', stm);

            stm.enable();
            stm.autoRecord = true;

            // let's track scheduling conflicts happened
            project.on("schedulingconflict", context => {
                // show notification to user
                bryntum.gantt.Toast.show(
                    "Scheduling conflict has happened ..recent changes were reverted"
                );
                // as the conflict resolution approach let's simply cancel the changes
                context.continueWithResolutionResult(
                    bryntum.gantt.EffectResolutionResult.Cancel
                );
            });
        });
    }

   
}