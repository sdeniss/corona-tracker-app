import React from 'react';
import {Component} from 'react';
import { Switch, StyleSheet, Text, View, Animated, Button, Linking, Easing, Image, TouchableOpacity, Vibration} from 'react-native';
import MapView from 'react-native-maps';
import {Marker, Callout} from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import StorageManager from './Storage';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state ={ isLoading: true, markers:[], 
      all_markers: [],
      selected_marker: null, 
      slideAnimation: new Animated.Value(-300),
    show_all_points: false}
    this.storageManager = new StorageManager();
    this.onPressCallback = function(marker) {
      marker = JSON.parse(JSON.stringify(marker));
      Haptics.selectionAsync();
      console.log(new Date().getTime())
      this.setState({slideAnimation: new Animated.Value(-300), selected_marker: marker, marker_press_time: new Date().getTime()},
      function() {
        Animated.timing(this.state.slideAnimation, {
          toValue: 0,
          duration: 500,
          easing: Easing.bezier(.4,.54,.51,.99),
          useNativeDriver: false,
        }).start()
      });

      this.refs.mapview.animateToRegion({
        latitude: marker.position[1] - 0.007,
        longitude: marker.position[0],
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
      
    }.bind(this);

    this.dismissPoint = function() {
      this.storageManager.dismissDataPoint(this.state.selected_marker.position);
      this.setState(old => {
        for( var i = 0; i < old.markers.length; i++){
          if ( old.markers[i].position[0] === old.selected_marker.position[0] && old.markers[i].position[1] === old.selected_marker.position[1]) {
              old.markers.splice(i, 1); i--;
            }
          }
          
        return {markers: old.markers}}, () => {
          if (this.state.markers.length > 0) {
            this.onPressCallback(this.state.markers[0]);
          } else {
            this.onMapPress();
            this.refs.mapview.animateToRegion({
              latitude: 32.180752,
              longitude: 34.887284,
              latitudeDelta: 1,
              longitudeDelta: 1,
            }, 1000);
          }
        });
          
      }.bind(this);

    this.onMapPress = function() {
      if (!this.state.marker_press_time 
        || new Date().getTime() - this.state.marker_press_time < 1000
        || !this.state.selected_marker) {
        console.log('not hidin');
        return;
      }
      console.log(new Date().getTime() - this.state.marker_press_time);
      console.log("hidin");

      this.setState({slideAnimation: new Animated.Value(0)}, ()=>{
        Animated.timing(this.state.slideAnimation, {
          toValue: -300,
          duration: 300,
          easing: Easing.bezier(.4,.54,.51,.99),
          useNativeDriver: false,      
        }).start(()=>{
          this.setState({selected_marker: null});
        });
      });
      
      
    }.bind(this);
  }
  
  

  render() {
    return (
      <View style={{flex: 1}}>
          
        <View style={{height: 100, backgroundColor: 'transparent', position: 'absolute', left: 0, right: 0}}>
        <Image style={{resizeMode: 'contain', height: 40, width: 200, marginTop: 50, marginLeft: 'auto', marginRight: 'auto'}}
          source={require('./assets/corona-tracker-logo.png')} ></Image>
        </View>

      <MapView style={{flex: 1, zIndex: -1}}
      ref="mapview"
        onPress={this.onMapPress}
        initialRegion={
          {
            latitude: 32.180752,
            longitude: 34.887284,
            latitudeDelta: 1,
            longitudeDelta: 1,
          } 
        }
      >
        {(this.state.show_all_points? this.state.all_markers:this.state.markers).map((marker, index) => (
          <Marker key={index}
          onPress={() => this.onPressCallback(marker)}
          onSelect={() => this.onPressCallback(marker)}
          onCalloutPress={() => this.onPressCallback(marker)} 

            coordinate={{latitude: marker.position[1],
                          longitude: marker.position[0]}}
            image={require('./assets/biohazard.png')}
            opacity={Math.log(0.4 + ((new Date().getTime()- new Date(marker.t_start).getTime()) / (14 * 24 * 60 * 60 * 1000))) + 1}
          >
            <Callout opacity={1}>
              <View> 
                <Text>{marker.label}</Text>
            
              </View>
            </Callout>
          </Marker>
        ))}
  </MapView>
  <View style={{width: '100%', position: "absolute", bottom: 10, zIndex: 999999}}>
      <View style={[styles.card, {backgroundColor: 'white', marginLeft: 10, marginRight: 10, padding: 30}]}>
            <View style={{flexDirection: 'row-reverse', alignItems: 'center'}}>
            <Switch onValueChange={() => {this.setState(old => ({show_all_points: !old.show_all_points}))}}
            value = {this.state.show_all_points}/>
              <Text style={{marginRight: 10, fontSize: 18}}>הצג הכל <Text style={{color: '#d0d0d0'}}>ולא רק הנקודות שלא סימנתי</Text></Text>
            </View>
      </View>
    </View>
      
  {
    this.state.selected_marker != null && 
    <View style={{width: '100%', position: "absolute", bottom: 10, zIndex: 999999}}>
      <Animated.View style={[styles.card, {backgroundColor: 'white', marginLeft: 10, marginRight: 10, minHeight: 300, marginBottom: this.state.slideAnimation}]}>
      <Text style={{textAlign: "right"}}>
          <Text style={styles.cardTitle}>{this.state.selected_marker.label + "\n"}</Text>
            <Text style={styles.cardDescription}>{this.state.selected_marker.description.replace(/<br>/g, '\n').replace(/<li>/g, '\n - ').replace(/<.+>/, '').replace('\n\n\n', '\n')}</Text>
        </Text>
        {/* <Button containerStyle={{position: 'absolute', bottom: 0, backgroundColor: 'blue', color: 'white'}} */}
        {/* title="דווח על חשיפה" onPress={() => {Linking.openURL("http://bit.ly/MOH-Corona");}}></Button> */}

        
        <TouchableOpacity onPress={() => {Linking.openURL(this.state.selected_marker.link);}}
                        style={{display: this.state.selected_marker.link? 'flex' : 'none'}}>
          <Text style={{color: '#0084FF', fontSize: 18, textAlign: "right", marginTop: 20}}>צפה במקור</Text>
        </TouchableOpacity>
      
        
        <View style={{position: 'absolute', flexDirection: "row",bottom: 0, left: 25, right: 25, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
        <TouchableOpacity onPress={() => this.dismissPoint()}
                        style={{backgroundColor: '#0080FF', alignItems: 'center', padding: 15, marginLeft: -25,
                         flex: 1}}>
          <Text style={{color: 'white', fontSize: 18}}>אני בטוח</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {Linking.openURL("http://bit.ly/MOH-Corona");}}
                        style={{backgroundColor: '#FF0000', alignItems: 'center', padding: 15, marginRight: -25,
                         flex: 1}}>
          <Text style={{color: 'white', fontSize: 18, textAlign: "center"}}>דווח על חשיפה</Text>
        </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  }
  

</View>
      );
  }


  componentDidMount(){
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    fetch('http://corona-tracker.com/api/dangerZone')
      .then((response) => response.json())
      .then((responseJson) => {
        var results = [];
        var storageManager = new StorageManager();
        responseJson.forEach(function(point) {
          storageManager.shouldShowDataPoint((point.position)).then(result=> {
              if(result) {results.push(point);}
          });
        });
        

        sleep(500).then(()=> {
          this.setState({
            isLoading: false,
            markers: results,
            all_markers: responseJson
          }, function(){
            
          });
        })

      })
      .catch((error) =>{
        console.error(error);
      });

  }

  async getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
        position => {
        let region = {
                latitude: parseFloat(position.coords.latitude),
                longitude: parseFloat(position.coords.longitude),
                latitudeDelta: 0.5,
                longitudeDelta: 0.5
            };
        },
        error => console.log(error),
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000
        }
    );
  }

}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15
  },
  cardDescription: {
    fontSize: 18,
    color: '#373436'
  }
});
