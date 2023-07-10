/* globals bryntum : true */
import {LightningElement,track} from "lwc";
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import {loadScript,loadStyle} from "lightning/platformResourceLoader";
import GANTT from "@salesforce/resourceUrl/bryntum_gantt_new";
import GanttToolbarMixin from "./lib/GanttToolbar";
import data from './data/launch-saas';
import scheduleWrapperDataFromApex from "@salesforce/apex/bryntumGanttController.getScheduleWrapperAtLoading"
import { formatApexDatatoJSData } from "./gantt_componentHelper";

export default class Gantt_component extends LightningElement {


  @track islibraryloaded = false;
  @track scheduleItemsDataList;
  @track scheduleData;
  @track scheduleItemsData;

  connectedCallback() {
    this.getScheduleWrapperDataFromApex();
  }

  renderedCallback() {
    if (this.bryntumInitialized) {
      return;
    }
    this.bryntumInitialized = true;

    Promise.all([
        loadScript(this, GANTT + "/gantt.lwc.module.min.js"),
        loadStyle(this, GANTT + "/gantt.stockholm-1.css")
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
      scheduleid: 'a2zDm000000suFyIAI',
    }).then((response) => {
      console.log('response ', JSON.parse(JSON.stringify(response)));
      var records = response;
      console.log({records});
      var data = response.lstOfSObjs;
      console.log('data-->',data);
      this.scheduleItemsDataList = JSON.parse(JSON.stringify(response.lstOfSObjs));
      console.log('scheduleItemsDataList', this.scheduleItemsDataList);
      this.scheduleData = response.scheduleObj;
      console.log('scheduleData',this.scheduleData);
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
      console.log('scheduleDataList after logic changed ',{scheduleDataList});
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
          width: 250
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
            console.log('record :- ',JSON.parse(JSON.stringify(record.record.data)));
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
            Test1 : 'Test1',
            Test2 : 'Test2',
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
            console.log('record :- ',JSON.parse(JSON.stringify(record.record.data)));

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
      }
    });

    gantt.on('cellClick', ({ record }) => {
      // Scroll the associated task into view
      gantt.scrollTaskIntoView(record);
    });

    console.log('gantt:-', gantt);

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