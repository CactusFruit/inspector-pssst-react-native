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
import Slider from "react-native-slider";
import FullWidthImage from 'react-native-fullwidth-image'

export default class SettingsScreen extends Component {
  constructor(props) {
    super(props);
    // this.dataStorageService = new DataStorageService();
    // console.log('story props');
    // console.log(props);
    this.navigation = props.navigation;
    this.route = props.route;
    this.dataStorageService = props.route.params.dataStorageService;
    this.state = {
      value: 2
    };
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <ScrollView
          ref='storyScrollView'
          style={styles.scrollContainer}>
          <Slider
            value={this.state.value}
            minimumValue={0}
            maximumValue={10}
            step={1}
            onValueChange={value => this.setState({ value })}
          />
          <Text>
            Value: {this.state.value}
          </Text>
        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    alignItems: "stretch",
    justifyContent: "center"
  },
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
