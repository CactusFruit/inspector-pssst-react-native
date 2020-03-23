// import AsyncStorage from '@react-native-community/async-storage';
import { AsyncStorage } from 'react-native';

export class DataStorageService {

  appVersionNumber = 0.0;
  storyIsFullyLoaded = false;
  activeStoryId = 1;
  activeStoryInstanceGuid = "";
  activeStoryConfiguration = null;
  activeStoryChapter = "";
  activeStoryPage = "";
  listStoryImageDetails = [];
  listLocalImageLocations = [];
  activeMetrics = [];
  activeVariables = [];
  scoreHistory = [];
  storyIsCompleted = false;
  musicVolume = 10;
  textSize = 20;

  resetStoryVariables = () => {
      this.setActiveStoryChapter("");
      this.setActiveStoryPage("");
      this.setActiveMetrics([]);
      this.setActiveVariables([]);
      this.setStoryIsCompleted(false);
  }

  getIfStoryIsLoaded = () => {
      return this.storyIsFullyLoaded;
  }

  getIfStoryIsStarted = () => {
      if (this.activeStoryChapter != "" && this.activeStoryPage != "") {
          return true;
      }
      else {
          return false;
      }
  }

  loadExistingValuesFromStorage = (onActiveStoryConfigurationFound, onNoActiveStoryConfiguration) => {
      // In browser testing the storage driver will be null
      //if (this.storage.driver == null) {
      //    alert("storage not ready");
      //    onNoActiveStoryConfiguration();
      //}
      //else {
          //alert("storage ready");
      console.log("entered loadExistingValuesFromStorage");
      // this.storage.ready().then(() => {            
          console.log("storage is ready");
          AsyncStorage.getItem('appVersionNumber').then((val) => {
              if (val) {
                  this.appVersionNumber = val;
              }
          });
          AsyncStorage.getItem('activeStoryId').then((val) => {
              if (val) {
                  this.activeStoryId = val;
              }
          });
          AsyncStorage.getItem('activeStoryInstanceGuid').then((val) => {
              if (val) {
                  this.activeStoryInstanceGuid = val;
              }
          });
          AsyncStorage.getItem('activeStoryChapter').then((val) => {
              if (val) {
                  this.activeStoryChapter = val;
              }
          });
          AsyncStorage.getItem('activeStoryPage').then((val) => {
              if (val) {
                  this.activeStoryPage = val;
              }
          });
          AsyncStorage.getItem('listStoryImageDetails').then((val) => {
              if (val) {
                console.log(val);
                this.listStoryImageDetails = JSON.parse(val);
              }
          });
          AsyncStorage.getItem('listLocalImageLocations').then((val) => {
              if (val) {
                  this.listLocalImageLocations = JSON.parse(val);
              }
          });
          AsyncStorage.getItem('activeMetrics').then((val) => {
              if (val) {
                  this.activeMetrics = JSON.parse(val);
              }
          });
          AsyncStorage.getItem('activeVariables').then((val) => {
              if (val) {
                  this.activeVariables = JSON.parse(val);
              }
          });
          AsyncStorage.getItem('scoreHistory').then((val) => {
              if (val) {
                  this.scoreHistory = JSON.parse(val);
              }
          });
          AsyncStorage.getItem('storyIsFullyLoaded').then((val) => {
              if (val) {
                  this.storyIsFullyLoaded = val == 'true';
              }
          });
          AsyncStorage.getItem('storyIsCompleted').then((val) => {
              if (val) {
                  this.storyIsCompleted = val == 'true';
              }
          });
          AsyncStorage.getItem('musicVolume').then((val) => {
              console.log("existing music volume: " + val);
              if (val || val == 0) {
                  this.musicVolume = val;
              }
          });  
          AsyncStorage.getItem('textSize').then((val) => {
              console.log("existing text size: " + val);
              if (val || val == 0) {
                  this.textSize = val;
              }
          });
          AsyncStorage.getItem('activeStoryConfiguration').then((val) => {
              console.log("activeStoryConfiguration val:");
              console.log(val);
              if (val) {
                  this.activeStoryConfiguration = val;
                  onActiveStoryConfigurationFound();
              }
              else {
                  //alert("No activeStoryConfiguration");
                  onNoActiveStoryConfiguration();
              }
          }).catch(() => {
              //alert("Catch No activeStoryConfiguration");
              onNoActiveStoryConfiguration();
          });
          // When testing in browser we need this line as storage will not be available but does not throw an error if value is null
          //onNoActiveStoryConfiguration();
      // });
  }

  getAppVersionNumber = () => {
      return this.appVersionNumber;
  }
  getActiveStoryId = () => {
      return this.activeStoryId;
  }
  getActiveStoryInstanceGuid = () => {
      return this.activeStoryInstanceGuid;
  }
  getActiveStoryConfiguration = () => {
      return this.activeStoryConfiguration;
  }
  getActiveStoryChapter = () => {
      return this.activeStoryChapter;
  }
  getActiveStoryPage = () => {
      return this.activeStoryPage;
  }
  getListStoryImageDetails = () => {
      return this.listStoryImageDetails;
  }
  getListLocalImageLocations = () => {
      return this.listLocalImageLocations;
  }
  getActiveMetrics = () => {
      return this.activeMetrics;
  }
  getActiveVariables = () => {
      return this.activeVariables;
  }
  getScoreHistory = () => {
      return this.scoreHistory;
  }
  getMusicVolume = () => {
      return this.musicVolume;
  }
  getTextSize = () => {
      return this.textSize;
  }
  getIsStoryCompleted = () => {
      return this.storyIsCompleted;
  }

  setAppVersionNumber = (appVersionNumber) => {
      this.appVersionNumber = appVersionNumber;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('appVersionNumber', this.appVersionNumber);
      // });
  }
  setStoryIsFullyLoaded = (storyIsLoaded) => {
      this.storyIsFullyLoaded = storyIsLoaded;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('storyIsFullyLoaded', this.storyIsFullyLoaded.toString());
      // });
  }
  setActiveStoryId = (storyId) => {
      this.activeStoryId = storyId;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeStoryId', this.activeStoryId);
      // });
  }
  setActiveStoryInstanceGuid = (storyInstanceGuid) => {
      this.activeStoryInstanceGuid = storyInstanceGuid;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeStoryInstanceGuid', this.activeStoryInstanceGuid);
      // });
  }
  setActiveStoryConfiguration = (storyConfiguration) => {
      this.activeStoryConfiguration = storyConfiguration;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeStoryConfiguration', this.activeStoryConfiguration);
      // });
  }
  setActiveStoryChapter = (storyChapter) => {
      this.activeStoryChapter = storyChapter;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeStoryChapter', this.activeStoryChapter);
      // });
  }
  setActiveStoryPage = (storyPage) => {
      this.activeStoryPage = storyPage;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeStoryPage', this.activeStoryPage);
      // });
  }
  setListStoryImageDetails = (storyImageDetails) => {
      this.listStoryImageDetails = storyImageDetails;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('listStoryImageDetails', JSON.stringify(this.listStoryImageDetails));
      // });
  }
  setListLocalImageLocations = (localImageLocations) => {
      this.listLocalImageLocations = localImageLocations;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('listLocalImageLocations', JSON.stringify(this.listLocalImageLocations));
      // });
  }
  setMusicVolume = (musicVolume) => {
      this.musicVolume = musicVolume;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('musicVolume', this.musicVolume);
      // });
  }
  setTextSize = (textSize) => {
      this.textSize = textSize;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('textSize', this.textSize);
      // });
  }
  setStoryIsCompleted = (storyIsCompleted) => {
      this.storyIsCompleted = storyIsCompleted;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('storyIsCompleted', this.storyIsCompleted.toString());
      // });
  }
  addActiveMetricsToScoreHistory = () => {
      this.scoreHistory.push(this.activeMetrics);
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('scoreHistory', JSON.stringify(this.scoreHistory));
      // });
  }
  addToListLocalImageLocations = (localImageLocation) => {
      // First check if the image is already in this list
      // If it is, then we want to overwrite the old location
      var imagePreviouslyDownloaded = false;
      for (var i = 0; i < this.listLocalImageLocations.length; i++) {
          var localImage = this.listLocalImageLocations[i];
          if (localImage.storyImageId == localImageLocation.storyImageId) {
              imagePreviouslyDownloaded = true;
              localImage.storyImageLocalUrl = localImageLocation.storyImageLocalUrl;
          }
      }
      if (!imagePreviouslyDownloaded) {
          this.listLocalImageLocations.push(localImageLocation);
      }        
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('listLocalImageLocations', JSON.stringify(this.listLocalImageLocations));
      // });
  }
  updateMetric = (metricModifier) => {
      var metricFound = false;
      for (var i = 0; i < this.activeMetrics.length; i++) {
          var activeMetric = this.activeMetrics[i];
          if (activeMetric.metricName == metricModifier.metricName) {
              metricFound = true;
              activeMetric.metricLastChangeAmount = parseInt(metricModifier.metricModifier);
              activeMetric.metricValue = parseInt(activeMetric.metricValue) + parseInt(metricModifier.metricModifier);
              break;
          }
      }
      if (!metricFound) {
          this.activeMetrics.push({
              metricName: metricModifier.metricName,
              metricValue: parseInt(metricModifier.metricModifier),
              metricLastChangeAmount: parseInt(metricModifier.metricModifier)
          });
      }
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeMetrics', JSON.stringify(this.activeMetrics));
      // });
  }
  resetMetricLastChangeAmounts = () => {
      for (var i = 0; i < this.activeMetrics.length; i++) {
          var activeMetric = this.activeMetrics[i];
          console.log("resetting metricLastChangeAmount for:");
          console.log(activeMetric);
          activeMetric.metricLastChangeAmount = 0;       
          console.log(activeMetric);
      }
      //this.storage.ready().then(() => {
      //    AsyncStorage.setItem('activeMetrics', this.activeMetrics);
      //});
  }
  setActiveMetrics = (activeMetrics) => {
      this.activeMetrics = activeMetrics;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeMetrics', JSON.stringify(this.activeMetrics));
      // });
  }
  updateVariable = (storyVariable) => {
      var variableFound = false;
      for (var i = 0; i < this.activeVariables.length; i++) {
          var activeVariable = this.activeVariables[i];
          if (activeVariable.variableName == storyVariable.variableName) {
              variableFound = true;
              activeVariable.variableValue = storyVariable.variableValue;
              break;
          }
      }
      if (!variableFound) {
          this.activeVariables.push({
              variableName: storyVariable.variableName,
              variableValue: storyVariable.variableValue
          });
      }
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeVariables', JSON.stringify(this.activeVariables));
      // });
  }
  setActiveVariables = (activeVariables) => {
      this.activeVariables = activeVariables;
      // this.storage.ready().then(() => {
          AsyncStorage.setItem('activeVariables', JSON.stringify(this.activeVariables));
      // });
  }
}