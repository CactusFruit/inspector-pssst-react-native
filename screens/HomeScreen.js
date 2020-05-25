import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import FullWidthImage from 'react-native-fullwidth-image'

import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';
import { DataStorageService } from '../services/DataStorageService';

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      appVersion: 1.12, // update this value when pushing new builds to app stores. Used to force image download.
      loadingData: true,
      loadingDataMessage: "",
      storyIsLoaded: false,
      storyIsStarted: false,
      imageDownloadQueue: [],
      musicLoaded: false,
      date: new Date(),
    };
    console.log(props);
    this.navigation = props.navigation;
    // this.navigation = useNavigation();
    this.dataStorageService = new DataStorageService();
    this.volumeController = null;
  }

  // const navigation = useNavigation();

  componentDidMount() {
    // this.timerID = setInterval(
    //   () => this.tick(),
    //   1000
    // );
    this.onPageLoad();
  }

  componentWillUnmount() {
    // clearInterval(this.timerID);
  }

  // tick() {
  //   this.setState({
  //     date: new Date()
  //   });
  // }

  onPageLoad = () => {
    this.setState(previousState => (
      { loadingData: true }
    ));
    this.dataStorageService.loadExistingValuesFromStorage(
      // If story is already loaded and is started then do nothing as everything should already be on the
      // device
      () => {
        console.log('first function');
        // First check if the story is loaded
        this.storyIsLoaded = this.dataStorageService.getIfStoryIsLoaded();                    
        if (!this.storyIsLoaded) {
            this.reloadStory(
                () => {
                  // this.storyIsLoaded = true;
                  this.dataStorageService.setStoryIsFullyLoaded(true);
                  // after the first story reload we update the appVersion in the data store
                  // this should prevent forced re-download of images next time the app starts
                  this.dataStorageService.setAppVersionNumber(this.state.appVersion);
                  // this.storyIsStarted = false;
                  // this.loadingData = false;                                
                  this.loadBackgroundMusic();
                  this.setState(previousState => (
                    {
                      storyIsLoaded: true,
                      storyIsStarted: false,
                      loadingData: false,
                    }
                  ));
                }
            );
        }
        else {
            // Also check if the app has been updated
            var appVersionNumberInStorage = this.dataStorageService.getAppVersionNumber();
            if (appVersionNumberInStorage != this.state.appVersion) {
                this.loadingDataMessage = "Downloading new images...";
                this.getExistingUploadedImages(() => {
                    this.updateLocalImageCache(() => {
                      this.dataStorageService.setAppVersionNumber(this.state.appVersion);
                      // this.storyIsStarted = this.dataStorageService.getIfStoryIsStarted();
                      // this.loadingData = false;
                      this.setState(previousState => (
                        {
                          storyIsStarted: this.dataStorageService.getIfStoryIsStarted(),
                          loadingData: false,
                        }
                      ));
                      this.loadBackgroundMusic();
                    });
                });
            }
            else {
                // this.storyIsStarted = this.dataStorageService.getIfStoryIsStarted();
                // this.loadingData = false;
                this.setState(previousState => (
                  {
                    storyIsStarted: this.dataStorageService.getIfStoryIsStarted(),
                    loadingData: false,
                  }
                ));
                this.loadBackgroundMusic();
            }
        }
      },
      // if story has never been loaded then reload story
      () => {
        console.log('second function');
        //alert("reloading");
        this.reloadStory(
          () => {
            console.log('done reloading story');
            // this.storyIsLoaded = true;
            this.dataStorageService.setStoryIsFullyLoaded(true);
            // after the first story reload we update the appVersion in the data store
            // this should prevent forced re-download of images next time the app starts
            this.dataStorageService.setAppVersionNumber(this.state.appVersion);
            // this.storyIsStarted = false;
            // this.loadingData = false;
            this.setState(previousState => (
              {
                storyIsLoaded: true,
                storyIsStarted: false,
                loadingData: false,
              }
            ));
            this.loadBackgroundMusic();
          }
        );
      }
    );
  }

  loadBackgroundMusic = () => {
    if (!this.musicLoaded) {
        console.log("loading background music");
        const soundObject = new Audio.Sound();
        this.volumeController = soundObject;
        soundObject.loadAsync(require('../assets/audio/funny53.wav'))
          .then(() => {
            this.musicLoaded = true;
            var musicVolume = this.dataStorageService.getMusicVolume();
            console.log("Music Volume: " + musicVolume);
            if (musicVolume > 0) {
              soundObject.setVolumeAsync(musicVolume/10.0);
              soundObject.setIsLoopingAsync(true);
              soundObject.playAsync();
            }
            // Your sound is playing!
          })
          .catch(error => {
            // An error occurred!
          });
    }
  }

  reloadStory = (onSuccess) => {
    this.dataStorageService.resetStoryVariables();
    this.loadingDataMessage = "Checking for story updates...";
    // Generate New Story Instance Guid (used for tracking each run through the story)
    var storyInstanceGuid = this.generateNewStoryInstanceGuid();
    this.dataStorageService.setActiveStoryInstanceGuid(storyInstanceGuid);
    var deviceInfo = this.getDeviceInformation(storyInstanceGuid);
    // console.log(deviceInfo);
    fetch('https://makeyourownadventuremobilebackend.azurewebsites.net/api/Story/GetStoryActiveConfigurationWithLogging/1', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceInfo),
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      if (data != null) {    
        this.dataStorageService.setActiveStoryConfiguration(JSON.parse(data));
        this.loadingDataMessage = "Downloading new images...";
        //alert("getting existing uploaded images");
        this.getExistingUploadedImages(() => {
          //alert("updating local image cache");
          this.updateLocalImageCache(onSuccess);
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }

  generateNewStoryInstanceGuid () {
    // Source: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    //return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    //    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    //);
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }

  getDeviceInformation = (storyInstanceGuid) => {
    return {
        deviceType: Device.DeviceType,
        storyInstanceGuid: storyInstanceGuid,
        cordova: "React-Native",
        isVirtual: Device.isDevice,
        manufacturer: Device.manufacturer,
        model: Device.modelName,
        platform: Device.osName,
        serial: Device.deviceName,
        uuid: Device.deviceName,
        version: Device.osVersion,
    };
  }

  getExistingUploadedImages = (onSuccess) => {
    var listStoryImageDetails = [];        
    fetch('https://makeyourownadventuremobilebackend.azurewebsites.net/api/story/GetAllStoryImageDetails/1', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseString) => {
        //this.http.get('http://localhost:17861/api/story/GetAllStoryImageDetails/1').map(res => res.json()).subscribe(responseString => {
        for (var i = 0; i < responseString.length; i++) {
            var storyImageDetails = responseString[i];
            var storyImageId = storyImageDetails.storyImageId;
            var storyId = storyImageDetails.storyId;
            var imageOriginalFilename = storyImageDetails.imageOriginalFilename;
            var imageFilenameInStorage = storyImageDetails.imageFilenameInStorage;
            var dateUploaded = storyImageDetails.dateUploaded;
            var imageFileSize = storyImageDetails.imageFileSize;
            listStoryImageDetails.push({
                storyImageId: storyImageId,
                storyId: storyId,
                imageOriginalFilename: imageOriginalFilename,
                imageFilenameInStorage: imageFilenameInStorage,
                dateUploaded: dateUploaded,
                imageFileSize: imageFileSize
            });                
        }
        this.dataStorageService.setListStoryImageDetails(listStoryImageDetails);
        console.log('doing stuff');
        onSuccess();
    })
    .catch((error) => {
      console.log(error);
    });
  }

  imageDownloadSubloop = (i, onSuccess) => {  
    var imageNumber = i + 1;
    var listStoryImageDetails = this.dataStorageService.getListStoryImageDetails();
    this.loadingDataMessage = "Downloading Image " + imageNumber + " of " + listStoryImageDetails.length;
    // console.log("listStoryImageDetails.length: " + listStoryImageDetails.length);
    if (i < listStoryImageDetails.length) {
        var listLocalImageLocations = this.dataStorageService.getListLocalImageLocations();
        var storyImageDetail = listStoryImageDetails[i];
        var imageFound = false;
        for (var j = 0; j < listLocalImageLocations.length; j++) {
            var localImageDetail = listLocalImageLocations[j];
            if (storyImageDetail.storyImageId == localImageDetail.storyImageId) {
                // Image Found
                imageFound = true;
                break;
            }
        }
        if (imageFound) {
            // console.log("Image Found: " + storyImageDetail.imageFilenameInStorage);
            // do a check for the image locally and make sure it's actually on the device                
            var fileName = storyImageDetail.imageFilenameInStorage;
            var fileExt = "jpg";
            var localStorageFileName = fileName + "." + fileExt;
            var targetPath = FileSystem.documentDirectory + localStorageFileName;
            // checkFile returns boolean on if file exists
            FileSystem.getInfoAsync(FileSystem.documentDirectory + localStorageFileName).then((fileExists) => {
                // console.log("File Exists: " + fileExists.exists);
                // On first update to new app version
                // On IOS at least (and maybe on all platforms just to be safe)
                // We will trigger a re-downloading of all images once
                // This is because for some reason, new app versions are not rendering
                // images that were downloaded by earlier versions (possibly security issue?)
                var savedAppVersion = this.dataStorageService.getAppVersionNumber();
                console.log(savedAppVersion);
                console.log(this.state.appVersion);
                // If the file does not exist, or if the app version is new, we should re-download
                if (!fileExists.exists || savedAppVersion != this.state.appVersion) {
                  console.log('downloading file');
                    // file is missing so download it
                    //console.log("Downloading File: " + JSON.stringify(storyImageDetail));
                    this.downloadFileFromCloud(storyImageDetail,
                        (targetPath, imageDetails) => {
                            this.dataStorageService.addToListLocalImageLocations({
                                storyImageId: imageDetails.storyImageId,
                                storyImageLocalUrl: targetPath
                            });
                            // once downloaded, process the next image
                            this.imageDownloadSubloop(i + 1, onSuccess);
                        },
                        (error) => {

                        }
                    );
                }
                else {
                  console.log('skipping file download');
                    // we already have the file so process the next one
                    this.imageDownloadSubloop(i + 1, onSuccess);
                }
            });
        }
        else {
            // file is missing so download it
            console.log("Downloading File: " + JSON.stringify(storyImageDetail));
            this.downloadFileFromCloud(storyImageDetail,
                (targetPath, imageDetails) => {
                    this.dataStorageService.addToListLocalImageLocations({
                        storyImageId: imageDetails.storyImageId,
                        storyImageLocalUrl: targetPath
                    });
                    // once downloaded, process the next image
                    this.imageDownloadSubloop(i + 1, onSuccess);
                },
                (error) => {

                }
            );
        }
    }
    else {
      console.log('end of the queue');
        // The end of the queue has been reached so process the onSuccess
        onSuccess();
    }
  }

  updateLocalImageCache = (onSuccess) => {
    var listStoryImageDetails = this.dataStorageService.getListStoryImageDetails();
    console.log(listStoryImageDetails.length);
    if (listStoryImageDetails.length > 0) {
        this.loadingDataMessage = "Downloading Image 1 of " + listStoryImageDetails.length;
        console.log("hi");
        this.imageDownloadSubloop(0, onSuccess);
    }        
  }

  downloadFileFromCloud = (imageDetails, onSuccess, onError) => {
    var fileName = imageDetails.imageFilenameInStorage;
    var originalFilename = imageDetails.imageOriginalFilename;
    var fileExt = "jpg";
    var localStorageFileName = fileName + "." + fileExt;
    var url = "https://makeyourownadventuremobilebackend.azurewebsites.net/api/story/DownloadFile/" + fileName;
    //var url = "http://localhost:17861/api/story/DownloadFile/" + fileName;
    // console.log("url: " + url);
    // definitely use file.dataDirectory as file.documentsDirectory actually saves to the 
    // users documents folder, meaning they would see the files in other apps

    // FileSystem.downloadAsync(
    //   'http://techslides.com/demos/sample-videos/small.mp4',
    //   FileSystem.documentDirectory + 'small.mp4'
    // )
    //   .then(({ uri }) => {
    //     console.log('Finished downloading to ', uri);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });

    var targetPath = FileSystem.documentDirectory + localStorageFileName;
    var trustHosts = true;
    // console.log("targetPath: " + targetPath);
    // var fileTransfer = this.transfer.create();
    FileSystem.downloadAsync(url, targetPath)
      .then((result) => {
        console.log('successful download');
        // console.log(result);
        onSuccess(targetPath, imageDetails);
      })
      .catch((err) => {
        console.log('error on download', err);
        onError(err);
      });
  }

  renderStartMenu = () => {
    if (this.state.loadingData) {
      console.log('render loadingDataMessage component');
      return (
        <View style={styles.helpContainer}>
            <Text style={styles.helpLinkText}>
              {this.loadingDataMessage}
            </Text>
        </View>
      );
    }
    else if (this.state.storyIsStarted) {
      console.log('render Continue Case component');
      return (
        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={this.btnClickContinueCase} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              Continue Case
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.btnClickRestartCase} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              Restart Case
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.btnClickGoToSettings} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              Settings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.btnClickGoToScoreHistory} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              Case Records
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    else {
      console.log('render Begin Case component');
      return (
        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={this.btnClickBeginStory} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              Begin Case
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.btnClickGoToSettings} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              Settings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.btnClickGoToScoreHistory} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              Case Records
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  btnClickRestartCase = (event) => {
    this.setState(previousState => (
      {
        loadingData: true,
      }
    ));
    // this.loadingData = true;
    this.reloadStory(() => {
      // this.storyIsLoaded = true;
      this.dataStorageService.setStoryIsFullyLoaded(true);
      // after the first story reload we update the appVersion in the data store
      // this should prevent forced re-download of images next time the app starts
      this.dataStorageService.setAppVersionNumber(this.state.appVersion);
      // this.storyIsStarted = false;
      // this.loadingData = false;
      this.setState(previousState => (
        {
          storyIsLoaded: true,
          storyIsStarted: false,
          loadingData: false,
        }
      ));
      this.navigation.navigate('Story', { dataStorageService: this.dataStorageService, isContinuingStory: false });
      // this.navCtrl.push(Story, {
      //     isContinuingStory: false
      // });
    });        
  }

  btnClickContinueCase = (event) => {
    var storyIsCompleted = this.dataStorageService.getIsStoryCompleted();
    if (storyIsCompleted) {
      // this.navCtrl.push(StoryComplete, {});
      
    }
    else {
      this.navigation.navigate('Story', { dataStorageService: this.dataStorageService, isContinuingStory: true });
      // this.navCtrl.push(Story, {
      //     isContinuingStory: true
      // });
    }
  }

  btnClickBeginStory = (event) => {
    // this.navCtrl.push(Story, {
    //   isContinuingStory: false
    // });
    // console.log(this);
    // console.log(this.props);
    // console.log(this.navigation);
    // console.log(navigation);
    this.navigation.navigate('Story', { dataStorageService: this.dataStorageService, isContinuingStory: false });
  }

  btnClickGoToCongratulationScreen = (event) => {
    // this.navCtrl.push(StoryComplete, {});
  }

  btnClickGoToScoreScreen = (event) => {
    // this.navCtrl.push(ScoreScreen, {});
  }

  btnClickGoToSettings = (event) => {
    // this.navCtrl.push(Settings, {});
    this.navigation.navigate('Settings', { dataStorageService: this.dataStorageService, volumeController: this.volumeController });
  }

  btnClickGoToScoreHistory = (event) => {
    // this.navCtrl.push(ScoreHistory, {});
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/Inspector-and-Captain.png')
                  : require('../assets/images/Inspector-and-Captain.png')
              }
              style={styles.welcomeImage}
            />
          </View>
          {this.renderStartMenu(this.navigation)}
        </ScrollView>
      </View>
    );
  }
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 533,
    height: 300,
    resizeMode: 'contain',
    marginTop: 3,
    // marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 20,
    color: '#2e78b7',
  },
});
