import { LightningElement, api, track, wire} from 'lwc';
import fetchRecord from '@salesforce/apex/ReusableRelatedList.fetchRecord';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';


    export default class ReusableRelatedList extends NavigationMixin(LightningElement) {
        @api title;
        @api sobjectName;
        @api parentFieldName;
        @track ObjectName;
        @api childRelName;
        @api iconName;
        @api field1;
        @api field2;
        @api field3;
        @api field4;
        @api recordId;
        @track relatedListURL;
        @track listRecords = [];
        @track wiredActivities;

    get deleteLabel(){
        const objName = this.sobjectName;
        return 'Delete '+ objName.replace( "__c", "" ).replace( "_", " " );
    }
    get labelName (){
        const objName = this.sobjectName;
        return 'View '+ objName.replace( "__c", "" ).replace( "_", " " );
            }
     get titleName (){
         let size = '3+'
         if(this.listRecords.length <= 3)
         size = this.listRecords.length;
        return this.title + '('+size+')';
     }   
           
   @wire(fetchRecord, { 
        recId: '$recordId',  
        sObjName:  '$sobjectName',
        parentFldNam: '$parentFieldName'
     }) 
     wiredFetchRecord(value) {
        this.wiredActivities = value; 
        const { data, error } = value; 
        if (data) {
            console.log('DATA',data);
            this.listRecords  = data.listsObject;
            this.error = undefined;
        }
        else if (error) { 
            console.log('error',error);
            this.error = error;
            this.data  = undefined;
        }
    }

    viewRecord(event) {
        var recordID = event.target.value;
        console.log('recordID ', recordID);
        console.log('sobjectName ', this.sobjectName);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordID,
                objectApiName: this.sobjectName,
                actionName: 'view'
            },
        });
    }

    viewRelatedList(event) {
        console.log('recordId ', this.recordId);
        console.log('sobjectName ', this.sobjectName);
            this[NavigationMixin.Navigate]({
                type: 'standard__recordRelationshipPage',
                attributes: {
                    recordId: this.recordId,
                    objectApiName: this.sobjectName,
                    relationshipApiName: this.childRelName,
                    actionName: 'view'
                },
            });
    }

    deleteSelectedRecord(event) {
        var recordID = event.target.value;
        deleteRecord(recordID)
            .then(() => {
                refreshApex(this.wiredActivities);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
}