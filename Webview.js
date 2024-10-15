import React, { useRef, useState, useEffect } from 'react'
import {ScrollView, SafeAreaView, Dimensions, StyleSheet, Alert, PermissionsAndroid, Platform} from 'react-native'
import WebView from 'react-native-webview'
import Geolocation from 'react-native-geolocation-service'
import Loading from './Loading'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Access Required",
          message: "This App needs to Access your location"
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }
};

const Webview = () => {

  const [currentLocation, setCurrentLocation] = useState(null)
  const [time, setTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const webviewRef = useRef(null)

  // 위치 불러오기
    useEffect(() => {
      requestLocationPermission();
      const watchId = Geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          // const lat_time = latitude-time
          // const lng_time = longitude+time
          setCurrentLocation({ latitude, longitude });

          const sendCurrentLocation = JSON.stringify({
            lat: latitude,
            lng: longitude
            
            // 위도는 + 위쪽 - 아래쪽
            // 경도는 + 오른쪽 - 왼쪽

            // lat: 37.0116265,  // 테스트용 위치 (한경대학교 기준)
            // lng: 127.2642483 + (time)

            // lat: 37.010469 - (time * 0.7777),  
            // lng: 127.262119 + time
          })
          webviewRef.current?.postMessage(sendCurrentLocation)
        
          console.log("내 좌표", latitude, longitude);
        },
        error => {
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, 
          timeout: 20000, 
          maximumAge: 10000,
        },
      );

      if(currentLocation) {
        setIsLoading(false)
      }

      const interval = setInterval(() => {
        setTime(time + 0.0001)
        // console.log("시간",time)
      }, 3000)

      
  
      return () => {
        Geolocation.clearWatch(watchId);
        clearInterval(interval)
      };
    }, [time]);

  const handleOnMessage = (e) => {
    console.log("location message", e.nativeEvent.data)
    Alert.alert(e.nativeEvent.data)
    }
    
    if(isLoading) {
      return (<Loading />) 
    }

  return (
    <SafeAreaView style={styles.container}>
        <WebView
          ref={webviewRef}
          style={styles.webview}
          // 로컬 호스트에서 react 파일을 띄어 실행
          // source={{uri: 'http://10.0.2.2:3000'}}
          // netlify로 배포한 사이트에서 실행
          source={{uri: 'https://react-tmap.netlify.app/'}}
          onMessage={handleOnMessage}></WebView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webview: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
  scrollContainer: {
    flexGrow: 1,
  },
})

export default Webview