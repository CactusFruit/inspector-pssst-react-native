import React, { Component } from 'react';
import {
  Image,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FullWidthImage from 'react-native-fullwidth-image'

export default class StoryScreen extends Component {
  constructor(props) {
    super(props);
    // this.dataStorageService = new DataStorageService();
    // console.log('story props');
    // console.log(props);
    this.navigation = props.navigation;
    this.route = props.route;
    this.dataStorageService = props.route.params.dataStorageService;
    let activeStoryConfiguration = this.dataStorageService.getActiveStoryConfiguration();
    let activeStoryChapter = this.dataStorageService.getActiveStoryChapter();
    let activeStoryPage = this.dataStorageService.getActiveStoryPage();
    if (activeStoryPage == "") {
      this.dataStorageService.setActiveStoryChapter(activeStoryConfiguration.storyChapters[0].chapterTitle);
      activeStoryChapter = activeStoryConfiguration.storyChapters[0].chapterTitle;
      this.dataStorageService.setActiveStoryPage(activeStoryConfiguration.storyChapters[0].chapterPages[0].pageTitle);
      activeStoryPage = activeStoryConfiguration.storyChapters[0].chapterPages[0].pageTitle;
    }
    this.state = { 
      isContinuingStory: props.route.params.isContinuingStory,
      textSize: this.dataStorageService.getTextSize(),
      activeStoryConfiguration: activeStoryConfiguration,
      activeStoryChapter: activeStoryChapter,
      activeStoryPage: activeStoryPage,
    };
  }

  renderStory = () => {
    console.log('rendering story');
    console.log(this.state.activeStoryChapter);
    let storyChapter = null;
    for (var i = 0; i < this.state.activeStoryConfiguration.storyChapters.length; i++) {
        storyChapter = this.state.activeStoryConfiguration.storyChapters[i];
        if (storyChapter.chapterTitle == this.state.activeStoryChapter) {
          break;
        }            
    }
    return this.renderStoryChapter(storyChapter);
  }

  renderStoryChapter = (storyChapter) => {
    console.log(this.state.activeStoryPage);
    let chapterPage = null;
    var chapterPages = storyChapter.chapterPages;
    for (var i = 0; i < chapterPages.length; i++) {
      chapterPage = chapterPages[i];
      if (chapterPage.pageTitle == this.state.activeStoryPage) {
        break;
      }
    }
    return this.renderChapterPage(chapterPage);
  }

  renderChapterPage = (chapterPage) => {
    var storyContent = chapterPage.storyContent;
    let storyContentArray = [];
    for (var i = 0; i < storyContent.length; i++) {
      var storyContentObject = storyContent[i];
      storyContentArray.push(this.renderStoryContent(storyContentObject));
    }
    var isStoryEnd = false;
    if (chapterPage.isStoryEnd != null && chapterPage.isStoryEnd) {
        isStoryEnd = true;
    }
    let pageTransitionsArray = [];
    if (isStoryEnd) {
      pageTransitionsArray.push(this.renderPageTransitionStoryEnd());
    }
    else {
      var pageTransitions = chapterPage.transitions;
      for (var i = 0; i < pageTransitions.length; i++) {
        var pageTransition = pageTransitions[i];
        if (pageTransition.transitionVariableName != null && pageTransition.transitionVariableName != "" && pageTransition.transitionVariableValue != null && pageTransition.transitionVariableValue != "") {
          // This transition has a variable requirement, so we need to check if that requirement has been satisfied
          var variableRequirementSatisfied = false;
          var activeVariables = this.dataStorageService.getActiveVariables();
          for (var j = 0; j < activeVariables.length; j++) {
            var activeVariable = activeVariables[j];
            if (activeVariable.variableName == pageTransition.transitionVariableName && activeVariable.variableValue == pageTransition.transitionVariableValue) {
              variableRequirementSatisfied = true;
              break;
            }
          }
          if (variableRequirementSatisfied) {
            pageTransitionsArray.push(this.renderPageTransition(pageTransition));
          }
        }
        else {
          pageTransitionsArray.push(this.renderPageTransition(pageTransition));
        }
      }
    }
    this.resetMetricLastChangeAmounts();
    if (!this.state.isContinuingStory) {
      console.log("processing metric modifiers");
      var metricModifiers = chapterPage.metricModifiers; 
      console.log(metricModifiers);
      if (metricModifiers != null) {
        for (var i = 0; i < metricModifiers.length; i++) {
          this.updateMetric(metricModifiers[i]);
        }
      }
      console.log("processing story variables");
      var storyVariables = chapterPage.storyVariables;
      console.log(storyVariables);
      if (storyVariables != null) {
        for (var i = 0; i < storyVariables.length; i++) {
          this.updateVariable(storyVariables[i]);
        }
      }
    }
    // let activeMetrics = this.renderActiveMetrics();
    return (
      <View style={styles.contentContainer}>
        <View style={styles.storyContentContainer}>
          {storyContentArray}
        </View>
        <View style={styles.transitionsContainer}>
          {pageTransitionsArray}
        </View>
      </View>
    );
  }

  resetMetricLastChangeAmounts = () => {
    this.dataStorageService.resetMetricLastChangeAmounts();
  }

  renderStoryContent = (storyContentObject) => {
      var contentType = storyContentObject.contentType;
      var content = storyContentObject.content;
      var isAnnecdote = false;
      if (storyContentObject.isAnnecdote != null && storyContentObject.isAnnecdote) {
        isAnnecdote = true;
      }
      if (contentType == "text") {
        if (!isAnnecdote) {
          // const contentWithLineBreaks = content.replace(new RegExp('\r?\n', 'g'), '<br />');
          return (
            <Text style={styles.helpLinkText}>
              {content}
            </Text>
          );
        }
        else {
          // Annecdotes just render as a clickable * symbol that when clicked initiates a popup with the story content
          // const styleObject = {
          //   color: 'blue',
          //   cursor: 'pointer',
          //   fontSize: this.state.textSize + 10 + 'px',
          // };
          return (
            // <Text style={styles.helpLinkText} onClick={() => { this.openAnecdote(content) }} >
            //   *
            // </Text>
            <Text style={styles.annecdoteText}>
              {content}
            </Text>
          );
        }
      }
      else if (contentType == "image") {
        var imageHtml = this.generateHtmlForStoryImageId(content);
        return imageHtml;
        // return <Image
        //   source={
        //     __DEV__
        //       ? require('../assets/images/robot-dev.png')
        //       : require('../assets/images/robot-prod.png')
        //   }
        //   style={styles.welcomeImage}
        // />;
        // $("#divStoryHolder").append('<div class="col-xs-12" style="margin-top: 10px; margin-bottom: 10px;">' + imageHtml + '</div>');
      }
  }

  openAnecdote = (anecdoteContent) => {
      console.log("Opening Footnote");
      console.log("textSize: " + this.state.textSize);        
      var navData = { anecdoteContent: anecdoteContent, textSize: this.textSize };
      let anecdoteModal = this.modalCtrl.create(Anecdote, navData);
      anecdoteModal.present();
  }

  renderPageTransition = (pageTransition) => {
      console.log("rendering page transition");
      console.log("textSize: " + this.state.textSize);
      var transitionText = pageTransition.transitionText;
      var transitionTarget = pageTransition.transitionTarget;
      // var divTransitionHolder = document.createElement("div");
      // divTransitionHolder.setAttribute("class", "col-xs-12");
      // divTransitionHolder.setAttribute("style", "margin-top: 10px; font-size: " + this.textSize + "px; padding: 10px;");
      // var aTransitionLink = document.createElement("a");
      // aTransitionLink.setAttribute("href", "#");
      // aTransitionLink.setAttribute("style", "text-decoration: none;");
      // aTransitionLink.addEventListener("click", () => {
      //     this.processTransition(transitionTarget);
      // });
      // aTransitionLink.appendChild(document.createTextNode("- " + transitionText));
      // divTransitionHolder.appendChild(aTransitionLink);
      // var divStoryHolder = document.getElementById("divStoryHolder");
      // divStoryHolder.appendChild(divTransitionHolder);
      // return <TouchableOpacity onPress={() => { this.processTransition(transitionTarget) }} style={styles.transitionContainer}>
      return  <View style={styles.transitionContainer}>
          <Button style={styles.transitionText} title={transitionText} onPress={() => { this.processTransition(transitionTarget) }} >
            {transitionText}
          </Button>
        </View>;
      // </TouchableOpacity>;
  }

  renderPageTransitionStoryEnd = () => {
      // var transitionText = "- Next";
      // var divTransitionHolder = document.createElement("div");
      // divTransitionHolder.setAttribute("class", "col-xs-12");
      // divTransitionHolder.setAttribute("style", "margin-top: 10px; font-size: " + this.textSize + "px; padding: 10px;");
      // var aTransitionLink = document.createElement("a");
      // aTransitionLink.setAttribute("href", "#");
      // aTransitionLink.setAttribute("style", "text-decoration: none;");
      // aTransitionLink.addEventListener("click", () => {
      //     this.btnClickGoToCongratulationScreen();
      // });
      // aTransitionLink.appendChild(document.createTextNode(transitionText));
      // divTransitionHolder.appendChild(aTransitionLink);
      // var divStoryHolder = document.getElementById("divStoryHolder");
      // divStoryHolder.appendChild(divTransitionHolder);
      return <TouchableOpacity onPress={this.btnClickGoToCongratulationScreen()} style={styles.helpLink}>
        <Text style={styles.helpLinkText}>
          - Next
        </Text>
      </TouchableOpacity>;
  }

  btnClickGoToCongratulationScreen() {
      // Push Active Metrics To Score History
      this.dataStorageService.addActiveMetricsToScoreHistory();
      this.dataStorageService.setStoryIsCompleted(true);
      // Go to congrats screen
      this.navCtrl.push(StoryComplete, {}).then(() => {
          // Remove Story Page from the Navigation Stack so that the back button from
          // StoryComplete takes you to the main menu and not back to the final story page
          this.navCtrl.remove(1);
      });
  }

  updateMetric = (metricModifier) => {
      this.dataStorageService.updateMetric(metricModifier);
      //this.renderActiveMetrics();
  }

  updateVariable = (storyVariable) => {
      this.dataStorageService.updateVariable(storyVariable);
      //this.renderActiveVariables();
  }

  renderActiveMetrics = () => {
    var metrics = [];
    var activeMetrics = this.dataStorageService.getActiveMetrics();
    for (var i = 0; i < activeMetrics.length; i++) {
      var activeMetric = activeMetrics[i];
      var metricLastChangeAmountString = "";
      if (activeMetric.metricLastChangeAmount > 0) {
          metricLastChangeAmountString = "+" + activeMetric.metricLastChangeAmount;
      }
      else {
          metricLastChangeAmountString = activeMetric.metricLastChangeAmount;
      }
      if (activeMetric.metricLastChangeAmount != 0) {
        metrics.push(
          <View style={styles.individualMetricContainer}>
            <Text style={styles.metricText}>
              {activeMetric.metricName} :  {activeMetric.metricValue} {"(" + metricLastChangeAmountString + ")"}
            </Text>
          </View>
        );
        // $("#divScoresHolder").append('<ion-col col-6 col-xs><ion-row><ion-col col-6 col-xs>' + activeMetric.metricName + '</ion-col><ion-col col-6 col-xs>' + activeMetric.metricValue + '<span> (' + metricLastChangeAmountString + ')</span>' + '</ion-col></ion-row></ion-col>');
      }
      else {
        metrics.push(
          <View style={styles.individualMetricContainer}>
            <Text style={styles.metricText}>
              {activeMetric.metricName} :  {activeMetric.metricValue}
            </Text>
          </View>
        );
        // $("#divScoresHolder").append('<ion-col col-6 col-xs><ion-row><ion-col col-6 col-xs>' + activeMetric.metricName + '</ion-col><ion-col col-6 col-xs>' + activeMetric.metricValue + '</ion-col></ion-row></ion-col>');
      }
    }
    return metrics;
  }

  processTransition = (transitionTarget) => {
    console.log('transition target');
    console.log(transitionTarget);
    let storyChapter = null;
    var pageFound = false;
    var activeStoryConfiguration = this.dataStorageService.getActiveStoryConfiguration();
    for (var i = 0; i < activeStoryConfiguration.storyChapters.length; i++) {
      storyChapter = activeStoryConfiguration.storyChapters[i];
      // if (!pageFound) {
      for (var j = 0; j < storyChapter.chapterPages.length; j++) {
        var chapterPage = storyChapter.chapterPages[j];
        if (chapterPage.pageTitle == transitionTarget) {
          console.log('found matching page');
          console.log(storyChapter.chapterTitle);
          console.log(chapterPage.pageTitle);
          this.dataStorageService.setActiveStoryChapter(storyChapter.chapterTitle);
          this.dataStorageService.setActiveStoryPage(chapterPage.pageTitle);
          pageFound = true;
          break;
        }
      }  
      if (pageFound) {
        break;
      }
      // } else {
      //   break;
      // }
    }
    if (pageFound) {
      var logData = {
        storyId: this.dataStorageService.getActiveStoryId(),
        storyInstanceGuid: this.dataStorageService.getActiveStoryInstanceGuid(),
        transitionTarget: transitionTarget
      };
      console.log(logData);
      fetch('https://makeyourownadventuremobilebackend.azurewebsites.net/api/Story/SaveLogStoryTransition', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
      // this.content.scrollToTop(1000);
      this.setState({
        isContinuingStory: false,
        activeStoryChapter: storyChapter.chapterTitle,
        activeStoryPage: chapterPage.pageTitle,
      });
      // this.renderStory();            
    }
  }

  generateHtmlForStoryImageId = (storyImageId) => {
      var htmlToReturn = "";
      var listLocalImageLocations = this.dataStorageService.getListLocalImageLocations();
      for (var i = 0; i < listLocalImageLocations.length; i++) {
          var localImageLocationDetails = listLocalImageLocations[i];
          if (localImageLocationDetails.storyImageId == storyImageId) {
              htmlToReturn = this.generateHtmlForStoryImage(localImageLocationDetails.storyImageLocalUrl);
              break;
          }
      }
      return htmlToReturn;
  }

  generateHtmlForStoryImage = (localImageUrl) => {
    console.log(localImageUrl);
    return <FullWidthImage
      source={{uri: localImageUrl}}
      style={styles.welcomeImage}
    />;
    // var imageHtml = '<div>'
    //     + '<img src="' + localImageUrl + '" style="width: 100%;" />'
    //     + '</div>';
    // return imageHtml;
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.metricContainer}>
          {this.renderActiveMetrics()}
        </View>
        <ScrollView
          style={styles.scrollContainer}>
          {this.renderStory()}
        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  metricContainer: {
    backgroundColor: '#fff',
    height: 30,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 6,
    // flex: 1,
    flexDirection: 'row',
    // textAlign: 'right',
    // color: 'black',
    // fontWeight: 'bold',
  },
  individualMetricContainer: {
    flex: 1
  },
  metricText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
  },
  annecdoteText: {
    fontStyle: 'italic',
    textAlign: 'right',
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 30,
    paddingBottom: 30,
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   paddingLeft: 10,
  //   paddingRight: 10,
  //   marginBottom: 30,
  // },
  transitionContainer: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  transitionText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    // fontWeight: 'bold',
    // fontStyle: 'italic',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    // marginTop: 10,
    marginBottom: 100,
    alignItems: 'center',
  },
  storyContentContainer: {
    textAlign: 'left',
  },
  transitionsContainer: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    // width: '100%',
    // height: '100%',
    resizeMode: 'contain',
    marginTop: 10,
    marginBottom: 10,
    // marginLeft: 10,
    // marginRight: 10
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
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
